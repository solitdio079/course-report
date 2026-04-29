const express = require("express")
const { body, validationResult } = require("express-validator")

const queries = require("../db/queries")
const { requireAuth, requireRole } = require("../middlewares/auth")
const { buildReportPdf } = require("../lib/reportPdf")

const router = express.Router()

router.use(requireAuth, requireRole("teacher"))

function reportLanguage(req) {
  const raw = req.body?.language || req.query?.lang
  return String(raw || "").toLowerCase().startsWith("tr") ? "tr" : "en"
}

const EVALUATION_CRITERIA = new Set([
  "vocabulary",
  "grammar",
  "listening_comprehension",
  "reading_comprehension",
  "speaking",
  "writing",
  "pronunciation",
  "confidence",
  "autonomy",
])

const EVALUATION_STATUSES = new Set([
  "in_progress",
  "needs_work",
  "priority",
])

const SESSION_STATUSES = new Set(["planned", "completed", "cancelled"])

function normalizeCriteria(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {}

  return Object.fromEntries(
    Object.entries(input).filter(
      ([criterion, status]) =>
        EVALUATION_CRITERIA.has(criterion) && EVALUATION_STATUSES.has(status)
    )
  )
}

function normalizeSessionStatus(input) {
  return SESSION_STATUSES.has(input) ? input : "planned"
}

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

    const [student, evaluations, parents, sessions] = await Promise.all([
      queries.findStudentById(studentId),
      queries.listEvaluationsForStudent(studentId),
      queries.listParentsForStudent(studentId),
      queries.listSessionsForTeacherStudent(req.user.id, studentId),
    ])
    if (!student) return res.status(404).json({ message: "Not found" })

    res.json({ student, evaluations, parents, sessions })
  } catch (err) {
    next(err)
  }
})

router.get("/sessions", async (req, res, next) => {
  try {
    const sessions = await queries.listSessionsForTeacher(req.user.id)
    res.json({ sessions })
  } catch (err) {
    next(err)
  }
})

router.post(
  "/sessions",
  body("studentId").isInt({ min: 1 }),
  body("courseId").optional({ values: "falsy" }).isInt({ min: 1 }),
  body("sessionDate").isISO8601(),
  body("objectives").optional({ values: "falsy" }).isString(),
  body("status").optional().isIn(["planned", "completed", "cancelled"]),
  body("notes").optional({ values: "falsy" }).isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const studentId = Number(req.body.studentId)
      const allowed = await queries.isTeacherForStudent(req.user.id, studentId)
      if (!allowed) return res.status(403).json({ message: "Forbidden" })

      const session = await queries.createSession({
        teacherUserId: req.user.id,
        studentId,
        courseId: req.body.courseId ? Number(req.body.courseId) : null,
        sessionDate: req.body.sessionDate,
        objectives: req.body.objectives,
        status: normalizeSessionStatus(req.body.status),
        notes: req.body.notes,
      })
      res.status(201).json({ session })
    } catch (err) {
      next(err)
    }
  }
)

router.patch(
  "/sessions/:id",
  body("courseId").optional({ values: "falsy" }).isInt({ min: 1 }),
  body("sessionDate").optional().isISO8601(),
  body("objectives").optional({ values: "falsy" }).isString(),
  body("status").optional().isIn(["planned", "completed", "cancelled"]),
  body("notes").optional({ values: "falsy" }).isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const session = await queries.updateSessionForTeacher(
        req.user.id,
        Number(req.params.id),
        {
          courseId: req.body.courseId ? Number(req.body.courseId) : undefined,
          sessionDate: req.body.sessionDate,
          objectives: req.body.objectives,
          status: req.body.status,
          notes: req.body.notes,
        }
      )
      if (!session) return res.status(404).json({ message: "Not found" })
      res.json({ session })
    } catch (err) {
      next(err)
    }
  }
)

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
  body("sessionId").optional({ values: "falsy" }).isInt({ min: 1 }),
  body("points").isInt({ min: 1, max: 5 }),
  body("teacherComment").optional({ values: "falsy" }).isString(),
  body("progressAppreciation").optional({ values: "falsy" }).isString(),
  body("criteria").optional().isObject(),
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

      let session = null
      if (req.body.sessionId) {
        session = await queries.findSessionForTeacher(
          req.user.id,
          Number(req.body.sessionId)
        )
        if (!session) return res.status(404).json({ message: "Session not found" })
        if (Number(session.student_id) !== studentId) {
          return res.status(400).json({ message: "Session does not belong to this student" })
        }
      }

      const evaluation = await queries.createEvaluation({
        teacherUserId: req.user.id,
        studentId,
        courseId: req.body.courseId
          ? Number(req.body.courseId)
          : session?.course_id || null,
        sessionId: session?.id || null,
        points: req.body.points != null ? Number(req.body.points) : null,
        teacherComment: req.body.teacherComment,
        progressAppreciation: req.body.progressAppreciation,
        criteria: normalizeCriteria(req.body.criteria),
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
      const language = reportLanguage(req)

      const title =
        req.body.title ||
        `${language === "tr" ? "Aylık ders raporu" : "Monthly course report"} — ${student.first_name} ${student.last_name} — ${new Date().toLocaleString(language === "tr" ? "tr-TR" : "en-US", {
          month: "long",
          year: "numeric",
        })}`

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

    buildReportPdf({
      report,
      evaluations,
      stream: res,
      language: reportLanguage(req),
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
