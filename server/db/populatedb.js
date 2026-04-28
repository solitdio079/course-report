
const { Client } = require("pg")
require("dotenv").config()

const SQL = `
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'teacher',
    'social_relations',
    'accountant',
    'parent',
    'admin'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE inbox_type AS ENUM (
    'individual',
    'shared'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending',
    'paid',
    'overdue',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS course_users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  address TEXT,
  course_email VARCHAR(255),
  created_by_parent_id BIGINT REFERENCES course_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parents (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES course_users(id) ON DELETE CASCADE,
  phone_number VARCHAR(50),
  address TEXT
);

CREATE TABLE IF NOT EXISTS student_parents (
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  parent_id BIGINT REFERENCES parents(id) ON DELETE CASCADE,
  relationship VARCHAR(50),
  PRIMARY KEY (student_id, parent_id)
);

CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS teacher_courses (
  teacher_id BIGINT REFERENCES course_users(id) ON DELETE CASCADE,
  course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, course_id)
);

CREATE TABLE IF NOT EXISTS student_courses (
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS student_evaluations (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id BIGINT REFERENCES courses(id),
  teacher_id BIGINT NOT NULL REFERENCES course_users(id),
  points NUMERIC(5,2),
  teacher_comment TEXT,
  progress_appreciation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generated_reports (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  created_by BIGINT REFERENCES course_users(id),
  title VARCHAR(255) NOT NULL,
  report_type VARCHAR(100),
  file_url TEXT,
  includes_charts BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inboxes (
  id BIGSERIAL PRIMARY KEY,
  owner_user_id BIGINT REFERENCES course_users(id),
  type inbox_type NOT NULL,
  name VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS course_messages (
  id BIGSERIAL PRIMARY KEY,
  inbox_id BIGINT NOT NULL REFERENCES inboxes(id) ON DELETE CASCADE,
  sender_id BIGINT REFERENCES course_users(id),
  subject VARCHAR(255),
  body TEXT,
  report_id BIGINT REFERENCES generated_reports(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status payment_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course_expenses (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  description TEXT,
  created_by BIGINT REFERENCES course_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  recipient_user_id BIGINT NOT NULL REFERENCES course_users(id) ON DELETE CASCADE,
  student_id BIGINT REFERENCES students(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seo_pages (
  id BIGSERIAL PRIMARY KEY,
  page_slug VARCHAR(150) UNIQUE NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  content TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES course_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS message_reads (
  message_id BIGINT NOT NULL REFERENCES course_messages(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES course_users(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, user_id)
);

INSERT INTO inboxes (owner_user_id, type, name)
SELECT NULL, 'shared', 'Shared inbox'
WHERE NOT EXISTS (SELECT 1 FROM inboxes WHERE type = 'shared');

ALTER TABLE generated_reports
  ADD COLUMN IF NOT EXISTS content TEXT;
`
async function main() {
  console.log("seeding...")

  
  const client = new Client({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    port: Number(process.env.DB_PORT),
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()

  await client.query(SQL)
  await client.end()

  console.log("done")
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
