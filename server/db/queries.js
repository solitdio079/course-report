const pool = require("./pool")

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    "SELECT id, full_name, email, password_hash, role FROM course_users WHERE email = $1 LIMIT 1",
    [email]
  )
  return rows[0] || null
}

async function findUserById(id) {
  const { rows } = await pool.query(
    "SELECT id, full_name, email, password_hash, role FROM course_users WHERE id = $1 LIMIT 1",
    [id]
  )
  return rows[0] || null
}

async function createUser({ fullName, email, passwordHash, role }) {
  const { rows } = await pool.query(
    `INSERT INTO course_users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, full_name, email, role`,
    [fullName, email, passwordHash, role]
  )
  return rows[0]
}

async function createTeacherUser(payload) {
  return createUser({ ...payload, role: "teacher" })
}

async function updateUserProfile(id, { fullName }) {
  const { rows } = await pool.query(
    `UPDATE course_users
     SET full_name = COALESCE($2, full_name)
     WHERE id = $1
     RETURNING id, full_name, email, role`,
    [id, fullName ?? null]
  )
  return rows[0] || null
}

async function updateUserPassword(id, passwordHash) {
  await pool.query(
    "UPDATE course_users SET password_hash = $2 WHERE id = $1",
    [id, passwordHash]
  )
}

async function createPasswordResetToken({ userId, tokenHash, expiresAt }) {
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  )
}

async function findValidPasswordResetToken(tokenHash) {
  const { rows } = await pool.query(
    `SELECT id, user_id, expires_at, used_at
     FROM password_reset_tokens
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  )
  return rows[0] || null
}

async function markPasswordResetTokenUsed(id) {
  await pool.query(
    "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1",
    [id]
  )
}

async function createParentRecord({ userId, phoneNumber, address }) {
  const { rows } = await pool.query(
    `INSERT INTO parents (user_id, phone_number, address)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET
       phone_number = EXCLUDED.phone_number,
       address = EXCLUDED.address
     RETURNING id, user_id, phone_number, address`,
    [userId, phoneNumber || null, address || null]
  )
  return rows[0]
}

async function findParentByUserId(userId) {
  const { rows } = await pool.query(
    "SELECT id, user_id, phone_number, address FROM parents WHERE user_id = $1 LIMIT 1",
    [userId]
  )
  return rows[0] || null
}

async function createChildProfile({
  parentUserId,
  firstName,
  lastName,
  dateOfBirth,
  address,
  courseEmail,
  relationship,
}) {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const studentRes = await client.query(
      `INSERT INTO students (first_name, last_name, date_of_birth, address, course_email, created_by_parent_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, first_name, last_name, date_of_birth, address, course_email, created_at`,
      [
        firstName,
        lastName,
        dateOfBirth || null,
        address || null,
        courseEmail || null,
        parentUserId,
      ]
    )
    const student = studentRes.rows[0]

    const parent = await findParentByUserId(parentUserId)
    if (parent) {
      await client.query(
        `INSERT INTO student_parents (student_id, parent_id, relationship)
         VALUES ($1, $2, $3)
         ON CONFLICT (student_id, parent_id) DO NOTHING`,
        [student.id, parent.id, relationship || null]
      )
    }

    await client.query("COMMIT")
    return student
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}

async function listChildrenForParent(parentUserId) {
  const { rows } = await pool.query(
    `SELECT s.id, s.first_name, s.last_name, s.date_of_birth, s.address, s.course_email, s.created_at
     FROM students s
     LEFT JOIN student_parents sp ON sp.student_id = s.id
     LEFT JOIN parents p ON p.id = sp.parent_id
     WHERE s.created_by_parent_id = $1 OR p.user_id = $1
     ORDER BY s.created_at DESC`,
    [parentUserId]
  )
  return rows
}

async function findChildForParent(studentId, parentUserId) {
  const { rows } = await pool.query(
    `SELECT s.id, s.first_name, s.last_name, s.date_of_birth, s.address, s.course_email, s.created_at, s.created_by_parent_id
     FROM students s
     LEFT JOIN student_parents sp ON sp.student_id = s.id
     LEFT JOIN parents p ON p.id = sp.parent_id
     WHERE s.id = $1 AND (s.created_by_parent_id = $2 OR p.user_id = $2)
     LIMIT 1`,
    [studentId, parentUserId]
  )
  return rows[0] || null
}

async function findStudentById(studentId) {
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name, date_of_birth, address, course_email, created_at, created_by_parent_id
     FROM students WHERE id = $1 LIMIT 1`,
    [studentId]
  )
  return rows[0] || null
}

async function updateStudent(studentId, fields) {
  const allowed = [
    "first_name",
    "last_name",
    "date_of_birth",
    "address",
    "course_email",
  ]
  const set = []
  const values = [studentId]
  let i = 2
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      set.push(`${key} = $${i++}`)
      values.push(fields[key] === "" ? null : fields[key])
    }
  }
  if (!set.length) return findStudentById(studentId)

  const { rows } = await pool.query(
    `UPDATE students SET ${set.join(", ")} WHERE id = $1
     RETURNING id, first_name, last_name, date_of_birth, address, course_email, created_at, created_by_parent_id`,
    values
  )
  return rows[0] || null
}

