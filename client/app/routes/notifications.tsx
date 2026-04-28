import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL, fetchMe } from "../lib/auth";
import { PageLoader } from "../components/Spinner";

type Notif = {
  id: number;
  student_id: number | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function Notifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Notif[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/sign-in");
      const res = await fetch(`${API_URL}/notifications`, {
        credentials: "include",
      });
      if (res.ok) setItems((await res.json()).notifications || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function markRead(id: number) {
    await fetch(`${API_URL}/notifications/${id}/read`, {
      method: "POST",
      credentials: "include",
    });
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <PageLoader label={t("common.loading")} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
      <div className="flex items-center justify-between">
        <Link className="link" to="/">
          ← {t("nav.home")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("notifications.title")}</h1>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          {items.length === 0 ? (
            <p className="text-base-content/70">{t("notifications.empty")}</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`py-3 ${!n.is_read ? "bg-base-200/50 -mx-4 px-4" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">
                      {n.title}{" "}
                      {!n.is_read && (
                        <span className="badge badge-primary badge-sm">{t("notifications.new")}</span>
                      )}
                    </div>
                    {!n.is_read && (
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => markRead(n.id)}
                      >
                        {t("notifications.markRead")}
                      </button>
                    )}
                  </div>
                  <p className="text-sm mt-1">{n.message}</p>
                  <div className="text-xs text-base-content/60 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
