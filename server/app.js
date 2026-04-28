const express = require("express")
const session = require("express-session")
const passport = require("passport")
require("dotenv").config()

const configurePassport = require("./config/passport")
const authRoutes = require("./routes/auth")
const authTeacherRoutes = require("./routes/authTeacher")
const parentsRoutes = require("./routes/parents")
const coursesRoutes = require("./routes/courses")
const teachersRoutes = require("./routes/teachers")
const inboxRoutes = require("./routes/inbox")
const reportsRoutes = require("./routes/reports")
const socialRoutes = require("./routes/social")
const accountingRoutes = require("./routes/accounting")
const notificationsRoutes = require("./routes/notifications")
const adminRoutes = require("./routes/admin")
const { ensureSchema } = require("./db/ensureSchema")

const app = express()

configurePassport()

app.use(express.json())

app.use((req, res, next) => {
  const origin = req.headers.origin

  if (origin) {
    res.header("Access-Control-Allow-Origin", origin)
    res.header("Vary", "Origin")
  }

  res.header("Access-Control-Allow-Credentials", "true")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  )
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")

  if (req.method === "OPTIONS") {
    return res.sendStatus(204)
  }

  next()
})

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.use("/auth", authRoutes)
app.use("/auth", authTeacherRoutes)
app.use("/parents", parentsRoutes)
app.use("/courses", coursesRoutes)
app.use("/teachers", teachersRoutes)
app.use("/inbox", inboxRoutes)
app.use("/reports", reportsRoutes)
app.use("/social", socialRoutes)
app.use("/accounting", accountingRoutes)
app.use("/notifications", notificationsRoutes)
app.use("/admin", adminRoutes)

app.get("/health", (req, res) => {
  res.json({ ok: true })
})

// JSON error handler — keeps API responses parseable on the client.
app.use((err, req, res, next) => {
  console.error("[api error]", req.method, req.originalUrl, err)
  if (res.headersSent) return next(err)
  const status = err.status || 500
  res.status(status).json({
    message: err.message || "Server error",
    code: err.code || undefined,
    detail: err.detail || undefined,
  })
})

const PORT = process.env.PORT || 3000
ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Could not prepare database schema", err)
    process.exitCode = 1
  })
