import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { API_URL, fetchMe } from "../lib/auth";
import { useTranslation } from "react-i18next";
import { ButtonContent, PageLoader } from "../components/Spinner";

type Expense = {
  id: number;
  title: string;
  amount: string;
  expense_date: string;
  description: string | null;
  created_at: string;
  author_name: string | null;
};

export default function AccountantExpenses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/sign-in");
      if (me.role !== "accountant" && me.role !== "admin") {
        return navigate("/");
      }
      await load();
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function load() {
    const res = await fetch(`${API_URL}/accounting/expenses`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.expenses || []);
      setTotal(data.summary?.total ?? 0);
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/accounting/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          amount: Number(amount),
          expenseDate,
          description: description || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.errors?.[0]?.msg || data?.message || "Could not create");
        return;
      }
      setTitle("");
      setAmount("");
      setExpenseDate("");
      setDescription("");
      await load();
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id: number) {
    if (!confirm(t("acctExp.deleteConfirm"))) return;
    await fetch(`${API_URL}/accounting/expenses/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await load();
  }

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
        <Link className="link" to="/accountant">
          ← {t("common.back")}
        </Link>
        <h1 className="text-2xl font-semibold">
          {t("acctExp.title")}{" "}
          <span className="text-base-content/60 text-base">
            • {t("acctExp.totalSuffix", { amount: total.toFixed(2) })}
          </span>
        </h1>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">{t("acctExp.new")}</h2>
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}
          <form className="grid gap-3 md:grid-cols-4" onSubmit={onCreate}>
            <input
              className="input input-bordered md:col-span-2"
              placeholder={t("common.title")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              className="input input-bordered"
              type="number"
              step="0.01"
              min="0"
              placeholder={t("common.amount")}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <input
              className="input input-bordered"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
            />
            <input
              className="input input-bordered md:col-span-3"
              placeholder={t("common.description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={creating}
            >
              <ButtonContent loading={creating} loadingLabel={t("common.creating")}>
                {t("acctExp.add")}
              </ButtonContent>
            </button>
          </form>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          {items.length === 0 ? (
            <p className="text-base-content/70">{t("acctExp.empty")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t("acctExp.col.title")}</th>
                    <th>{t("common.amount")}</th>
                    <th>{t("common.date")}</th>
                    <th>{t("acctExp.col.author")}</th>
                    <th>{t("acctExp.col.description")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((e) => (
                    <tr key={e.id}>
                      <td>{e.title}</td>
                      <td>{e.amount}</td>
                      <td>{e.expense_date?.slice(0, 10)}</td>
                      <td>{e.author_name || "—"}</td>
                      <td className="text-sm text-base-content/70">
                        {e.description || "—"}
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => onDelete(e.id)}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
