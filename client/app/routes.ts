import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("sign-in", "routes/sign-in.tsx"),
  route("sign-up", "routes/sign-up.tsx"),
  route("profile", "routes/profile.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
  route("reset-password/confirm", "routes/reset-password.confirm.tsx"),

  route("teacher/sign-in", "routes/teacher.sign-in.tsx"),
  route("teacher/sign-up", "routes/teacher.sign-up.tsx"),
  route("teacher", "routes/teacher.dashboard.tsx"),
  route("teacher/sessions", "routes/teacher.sessions.tsx"),
  route("teacher/students/:id", "routes/teacher.students.id.tsx"),
  route("teacher/evaluations", "routes/teacher.evaluations.tsx"),
  route("teacher/evaluations/new", "routes/teacher.evaluations.new.tsx"),
  route("teacher/reports/:id", "routes/teacher.reports.id.tsx"),

  route("parent", "routes/parent.dashboard.tsx"),
  route("parent/children/:id", "routes/parent.children.id.tsx"),

  route("admin", "routes/admin.tsx"),
  route("admin/users", "routes/admin.users.tsx"),
  route("admin/courses", "routes/admin.courses.tsx"),
  route("admin/reports", "routes/admin.reports.tsx"),
  route("admin/teachers/:id", "routes/admin.teachers.$id.tsx"),

  route("accountant", "routes/accountant.tsx"),
  route("accountant/payments", "routes/accountant.payments.tsx"),
  route("accountant/expenses", "routes/accountant.expenses.tsx"),

  route("about", "routes/about.tsx"),
  route("contact", "routes/contact.tsx"),

  route("inbox", "routes/inbox.tsx"),
  route("notifications", "routes/notifications.tsx"),

  route("social", "routes/social.tsx"),
  route("social/students/:id", "routes/social.students.id.tsx"),
  route("social/reports/new", "routes/social.reports.new.tsx"),
  route("social/reports/:id", "routes/social.reports.id.tsx"),
] satisfies RouteConfig;
