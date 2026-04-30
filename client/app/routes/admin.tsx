import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL, fetchMe } from "../lib/auth";
import { PageLoader } from "../components/Spinner";

type Overview = {
  userCount: number;
  teacherCount: number;
  reportCount: number;
  payments: {
    pending: { count: number; total: number };
    paid: { count: number; total: number };
    overdue: { count: number; total: number };
    cancelled: { count: number; total: number };
  };
  expenses: { count: number; total: number };
};

type TeacherSummary = {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
  course_count: number;
  student_count: number;
  evaluation_count: number;
  report_count: number;
  last_evaluation_at: string | null;
};

type User = {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
};

type UserRole = "admin" | "teacher" | "social_relations" | "accountant" | "parent";

const paymentColors = {
  paid: "border-[#24a148] bg-[#defbe6] text-[#0e5f2c]",
  pending: "border-[#f2a900] bg-[#fff5cc] text-[#6f4d00]",
  overdue: "border-[#da1e28] bg-[#fff1f1] text-[#8f1118]",
  cancelled: "border-[#8d8d8d] bg-[#f4f4f4] text-[#393939]",
} as const;

const ROLES: UserRole[] = ["admin", "teacher", "accountant", "social_relations", "parent"];

const roleStyles: Record<UserRole, string> = {
  admin: "border-[#7857ff] bg-[#f7f4ff] text-[#3f278f]",
  teacher: "border-[#f8760f] bg-[#fff0dd] text-[#7d3300]",
  accountant: "border-[#2478ff] bg-[#eef6ff] text-[#174ea6]",
  social_relations: "border-[#00a88f] bg-[#e8fff9] text-[#007c68]",
  parent: "border-[#ff6b57] bg-[#fff4f1] text-[#8f2518]",
};

