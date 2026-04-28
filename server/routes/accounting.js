const express = require("express")
const { body, validationResult } = require("express-validator")

const queries = require("../db/queries")
const { requireAuth, requireRole } = require("../middlewares/auth")

const router = express.Router()

router.use(requireAuth, requireRole("accountant", "admin"))

// ----- Payments -----

router.get("/payments", async (req, res, next) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : null
    const search = typeof req.query.q === "string" ? req.query.q.trim() : null
    const payments = await queries.listPayments({ status, search })
    res.json({ payments })
  } catch (err) {
    next(err)
  }
})

router.get("/payments/summary", async (req, res, next) => {
  try {
    res.json({ summary: await queries.paymentSummary() })
  } catch (err) {
    next(err)
  }
})

router.post(
  "/payments",
  body("studentId").isInt({ min: 1 }),
  body("amount").isFloat({ gt: 0 }),
  body("dueDate").isISO8601(),
  body("status").optional().isIn(["pending", "paid", "overdue", "cancelled"]),
  body("notes").optional({ values: "falsy" }).isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const payment = await queries.createPayment({
        studentId: Number(req.body.studentId),
        amount: req.body.amount,
        dueDate: req.body.dueDate,
        status: req.body.status,
        notes: req.body.notes,
      })
      res.status(201).json({ payment })
    } catch (err) {
      next(err)
    }
  }
)

router.patch(
  "/payments/:id",
  body("amount").optional().isFloat({ gt: 0 }),
  body("dueDate").optional().isISO8601(),
  body("paidDate").optional({ values: "falsy" }).isISO8601(),
  body("status").optional().isIn(["pending", "paid", "overdue", "cancelled"]),
  body("notes").optional({ values: "falsy" }).isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const id = Number(req.params.id)
      const updated = await queries.updatePayment(id, {
        amount: req.body.amount,
        dueDate: req.body.dueDate,
        paidDate: req.body.paidDate ?? null,
        status: req.body.status,
        notes: req.body.notes,
      })
      if (!updated) return res.status(404).json({ message: "Not found" })
      res.json({ payment: updated })
    } catch (err) {
      next(err)
    }
  }
)

router.delete("/payments/:id", async (req, res, next) => {
  try {
    await queries.deletePayment(Number(req.params.id))
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// Send a payment reminder (creates notifications + individual inbox messages
// for each parent of the payment's student).
router.post("/payments/:id/remind", async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const payment = await queries.findPaymentById(id)
    if (!payment) return res.status(404).json({ message: "Not found" })

    const parentIds = await queries.listParentUserIdsForStudent(
      payment.student_id
    )
    if (parentIds.length === 0) {
      return res.json({ sent: 0 })
    }

    const subject = "Payment reminder"
    const message = `A payment of ${payment.amount} is due on ${
      typeof payment.due_date === "string"
        ? payment.due_date.slice(0, 10)
        : new Date(payment.due_date).toISOString().slice(0, 10)
    }. Status: ${payment.status}.`

    let sent = 0
    for (const parentUserId of parentIds) {
      await queries.createNotification({
        recipientUserId: parentUserId,
        studentId: payment.student_id,
        title: subject,
        message,
      })
      const inboxId = await queries.getOrCreateIndividualInbox(parentUserId)
      await queries.createMessage({
        inboxId,
        senderId: req.user.id,
        subject,
        body: message,
      })
      sent++
    }

    res.json({ sent })
  } catch (err) {
    next(err)
  }
})

// ----- Expenses -----

router.get("/expenses", async (req, res, next) => {
  try {
    const expenses = await queries.listExpenses()
    res.json({ expenses, summary: await queries.expenseSummary() })
  } catch (err) {
    next(err)
  }
})

router.post(
  "/expenses",
  body("title").trim().isLength({ min: 1, max: 255 }),
  body("amount").isFloat({ gt: 0 }),
  body("expenseDate").isISO8601(),
  body("description").optional({ values: "falsy" }).isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const expense = await queries.createExpense({
        title: req.body.title,
        amount: req.body.amount,
        expenseDate: req.body.expenseDate,
        description: req.body.description,
        createdBy: req.user.id,
      })
      res.status(201).json({ expense })
    } catch (err) {
      next(err)
    }
  }
)

router.delete("/expenses/:id", async (req, res, next) => {
  try {
    await queries.deleteExpense(Number(req.params.id))
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ----- Ledger (combined payments + expenses by day) -----

function isValidMonth(s) {
  return typeof s === "string" && /^\d{4}-\d{2}$/.test(s)
}

router.get("/ledger", async (req, res, next) => {
  try {
    const month = isValidMonth(req.query.month) ? req.query.month : null
    const rows = await queries.listLedger({ month })
    const totals = rows.reduce(
      (acc, r) => {
        acc.in += Number(r.payments_in) || 0
        acc.out += Number(r.expenses_out) || 0
        acc.net += Number(r.net) || 0
        return acc
      },
      { in: 0, out: 0, net: 0 }
    )
    res.json({ month, rows, totals })
  } catch (err) {
    next(err)
  }
})

router.get("/ledger.csv", async (req, res, next) => {
  try {
    const month = isValidMonth(req.query.month) ? req.query.month : null
    const rows = await queries.listLedger({ month })

    const fmtDate = (d) =>
      typeof d === "string" ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10)
    const fmtNum = (n) => (Number(n) || 0).toFixed(2)

    let totalIn = 0
    let totalOut = 0
    const lines = ["Date,Payments In,Expenses Out,Net"]
    for (const r of rows) {
      totalIn += Number(r.payments_in) || 0
      totalOut += Number(r.expenses_out) || 0
      lines.push(
        [fmtDate(r.date), fmtNum(r.payments_in), fmtNum(r.expenses_out), fmtNum(r.net)].join(",")
      )
    }
    lines.push(["TOTAL", fmtNum(totalIn), fmtNum(totalOut), fmtNum(totalIn - totalOut)].join(","))

    const filename = `ledger_${month || "all"}.csv`
    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.send(lines.join("\n"))
  } catch (err) {
    next(err)
  }
})

// ----- Students list (helper for forms) -----

router.get("/students", async (req, res, next) => {
  try {
    const students = await queries.listStudentsWithPrimaryParent()
    res.json({ students })
  } catch (err) {
    next(err)
  }
})

module.exports = router
