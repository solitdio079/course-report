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

const paymentColors = {
  paid: "border-[#24a148] bg-[#defbe6] text-[#0e5f2c]",
  pending: "border-[#f2a900] bg-[#fff5cc] text-[#6f4d00]",
  overdue: "border-[#da1e28] bg-[#fff1f1] text-[#8f1118]",
  cancelled: "border-[#8d8d8d] bg-[#f4f4f4] text-[#393939]",
} as const;

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [teachers, setTeachers] = useState<TeacherSummary[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/sign-in");
      if (me.role !== "admin") return navigate("/");

      const [overviewRes, teachersRes] = await Promise.all([
        fetch(`${API_URL}/admin/overview`, { credentials: "include" }),
        fetch(`${API_URL}/admin/teachers`, { credentials: "include" }),
      ]);
      if (cancelled) return;
      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (teachersRes.ok) {
        const data = await teachersRes.json();
        setTeachers(data?.teachers || []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const filteredTeachers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return teachers;
    return teachers.filter((teacher) =>
      `${teacher.full_name} ${teacher.email}`.toLowerCase().includes(term)
    );
  }, [search, teachers]);

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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
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
