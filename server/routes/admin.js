const express = require("express")
const bcrypt = require("bcryptjs")
const { body, validationResult } = require("express-validator")

const queries = require("../db/queries")
const { requireAuth, requireRole } = require("../middlewares/auth")

const router = express.Router()

router.use(requireAuth, requireRole("admin"))

const VALID_ROLES = [
  "admin",
  "teacher",
  "social_relations",
  "accountant",
  "parent",
]

const STAFF_ROLES = ["admin", "teacher", "social_relations", "accountant"]

router.post(
  "/users",
  body("fullName").trim().isLength({ min: 1, max: 150 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("role").isIn(STAFF_ROLES),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const { fullName, email, password, role } = req.body

      const existing = await queries.findUserByEmail(email)
      if (existing) {
        return res.status(409).json({ message: "Email already in use" })
      }

      const passwordHash = await bcrypt.hash(password, 12)
      const user = await queries.createUser({
        fullName,
        email,
        passwordHash,
        role,
      })
      res.status(201).json({ user })
    } catch (err) {
      next(err)
    }
  }
)

router.get("/users", async (req, res, next) => {
  try {
    res.json({ users: await queries.listAllUsers() })
  } catch (err) {
    next(err)
  }
})

router.patch(
  "/users/:id/role",
  body("role").isIn(VALID_ROLES),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const id = Number(req.params.id)
      const user = await queries.updateUserRole(id, req.body.role)
      if (!user) return res.status(404).json({ message: "Not found" })
      res.json({ user })
    } catch (err) {
      next(err)
    }
  }
)

router.get("/reports", async (req, res, next) => {
  try {
    res.json({ reports: await queries.listAllReports() })
  } catch (err) {
    next(err)
  }
})

router.get("/overview", async (req, res, next) => {
  try {
    const [users, payments, expenses, reports] = await Promise.all([
      queries.listAllUsers(),
      queries.paymentSummary(),
      queries.expenseSummary(),
      queries.listAllReports(),
    ])
    res.json({
      userCount: users.length,
      payments,
      expenses,
      reportCount: reports.length,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