async function listParentsForStudent(studentId) {
  const { rows } = await pool.query(
    `SELECT u.id AS user_id, u.full_name, u.email, p.phone_number, p.address, sp.relationship
     FROM student_parents sp
     JOIN parents p ON p.id = sp.parent_id
     JOIN course_users u ON u.id = p.user_id
     WHERE sp.student_id = $1`,
    [studentId]
  )
  return rows
}

async function listCoursesForStudent(studentId) {
  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.description
     FROM student_courses sc
     JOIN courses c ON c.id = sc.course_id
     WHERE sc.student_id = $1
     ORDER BY c.name ASC`,
    [studentId]
  )
  return rows
}

async function listTeachersForStudent(studentId) {
  const { rows } = await pool.query(
    `SELECT DISTINCT u.id, u.full_name, u.email, c.id AS course_id, c.name AS course_name
     FROM student_courses sc
     JOIN teacher_courses tc ON tc.course_id = sc.course_id
     JOIN courses c ON c.id = sc.course_id
     JOIN course_users u ON u.id = tc.teacher_id
     WHERE sc.student_id = $1
     ORDER BY u.full_name ASC`,
    [studentId]
  )
  return rows
}

async function listCourses() {
  const { rows } = await pool.query(
    `SELECT id, name, description FROM courses ORDER BY name ASC`
  )
  return rows
}

async function getCourseDetail(courseId) {
  const courseRes = await pool.query(
    `SELECT id, name, description FROM courses WHERE id = $1 LIMIT 1`,
    [courseId]
  )
  const course = courseRes.rows[0]
  if (!course) return null

  const teachersRes = await pool.query(
    `SELECT u.id, u.full_name, u.email
     FROM teacher_courses tc
     JOIN course_users u ON u.id = tc.teacher_id
     WHERE tc.course_id = $1
     ORDER BY u.full_name ASC`,
    [courseId]
  )
  const studentsRes = await pool.query(
    `SELECT s.id, s.first_name, s.last_name, s.course_email
     FROM student_courses sc
     JOIN students s ON s.id = sc.student_id
     WHERE sc.course_id = $1
     ORDER BY s.last_name ASC`,
    [courseId]
  )
  return {
    ...course,
    teachers: teachersRes.rows,
    students: studentsRes.rows,
  }
}

async function createCourse({ name, description }) {
  const { rows } = await pool.query(
    `INSERT INTO courses (name, description) VALUES ($1, $2)
     RETURNING id, name, description`,
    [name, description || null]
  )
  return rows[0]
}

async function updateCourse(courseId, { name, description }) {
  const { rows } = await pool.query(
    `UPDATE courses SET
       name = COALESCE($2, name),
       description = COALESCE($3, description)
     WHERE id = $1
     RETURNING id, name, description`,
    [courseId, name ?? null, description ?? null]
  )
  return rows[0] || null
}

async function deleteCourse(courseId) {
  await pool.query(`DELETE FROM courses WHERE id = $1`, [courseId])
}

async function assignTeacherToCourse(courseId, teacherUserId) {
  await pool.query(
    `INSERT INTO teacher_courses (teacher_id, course_id) VALUES ($1, $2)
     ON CONFLICT (teacher_id, course_id) DO NOTHING`,
    [teacherUserId, courseId]
  )
}

async function removeTeacherFromCourse(courseId, teacherUserId) {
  await pool.query(
    `DELETE FROM teacher_courses WHERE teacher_id = $1 AND course_id = $2`,
    [teacherUserId, courseId]
  )
}

async function enrollStudentInCourse(courseId, studentId) {
  await pool.query(
    `INSERT INTO student_courses (student_id, course_id) VALUES ($1, $2)
     ON CONFLICT (student_id, course_id) DO NOTHING`,
    [studentId, courseId]
  )
}

async function unenrollStudentFromCourse(courseId, studentId) {
  await pool.query(
    `DELETE FROM student_courses WHERE student_id = $1 AND course_id = $2`,
    [studentId, courseId]
  )
}

async function listTeachers() {
  const { rows } = await pool.query(
    `SELECT id, full_name, email FROM course_users WHERE role = 'teacher' ORDER BY full_name ASC`
  )
  return rows
}

async function listAllStudents() {
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name, course_email FROM students ORDER BY last_name ASC`
  )
  return rows
}

