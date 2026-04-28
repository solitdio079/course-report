const express = require("express")
const { body, validationResult } = require("express-validator")

const queries = require("../db/queries")
const { requireAuth, requireRole } = require("../middlewares/auth")

const router = express.Router()

const SHARED_ROLES = ["admin", "teacher", "social_relations", "accountant"]

router.use(requireAuth)

// List people you can send messages to
router.get("/users", async (req, res, next) => {
  try {
    const users = await queries.listAddressableUsers()
    res.json({ users: users.filter((u) => u.id !== req.user.id) })
  } catch (err) {
    next(err)
  }
})

// Unread count for the navbar / dashboard pill
router.get("/unread", async (req, res, next) => {
  try {
    const count = await queries.countUnreadInIndividualInbox(req.user.id)
    res.json({ count })
  } catch (err) {
    next(err)
  }
})

// Individual inbox messages
router.get("/individual", async (req, res, next) => {
  try {
    const inboxId = await queries.getOrCreateIndividualInbox(req.user.id)
    const messages = await queries.listMessagesForInbox(
      inboxId,
      req.user.id,
      typeof req.query.q === "string" ? req.query.q.trim() : null
    )
    res.json({ inboxId, messages })
  } catch (err) {
    next(err)
  }
})

// Shared inbox messages (restricted roles)
router.get(
  "/shared",
  requireRole(...SHARED_ROLES),
  async (req, res, next) => {
    try {
      const inboxId = await queries.getSharedInboxId()
      const messages = await queries.listMessagesForInbox(
        inboxId,
        req.user.id,
        typeof req.query.q === "string" ? req.query.q.trim() : null
      )
      res.json({ inboxId, messages })
    } catch (err) {
      next(err)
    }
  }
)

// Send to a user's individual inbox
router.post(
  "/individual/messages",
  body("recipientUserId").isInt({ min: 1 }),
  body("subject").optional({ values: "falsy" }).isString(),
  body("body").optional({ values: "falsy" }).isString(),
  body("reportId").optional({ values: "falsy" }).isInt({ min: 1 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const recipientUserId = Number(req.body.recipientUserId)
      const reportId = req.body.reportId ? Number(req.body.reportId) : null

      if (reportId) {
        const ok = await queries.reportBelongsToUser(reportId, req.user.id)
        if (!ok) {
          return res
            .status(403)
            .json({ message: "You can only attach reports you authored." })
        }
      }

      const inboxId = await queries.getOrCreateIndividualInbox(recipientUserId)
      const message = await queries.createMessage({
        inboxId,
        senderId: req.user.id,
        subject: req.body.subject,
        body: req.body.body,
        reportId,
      })
      res.status(201).json({ message })
    } catch (err) {
      next(err)
    }
  }
)

// Send to the shared inbox (restricted roles)
router.post(
  "/shared/messages",
  requireRole(...SHARED_ROLES),
  body("subject").optional({ values: "falsy" }).isString(),
  body("body").optional({ values: "falsy" }).isString(),
  body("reportId").optional({ values: "falsy" }).isInt({ min: 1 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const reportId = req.body.reportId ? Number(req.body.reportId) : null

      if (reportId) {
        const ok = await queries.reportBelongsToUser(reportId, req.user.id)
        if (!ok) {
          return res
            .status(403)
            .json({ message: "You can only attach reports you authored." })
        }
      }

      const inboxId = await queries.getSharedInboxId()
      const message = await queries.createMessage({
        inboxId,
        senderId: req.user.id,
        subject: req.body.subject,
        body: req.body.body,
        reportId,
      })
      res.status(201).json({ message })
    } catch (err) {
      next(err)
    }
  }
)

// Mark a message read (auth-checked: must have access to that inbox)
router.post("/messages/:id/read", async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const message = await queries.findMessageById(id)
    if (!message) return res.status(404).json({ message: "Not found" })

    if (message.inbox_type === "individual") {
      if (message.inbox_owner_id !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" })
      }
    } else {
      if (!SHARED_ROLES.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden" })
      }
    }

    await queries.markMessageRead(id, req.user.id)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router
