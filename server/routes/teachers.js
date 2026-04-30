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

function normalizeSessionSkills(input) {
  if (!Array.isArray(input)) return []
  return input
    .map((skill) => ({
      name: String(skill?.name || "").trim(),
      score: Number(skill?.score),
    }))
    .filter((skill) => skill.name && Number.isFinite(skill.score))
    .map((skill) => ({
      name: skill.name,
      score: Math.max(1, Math.min(5, skill.score)),
    }))
}

function normalizeMoodCheck(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {}
  const value = Number(input.value)
  const cleanValue = Number.isFinite(value) ? Math.max(1, Math.min(5, value)) : null
  return {
    ...(cleanValue ? { value: cleanValue } : {}),
    ...(input.label ? { label: String(input.label).slice(0, 80) } : {}),
  }
}

function monthStart(value) {
  if (!value) return new Date().toISOString().slice(0, 7) + "-01"
  const raw = String(value)
  if (/^\d{4}-\d{2}$/.test(raw)) return `${raw}-01`
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw.slice(0, 7) + "-01"
  return new Date().toISOString().slice(0, 7) + "-01"
}

function textList(values) {
  return values.filter((value) => typeof value === "string" && value.trim()).join("\n")
}

function averageScore(values) {
  const clean = values.map(Number).filter(Number.isFinite)
  if (!clean.length) return null
  return clean.reduce((sum, value) => sum + value, 0) / clean.length
}

function buildReportDraft(student, evaluations, reportMonth, language) {
  const monthKey = String(reportMonth || "").slice(0, 7)
  const monthEvaluations = evaluations.filter((evaluation) => {
    const source = evaluation.session_date || evaluation.created_at
    return source && String(source).slice(0, 7) === monthKey
  })
  const source = monthEvaluations.length ? monthEvaluations : evaluations
  const average = averageScore(source.map((evaluation) => evaluation.points))
  const sessionTitles = source
    .map((evaluation) => evaluation.session_title || evaluation.course_name)
    .filter(Boolean)
  const isTurkish = language === "tr"
  return {
    summary: isTurkish
      ? `${student.first_name} bu dönemde ${source.length} değerlendirme aldı. ${
          average ? `Ortalama puan ${average.toFixed(1)}/5.` : "Henüz puanlanmış değerlendirme yok."
        } ${sessionTitles.length ? `Çalışılan konular: ${sessionTitles.join(", ")}.` : ""}`
      : `${student.first_name} received ${source.length} evaluation(s) in this period. ${
          average ? `Average rating: ${average.toFixed(1)}/5.` : "No rated evaluations yet."
        } ${sessionTitles.length ? `Topics covered: ${sessionTitles.join(", ")}.` : ""}`,
    strengths: textList(source.map((evaluation) => evaluation.session_summary || evaluation.teacher_comment)),
    improvements: textList(
      source.flatMap((evaluation) => [
        evaluation.session_difficulties,
        evaluation.session_mistakes,
      ])
    ),
    recommendations: textList(
      source.map((evaluation) => evaluation.session_homework || evaluation.progress_appreciation)
    ),
  }
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

    const [student, evaluations, parents, sessions, feedback] = await Promise.all([
      queries.findStudentById(studentId),
      queries.listEvaluationsForStudent(studentId),
      queries.listParentsForStudent(studentId),
      queries.listSessionsForTeacherStudent(req.user.id, studentId),
      queries.listFeedbackForStudent(studentId),
    ])
    if (!student) return res.status(404).json({ message: "Not found" })

    res.json({ student, evaluations, parents, sessions, feedback })
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
  body("title").optional({ values: "falsy" }).isString(),
  body("startTime").optional({ values: "falsy" }).matches(/^\d{2}:\d{2}$/),
  body("endTime").optional({ values: "falsy" }).matches(/^\d{2}:\d{2}$/),
  body("objectives").optional({ values: "falsy" }).isString(),
  body("status").optional().isIn(["planned", "completed", "cancelled"]),
  body("notes").optional({ values: "falsy" }).isString(),
  body("score").optional({ values: "falsy" }).isFloat({ min: 1, max: 5 }),
  body("skills").optional().isArray(),
  body("moodCheck").optional().isObject(),
  body("summary").optional({ values: "falsy" }).isString(),
  body("difficulties").optional({ values: "falsy" }).isString(),
  body("mistakes").optional({ values: "falsy" }).isString(),
  body("homework").optional({ values: "falsy" }).isString(),
  body("recording").optional({ values: "falsy" }).isString(),
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
        title: req.body.title,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        objectives: req.body.objectives,
        status: normalizeSessionStatus(req.body.status),
        notes: req.body.notes,
        score: req.body.score != null ? Number(req.body.score) : null,
        skills: normalizeSessionSkills(req.body.skills),
        moodCheck: normalizeMoodCheck(req.body.moodCheck),
        summary: req.body.summary,
        difficulties: req.body.difficulties,
        mistakes: req.body.mistakes,
        homework: req.body.homework,
        recording: req.body.recording,
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
  body("title").optional({ values: "falsy" }).isString(),
  body("startTime").optional({ values: "falsy" }).matches(/^\d{2}:\d{2}$/),
  body("endTime").optional({ values: "falsy" }).matches(/^\d{2}:\d{2}$/),
  body("objectives").optional({ values: "falsy" }).isString(),
  body("status").optional().isIn(["planned", "completed", "cancelled"]),
  body("notes").optional({ values: "falsy" }).isString(),
  body("score").optional({ values: "falsy" }).isFloat({ min: 1, max: 5 }),
  body("skills").optional().isArray(),
  body("moodCheck").optional().isObject(),
  body("summary").optional({ values: "falsy" }).isString(),
  body("difficulties").optional({ values: "falsy" }).isString(),
  body("mistakes").optional({ values: "falsy" }).isString(),
  body("homework").optional({ values: "falsy" }).isString(),
  body("recording").optional({ values: "falsy" }).isString(),
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
          title: req.body.title,
          startTime: req.body.startTime,
          endTime: req.body.endTime,
          objectives: req.body.objectives,
          status: req.body.status,
          notes: req.body.notes,
          score: req.body.score != null ? Number(req.body.score) : undefined,
          skills: req.body.skills !== undefined ? normalizeSessionSkills(req.body.skills) : undefined,
          moodCheck: req.body.moodCheck !== undefined ? normalizeMoodCheck(req.body.moodCheck) : undefined,
          summary: req.body.summary,
          difficulties: req.body.difficulties,
          mistakes: req.body.mistakes,
          homework: req.body.homework,
          recording: req.body.recording,
        }
      )
      if (!session) return res.status(404).json({ message: "Not found" })
      res.json({ session })
    } catch (err) {
      next(err)
    }
  }
)