async function listCoursesForTeacher(teacherUserId) {
  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.description
     FROM teacher_courses tc
     JOIN courses c ON c.id = tc.course_id
     WHERE tc.teacher_id = $1
     ORDER BY c.name ASC`,
    [teacherUserId]
  )
  return rows
}

async function listStudentsForTeacher(teacherUserId) {
  const { rows } = await pool.query(
    `SELECT DISTINCT s.id, s.first_name, s.last_name, s.course_email,
       c.id AS course_id, c.name AS course_name
     FROM teacher_courses tc
     JOIN student_courses sc ON sc.course_id = tc.course_id
     JOIN students s ON s.id = sc.student_id
     JOIN courses c ON c.id = sc.course_id
     WHERE tc.teacher_id = $1
     ORDER BY s.last_name ASC`,
    [teacherUserId]
  )
  return rows
}

async function isTeacherForStudent(teacherUserId, studentId) {
  const { rows } = await pool.query(
    `SELECT 1
     FROM teacher_courses tc
     JOIN student_courses sc ON sc.course_id = tc.course_id
     WHERE tc.teacher_id = $1 AND sc.student_id = $2
     LIMIT 1`,
    [teacherUserId, studentId]
  )
  return rows.length > 0
}

async function createEvaluation({
  teacherUserId,
  studentId,
  courseId,
  points,
  teacherComment,
  progressAppreciation,
}) {
  const { rows } = await pool.query(
    `INSERT INTO student_evaluations
       (student_id, course_id, teacher_id, points, teacher_comment, progress_appreciation)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, student_id, course_id, teacher_id, points, teacher_comment, progress_appreciation, created_at`,
    [
      studentId,
      courseId || null,
      teacherUserId,
      points ?? null,
      teacherComment || null,
      progressAppreciation || null,
    ]
  )
  return rows[0]
}

async function listEvaluationsForTeacher(teacherUserId) {
  const { rows } = await pool.query(
    `SELECT e.id, e.student_id, e.course_id, e.points, e.teacher_comment, e.progress_appreciation, e.created_at,
            s.first_name, s.last_name, c.name AS course_name
     FROM student_evaluations e
     JOIN students s ON s.id = e.student_id
     LEFT JOIN courses c ON c.id = e.course_id
     WHERE e.teacher_id = $1
     ORDER BY e.created_at DESC
     LIMIT 200`,
    [teacherUserId]
  )
  return rows
}

async function listEvaluationsForStudent(studentId) {
  const { rows } = await pool.query(
    `SELECT e.id, e.student_id, e.course_id, e.points, e.teacher_comment, e.progress_appreciation, e.created_at,
            u.full_name AS teacher_name, c.name AS course_name
     FROM student_evaluations e
     LEFT JOIN course_users u ON u.id = e.teacher_id
     LEFT JOIN courses c ON c.id = e.course_id
     WHERE e.student_id = $1
     ORDER BY e.created_at DESC`,
    [studentId]
  )
  return rows
}

async function createGeneratedReport({
  studentId,
  createdBy,
  title,
  reportType,
  fileUrl,
  includesCharts,
}) {
  const { rows } = await pool.query(
    `INSERT INTO generated_reports
       (student_id, created_by, title, report_type, file_url, includes_charts)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, student_id, created_by, title, report_type, file_url, includes_charts, created_at`,
    [
      studentId,
      createdBy,
      title,
      reportType || "course",
      fileUrl || null,
      !!includesCharts,
    ]
  )
  return rows[0]
}

async function findReportById(id) {
  const { rows } = await pool.query(
    `SELECT r.id, r.student_id, r.created_by, r.title, r.report_type, r.file_url,
            r.includes_charts, r.content, r.created_at,
            s.first_name, s.last_name,
            u.full_name AS author_name, u.role AS author_role
     FROM generated_reports r
     LEFT JOIN students s ON s.id = r.student_id
     LEFT JOIN course_users u ON u.id = r.created_by
     WHERE r.id = $1
     LIMIT 1`,
    [id]
  )
  return rows[0] || null
}

async function canAccessReport(reportId, user) {
  // Author always has access.
  const author = await pool.query(
    `SELECT 1 FROM generated_reports WHERE id = $1 AND created_by = $2 LIMIT 1`,
    [reportId, user.id]
  )
  if (author.rows.length) return true

  // Recipient via individual inbox.
  const individual = await pool.query(
    `SELECT 1
     FROM course_messages m
     JOIN inboxes i ON i.id = m.inbox_id
     WHERE m.report_id = $1 AND i.type = 'individual' AND i.owner_user_id = $2
     LIMIT 1`,
    [reportId, user.id]
  )
  if (individual.rows.length) return true

  // Parent of the report's student.
  if (user.role === "parent") {
    const parentMatch = await pool.query(
      `SELECT 1
       FROM generated_reports r
       JOIN student_parents sp ON sp.student_id = r.student_id
       JOIN parents p ON p.id = sp.parent_id
       WHERE r.id = $1 AND p.user_id = $2
       LIMIT 1`,
      [reportId, user.id]
    )
    if (parentMatch.rows.length) return true
  }

  // Recipient via shared inbox if user has access to it.
  const SHARED_ROLES = ["admin", "teacher", "social_relations", "accountant"]
  if (SHARED_ROLES.includes(user.role)) {
    const shared = await pool.query(
      `SELECT 1
       FROM course_messages m
       JOIN inboxes i ON i.id = m.inbox_id
       WHERE m.report_id = $1 AND i.type = 'shared'
       LIMIT 1`,
      [reportId]
    )
    if (shared.rows.length) return true
  }

  return false
}

async function createSocialReport({
  studentId,
  createdBy,
  title,
  content,
  includesCharts,
}) {
  const { rows } = await pool.query(
    `INSERT INTO generated_reports
       (student_id, created_by, title, report_type, includes_charts, content)
     VALUES ($1, $2, $3, 'social', $4, $5)
     RETURNING id, student_id, created_by, title, report_type, content,
               includes_charts, created_at`,
    [studentId, createdBy, title, !!includesCharts, content || null]
  )
  return rows[0]
}

async function listSocialReportsByAuthor(userId) {
  const { rows } = await pool.query(
    `SELECT r.id, r.title, r.report_type, r.created_at, r.student_id,
            s.first_name, s.last_name
     FROM generated_reports r
     LEFT JOIN students s ON s.id = r.student_id
     WHERE r.created_by = $1 AND r.report_type = 'social'
     ORDER BY r.created_at DESC`,
    [userId]
  )
  return rows
}

async function listStudentsWithPrimaryParent() {
  const { rows } = await pool.query(
    `SELECT s.id, s.first_name, s.last_name, s.course_email, s.date_of_birth,
            (
              SELECT u.full_name
              FROM student_parents sp
              JOIN parents p ON p.id = sp.parent_id
              JOIN course_users u ON u.id = p.user_id
              WHERE sp.student_id = s.id
              ORDER BY sp.parent_id ASC
              LIMIT 1
            ) AS parent_name,
            (
              SELECT p.phone_number
              FROM student_parents sp
              JOIN parents p ON p.id = sp.parent_id
              WHERE sp.student_id = s.id
              ORDER BY sp.parent_id ASC
              LIMIT 1
            ) AS parent_phone,
            (
              SELECT u.email
              FROM student_parents sp
              JOIN parents p ON p.id = sp.parent_id
              JOIN course_users u ON u.id = p.user_id
              WHERE sp.student_id = s.id
              ORDER BY sp.parent_id ASC
              LIMIT 1
            ) AS parent_email
     FROM students s
     ORDER BY s.last_name ASC, s.first_name ASC`
  )
  return rows
}

// ---------- Payments ----------

async function listPayments({ status, search } = {}) {
  const params = []
  const where = []
  if (status) {
    params.push(status)
    where.push(`p.status = $${params.length}`)
  }
  if (search) {
    params.push(`%${search}%`)
    where.push(
      `(s.first_name ILIKE $${params.length} OR s.last_name ILIKE $${params.length})`
    )
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""
  const { rows } = await pool.query(
    `SELECT p.id, p.student_id, p.amount, p.due_date, p.paid_date, p.status, p.notes, p.created_at,
            s.first_name, s.last_name,
            (
              SELECT json_build_object(
                'user_id', u.id, 'full_name', u.full_name, 'email', u.email, 'phone_number', pa.phone_number
              )
              FROM student_parents sp
              JOIN parents pa ON pa.id = sp.parent_id
              JOIN course_users u ON u.id = pa.user_id
              WHERE sp.student_id = s.id
              ORDER BY sp.parent_id ASC LIMIT 1
            ) AS parent
     FROM payments p
     JOIN students s ON s.id = p.student_id
     ${whereSql}
     ORDER BY p.due_date DESC, p.id DESC
     LIMIT 500`,
    params
  )
  return rows
}

async function findPaymentById(id) {
  const { rows } = await pool.query(
    `SELECT id, student_id, amount, due_date, paid_date, status, notes, created_at
     FROM payments WHERE id = $1 LIMIT 1`,
    [id]
  )
  return rows[0] || null
}

async function createPayment({ studentId, amount, dueDate, status, notes }) {
  const { rows } = await pool.query(
    `INSERT INTO payments (student_id, amount, due_date, status, notes)
     VALUES ($1, $2, $3, COALESCE($4::payment_status, 'pending'::payment_status), $5)
     RETURNING id, student_id, amount, due_date, paid_date, status, notes, created_at`,
    [studentId, amount, dueDate, status || null, notes || null]
  )
  return rows[0]
}

async function updatePayment(id, { amount, dueDate, paidDate, status, notes }) {
  const { rows } = await pool.query(
    `UPDATE payments SET
       amount = COALESCE($2, amount),
       due_date = COALESCE($3, due_date),
       paid_date = $4,
       status = COALESCE($5::payment_status, status),
       notes = COALESCE($6, notes)
     WHERE id = $1
     RETURNING id, student_id, amount, due_date, paid_date, status, notes, created_at`,
    [
      id,
      amount ?? null,
      dueDate ?? null,
      paidDate ?? null,
      status ?? null,
      notes ?? null,
    ]
  )
  return rows[0] || null
}

async function deletePayment(id) {
  await pool.query(`DELETE FROM payments WHERE id = $1`, [id])
}

async function paymentSummary() {
  const { rows } = await pool.query(
    `SELECT status, COUNT(*)::int AS count, COALESCE(SUM(amount), 0)::float AS total
     FROM payments
     GROUP BY status`
  )
  const result = { pending: { count: 0, total: 0 }, paid: { count: 0, total: 0 }, overdue: { count: 0, total: 0 }, cancelled: { count: 0, total: 0 } }
  for (const r of rows) result[r.status] = { count: r.count, total: r.total }
  return result
}

async function listPaymentsForParentUser(userId) {
  const { rows } = await pool.query(
    `SELECT DISTINCT p.id, p.student_id, p.amount, p.due_date, p.paid_date, p.status, p.notes, p.created_at,
            s.first_name, s.last_name
     FROM payments p
     JOIN students s ON s.id = p.student_id
     LEFT JOIN student_parents sp ON sp.student_id = s.id
     LEFT JOIN parents pa ON pa.id = sp.parent_id
     WHERE pa.user_id = $1 OR s.created_by_parent_id = $1
     ORDER BY p.due_date DESC`,
    [userId]
  )
  return rows
}

async function listParentUserIdsForStudent(studentId) {
  const { rows } = await pool.query(
    `SELECT DISTINCT pa.user_id
     FROM student_parents sp
     JOIN parents pa ON pa.id = sp.parent_id
     WHERE sp.student_id = $1`,
    [studentId]
  )
  return rows.map((r) => r.user_id)
}

// ---------- Expenses ----------

async function listExpenses() {
  const { rows } = await pool.query(
    `SELECT e.id, e.title, e.amount, e.expense_date, e.description, e.created_at,
            u.full_name AS author_name
     FROM course_expenses e
     LEFT JOIN course_users u ON u.id = e.created_by
     ORDER BY e.expense_date DESC, e.id DESC
     LIMIT 500`
  )
  return rows
}

async function createExpense({ title, amount, expenseDate, description, createdBy }) {
  const { rows } = await pool.query(
    `INSERT INTO course_expenses (title, amount, expense_date, description, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, amount, expense_date, description, created_at, created_by`,
    [title, amount, expenseDate, description || null, createdBy]
  )
  return rows[0]
}

async function deleteExpense(id) {
  await pool.query(`DELETE FROM course_expenses WHERE id = $1`, [id])
}

async function expenseSummary() {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count, COALESCE(SUM(amount), 0)::float AS total FROM course_expenses`
  )
  return rows[0]
}

