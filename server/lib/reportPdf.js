const fs = require("fs")
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
 *   criteria?: Record<string, string>|null,
 * }>} params.evaluations
 * @param {NodeJS.WritableStream} params.stream
 */
function buildReportPdf({ report, evaluations, stream, language = "en" }) {
  const doc = new PDFDocument({ size: "A4", margin: 50 })
  doc.pipe(stream)
  useUnicodeFont(doc)

  const isSocial = report.report_type === "social"
  const lang = normalizeLanguage(language)
  const labels = PDF_LABELS[lang]
  const { left, right } = pageBounds(doc)
  const contentWidth = right - left
  const header = reportHeaderParts(report, isSocial, labels, lang)

  // Header
  doc.rect(0, 0, doc.page.width, 148).fill("#ecfdf5")
  doc
    .roundedRect(left, 34, 58, 58, 14)
    .fill("#0f766e")
    .fillColor("#ffffff")
    .fontSize(18)
    .text("CR", left, 52, { width: 58, align: "center" })

  doc
    .fontSize(22)
    .fillColor("#0f172a")
    .text(header.title, left + 74, 35, {
      width: contentWidth - 74,
      align: "left",
    })
  doc
    .fontSize(15)
    .fillColor("#0f766e")
    .text(header.subtitle, left + 74, 64, { width: contentWidth - 74 })

  const authorLine = report.author_name
    ? `   •   ${labels.author}: ${report.author_name}` +
      (report.author_role ? ` (${report.author_role})` : "")
    : ""
  doc
    .fontSize(10)
    .fillColor("#475569")
    .text(
      `${labels.student}: ${report.first_name} ${report.last_name}` +
        authorLine +
        `   •   ${labels.generated}: ${formatDateTime(report.created_at, lang)}`,
      left + 74,
      92,
      { width: contentWidth - 74 }
    )

  doc.y = 172
  doc.x = left

  // Free-form content (used by social reports)
  if (report.content) {
    drawSectionTitle(doc, labels.report, labels.teacherNotes)
    doc
      .fontSize(11)
      .fillColor("#111827")
      .text(report.content, left, doc.y, { width: contentWidth, align: "left" })
    doc.y += 20
  }

  // Performance chart (course reports only)
  const reportEvaluations = monthlyEvaluations(evaluations, report)

  if (!isSocial) {
    drawReportDraftBlocks(doc, report, labels)
    drawSectionTitle(doc, labels.monthlyOverview, labels.monthlyOverviewSub)
    drawMonthlySummary(doc, reportEvaluations, labels)
  }

  if (!isSocial && report.includes_charts) {
    drawSectionTitle(doc, labels.ratingChart, labels.ratingChartSub)
    drawPointsChart(doc, reportEvaluations, labels, lang)
  }

  if (isSocial) {
    doc.end()
    return
  }

  // Evaluations
  if (reportEvaluations && reportEvaluations.length > 0) ensureSpace(doc, 250)
  drawSectionTitle(doc, labels.evaluationTimeline, labels.evaluationTimelineSub)

  if (!reportEvaluations || reportEvaluations.length === 0) {
    doc.fontSize(10).fillColor("#6b7280").text(labels.noEvaluations, left, doc.y, {
      width: contentWidth,
    })
  } else {
    reportEvaluations.forEach((e) => drawEvaluationCard(doc, e, labels, lang))
  }

  doc.end()
}

