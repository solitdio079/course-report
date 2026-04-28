import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { API_URL, fetchMe } from "../lib/auth";
import { useTranslation } from "react-i18next";
import {
  ButtonContent,
  PageLoader,
  SectionLoader,
} from "../components/Spinner";

type Payment = {
  id: number;
  student_id: number;
  amount: string;
  due_date: string;
  paid_date: string | null;
  status: "pending" | "paid" | "overdue" | "cancelled";
  notes: string | null;
  first_name: string;
  last_name: string;
  parent: {
    user_id: number;
    full_name: string;
    email: string;
    phone_number: string | null;
  } | null;
};

type Student = {
  id: number;
  first_name: string;
  last_name: string;
};

const STATUSES = ["pending", "paid", "overdue", "cancelled"] as const;

export default function AccountantPayments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // create form
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reminding, setReminding] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/sign-in");
      if (me.role !== "accountant" && me.role !== "admin") {
        return navigate("/");
      }
      const sRes = await fetch(`${API_URL}/accounting/students`, {
        credentials: "include",
      });
      if (sRes.ok) setStudents((await sRes.json()).students || []);
      await load();
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => load(), 200);
    return () => clearTimeout(t);
  }, [statusFilter, search]); // eslint-disable-line

  async function load() {
    setRefreshing(true);
    try {
      const url = new URL(`${API_URL}/accounting/payments`);
      if (statusFilter) url.searchParams.set("status", statusFilter);
      if (search) url.searchParams.set("q", search);
      const res = await fetch(url.toString(), { credentials: "include" });
      if (res.ok) setPayments((await res.json()).payments || []);
    } finally {
      setRefreshing(false);
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/accounting/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: Number(studentId),
          amount: Number(amount),
          dueDate,
          notes: notes || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const firstErr = data?.errors?.[0];
        const detail = firstErr
          ? `${firstErr.path || firstErr.param || "field"}: ${firstErr.msg} (got "${firstErr.value}")`
          : data?.message;
        setError(
          `HTTP ${res.status} — ${detail || "Could not create"}`
        );
        console.error("Create payment failed:", { status: res.status, data });
        return;
      }
      setStudentId("");
      setAmount("");
      setDueDate("");
      setNotes("");
      await load();
    } finally {
      setCreating(false);
    }
  }

  async function setStatus(id: number, status: Payment["status"]) {
    const body: Record<string, unknown> = { status };
    if (status === "paid") body.paidDate = new Date().toISOString().slice(0, 10);
    else body.paidDate = null;
    await fetch(`${API_URL}/accounting/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    await load();
  }

  async function remind(id: number) {
    setReminding(id);
    try {
      const res = await fetch(`${API_URL}/accounting/payments/${id}/remind`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      alert(t("acctPayments.remindSent", { n: data?.sent ?? 0 }));
    } finally {
      setReminding(null);
    }
  }

  async function onDelete(id: number) {
    if (!confirm(t("acctPayments.deleteConfirm"))) return;
    await fetch(`${API_URL}/accounting/payments/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await load();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageLoader label={t("common.loading")} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link className="link" to="/accountant">
          ← {t("common.back")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("acctPayments.title")}</h1>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">{t("acctPayments.new")}</h2>
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}
          <form className="grid gap-3 md:grid-cols-4" onSubmit={onCreate}>
            <select
              className="select select-bordered md:col-span-2"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            >
              <option value="">{t("acctPayments.selectStudent")}</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name}
                </option>
              ))}
            </select>
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
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
            <input
              className="input input-bordered md:col-span-3"
              placeholder={t("acctPayments.notesPh")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={creating}
            >
              <ButtonContent loading={creating} loadingLabel={t("common.creating")}>
                {t("acctPayments.add")}
              </ButtonContent>
            </button>
          </form>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <h2 className="card-title">{t("acctPayments.all")}</h2>
            <div className="flex items-center gap-2">
              <select
                className="select select-bordered select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">{t("acctPayments.allStatuses")}</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                className="input input-bordered input-sm"
                type="search"
                placeholder={t("acctPayments.searchStudent")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {refreshing && payments.length === 0 ? (
            <SectionLoader />
          ) : payments.length === 0 ? (
            <p className="text-base-content/70">{t("acctPayments.empty")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t("acctPayments.col.student")}</th>
                    <th>{t("acctPayments.col.parent")}</th>
                    <th>{t("common.amount")}</th>
                    <th>{t("acctPayments.col.due")}</th>
                    <th>{t("acctPayments.col.paid")}</th>
                    <th>{t("common.status")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.first_name} {p.last_name}
                      </td>
                      <td className="text-sm">
                        {p.parent ? (
                          <>
                            <div>{p.parent.full_name}</div>
                            <div className="text-base-content/60">
                              {p.parent.phone_number || p.parent.email}
                            </div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{p.amount}</td>
                      <td>{p.due_date?.slice(0, 10)}</td>
                      <td>{p.paid_date?.slice(0, 10) || "—"}</td>
                      <td>
                        <select
                          className="select select-bordered select-xs"
                          value={p.status}
                          onChange={(e) =>
                            setStatus(p.id, e.target.value as Payment["status"])
                          }
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => remind(p.id)}
                          disabled={reminding === p.id}
                        >
                          <ButtonContent
                            loading={reminding === p.id}
                            loadingLabel="..."
                          >
                            {t("acctPayments.remind")}
                          </ButtonContent>
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => onDelete(p.id)}
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