// Combined daily ledger: payments-in (paid only) and expenses-out for a given month.
// `month` is "YYYY-MM"; if omitted, returns all-time.
async function listLedger({ month } = {}) {
  const params = []
  let paymentsWhere = "p.status = 'paid' AND p.paid_date IS NOT NULL"
  let expensesWhere = "TRUE"
  if (month) {
    params.push(`${month}-01`)
    paymentsWhere += ` AND date_trunc('month', p.paid_date) = date_trunc('month', $${params.length}::date)`
    expensesWhere += ` AND date_trunc('month', e.expense_date) = date_trunc('month', $${params.length}::date)`
  }
  const { rows } = await pool.query(
    `WITH pay AS (
       SELECT p.paid_date::date AS d,
              COALESCE(SUM(p.amount), 0)::float AS payments_in
       FROM payments p
       WHERE ${paymentsWhere}
       GROUP BY p.paid_date::date
     ),
     exp AS (
       SELECT e.expense_date::date AS d,
              COALESCE(SUM(e.amount), 0)::float AS expenses_out
       FROM course_expenses e
       WHERE ${expensesWhere}
       GROUP BY e.expense_date::date
     )
     SELECT COALESCE(pay.d, exp.d) AS date,
            COALESCE(pay.payments_in, 0)::float AS payments_in,
            COALESCE(exp.expenses_out, 0)::float AS expenses_out,
            (COALESCE(pay.payments_in, 0) - COALESCE(exp.expenses_out, 0))::float AS net
     FROM pay
     FULL OUTER JOIN exp ON pay.d = exp.d
     ORDER BY date ASC`,
    params
  )
  return rows
}

