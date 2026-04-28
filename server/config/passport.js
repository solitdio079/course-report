const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcryptjs")

const queries = require("../db/queries")

function toPublicUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
  }
}

function configurePassport() {
  passport.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          const user = await queries.findUserByEmail(email)
          if (!user) {
            return done(null, false, { message: "Invalid email or password" })
          }

          const ok = await bcrypt.compare(password, user.password_hash)
          if (!ok) {
            return done(null, false, { message: "Invalid email or password" })
          }

          const requiredRole = req.body?.requiredRole
          if (requiredRole && user.role !== requiredRole) {
            return done(null, false, {
              message: `${requiredRole} access only`,
            })
          }

          return done(null, toPublicUser(user))
        } catch (err) {
          return done(err)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await queries.findUserById(id)
      if (!user) return done(null, false)
      return done(null, toPublicUser(user))
    } catch (err) {
      done(err)
    }
  })
}

module.exports = configurePassport
module.exports.toPublicUser = toPublicUser