router.post("/sessions/:id/duplicate", async (req, res, next) => {
  try {
    const session = await queries.duplicateSessionForTeacher(
      req.user.id,
      Number(req.params.id)
    )
    if (!session) return res.status(404).json({ message: "Not found" })
    res.status(201).json({ session })
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

router.get("/feedback", async (req, res, next) => {
  try {
    const feedback = await queries.listFeedbackForTeacher(req.user.id)
    res.json({ feedback })
  } catch (err) {
    next(err)
  }
})

router.post(
  "/feedback",
  body("studentId").isInt({ min: 1 }),
  body("feedbackDate").optional({ values: "falsy" }).isISO8601(),
  body("author").optional({ values: "falsy" }).isString(),
  body("satisfaction").optional({ values: "falsy" }).isString(),
  body("progress").optional({ values: "falsy" }).isString(),
  body("difficulties").optional({ values: "falsy" }).isString(),
  body("comment").optional({ values: "falsy" }).isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const studentId = Number(req.body.studentId)
      const allowed = await queries.isTeacherForStudent(req.user.id, studentId)
      if (!allowed) return res.status(403).json({ message: "Forbidden" })
      const feedback = await queries.createFeedbackForTeacher({
        teacherUserId: req.user.id,
        studentId,
        feedbackDate: req.body.feedbackDate,
        author: req.body.author,
        satisfaction: req.body.satisfaction,
        progress: req.body.progress,
        difficulties: req.body.difficulties,
        comment: req.body.comment,
      })
      res.status(201).json({ feedback })
    } catch (err) {
      next(err)
    }
  }
)

router.patch(
  "/feedback/:id",
  body("feedbackDate").optional({ values: "falsy" }).isISO8601(),
  body("author").optional({ values: "falsy" }).isString(),
  body("satisfaction").optional({ values: "falsy" }).isString(),
  body("progress").optional({ values: "falsy" }).isString(),
  body("difficulties").optional({ values: "falsy" }).isString(),
  body("comment").optional({ values: "falsy" }).isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const feedback = await queries.updateFeedbackForTeacher(
        req.user.id,
        Number(req.params.id),
        req.body
      )
      if (!feedback) return res.status(404).json({ message: "Not found" })
      res.json({ feedback })
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
  body("reportMonth").optional({ values: "falsy" }).matches(/^\d{4}-\d{2}(-\d{2})?$/),
  body("status").optional({ values: "falsy" }).isString(),
  body("summary").optional({ values: "falsy" }).isString(),
  body("strengths").optional({ values: "falsy" }).isString(),
  body("improvements").optional({ values: "falsy" }).isString(),
  body("recommendations").optional({ values: "falsy" }).isString(),
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
      const reportMonth = monthStart(req.body.reportMonth)
      const evaluations = await queries.listEvaluationsForStudent(studentId)
      const draft = buildReportDraft(student, evaluations, reportMonth, language)

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
        reportMonth,
        status: req.body.status || "draft",
        summary: req.body.summary || draft.summary,
        strengths: req.body.strengths || draft.strengths,
        improvements: req.body.improvements || draft.improvements,
        recommendations: req.body.recommendations || draft.recommendations,
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

router.patch(
  "/reports/:id",
  body("title").optional().isString(),
  body("includesCharts").optional().isBoolean(),
  body("reportMonth").optional({ values: "falsy" }).matches(/^\d{4}-\d{2}(-\d{2})?$/),
  body("status").optional({ values: "falsy" }).isString(),
  body("summary").optional({ values: "falsy" }).isString(),
  body("strengths").optional({ values: "falsy" }).isString(),
  body("improvements").optional({ values: "falsy" }).isString(),
  body("recommendations").optional({ values: "falsy" }).isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const report = await queries.updateGeneratedReport(
        Number(req.params.id),
        req.user.id,
        {
          ...req.body,
          reportMonth: req.body.reportMonth ? monthStart(req.body.reportMonth) : undefined,
        }
      )
      if (!report) return res.status(404).json({ message: "Not found" })
      res.json({ report })
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