// ---------- Notifications ----------

async function createNotification({ recipientUserId, studentId, title, message }) {
  const { rows } = await pool.query(
    `INSERT INTO notifications (recipient_user_id, student_id, title, message)
     VALUES ($1, $2, $3, $4)
     RETURNING id, recipient_user_id, student_id, title, message, is_read, created_at`,
    [recipientUserId, studentId || null, title, message]
  )
  return rows[0]
}

async function listNotificationsForUser(userId) {
  const { rows } = await pool.query(
    `SELECT id, student_id, title, message, is_read, created_at
     FROM notifications
     WHERE recipient_user_id = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [userId]
  )
  return rows
}

async function markNotificationRead(id, userId) {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND recipient_user_id = $2`,
    [id, userId]
  )
}

async function countUnreadNotifications(userId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM notifications
     WHERE recipient_user_id = $1 AND is_read = FALSE`,
    [userId]
  )
  return rows[0].count
}

// ---------- Admin ----------

async function listAllUsers() {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, role, created_at
     FROM course_users
     ORDER BY created_at DESC`
  )
  return rows
}

async function updateUserRole(userId, role) {
  const { rows } = await pool.query(
    `UPDATE course_users SET role = $2 WHERE id = $1
     RETURNING id, full_name, email, role`,
    [userId, role]
  )
  return rows[0] || null
}

