const express = require("express")
const { body, validationResult } = require("express-validator")

const queries = require("../db/queries")
const { requireAuth, requireRole } = require("../middlewares/auth")

const router = express.Router()

router.use(requireAuth, requireRole("parent"))

router.get("/me", async (req, res, next) => {
  try {
    const parent = await queries.findParentByUserId(req.user.id)
    res.json({ parent })
  } catch (err) {
    next(err)
  }
})

router.get("/children", async (req, res, next) => {
  try {
    const children = await queries.listChildrenForParent(req.user.id)
    res.json({ children })
  } catch (err) {
    next(err)
  }
})

router.post(
  "/children",
  body("firstName").trim().isLength({ min: 1, max: 100 }),
  body("lastName").trim().isLength({ min: 1, max: 100 }),
  body("dateOfBirth").optional({ values: "falsy" }).isISO8601(),
  body("address").optional({ values: "falsy" }).isString(),
  body("courseEmail").optional({ values: "falsy" }).isEmail(),
  body("relationship").optional({ values: "falsy" }).isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const child = await queries.createChildProfile({
        parentUserId: req.user.id,
        ...req.body,
      })
      res.status(201).json({ child })
    } catch (err) {
      next(err)
    }
  }
)

router.get("/children/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const child = await queries.findChildForParent(id, req.user.id)
    if (!child) return res.status(404).json({ message: "Not found" })

    const [parents, courses, teachers] = await Promise.all([
      queries.listParentsForStudent(id),
      queries.listCoursesForStudent(id),
      queries.listTeachersForStudent(id),
    ])

    res.json({ child, parents, courses, teachers })
  } catch (err) {
    next(err)
  }
})

router.patch(
  "/children/:id",
  body("firstName").optional().trim().isLength({ min: 1, max: 100 }),
  body("lastName").optional().trim().isLength({ min: 1, max: 100 }),
  body("dateOfBirth").optional({ values: "falsy" }).isISO8601(),
  body("address").optional({ values: "falsy" }).isString(),
  body("courseEmail").optional({ values: "falsy" }).isEmail(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const id = Number(req.params.id)
      const existing = await queries.findChildForParent(id, req.user.id)
      if (!existing) return res.status(404).json({ message: "Not found" })

      const map = {
        firstName: "first_name",
        lastName: "last_name",
        dateOfBirth: "date_of_birth",
        address: "address",
        courseEmail: "course_email",
      }
      const fields = {}
      for (const [k, v] of Object.entries(map)) {
        if (req.body[k] !== undefined) fields[v] = req.body[k]
      }

      const updated = await queries.updateStudent(id, fields)
      res.json({ child: updated })
    } catch (err) {
      next(err)
    }
  }
)

router.get("/reports", async (req, res, next) => {
  try {
    const reports = await queries.listReportsForParentUser(req.user.id)
    res.json({ reports })
  } catch (err) {
    next(err)
  }
})

router.get("/payments", async (req, res, next) => {
  try {
    const payments = await queries.listPaymentsForParentUser(req.user.id)
    res.json({ payments })
  } catch (err) {
    next(err)
  }
})

router.get("/notifications", async (req, res, next) => {
  try {
    const notifications = await queries.listNotificationsForUser(req.user.id)
    res.json({ notifications })
  } catch (err) {
    next(err)
  }
})

module.exports = router
