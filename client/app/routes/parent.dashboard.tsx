import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL, type AuthUser, fetchMe } from "../lib/auth";
import { pdfUrl } from "../lib/reportLanguage";
import { ButtonContent, PageLoader } from "../components/Spinner";

type Child = {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  address: string | null;
  course_email: string | null;
  created_at: string;
};

type Notif = {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type Payment = {
  id: number;
  amount: string;
  due_date: string;
  paid_date: string | null;
  status: string;
  first_name: string;
  last_name: string;
};

type ReportItem = {
  id: number;
  title: string;
  report_type: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  author_name: string | null;
};

export default function ParentDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [courseEmail, setCourseEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) {
        navigate("/sign-in");
        return;
      }
      if (me.role !== "parent") {
        navigate("/");
        return;
      }
      setUser(me);
      await Promise.all([
        loadChildren(),
        loadNotifications(),
        loadPayments(),
        loadReports(),
      ]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function loadChildren() {
    const res = await fetch(`${API_URL}/parents/children`, {
      credentials: "include",
    }).catch(() => null);
    if (!res || !res.ok) return;
    const data = await res.json().catch(() => ({}));
    setChildren(data?.children || []);
  }

  async function loadNotifications() {
    const res = await fetch(`${API_URL}/parents/notifications`, {
      credentials: "include",
    }).catch(() => null);
    if (!res || !res.ok) return;
    const data = await res.json().catch(() => ({}));
    setNotifications(data?.notifications || []);
  }

  async function loadPayments() {
    const res = await fetch(`${API_URL}/parents/payments`, {
      credentials: "include",
    }).catch(() => null);
    if (!res || !res.ok) return;
    const data = await res.json().catch(() => ({}));
    setPayments(data?.payments || []);
  }

  async function loadReports() {
    const res = await fetch(`${API_URL}/parents/reports`, {
      credentials: "include",
    }).catch(() => null);
    if (!res || !res.ok) return;
    const data = await res.json().catch(() => ({}));
    setReports(data?.reports || []);
  }

  async function downloadReport(id: number) {
    const res = await fetch(pdfUrl(API_URL, id, i18n.language), {
      credentials: "include",
    });
    if (!res.ok) return alert("Could not download.");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function onAddChild(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/parents/children`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          dateOfBirth: dateOfBirth || undefined,
          address: address || undefined,
          courseEmail: courseEmail || undefined,
          relationship: relationship || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data?.errors?.[0]?.msg ||
            data?.message ||
            "Could not create child profile"
        );
        return;
      }
      setFirstName("");
      setLastName("");
      setDateOfBirth("");
      setAddress("");
      setCourseEmail("");
      setRelationship("");
      await loadChildren();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PageLoader label="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">{t("nav.parent")}</h1>
          <p className="text-base-content/70">
            {t("parent.title", { name: user?.fullName || "" })}
          </p>

          <div className="mt-2 text-sm">
            <Link className="link" to="/profile">
              Update profile / change password
            </Link>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">{t("parent.children.title")}</h2>

          {children.length === 0 ? (
            <p className="text-base-content/70">{t("parent.children.empty")}</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {children.map((c) => (
                <li key={c.id} className="py-3">
                  <Link
                    to={`/parent/children/${c.id}`}
                    className="block hover:opacity-80"
                  >
                    <div className="font-medium">
                      {c.first_name} {c.last_name}
                    </div>
                    <div className="text-sm text-base-content/70">
                      {c.date_of_birth
                        ? new Date(c.date_of_birth).toLocaleDateString()
                        : "DOB not set"}
                      {c.course_email ? ` • ${c.course_email}` : ""}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">{t("parent.notifications.title")}</h2>
              <Link className="link text-sm" to="/notifications">
                {t("parent.notifications.viewAll")}
              </Link>
            </div>
            {notifications.length === 0 ? (
              <p className="text-base-content/70">{t("parent.notifications.empty")}</p>
            ) : (
              <ul className="divide-y divide-base-300">
                {notifications.slice(0, 5).map((n) => (
                  <li key={n.id} className="py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm">
                        {n.title}
                        {!n.is_read && (
                          <span className="badge badge-primary badge-sm ml-2">
                            {t("notifications.new")}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-base-content/60">
                        {new Date(n.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-sm text-base-content/70">{n.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">{t("parent.payments.title")}</h2>
            {payments.length === 0 ? (
              <p className="text-base-content/70">{t("parent.payments.empty")}</p>
            ) : (
              <ul className="divide-y divide-base-300">
                {payments.slice(0, 5).map((p) => (
                  <li key={p.id} className="py-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span>
                        {p.first_name} {p.last_name} — {p.amount}
                      </span>
                      <span
                        className={`badge badge-sm ${
                          p.status === "paid"
                            ? "badge-success"
                            : p.status === "overdue"
                              ? "badge-error"
                              : "badge-ghost"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="text-xs text-base-content/60">
                      {t("parent.payments.due", { date: p.due_date?.slice(0, 10) })}
                      {p.paid_date && ` • ${t("parent.payments.paid", { date: p.paid_date.slice(0, 10) })}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="card-title">{t("parent.reports.title")}</h2>
              <p className="text-sm text-base-content/60">
                Generated teacher reports are available here for download.
              </p>
            </div>
            <span className="badge badge-ghost">{reports.length}</span>
          </div>
          {reports.length === 0 ? (
            <p className="mt-4 rounded-lg bg-base-200 p-4 text-base-content/70">
              {t("parent.reports.empty")}
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {reports.map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg border border-base-300 bg-[#fbfcfa] p-4"
                >
                  <div className="flex h-full flex-col justify-between gap-4">
                    <div>
                      <div className="font-medium">
                      {r.title}{" "}
                        <span className="badge badge-ghost badge-sm">
                          {r.report_type}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-base-content/70">
                        {r.first_name && r.last_name
                          ? `${r.first_name} ${r.last_name} • `
                          : ""}
                        {r.author_name && `${r.author_name} • `}
                        {new Date(r.created_at).toLocaleString()}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm self-start"
                      onClick={() => downloadReport(r.id)}
                    >
                      {t("parent.reports.download")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">{t("parent.addChild.title")}</h2>

          {error && (
            <div className="alert alert-error mt-2">
              <span>{error}</span>
            </div>
          )}

          <form
            className="grid gap-4 md:grid-cols-2 mt-2"
            onSubmit={onAddChild}
          >
            <label className="form-control">
              <div className="label">
                <span className="label-text">{t("parent.addChild.firstName")}</span>
              </div>
              <input
                className="input input-bordered"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">{t("parent.addChild.lastName")}</span>
              </div>
              <input
                className="input input-bordered"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">{t("parent.addChild.dob")}</span>
              </div>
              <input
                className="input input-bordered"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">{t("parent.addChild.courseEmail")}</span>
              </div>
              <input
                className="input input-bordered"
                type="email"
                value={courseEmail}
                onChange={(e) => setCourseEmail(e.target.value)}
              />
            </label>

            <label className="form-control md:col-span-2">
              <div className="label">
                <span className="label-text">{t("common.address")}</span>
              </div>
              <input
                className="input input-bordered"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>

            <label className="form-control md:col-span-2">
              <div className="label">
                <span className="label-text">{t("parent.addChild.relationship")}</span>
              </div>
              <input
                className="input input-bordered"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="mother, father, guardian..."
              />
            </label>

            <button
              className="btn btn-primary md:col-span-2"
              type="submit"
              disabled={submitting}
            >
              <ButtonContent loading={submitting} loadingLabel={t("common.creating")}>
                {t("parent.addChild.submit")}
              </ButtonContent>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