async function listAllReports() {
  const { rows } = await pool.query(
    `SELECT r.id, r.title, r.report_type, r.created_at, r.student_id,
            s.first_name, s.last_name,
            u.full_name AS author_name, u.role AS author_role
     FROM generated_reports r
     LEFT JOIN students s ON s.id = r.student_id
     LEFT JOIN course_users u ON u.id = r.created_by
     ORDER BY r.created_at DESC
     LIMIT 200`
  )
  return rows
}

// ---------- Parent extras ----------

async function listReportsForParentUser(userId) {
  const { rows } = await pool.query(
    `SELECT DISTINCT r.id, r.title, r.report_type, r.created_at, r.student_id,
            s.first_name, s.last_name,
            u.full_name AS author_name, u.role AS author_role
     FROM generated_reports r
     JOIN students s ON s.id = r.student_id
     LEFT JOIN student_parents sp ON sp.student_id = s.id
     LEFT JOIN parents pa ON pa.id = sp.parent_id
     LEFT JOIN course_users u ON u.id = r.created_by
     WHERE pa.user_id = $1 OR s.created_by_parent_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  )
  return rows
}

// ---------- Inbox ----------

async function getOrCreateIndividualInbox(userId) {
  const existing = await pool.query(
    `SELECT id FROM inboxes WHERE owner_user_id = $1 AND type = 'individual' LIMIT 1`,
    [userId]
  )
  if (existing.rows[0]) return existing.rows[0].id
  const { rows } = await pool.query(
    `INSERT INTO inboxes (owner_user_id, type, name)
     VALUES ($1, 'individual', 'Inbox')
     RETURNING id`,
    [userId]
  )
  return rows[0].id
}

async function getSharedInboxId() {
  const { rows } = await pool.query(
    `SELECT id FROM inboxes WHERE type = 'shared' ORDER BY id ASC LIMIT 1`
  )
  if (rows[0]) return rows[0].id
  const created = await pool.query(
    `INSERT INTO inboxes (owner_user_id, type, name)
     VALUES (NULL, 'shared', 'Shared inbox')
     RETURNING id`
  )
  return created.rows[0].id
}

async function reportBelongsToUser(reportId, userId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM generated_reports WHERE id = $1 AND created_by = $2 LIMIT 1`,
    [reportId, userId]
  )
  return rows.length > 0
}

