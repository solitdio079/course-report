const express = require("express")
const passport = require("passport")
const bcrypt = require("bcryptjs")
const { body, validationResult } = require("express-validator")

const queries = require("../db/queries")

const router = express.Router()

// Public teacher signup is disabled.
// Staff accounts (teacher, accountant, social_relations, admin) must be
// created by an administrator via POST /admin/users.
router.post("/teacher/signup", (_req, res) => {
  res.status(403).json({
    message:
      "Teacher accounts are created by an administrator. Please contact your admin.",
  })
})

router.post("/teacher/login", (req, res, next) => {
  passport.authenticate("teacher-local", (err, user, info) => {
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

module.exports = router
