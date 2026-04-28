const express = require("express")
const { body, validationResult } = require("express-validator")

const queries = require("../db/queries")
const { requireAuth, requireRole } = require("../middlewares/auth")
const { buildReportPdf } = require("../lib/reportPdf")

const router = express.Router()

router.use(requireAuth, requireRole("teacher"))

router.get("/courses", async (req, res, next) => {
  try {
    const courses = await queries.listCoursesForTeacher(req.user.id)
    res.json({ courses })
  } catch (err) {
    next(err)
  }
})

router.get("/students", async (req, res, next) => {
  try {
    const students = await queries.listStudentsForTeacher(req.user.id)
    res.json({ students })
  } catch (err) {
    next(err)
  }
})

router.get("/students/:id", async (req, res, next) => {
  try {
    const studentId = Number(req.params.id)
    const allowed = await queries.isTeacherForStudent(req.user.id, studentId)
    if (!allowed) return res.status(403).json({ message: "Forbidden" })

    const [student, evaluations] = await Promise.all([
      queries.findStudentById(studentId),
      queries.listEvaluationsForStudent(studentId),
    ])
    if (!student) return res.status(404).json({ message: "Not found" })

    res.json({ student, evaluations })
  } catch (err) {
    next(err)
  }
})

router.get("/evaluations", async (req, res, next) => {
  try {
    const evaluations = await queries.listEvaluationsForTeacher(req.user.id)
    res.json({ evaluations })
  } catch (err) {
    next(err)
  }
})

router.post(
  "/evaluations",
  body("studentId").isInt({ min: 1 }),
  body("courseId").optional({ values: "falsy" }).isInt({ min: 1 }),
  body("points").optional({ values: "falsy" }).isFloat({ min: 0, max: 100 }),
  body("teacherComment").optional({ values: "falsy" }).isString(),
  body("progressAppreciation").optional({ values: "falsy" }).isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const studentId = Number(req.body.studentId)
      const allowed = await queries.isTeacherForStudent(
        req.user.id,
        studentId
      )
      if (!allowed) return res.status(403).json({ message: "Forbidden" })

      const evaluation = await queries.createEvaluation({
        teacherUserId: req.user.id,
        studentId,
        courseId: req.body.courseId ? Number(req.body.courseId) : null,
        points: req.body.points != null ? Number(req.body.points) : null,
        teacherComment: req.body.teacherComment,
        progressAppreciation: req.body.progressAppreciation,
      })
      res.status(201).json({ evaluation })
    } catch (err) {
      next(err)
    }
  }
)

router.get("/reports", async (req, res, next) => {
  try {
    const reports = await queries.listReportsForTeacher(req.user.id)
    res.json({ reports })
  } catch (err) {
    next(err)
  }
})

router.post(
  "/reports",
  body("studentId").isInt({ min: 1 }),
  body("title").optional().isString(),
  body("includesCharts").optional().isBoolean(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const studentId = Number(req.body.studentId)
      const allowed = await queries.isTeacherForStudent(
        req.user.id,
        studentId
      )
      if (!allowed) return res.status(403).json({ message: "Forbidden" })

      const student = await queries.findStudentById(studentId)
      if (!student) return res.status(404).json({ message: "Not found" })

      const title =
        req.body.title ||
        `Course report — ${student.first_name} ${student.last_name}`

      const report = await queries.createGeneratedReport({
        studentId,
        createdBy: req.user.id,
        title,
        reportType: "course",
        includesCharts: !!req.body.includesCharts,
      })

      try {
        const parentIds = await queries.listParentUserIdsForStudent(studentId)
        await Promise.all(
          parentIds.map((pid) =>
            queries.createNotification({
              recipientUserId: pid,
              studentId,
              title: "New report available",
              message: `A new course report (${title}) is available for your child.`,
            })
          )
        )
      } catch (e) {
        // best-effort, don't block on notification failures
      }

      res.status(201).json({ report })
    } catch (err) {
      next(err)
    }
  }
)

router.get("/reports/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const report = await queries.findReportById(id)
    if (!report) return res.status(404).json({ message: "Not found" })
    if (report.created_by !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" })
    }
    const evaluations = await queries.listEvaluationsForStudent(
      report.student_id
    )
    res.json({ report, evaluations })
  } catch (err) {
    next(err)
  }
})

router.get("/reports/:id/pdf", async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const report = await queries.findReportById(id)
    if (!report) return res.status(404).json({ message: "Not found" })
    if (report.created_by !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const evaluations = await queries.listEvaluationsForStudent(
      report.student_id
    )

    const safeName = `${report.first_name}_${report.last_name}_report_${report.id}.pdf`
      .replace(/\s+/g, "_")
      .replace(/[^A-Za-z0-9._-]/g, "")

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName}"`
    )

    buildReportPdf({ report, evaluations, stream: res })
  } catch (err) {
    next(err)
  }
})

module.exports = router