const PDF_LABELS = {
  en: {
    author: "Author",
    generated: "Generated",
    student: "Student",
    monthlyCourseReport: "Monthly course report",
    socialReport: "Social report",
    report: "Report",
    teacherNotes: "Teacher notes and context",
    monthlyOverview: "Monthly overview",
    monthlyOverviewSub: "A warm summary of this student's month",
    ratingChart: "Rating chart",
    ratingChartSub: "Progress rating from each evaluation",
    evaluationTimeline: "Evaluation timeline",
    evaluationTimelineSub: "Dated teacher observations",
    averageRating: (rating, count) =>
      `Average rating: ${rating}/5 across ${count} evaluation(s).`,
    noRatings: "No ratings recorded.",
    commentOverview: "Comment overview",
    noTeacherComments: "No teacher comments recorded.",
    noNumericPoints: "No numeric points to chart.",
    noEvaluations: "No evaluations.",
    noCourseComment: "No course comment recorded.",
    teacherComment: "Teacher comment",
    progressNote: "Progress note",
    reportSummary: "Teacher monthly summary",
    strengths: "Strengths",
    improvements: "Areas to improve",
    recommendations: "Recommendations",
    session: "Session",
    objectives: "Objectives",
    sessionSummary: "Session summary",
    difficulties: "Difficulties",
    mistakes: "Mistakes noticed",
    homework: "Homework",
    recording: "Recording",
    sessionSkills: "Session skills",
    moodCheck: "MoodCheck",
    criteriaLabel: "Evaluation criteria",
    by: "by",
    criteria: {
      vocabulary: "Vocabulary",
      grammar: "Grammar",
      listening_comprehension: "Listening comprehension",
      reading_comprehension: "Reading comprehension",
      speaking: "Speaking",
      writing: "Writing",
      pronunciation: "Pronunciation",
      confidence: "Confidence",
      autonomy: "Autonomy",
    },
    statuses: {
      in_progress: "In progress",
      needs_work: "Needs work",
      priority: "Priority to strengthen",
    },
  },
  tr: {
    author: "Hazırlayan",
    generated: "Oluşturulma",
    student: "Öğrenci",
    monthlyCourseReport: "Aylık ders raporu",
    socialReport: "Sosyal rapor",
    report: "Rapor",
    teacherNotes: "Öğretmen notları ve bağlam",
    monthlyOverview: "Aylık özet",
    monthlyOverviewSub: "Öğrencinin bu ayki gelişimine sıcak bir bakış",
    ratingChart: "Puan grafiği",
    ratingChartSub: "Her değerlendirmedeki gelişim puanı",
    evaluationTimeline: "Değerlendirme zaman çizelgesi",
    evaluationTimelineSub: "Tarihli öğretmen gözlemleri",
    averageRating: (rating, count) =>
      `${count} değerlendirme üzerinden ortalama puan: ${rating}/5.`,
    noRatings: "Puan kaydedilmedi.",
    commentOverview: "Yorum özeti",
    noTeacherComments: "Öğretmen yorumu kaydedilmedi.",
    noNumericPoints: "Grafik için sayısal puan yok.",
    noEvaluations: "Değerlendirme yok.",
    noCourseComment: "Ders yorumu kaydedilmedi.",
    teacherComment: "Öğretmen yorumu",
    progressNote: "Gelişim notu",
    reportSummary: "Öğretmenin aylık özeti",
    strengths: "Güçlü yönler",
    improvements: "Geliştirilecek alanlar",
    recommendations: "Öneriler",
    session: "Ders oturumu",
    objectives: "Hedefler",
    sessionSummary: "Oturum özeti",
    difficulties: "Zorlanılan noktalar",
    mistakes: "Fark edilen hatalar",
    homework: "Ödev",
    recording: "Kayıt",
    sessionSkills: "Oturum becerileri",
    moodCheck: "MoodCheck",
    criteriaLabel: "Değerlendirme kriterleri",
    by: "hazırlayan",
    criteria: {
      vocabulary: "Kelime bilgisi",
      grammar: "Dil bilgisi",
      listening_comprehension: "Dinleme anlama",
      reading_comprehension: "Okuma anlama",
      speaking: "Konuşma",
      writing: "Yazma",
      pronunciation: "Telaffuz",
      confidence: "Özgüven",
      autonomy: "Özerklik",
    },
    statuses: {
      in_progress: "Gelişiyor",
      needs_work: "Çalışılmalı",
      priority: "Öncelikli güçlendirilmeli",
    },
  },
  fr: {
    author: "Auteur",
    generated: "Généré",
    student: "Élève",
    monthlyCourseReport: "Rapport mensuel de cours",
    socialReport: "Rapport social",
    report: "Rapport",
    teacherNotes: "Notes du professeur et contexte",
    monthlyOverview: "Aperçu mensuel",
    monthlyOverviewSub: "Un résumé clair du mois de l'élève",
    ratingChart: "Graphique des notes",
    ratingChartSub: "Note de progression de chaque évaluation",
    evaluationTimeline: "Historique des évaluations",
    evaluationTimelineSub: "Observations datées du professeur",
    averageRating: (rating, count) =>
      `Note moyenne : ${rating}/5 sur ${count} évaluation(s).`,
    noRatings: "Aucune note enregistrée.",
    commentOverview: "Résumé des commentaires",
    noTeacherComments: "Aucun commentaire professeur enregistré.",
    noNumericPoints: "Aucune note numérique à afficher.",
    noEvaluations: "Aucune évaluation.",
    noCourseComment: "Aucun commentaire de cours enregistré.",
    teacherComment: "Commentaire du professeur",
    progressNote: "Note de progression",
    reportSummary: "Résumé mensuel du professeur",
    strengths: "Points forts",
    improvements: "Axes d'amélioration",
    recommendations: "Recommandations",
    session: "Séance",
    objectives: "Objectifs",
    sessionSummary: "Résumé de séance",
    difficulties: "Difficultés",
    mistakes: "Erreurs observées",
    homework: "Devoirs",
    recording: "Enregistrement",
    sessionSkills: "Compétences travaillées",
    moodCheck: "MoodCheck",
    criteriaLabel: "Critères d'évaluation",
    by: "par",
    criteria: {
      vocabulary: "Vocabulaire",
      grammar: "Grammaire",
      listening_comprehension: "Compréhension orale",
      reading_comprehension: "Compréhension écrite",
      speaking: "Expression orale",
      writing: "Expression écrite",
      pronunciation: "Prononciation",
      confidence: "Confiance",
      autonomy: "Autonomie",
    },
    statuses: {
      in_progress: "En progrès",
      needs_work: "À travailler",
      priority: "Priorité à renforcer",
    },
  },
}