async function createMessage({
  inboxId,
  senderId,
  subject,
  body,
  reportId,
}) {
  const { rows } = await pool.query(
    `INSERT INTO course_messages (inbox_id, sender_id, subject, body, report_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, inbox_id, sender_id, subject, body, report_id, created_at`,
    [inboxId, senderId, subject || null, body || null, reportId || null]
  )
  return rows[0]
}

async function listMessagesForInbox(inboxId, viewerUserId, search) {
  const params = [inboxId, viewerUserId]
  let where = `m.inbox_id = $1`
  if (search) {
    params.push(`%${search}%`)
    where += ` AND (m.subject ILIKE $${params.length} OR m.body ILIKE $${params.length})`
  }
  const { rows } = await pool.query(
    `SELECT m.id, m.subject, m.body, m.report_id, m.created_at,
            m.sender_id, u.full_name AS sender_name, u.role AS sender_role,
            r.title AS report_title,
            (mr.user_id IS NOT NULL) AS is_read
     FROM course_messages m
     LEFT JOIN course_users u ON u.id = m.sender_id
     LEFT JOIN generated_reports r ON r.id = m.report_id
     LEFT JOIN message_reads mr
       ON mr.message_id = m.id AND mr.user_id = $2
     WHERE ${where}
     ORDER BY m.created_at DESC
     LIMIT 200`,
    params
  )
  return rows
}

