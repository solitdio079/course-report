import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL, fetchMe } from "../lib/auth";
import { PageLoader } from "../components/Spinner";

type Overview = {
  userCount: number;
  reportCount: number;
  payments: {
    pending: { count: number; total: number };
    paid: { count: number; total: number };
    overdue: { count: number; total: number };
    cancelled: { count: number; total: number };
  };
  expenses: { count: number; total: number };
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/sign-in");
      if (me.role !== "admin") return navigate("/");
      const res = await fetch(`${API_URL}/admin/overview`, {
        credentials: "include",
      });
      if (res.ok) setOverview(await res.json());
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (loading || !overview) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PageLoader label={t("common.loading")} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">{t("admin.title")}</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label={t("admin.users")} value={overview.userCount} link="/admin/users" />
        <Stat
          label={t("admin.reports")}
          value={overview.reportCount}
          link="/admin/reports"
        />
        <Stat
          label={t("admin.expenses")}
          value={overview.expenses.count}
          subtitle={t("admin.expensesTotal", {
            amount: (overview.expenses.total ?? 0).toFixed(2),
          })}
          link="/accountant/expenses"
        />
        <Stat
          label={t("admin.payments")}
          value={
            overview.payments.pending.count +
            overview.payments.paid.count +
            overview.payments.overdue.count +
            overview.payments.cancelled.count
          }
          link="/accountant/payments"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {(["paid", "pending", "overdue", "cancelled"] as const).map((k) => (
          <div key={k} className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">{t(`acct.status.${k}`)}</h2>
              <div className="text-3xl font-bold">
                {overview.payments[k].count}
              </div>
              <div className="text-sm text-base-content/70">
                {overview.payments[k].total.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link className="btn btn-outline btn-sm" to="/admin/users">
          {t("admin.actions.users")}
        </Link>
        <Link className="btn btn-outline btn-sm" to="/admin/courses">
          {t("admin.actions.courses")}
        </Link>
        <Link className="btn btn-outline btn-sm" to="/admin/reports">
          {t("admin.actions.reports")}
        </Link>
        <Link className="btn btn-outline btn-sm" to="/accountant/payments">
          {t("admin.actions.payments")}
        </Link>
        <Link className="btn btn-outline btn-sm" to="/accountant/expenses">
          {t("admin.actions.expenses")}
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  subtitle,
  link,
}: {
  label: string;
  value: number;
  subtitle?: string;
  link?: string;
}) {
  const inner = (
    <div className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
      <div className="card-body">
        <h2 className="card-title">{label}</h2>
        <div className="text-3xl font-bold">{value}</div>
        {subtitle && (
          <div className="text-sm text-base-content/70">{subtitle}</div>
        )}
      </div>
    </div>
  );
  return link ? <Link to={link}>{inner}</Link> : inner;
}
