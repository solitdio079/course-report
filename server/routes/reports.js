const express = require("express")
const queries = require("../db/queries")
const { requireAuth } = require("../middlewares/auth")
const { buildReportPdf } = require("../lib/reportPdf")

const router = express.Router()

router.use(requireAuth)

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const report = await queries.findReportById(id)
    if (!report) return res.status(404).json({ message: "Not found" })

    const ok = await queries.canAccessReport(id, req.user)
    if (!ok) return res.status(403).json({ message: "Forbidden" })

    const evaluations =
      report.report_type === "course"
        ? await queries.listEvaluationsForStudent(report.student_id)
        : []
    res.json({ report, evaluations })
  } catch (err) {
    next(err)
  }
})

router.get("/:id/pdf", async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const report = await queries.findReportById(id)
    if (!report) return res.status(404).json({ message: "Not found" })

    const ok = await queries.canAccessReport(id, req.user)
    if (!ok) return res.status(403).json({ message: "Forbidden" })

    const evaluations =
      report.report_type === "course"
        ? await queries.listEvaluationsForStudent(report.student_id)
        : []

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