function normalizeLanguage(language) {
  const normalized = String(language || "").toLowerCase()
  if (normalized.startsWith("tr")) return "tr"
  if (normalized.startsWith("fr")) return "fr"
  return "en"
}

function useUnicodeFont(doc) {
  const candidates = [
    "/Library/Fonts/Arial Unicode.ttf",
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
  ]
  const fontPath = candidates.find((candidate) => fs.existsSync(candidate))
  if (fontPath) doc.font(fontPath)
}

function reportHeaderParts(report, isSocial, labels, language) {
  if (!isSocial) {
    return {
      title: labels.monthlyCourseReport,
      subtitle: `${report.first_name} ${report.last_name} · ${formatMonthYear(
        report.created_at,
        language
      )}`,
    }
  }

  return {
    title: report.title || labels.socialReport,
    subtitle: `${report.first_name} ${report.last_name}`,
  }
}

function formatCriteria(criteria, labels) {
  if (!criteria || typeof criteria !== "object" || Array.isArray(criteria)) {
    return []
  }

  return Object.entries(labels.criteria)
    .map(([key, label]) => {
      const status = labels.statuses[criteria[key]]
      return status ? `${label}: ${status}` : null
    })
    .filter(Boolean)
}

function compactText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function formatSessionSkills(skills, labels) {
  if (!skills) return []
  if (Array.isArray(skills)) {
    return skills
      .map((skill) => {
        if (!skill || typeof skill !== "object") return null
        const label = compactText(skill.label) || compactText(skill.name) || compactText(skill.key)
        const score = Number(skill.score)
        if (!label || !Number.isFinite(score)) return null
        return `${label}: ${Math.max(1, Math.min(5, Math.round(score)))}/5`
      })
      .filter(Boolean)
  }
  if (typeof skills === "object") {
    return Object.entries(skills)
      .map(([key, value]) => {
        const score = Number(value)
        return Number.isFinite(score)
          ? `${key}: ${Math.max(1, Math.min(5, Math.round(score)))}/5`
          : null
      })
      .filter(Boolean)
  }
  return []
}

