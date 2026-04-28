const express = require("express")
const { body, validationResult } = require("express-validator")

const queries = require("../db/queries")
const { requireAuth, requireRole } = require("../middlewares/auth")

const router = express.Router()

router.use(requireAuth, requireRole("social_relations", "admin"))

router.get("/students", async (req, res, next) => {
  try {
    const students = await queries.listStudentsWithPrimaryParent()
    res.json({ students })
  } catch (err) {
    next(err)
  }
})

router.get("/students/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const [student, parents, courses, teachers] = await Promise.all([
      queries.findStudentById(id),
      queries.listParentsForStudent(id),
      queries.listCoursesForStudent(id),
      queries.listTeachersForStudent(id),
    ])
    if (!student) return res.status(404).json({ message: "Not found" })
    res.json({ student, parents, courses, teachers })
  } catch (err) {
    next(err)
  }
})

router.get("/reports", async (req, res, next) => {
  try {
    const reports = await queries.listSocialReportsByAuthor(req.user.id)
    res.json({ reports })
  } catch (err) {
    next(err)
  }
})

router.post(
  "/reports",
  body("studentId").isInt({ min: 1 }),
  body("title").trim().isLength({ min: 1, max: 255 }),
  body("content").optional({ values: "falsy" }).isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const studentId = Number(req.body.studentId)
      const student = await queries.findStudentById(studentId)
      if (!student) return res.status(404).json({ message: "Student not found" })

      const report = await queries.createSocialReport({
        studentId,
        createdBy: req.user.id,
        title: req.body.title,
        content: req.body.content,
        includesCharts: false,
      })

      try {
        const parentIds = await queries.listParentUserIdsForStudent(studentId)
        await Promise.all(
          parentIds.map((pid) =>
            queries.createNotification({
              recipientUserId: pid,
              studentId,
              title: "New social report",
              message: `A new social report (${req.body.title}) is available.`,
            })
          )
        )
      } catch (e) {
        // ignore
      }

      res.status(201).json({ report })
    } catch (err) {
      next(err)
    }
  }
)

router.post(
  "/reports/:id/share",
  body("subject").optional({ values: "falsy" }).isString(),
  body("body").optional({ values: "falsy" }).isString(),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id)
      const report = await queries.findReportById(id)
      if (!report) return res.status(404).json({ message: "Not found" })
      if (report.created_by !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" })
      }

      const inboxId = await queries.getSharedInboxId()
      const message = await queries.createMessage({
        inboxId,
        senderId: req.user.id,
        subject: req.body.subject || `Social report — ${report.title}`,
        body: req.body.body || null,
        reportId: id,
      })
      res.status(201).json({ message })
    } catch (err) {
      next(err)
    }
  }
)

module.exports = router