function roleLabel(role: UserRole) {
  return role.replace("_", " ");
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [teachers, setTeachers] = useState<TeacherSummary[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/sign-in");
      if (me.role !== "admin") return navigate("/");

      const [overviewRes, teachersRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/admin/overview`, { credentials: "include" }),
        fetch(`${API_URL}/admin/teachers`, { credentials: "include" }),
        fetch(`${API_URL}/admin/users`, { credentials: "include" }),
      ]);
      if (cancelled) return;
      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (teachersRes.ok) {
        const data = await teachersRes.json();
        setTeachers(data?.teachers || []);
      }
      if (usersRes.ok) setUsers((await usersRes.json()).users || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const filteredTeachers = useMemo(() => {
    const term = teacherSearch.trim().toLowerCase();
    if (!term) return teachers;
    return teachers.filter((teacher) =>
      `${teacher.full_name} ${teacher.email}`.toLowerCase().includes(term)
    );
  }, [teacherSearch, teachers]);

  const roleCounts = useMemo(() => {
    return ROLES.reduce(
      (counts, role) => ({
        ...counts,
        [role]: users.filter((user) => user.role === role).length,
      }),
      {} as Record<UserRole, number>
    );
  }, [users]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    return users.filter((user) => {
      const roleMatches = roleFilter === "all" || user.role === roleFilter;
      const textMatches =
        !term ||
        `${user.full_name} ${user.email} ${user.role}`.toLowerCase().includes(term);
      return roleMatches && textMatches;
    });
  }, [roleFilter, userSearch, users]);

  async function setRole(id: number, role: UserRole) {
    await fetch(`${API_URL}/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });
    const [usersRes, teachersRes, overviewRes] = await Promise.all([
      fetch(`${API_URL}/admin/users`, { credentials: "include" }),
      fetch(`${API_URL}/admin/teachers`, { credentials: "include" }),
      fetch(`${API_URL}/admin/overview`, { credentials: "include" }),
    ]);
    if (usersRes.ok) setUsers((await usersRes.json()).users || []);
    if (teachersRes.ok) setTeachers((await teachersRes.json()).teachers || []);
    if (overviewRes.ok) setOverview(await overviewRes.json());
  }

  if (loading || !overview) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageLoader label={t("common.loading")} />
      </div>
    );
  }

  const totalPayments =
    overview.payments.pending.count +
    overview.payments.paid.count +
    overview.payments.overdue.count +
    overview.payments.cancelled.count;

  const activeStudents = teachers.reduce(
    (sum, teacher) => sum + Number(teacher.student_count || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#fff8ef] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-[#a34400]">
              Admin control center
            </div>
            <h1 className="mt-1 text-3xl font-semibold text-[#2b1708]">
              {t("admin.title")}
            </h1>
            <p className="mt-1 max-w-2xl text-sm font-medium text-[#6d5a4a]">
              Manage teachers, students, reports, payments, and school operations from one bright workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="btn btn-primary btn-sm" to="/admin/users">
              {t("admin.actions.users")}
            </Link>
            <Link className="btn btn-outline btn-sm bg-white" to="/admin/courses">
              {t("admin.actions.courses")}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatTile label={t("admin.users")} value={overview.userCount} note="All accounts" />
          <StatTile label="Teachers" value={overview.teacherCount} note="Teacher dashboards" />
          <StatTile label="Student access" value={activeStudents} note="Across teacher courses" />
          <StatTile label={t("admin.reports")} value={overview.reportCount} note="Generated reports" />
          <StatTile label={t("admin.payments")} value={totalPayments} note="Payment records" />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
          <section className="rounded-lg border border-[#ffd8ad] bg-[#fff4e5] p-4 shadow-sm shadow-[#f8760f]/10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#2b1708]">Teachers</h2>
                <p className="text-sm font-medium text-[#6d5a4a]">
                  Open a teacher to see their dashboard from the admin view.
                </p>
              </div>
              <input
                className="input input-bordered input-sm w-full sm:w-72"
                value={teacherSearch}
                onChange={(event) => setTeacherSearch(event.target.value)}
                placeholder="Search teachers..."
              />
            </div>

            {filteredTeachers.length === 0 ? (
              <p className="mt-4 text-sm text-base-content/60">No teachers found.</p>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {filteredTeachers.map((teacher) => (
                  <Link
                    key={teacher.id}
                    to={`/admin/teachers/${teacher.id}`}
                    className="rounded-lg border border-[#ffd8ad] bg-white p-4 transition hover:border-[#f8760f] hover:bg-[#fff9f0]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[#2b1708]">
                          {teacher.full_name}
                        </div>
                        <div className="mt-1 text-xs font-medium text-[#6d5a4a]">
                          {teacher.email}
                        </div>
                      </div>
                      <span className="badge badge-primary badge-outline">
                        {teacher.student_count} students
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                      <MiniStat label="Courses" value={teacher.course_count} />
                      <MiniStat label="Evals" value={teacher.evaluation_count} />
                      <MiniStat label="Reports" value={teacher.report_count} />
                    </div>
                    <div className="mt-3 text-xs text-base-content/60">
                      Last evaluation:{" "}
                      {teacher.last_evaluation_at
                        ? new Date(teacher.last_evaluation_at).toLocaleDateString()
                        : "None yet"}
                    </div>
                    <div className="mt-3 inline-flex rounded-lg bg-[#f8760f] px-3 py-2 text-xs font-black text-[#2b1708]">
                      View teacher dashboard
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-[#c9ddff] bg-[#f3f8ff] p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-[#2b1708]">Payment progression</h2>
            <p className="mt-1 text-sm font-medium text-[#6d5a4a]">
              Quick operational read of payment status.
            </p>
            <div className="mt-4 grid gap-3">
              {(["paid", "pending", "overdue", "cancelled"] as const).map((status) => (
                <Link
                  key={status}
                  to={`/accountant/payments?status=${status}`}
                  className={`rounded-lg border p-3 ${paymentColors[status]}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold capitalize">
                      {t(`acct.status.${status}`)}
                    </span>
                    <span className="text-2xl font-black">
                      {overview.payments[status].count}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-bold">
                    {overview.payments[status].total.toFixed(2)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-lg border border-[#ffd8ad] bg-white p-4 shadow-sm shadow-[#f8760f]/10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#2b1708]">Managed users</h2>
              <p className="text-sm font-medium text-[#6d5a4a]">
                Filter users by role and manage access from the admin panel.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="input input-bordered input-sm w-full sm:w-64"
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Search users..."
              />
              <select
                className="select select-bordered select-sm w-full sm:w-48"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as UserRole | "all")}
              >
                <option value="all">All roles</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(role)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-lg border px-3 py-2 text-sm font-bold ${
                roleFilter === "all"
                  ? "border-[#f8760f] bg-[#ffe0b8] text-[#7d3300]"
                  : "border-[#ffd8ad] bg-[#fff9f0] text-[#6d5a4a]"
              }`}
              onClick={() => setRoleFilter("all")}
            >
              All {users.length}
            </button>
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                className={`rounded-lg border px-3 py-2 text-sm font-bold capitalize ${
                  roleFilter === role ? roleStyles[role] : "border-[#ffd8ad] bg-[#fff9f0] text-[#6d5a4a]"
                }`}
                onClick={() => setRoleFilter(role)}
              >
                {roleLabel(role)} {roleCounts[role] || 0}
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="font-medium text-[#2b1708]">{user.full_name}</td>
                    <td className="text-sm text-base-content/70">{user.email}</td>
                    <td>
                      <select
                        className={`select select-bordered select-xs font-bold capitalize ${roleStyles[user.role]}`}
                        value={user.role}
                        onChange={(event) => setRole(user.id, event.target.value as UserRole)}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {roleLabel(role)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-sm text-base-content/70">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      {user.role === "teacher" ? (
                        <Link className="btn btn-primary btn-xs" to={`/admin/teachers/${user.id}`}>
                          Dashboard
                        </Link>
                      ) : user.role === "accountant" ? (
                        <Link className="btn btn-outline btn-xs bg-white" to="/accountant">
                          Accounting
                        </Link>
                      ) : user.role === "social_relations" ? (
                        <Link className="btn btn-outline btn-xs bg-white" to="/social">
                          Social
                        </Link>
                      ) : (
                        <span className="text-xs text-base-content/50">Managed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-[#ffcfc7] bg-[#fff4f1] p-4 shadow-sm shadow-[#ff6b57]/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#2b1708]">Admin actions</h2>
              <p className="text-sm font-medium text-[#6d5a4a]">
                Jump into the parts of the platform that support teachers and parents.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="btn btn-outline btn-sm bg-white" to="/admin/reports">
                {t("admin.actions.reports")}
              </Link>
              <Link className="btn btn-outline btn-sm bg-white" to="/accountant/payments">
                {t("admin.actions.payments")}
              </Link>
              <Link className="btn btn-outline btn-sm bg-white" to="/accountant/expenses">
                {t("admin.actions.expenses")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <div className="rounded-lg border border-[#ffd8ad] bg-white p-4 shadow-sm shadow-[#f8760f]/10">
      <div className="text-sm font-bold text-[#a34400]">{label}</div>
      <div className="mt-2 text-3xl font-black text-[#2b1708]">{value}</div>
      {note && <div className="mt-1 text-xs text-base-content/60">{note}</div>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-[#fff0dd] px-2 py-2">
      <div className="font-black text-[#2b1708]">{value}</div>
      <div className="mt-0.5 font-bold text-[#6d5a4a]">{label}</div>
    </div>
  );
}