function formatMoodCheck(moodCheck) {
  if (!moodCheck) return null
  if (typeof moodCheck === "string") return compactText(moodCheck)
  if (typeof moodCheck !== "object" || Array.isArray(moodCheck)) return null
  return Object.entries(moodCheck)
    .map(([key, value]) => {
      if (value == null || value === "") return null
      return `${key}: ${value}`
    })
    .filter(Boolean)
    .join("   |   ")
}

function evaluationOverviewTexts(evaluation) {
  return [
    evaluation.session_summary,
    evaluation.teacher_comment,
    evaluation.session_difficulties,
    evaluation.session_mistakes,
    evaluation.session_homework,
    evaluation.progress_appreciation,
  ].filter((comment) => typeof comment === "string" && comment.trim())
}

function monthlyEvaluations(evaluations, report) {
  const source = evaluations || []
  const monthSource = report.report_month || report.created_at
  const inMonth = source.filter((evaluation) =>
    sameMonth(evaluation.session_date || evaluation.created_at, monthSource)
  )
  return inMonth.length > 0 ? inMonth : source
}

function sameMonth(date, monthSource) {
  const left = new Date(date)
  const right = new Date(monthSource)
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth()
  )
}

function numericRatings(evaluations) {
  return (evaluations || [])
    .filter((e) => e.points != null)
    .map((e) => Number(e.points))
    .filter((value) => Number.isFinite(value))
    .map((value) => Math.max(1, Math.min(5, Math.round(value))))
}

function drawMonthlySummary(doc, evaluations, labels) {
  const { left, right } = pageBounds(doc)
  const width = right - left
  const ratings = numericRatings(evaluations)
  const comments = (evaluations || [])
    .flatMap((evaluation) => evaluationOverviewTexts(evaluation))
    .slice(0, 3)
  const summaryTop = doc.y
  const summaryHeight = Math.max(122, 82 + comments.length * 17)

  doc.roundedRect(left, summaryTop, width, summaryHeight, 10).fill("#f8fafc")
  doc.x = left + 18
  doc.y = summaryTop + 15

  if (ratings.length > 0) {
    const average =
      ratings.reduce((total, rating) => total + rating, 0) / ratings.length
    drawRatingPill(doc, left + 18, summaryTop + 14, average.toFixed(1))
    doc
      .fontSize(11)
      .fillColor("#334155")
      .text(
        labels.averageRating(average.toFixed(1), ratings.length),
        left + 120,
        summaryTop + 20,
        { width: width - 140 }
      )
  } else {
    doc.fontSize(10).fillColor("#6b7280").text(labels.noRatings, left + 18, doc.y, {
      width: width - 36,
    })
  }

  doc.fontSize(10).fillColor("#0f172a").text(labels.commentOverview, left + 18, summaryTop + 58, {
    width: width - 36,
  })
  if (comments.length === 0) {
    doc.fontSize(10).fillColor("#6b7280").text(labels.noTeacherComments, left + 18, doc.y + 4, {
      width: width - 36,
    })
    doc.y = summaryTop + summaryHeight + 20
    doc.x = left
    return
  }

  doc.y += 4
  comments.forEach((comment) => {
    doc.fontSize(9.5).fillColor("#475569").text(`- ${comment}`, left + 18, doc.y, {
      width: width - 36,
    })
  })
  doc.y = Math.max(doc.y + 20, summaryTop + summaryHeight + 20)
  doc.x = left
}

function drawReportDraftBlocks(doc, report, labels) {
  const blocks = [
    [labels.reportSummary, report.summary],
    [labels.strengths, report.strengths],
    [labels.improvements, report.improvements],
    [labels.recommendations, report.recommendations],
  ].filter(([, value]) => compactText(value))

  if (blocks.length === 0) return
  drawSectionTitle(doc, labels.report, labels.teacherNotes)
  const { left, right } = pageBounds(doc)
  const width = right - left

  blocks.forEach(([title, value]) => {
    const text = compactText(value)
    const height = Math.max(64, 48 + Math.ceil(text.length / 95) * 12)
    ensureSpace(doc, height + 10)
    const top = doc.y
    doc.roundedRect(left, top, width, height, 10).fill("#fff7ed")
    doc
      .fontSize(10)
      .fillColor("#9a3412")
      .text(title, left + 16, top + 13, { width: width - 32 })
    doc
      .fontSize(10)
      .fillColor("#334155")
      .text(text, left + 16, doc.y + 5, { width: width - 32 })
    doc.y = top + height + 10
    doc.x = left
  })
}

