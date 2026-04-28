const express = require("express")
const queries = require("../db/queries")
const { requireAuth } = require("../middlewares/auth")

const router = express.Router()

router.use(requireAuth)

router.get("/", async (req, res, next) => {
  try {
    const notifications = await queries.listNotificationsForUser(req.user.id)
    res.json({ notifications })
  } catch (err) {
    next(err)
  }
})

router.get("/unread", async (req, res, next) => {
  try {
    const count = await queries.countUnreadNotifications(req.user.id)
    res.json({ count })
  } catch (err) {
    next(err)
  }
})

router.post("/:id/read", async (req, res, next) => {
  try {
    await queries.markNotificationRead(Number(req.params.id), req.user.id)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router
