const express = require("express")
const passport = require("passport")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const { body, validationResult } = require("express-validator")

const queries = require("../db/queries")
const { requireAuth } = require("../middlewares/auth")

const router = express.Router()

const PUBLIC_SIGNUP_ENABLED = process.env.PUBLIC_SIGNUP_ENABLED !== "false"

function loginAndRespond(req, res, next, user, status = 200) {
  req.login(user, (err) => {
    if (err) return next(err)
    return res.status(status).json({ user })
  })
}

router.post(
  "/signup",
  body("fullName").trim().isLength({ min: 2, max: 150 }),
  body("email").trim().isEmail().normalizeEmail(),
  body("password").isLength({ min: 8, max: 200 }),
  async (req, res, next) => {
    try {
      if (!PUBLIC_SIGNUP_ENABLED) {
        return res.status(403).json({ message: "Public signup disabled" })
      }

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { fullName, email, password, phoneNumber, address } = req.body

      const existing = await queries.findUserByEmail(email)
      if (existing) {
        return res.status(409).json({ message: "Email already in use" })
      }

      const passwordHash = await bcrypt.hash(password, 12)
      const created = await queries.createUser({
        fullName,
        email,
        passwordHash,
        role: "parent",
      })

      await queries.createParentRecord({
        userId: created.id,
        phoneNumber,
        address,
      })

      const publicUser = {
        id: created.id,
        fullName: created.full_name,
        email: created.email,
        role: created.role,
      }
      return loginAndRespond(req, res, next, publicUser, 201)
    } catch (err) {
      next(err)
    }
  }
)

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err)
    if (!user) {
      return res.status(401).json({ message: info?.message || "Unauthorized" })
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr)
      return res.json({ user })
    })
  })(req, res, next)
})

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    req.session?.destroy(() => {
      res.clearCookie("connect.sid")
      res.json({ ok: true })
    })
  })
})

router.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ user: null })
  return res.json({ user: req.user })
})

router.patch(
  "/profile",
  requireAuth,
  body("fullName").optional().trim().isLength({ min: 2, max: 150 }),
  body("currentPassword").optional().isLength({ min: 1 }),
  body("newPassword").optional().isLength({ min: 8, max: 200 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { fullName, currentPassword, newPassword } = req.body

      if (newPassword) {
        if (!currentPassword) {
          return res
            .status(400)
            .json({ message: "Current password required to change password" })
        }

        const dbUser = await queries.findUserById(req.user.id)
        if (!dbUser) return res.status(404).json({ message: "User not found" })

        const ok = await bcrypt.compare(currentPassword, dbUser.password_hash)
        if (!ok) {
          return res
            .status(400)
            .json({ message: "Current password is incorrect" })
        }

        const newHash = await bcrypt.hash(newPassword, 12)
        await queries.updateUserPassword(req.user.id, newHash)
      }

      let updated
      if (fullName) {
        updated = await queries.updateUserProfile(req.user.id, { fullName })
      } else {
        updated = await queries.findUserById(req.user.id)
      }

      const publicUser = {
        id: updated.id,
        fullName: updated.full_name,
        email: updated.email,
        role: updated.role,
      }
      return res.json({ user: publicUser })
    } catch (err) {
      next(err)
    }
  }
)

router.post(
  "/password-reset/request",
  body("email").trim().isEmail().normalizeEmail(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email } = req.body
      const user = await queries.findUserByEmail(email)

      if (user) {
        const token = crypto.randomBytes(32).toString("hex")
        const tokenHash = crypto
          .createHash("sha256")
          .update(token)
          .digest("hex")
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        await queries.createPasswordResetToken({
          userId: user.id,
          tokenHash,
          expiresAt,
        })

        // No email service yet — log the reset link to server console.
        // Replace this with an email integration in production.
        console.log(
          `[password-reset] ${user.email} -> token: ${token} (expires ${expiresAt.toISOString()})`
        )
      }

      // Always return ok to prevent user enumeration.
      return res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  }
)

router.post(
  "/password-reset/confirm",
  body("token").isString().isLength({ min: 32 }),
  body("newPassword").isLength({ min: 8, max: 200 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { token, newPassword } = req.body
      const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")

      const record = await queries.findValidPasswordResetToken(tokenHash)
      if (!record) {
        return res.status(400).json({ message: "Invalid or expired token" })
      }

      const passwordHash = await bcrypt.hash(newPassword, 12)
      await queries.updateUserPassword(record.user_id, passwordHash)
      await queries.markPasswordResetTokenUsed(record.id)

      return res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  }
)

module.exports = router
