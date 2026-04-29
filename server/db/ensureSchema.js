const pool = require("./pool")

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id BIGSERIAL PRIMARY KEY,
      student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      course_id BIGINT REFERENCES courses(id) ON DELETE SET NULL,
      teacher_id BIGINT NOT NULL REFERENCES course_users(id) ON DELETE CASCADE,
      session_date TIMESTAMPTZ NOT NULL,
      objectives TEXT,
      status VARCHAR(30) NOT NULL DEFAULT 'planned'
        CHECK (status IN ('planned', 'completed', 'cancelled')),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.query(`
    ALTER TABLE student_evaluations
      ADD COLUMN IF NOT EXISTS criteria JSONB NOT NULL DEFAULT '{}'::jsonb
  `)

  await pool.query(`
    ALTER TABLE student_evaluations
      ADD COLUMN IF NOT EXISTS session_id BIGINT REFERENCES sessions(id) ON DELETE SET NULL
  `)

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS student_evaluations_session_id_unique
      ON student_evaluations(session_id)
      WHERE session_id IS NOT NULL
  `)
}

module.exports = { ensureSchema }
