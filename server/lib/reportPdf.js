const PDFDocument = require("pdfkit")

/**
 * Build a PDF report and write it into the provided writable stream.
 *
 * @param {object} params
 * @param {{ id: number, title: string, created_at: string|Date, includes_charts: boolean,
 *           first_name: string, last_name: string, author_name: string|null }} params.report
 * @param {Array<{
 *   created_at: string|Date,
 *   course_name: string|null,
 *   teacher_name?: string|null,
 *   points: string|number|null,
 *   teacher_comment: string|null,
 *   progress_appreciation: string|null,
 * }>} params.evaluations
 * @param {NodeJS.WritableStream} params.stream
 */
function buildReportPdf({ report, evaluations, stream }) {
  const doc = new PDFDocument({ size: "A4", margin: 50 })
  doc.pipe(stream)

  const isSocial = report.report_type === "social"

  // Header
  doc
    .fontSize(20)
    .fillColor("#111827")
    .text(report.title || (isSocial ? "Social report" : "Course report"), {
      align: "left",
    })

  doc.moveDown(0.3)
  const authorLine = report.author_name
    ? `   •   Author: ${report.author_name}` +
      (report.author_role ? ` (${report.author_role})` : "")
    : ""
  doc
    .fontSize(10)
    .fillColor("#6b7280")
    .text(
      `Student: ${report.first_name} ${report.last_name}` +
        authorLine +
        `   •   Generated: ${new Date(report.created_at).toLocaleString()}`
    )

  doc.moveDown(1)
  drawDivider(doc)

  // Free-form content (used by social reports)
  if (report.content) {
    doc.moveDown(0.6)
    doc.fontSize(14).fillColor("#111827").text("Report")
    doc.moveDown(0.3)
    doc
      .fontSize(11)
      .fillColor("#111827")
      .text(report.content, { align: "left" })
    doc.moveDown(0.6)
    drawDivider(doc)
  }

  // Performance chart (course reports only)
  if (!isSocial && report.includes_charts) {
    doc.moveDown(0.6)
    doc.fontSize(14).fillColor("#111827").text("Performance")
    doc.moveDown(0.3)
    drawPointsChart(doc, evaluations)
    doc.moveDown(0.6)
    drawDivider(doc)
  }

  if (isSocial) {
    doc.end()
    return
  }

  // Evaluations
  doc.moveDown(0.6)
  doc.fontSize(14).fillColor("#111827").text("Evaluations")
  doc.moveDown(0.3)

  if (!evaluations || evaluations.length === 0) {
    doc.fontSize(10).fillColor("#6b7280").text("No evaluations.")
  } else {
    evaluations.forEach((e, i) => {
      if (i > 0) doc.moveDown(0.6)

      const meta = [
        new Date(e.created_at).toLocaleString(),
        e.course_name || null,
        e.teacher_name ? `by ${e.teacher_name}` : null,
        e.points != null ? `${e.points} pts` : null,
      ]
        .filter(Boolean)
        .join("  •  ")

      doc.fontSize(10).fillColor("#6b7280").text(meta)

      if (e.teacher_comment) {
        doc.moveDown(0.2)
        doc.fontSize(11).fillColor("#111827").text(e.teacher_comment)
      }
      if (e.progress_appreciation) {
        doc.moveDown(0.2)
        doc
          .fontSize(10)
          .fillColor("#374151")
          .text(`Progress: ${e.progress_appreciation}`, { oblique: true })
      }
    })
  }

  doc.end()
}

function drawDivider(doc) {
  const { left, right } = pageBounds(doc)
  const y = doc.y
  doc
    .strokeColor("#e5e7eb")
    .lineWidth(1)
    .moveTo(left, y)
    .lineTo(right, y)
    .stroke()
  doc.moveDown(0.2)
}

function drawPointsChart(doc, evaluations) {
  const numeric = (evaluations || [])
    .filter((e) => e.points != null)
    .map((e) => ({
      date: new Date(e.created_at),
      value: Number(e.points),
      course: e.course_name || "—",
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  if (numeric.length === 0) {
    doc.fontSize(10).fillColor("#6b7280").text("No numeric points to chart.")
    return
  }

  const { left, right } = pageBounds(doc)
  const chartLeft = left + 40
  const chartRight = right - 20
  const chartTop = doc.y + 10
  const chartHeight = 180
  const chartBottom = chartTop + chartHeight
  const chartWidth = chartRight - chartLeft

  const yMax = 100
  const yMin = 0

  // Y axis grid + labels (0, 25, 50, 75, 100)
  const ticks = [0, 25, 50, 75, 100]
  ticks.forEach((t) => {
    const y = chartBottom - ((t - yMin) / (yMax - yMin)) * chartHeight
    doc
      .strokeColor("#e5e7eb")
      .lineWidth(0.5)
      .moveTo(chartLeft, y)
      .lineTo(chartRight, y)
      .stroke()
    doc
      .fillColor("#6b7280")
      .fontSize(8)
      .text(String(t), chartLeft - 28, y - 4, { width: 24, align: "right", lineBreak: false })
  })

  // Axes
  doc
    .strokeColor("#9ca3af")
    .lineWidth(1)
    .moveTo(chartLeft, chartTop)
    .lineTo(chartLeft, chartBottom)
    .lineTo(chartRight, chartBottom)
    .stroke()

  // Compute x positions: evenly spaced (or by time if range > 0)
  const tMin = numeric[0].date.getTime()
  const tMax = numeric[numeric.length - 1].date.getTime()
  const span = tMax - tMin
  const xFor = (i, t) => {
    if (numeric.length === 1) return chartLeft + chartWidth / 2
    if (span === 0) return chartLeft + (i / (numeric.length - 1)) * chartWidth
    return chartLeft + ((t - tMin) / span) * chartWidth
  }
  const yFor = (v) =>
    chartBottom - ((Math.max(yMin, Math.min(yMax, v)) - yMin) / (yMax - yMin)) * chartHeight

  // Line connecting points
  doc.strokeColor("#2563eb").lineWidth(1.5)
  numeric.forEach((n, i) => {
    const x = xFor(i, n.date.getTime())
    const y = yFor(n.value)
    if (i === 0) doc.moveTo(x, y)
    else doc.lineTo(x, y)
  })
  doc.stroke()

  // Points + value labels
  numeric.forEach((n, i) => {
    const x = xFor(i, n.date.getTime())
    const y = yFor(n.value)
    doc.fillColor("#2563eb").circle(x, y, 3).fill()
    doc
      .fillColor("#111827")
      .fontSize(8)
      .text(String(n.value), x - 12, y - 14, { width: 24, align: "center", lineBreak: false })
  })

  // X axis date labels (first, middle, last)
  const xLabels = []
  if (numeric.length === 1) xLabels.push(0)
  else {
    xLabels.push(0, Math.floor((numeric.length - 1) / 2), numeric.length - 1)
  }
  xLabels.forEach((idx) => {
    const n = numeric[idx]
    const x = xFor(idx, n.date.getTime())
    const label = n.date.toLocaleDateString()
    doc
      .fillColor("#6b7280")
      .fontSize(8)
      .text(label, x - 30, chartBottom + 4, { width: 60, align: "center", lineBreak: false })
  })

  doc.y = chartBottom + 22
}

function pageBounds(doc) {
  const left = doc.page.margins.left
  const right = doc.page.width - doc.page.margins.right
  return { left, right }
}

module.exports = { buildReportPdf }
