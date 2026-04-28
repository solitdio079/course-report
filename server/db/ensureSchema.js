const pool = require("./pool")

async function ensureSchema() {
  await pool.query(`
    ALTER TABLE student_evaluations
      ADD COLUMN IF NOT EXISTS criteria JSONB NOT NULL DEFAULT '{}'::jsonb
  `)
}

module.exports = { ensureSchema }
