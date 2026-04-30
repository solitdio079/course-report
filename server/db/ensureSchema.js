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
    CREATE TABLE IF NOT EXISTS parent_feedback (
      id BIGSERIAL PRIMARY KEY,
      student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      teacher_id BIGINT REFERENCES course_users(id) ON DELETE SET NULL,
      feedback_date DATE NOT NULL DEFAULT CURRENT_DATE,
      author VARCHAR(255),
      satisfaction VARCHAR(50),
      progress TEXT,
      difficulties TEXT,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.query(`
    ALTER TABLE student_evaluations
      ADD COLUMN IF NOT EXISTS criteria JSONB NOT NULL DEFAULT '{}'::jsonb
  `)

  await pool.query(`
    ALTER TABLE sessions
      ADD COLUMN IF NOT EXISTS title VARCHAR(255),
      ADD COLUMN IF NOT EXISTS start_time TIME,
      ADD COLUMN IF NOT EXISTS end_time TIME,
      ADD COLUMN IF NOT EXISTS score NUMERIC(5,2),
      ADD COLUMN IF NOT EXISTS skills JSONB NOT NULL DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS mood_check JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS summary TEXT,
      ADD COLUMN IF NOT EXISTS difficulties TEXT,
      ADD COLUMN IF NOT EXISTS mistakes TEXT,
      ADD COLUMN IF NOT EXISTS homework TEXT,
      ADD COLUMN IF NOT EXISTS recording TEXT
  `)

  await pool.query(`
    ALTER TABLE generated_reports
      ADD COLUMN IF NOT EXISTS report_month DATE,
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft',
      ADD COLUMN IF NOT EXISTS summary TEXT,
      ADD COLUMN IF NOT EXISTS strengths TEXT,
      ADD COLUMN IF NOT EXISTS improvements TEXT,
      ADD COLUMN IF NOT EXISTS recommendations TEXT
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
