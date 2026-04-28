function requireAuth(req, res, next) {
  if (!req.user) {
    console.warn("[requireAuth 401]", req.method, req.originalUrl, {
      hasCookie: Boolean(req.headers.cookie),
      cookie: req.headers.cookie,
      sessionID: req.sessionID,
      session: req.session,
    })
    return res.status(401).json({ message: "Authentication required" })
  }
  next()
}

function requireRole(...roles) {
  const allowed = roles.flat()
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" })
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" })
    }
    next()
  }
}

module.exports = {
  requireAuth,
  requireRole,
}