async function findMessageById(id) {
  const { rows } = await pool.query(
    `SELECT m.id, m.inbox_id, m.subject, m.body, m.report_id, m.created_at,
            m.sender_id, u.full_name AS sender_name, u.role AS sender_role,
            r.title AS report_title,
            i.type AS inbox_type, i.owner_user_id AS inbox_owner_id
     FROM course_messages m
     JOIN inboxes i ON i.id = m.inbox_id
     LEFT JOIN course_users u ON u.id = m.sender_id
     LEFT JOIN generated_reports r ON r.id = m.report_id
     WHERE m.id = $1
     LIMIT 1`,
    [id]
  )
  return rows[0] || null
}

async function markMessageRead(messageId, userId) {
  await pool.query(
    `INSERT INTO message_reads (message_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (message_id, user_id) DO NOTHING`,
    [messageId, userId]
  )
}

async function countUnreadInIndividualInbox(userId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM course_messages m
     JOIN inboxes i ON i.id = m.inbox_id
     LEFT JOIN message_reads mr
       ON mr.message_id = m.id AND mr.user_id = $1
     WHERE i.owner_user_id = $1 AND i.type = 'individual'
       AND mr.user_id IS NULL`,
    [userId]
  )
  return rows[0].count
}

async function listAddressableUsers() {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, role
     FROM course_users
     ORDER BY full_name ASC`
  )
  return rows
}

async function listReportsForTeacher(teacherUserId) {
  const { rows } = await pool.query(
    `SELECT r.id, r.title, r.report_type, r.includes_charts, r.created_at, r.student_id,
            s.first_name, s.last_name
     FROM generated_reports r
     JOIN students s ON s.id = r.student_id
     WHERE r.created_by = $1
     ORDER BY r.created_at DESC`,
    [teacherUserId]
  )
  return rows
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  createTeacherUser,
  updateUserProfile,
  updateUserPassword,
  createPasswordResetToken,
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
  createParentRecord,
  findParentByUserId,
  createChildProfile,
  listChildrenForParent,
  findChildForParent,
  findStudentById,
  updateStudent,
  listParentsForStudent,
  listCoursesForStudent,
  listTeachersForStudent,
  listCourses,
  getCourseDetail,
  createCourse,
  updateCourse,
  deleteCourse,
  assignTeacherToCourse,
  removeTeacherFromCourse,
  enrollStudentInCourse,
  unenrollStudentFromCourse,
  listTeachers,
  listAllStudents,
  listCoursesForTeacher,
  listStudentsForTeacher,
  isTeacherForStudent,
  createEvaluation,
  listEvaluationsForTeacher,
  listEvaluationsForStudent,
  createGeneratedReport,
  findReportById,
  listReportsForTeacher,
  getOrCreateIndividualInbox,
  getSharedInboxId,
  reportBelongsToUser,
  createMessage,
  listMessagesForInbox,
  findMessageById,
  markMessageRead,
  countUnreadInIndividualInbox,
  listAddressableUsers,
  canAccessReport,
  createSocialReport,
  listSocialReportsByAuthor,
  listStudentsWithPrimaryParent,
  listPayments,
  findPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  paymentSummary,
  listPaymentsForParentUser,
  listParentUserIdsForStudent,
  listExpenses,
  createExpense,
  deleteExpense,
  expenseSummary,
  listLedger,
  createNotification,
  listNotificationsForUser,
  markNotificationRead,
  countUnreadNotifications,
  listAllUsers,
  updateUserRole,
  listAllReports,
  listReportsForParentUser,
}