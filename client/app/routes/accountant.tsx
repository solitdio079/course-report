import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL, fetchMe } from "../lib/auth";
import { PageLoader, SectionLoader } from "../components/Spinner";

type Summary = {
  pending: { count: number; total: number };
  paid: { count: number; total: number };
  overdue: { count: number; total: number };
  cancelled: { count: number; total: number };
};

type ExpensesSummary = { count: number; total: number };

type LedgerRow = {
  date: string;
  payments_in: number;
  expenses_out: number;
  net: number;
};

type LedgerTotals = { in: number; out: number; net: number };

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function AccountantDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<ExpensesSummary | null>(null);
  const [month, setMonth] = useState<string>(currentMonth());
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [ledgerTotals, setLedgerTotals] = useState<LedgerTotals>({
    in: 0,
    out: 0,
    net: 0,
  });
  const [ledgerLoading, setLedgerLoading] = useState(false);

  async function loadLedger(m: string) {
    setLedgerLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/accounting/ledger?month=${encodeURIComponent(m)}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setLedger(data.rows || []);
        setLedgerTotals(data.totals || { in: 0, out: 0, net: 0 });
      }
    } finally {
      setLedgerLoading(false);
    }
  }

  async function downloadCsv() {
    const res = await fetch(
      `${API_URL}/accounting/ledger.csv?month=${encodeURIComponent(month)}`,
      { credentials: "include" }
    );
    if (!res.ok) {
      alert("Could not download ledger.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger_${month}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/sign-in");
      if (me.role !== "accountant" && me.role !== "admin") {
        return navigate("/");
      }
      const [pRes, eRes] = await Promise.all([
        fetch(`${API_URL}/accounting/payments/summary`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/accounting/expenses`, { credentials: "include" }),
      ]);
      if (pRes.ok) setSummary((await pRes.json()).summary);
      if (eRes.ok) setExpenses((await eRes.json()).summary);
      await loadLedger(month);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (loading) return;
    loadLedger(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PageLoader label={t("common.loading")} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("acct.title")}</h1>
        <div className="flex gap-2">
          <Link className="btn btn-outline btn-sm" to="/accountant/payments">
            {t("acct.payments")}
          </Link>
          <Link className="btn btn-outline btn-sm" to="/accountant/expenses">
            {t("acct.expenses")}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {summary &&
          (["paid", "pending", "overdue", "cancelled"] as const).map((k) => (
            <div key={k} className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">{t(`acct.status.${k}`)}</h2>
                <div className="text-3xl font-bold">{summary[k].count}</div>
                <div className="text-sm text-base-content/70">
                  {t("admin.expensesTotal", { amount: summary[k].total.toFixed(2) })}
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">{t("acct.expenses")}</h2>
          <div className="text-sm text-base-content/70">
            {t("acct.expensesSummary", {
              count: expenses?.count ?? 0,
              total: (expenses?.total ?? 0).toFixed(2),
            })}
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="card-title">Daily ledger</h2>
            <div className="flex items-center gap-2">
              <input
                type="month"
                className="input input-bordered input-sm"
                value={month}
                onChange={(e) => setMonth(e.target.value || currentMonth())}
              />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={downloadCsv}
              >
                Download CSV
              </button>
            </div>
          </div>

          {ledgerLoading ? (
            <SectionLoader />
          ) : ledger.length === 0 ? (
            <p className="text-base-content/70 mt-2">
              No payments or expenses recorded for {month}.
            </p>
          ) : (
            <div className="overflow-x-auto mt-2">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th className="text-right">Payments in</th>
                    <th className="text-right">Expenses out</th>
                    <th className="text-right">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((r) => (
                    <tr key={r.date}>
                      <td>{String(r.date).slice(0, 10)}</td>
                      <td className="text-right">
                        {Number(r.payments_in).toFixed(2)}
                      </td>
                      <td className="text-right">
                        {Number(r.expenses_out).toFixed(2)}
                      </td>
                      <td
                        className={`text-right font-medium ${
                          r.net > 0
                            ? "text-success"
                            : r.net < 0
                              ? "text-error"
                              : ""
                        }`}
                      >
                        {Number(r.net).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td>Total</td>
                    <td className="text-right">{ledgerTotals.in.toFixed(2)}</td>
                    <td className="text-right">
                      {ledgerTotals.out.toFixed(2)}
                    </td>
                    <td
                      className={`text-right ${
                        ledgerTotals.net > 0
                          ? "text-success"
                          : ledgerTotals.net < 0
                            ? "text-error"
                            : ""
                      }`}
                    >
                      {ledgerTotals.net.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
