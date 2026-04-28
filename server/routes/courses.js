const express = require("express")
const { body, validationResult } = require("express-validator")

const queries = require("../db/queries")
const { requireAuth, requireRole } = require("../middlewares/auth")

const router = express.Router()

router.use(requireAuth, requireRole("admin"))

router.get("/", async (req, res, next) => {
  try {
    const courses = await queries.listCourses()
    res.json({ courses })
  } catch (err) {
    next(err)
  }
})

router.get("/teachers", async (req, res, next) => {
  try {
    const teachers = await queries.listTeachers()
    res.json({ teachers })
  } catch (err) {
    next(err)
  }
})

router.get("/students", async (req, res, next) => {
  try {
    const students = await queries.listAllStudents()
    res.json({ students })
  } catch (err) {
    next(err)
  }
})

router.get("/:id", async (req, res, next) => {
  try {
    const course = await queries.getCourseDetail(Number(req.params.id))
    if (!course) return res.status(404).json({ message: "Not found" })
    res.json({ course })
  } catch (err) {
    next(err)
  }
})

router.post(
  "/",
  body("name").trim().isLength({ min: 1, max: 150 }),
  body("description").optional({ values: "falsy" }).isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const course = await queries.createCourse(req.body)
      res.status(201).json({ course })
    } catch (err) {
      next(err)
    }
  }
)

router.patch(
  "/:id",
  body("name").optional().trim().isLength({ min: 1, max: 150 }),
  body("description").optional({ values: "falsy" }).isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const course = await queries.updateCourse(Number(req.params.id), req.body)
      if (!course) return res.status(404).json({ message: "Not found" })
      res.json({ course })
    } catch (err) {
      next(err)
    }
  }
)

router.delete("/:id", async (req, res, next) => {
  try {
    await queries.deleteCourse(Number(req.params.id))
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.post("/:id/teachers/:teacherUserId", async (req, res, next) => {
  try {
    await queries.assignTeacherToCourse(
      Number(req.params.id),
      Number(req.params.teacherUserId)
    )
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.delete("/:id/teachers/:teacherUserId", async (req, res, next) => {
  try {
    await queries.removeTeacherFromCourse(
      Number(req.params.id),
      Number(req.params.teacherUserId)
    )
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.post("/:id/students/:studentId", async (req, res, next) => {
  try {
    await queries.enrollStudentInCourse(
      Number(req.params.id),
      Number(req.params.studentId)
    )
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.delete("/:id/students/:studentId", async (req, res, next) => {
  try {
    await queries.unenrollStudentFromCourse(
      Number(req.params.id),
      Number(req.params.studentId)
    )
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router