function formatRating(points) {
  const value = Number(points)
  if (!Number.isFinite(value)) return points
  return Math.max(1, Math.min(5, Math.round(value)))
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

function drawSectionTitle(doc, title, subtitle) {
  ensureSpace(doc, 88)
  const { left, right } = pageBounds(doc)
  doc.x = left
  doc.moveDown(0.2)
  doc
    .fontSize(16)
    .fillColor("#0f172a")
    .text(title, left, doc.y, { width: right - left })
  if (subtitle) {
    doc
      .fontSize(9)
      .fillColor("#64748b")
      .text(subtitle, left, doc.y + 3, { width: right - left })
  }
  doc.y += 14
  doc.x = left
}

function drawRatingPill(doc, x, y, rating) {
  doc.roundedRect(x, y, 84, 34, 17).fill("#dcfce7")
  doc
    .fontSize(14)
    .fillColor("#166534")
    .text(`${rating}/5`, x, y + 9, { width: 84, align: "center" })
}

function drawEvaluationCard(doc, evaluation, labels, language) {
  const { left, right } = pageBounds(doc)
  const width = right - left
  const criteriaLines = formatCriteria(evaluation.criteria, labels)
  const skillLines = formatSessionSkills(evaluation.session_skills, labels)
  const moodCheck = formatMoodCheck(evaluation.session_mood_check)
  const timeRange =
    evaluation.session_start_time || evaluation.session_end_time
      ? [evaluation.session_start_time, evaluation.session_end_time].filter(Boolean).join(" - ")
      : null
  const sessionMeta = [
    evaluation.session_title,
    evaluation.session_date ? formatDateTime(evaluation.session_date, language) : null,
    timeRange,
    evaluation.course_name,
  ]
    .map(compactText)
    .filter(Boolean)
    .join("  •  ")
  const detailBlocks = [
    sessionMeta ? [labels.session, sessionMeta] : null,
    compactText(evaluation.session_objectives)
      ? [labels.objectives, compactText(evaluation.session_objectives)]
      : null,
    compactText(evaluation.session_summary)
      ? [labels.sessionSummary, compactText(evaluation.session_summary)]
      : null,
    compactText(evaluation.teacher_comment)
      ? [labels.teacherComment, compactText(evaluation.teacher_comment)]
      : null,
    compactText(evaluation.session_difficulties)
      ? [labels.difficulties, compactText(evaluation.session_difficulties)]
      : null,
    compactText(evaluation.session_mistakes)
      ? [labels.mistakes, compactText(evaluation.session_mistakes)]
      : null,
    compactText(evaluation.session_homework) || compactText(evaluation.progress_appreciation)
      ? [
          labels.homework,
          [evaluation.session_homework, evaluation.progress_appreciation]
            .map(compactText)
            .filter(Boolean)
            .join(" "),
        ]
      : null,
    compactText(evaluation.session_recording)
      ? [labels.recording, compactText(evaluation.session_recording)]
      : null,
    skillLines.length > 0 ? [labels.sessionSkills, skillLines.join("   |   ")] : null,
    moodCheck ? [labels.moodCheck, moodCheck] : null,
    criteriaLines.length > 0 ? [labels.criteriaLabel || "Criteria", criteriaLines.join("   |   ")] : null,
  ].filter(Boolean)
  const estimatedText = detailBlocks.map(([, text]) => text).join(" ")
  const cardHeight = Math.max(142, 82 + detailBlocks.length * 24 + Math.ceil(estimatedText.length / 95) * 10)

  ensureSpace(doc, cardHeight + 18)
  const top = doc.y

  doc.roundedRect(left, top, width, cardHeight, 10).fill("#ffffff")
  doc.roundedRect(left, top, width, cardHeight, 10).strokeColor("#dbeafe").stroke()

  const meta = [
    formatDateTime(evaluation.created_at, language),
    evaluation.session_id ? labels.session : evaluation.course_name || null,
    evaluation.teacher_name ? `${labels.by} ${evaluation.teacher_name}` : null,
  ]
    .filter(Boolean)
    .join("  •  ")

  doc
    .fontSize(9)
    .fillColor("#64748b")
    .text(meta, left + 18, top + 16, { width: width - 128 })

  if (evaluation.points != null) {
    drawRatingPill(doc, right - 100, top + 12, formatRating(evaluation.points))
  }

  let y = top + 46
  if (detailBlocks.length === 0) {
    doc
      .fontSize(10)
      .fillColor("#334155")
      .text(labels.noCourseComment, left + 18, y, { width: width - 36 })
    y = doc.y + 8
  }

  detailBlocks.forEach(([label, text]) => {
    doc
      .fontSize(9)
      .fillColor("#0f766e")
      .text(label, left + 18, y, { width: width - 36 })
    doc
      .fontSize(9.5)
      .fillColor("#334155")
      .text(text, left + 18, doc.y + 2, { width: width - 36 })
    y = doc.y + 8
  })

  doc.y = top + cardHeight + 14
  doc.x = left
}

function ensureSpace(doc, neededHeight) {
  const bottom = doc.page.height - doc.page.margins.bottom
  if (doc.y + neededHeight > bottom) {
    doc.addPage()
    doc.x = doc.page.margins.left
    doc.y = doc.page.margins.top
  }
}

function drawPointsChart(doc, evaluations, labels, language) {
  const numeric = (evaluations || [])
    .filter((e) => e.points != null)
    .map((e) => ({
      date: new Date(e.created_at),
      value: formatRating(e.points),
      course: e.course_name || "—",
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  if (numeric.length === 0) {
    const { left, right } = pageBounds(doc)
    doc.fontSize(10).fillColor("#6b7280").text(labels.noNumericPoints, left, doc.y, {
      width: right - left,
    })
    return
  }

  const { left, right } = pageBounds(doc)
  ensureSpace(doc, 275)
  const chartBoxTop = doc.y
  const chartBoxHeight = 250
  doc.roundedRect(left, chartBoxTop, right - left, chartBoxHeight, 10).fill("#f8fafc")

  const chartLeft = left + 58
  const chartRight = right - 26
  const chartTop = chartBoxTop + 28
  const chartHeight = 180
  const chartBottom = chartTop + chartHeight
  const chartWidth = chartRight - chartLeft

  const yMax = 5
  const yMin = 1

  // Y axis grid + labels (1 to 5 stars)
  const ticks = [1, 2, 3, 4, 5]
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
      .text(String(t), chartLeft - 28, y - 4, { width: 24, align: "right" })
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
      .text(String(n.value), x - 12, y - 14, { width: 24, align: "center" })
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
    const label = n.date.toLocaleDateString(localeForLanguage(language))
    doc
      .fillColor("#6b7280")
      .fontSize(8)
      .text(label, x - 30, chartBottom + 8, { width: 60, align: "center" })
  })

  doc.x = left
  doc.y = chartBoxTop + chartBoxHeight + 28
}

function localeForLanguage(language) {
  if (language === "tr") return "tr-TR"
  if (language === "fr") return "fr-FR"
  return "en-US"
}

function formatDateTime(value, language) {
  return new Date(value).toLocaleString(localeForLanguage(language))
}

function formatMonthYear(value, language) {
  return new Date(value).toLocaleString(localeForLanguage(language), {
    month: "long",
    year: "numeric",
  })
}

function pageBounds(doc) {
  const left = doc.page.margins.left
  const right = doc.page.width - doc.page.margins.right
  return { left, right }
}

module.exports = { buildReportPdf }
