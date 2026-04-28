import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL, fetchMe } from "../lib/auth";
import { pdfUrl } from "../lib/reportLanguage";
import { PageLoader } from "../components/Spinner";

type Report = {
  id: number;
  title: string;
  report_type: string;
  created_at: string;
  student_id: number | null;
  first_name: string | null;
  last_name: string | null;
  author_name: string | null;
  author_role: string | null;
};

export default function AdminReports() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/sign-in");
      if (me.role !== "admin") return navigate("/");
      const res = await fetch(`${API_URL}/admin/reports`, {
        credentials: "include",
      });
      if (res.ok) setReports((await res.json()).reports || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function downloadPdf(id: number) {
    const res = await fetch(pdfUrl(API_URL, id, i18n.language), {
      credentials: "include",
    });
    if (!res.ok) return;
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

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PageLoader label={t("common.loading")} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-4">
      <div className="flex items-center justify-between">
        <Link className="link" to="/admin">
          ← {t("common.back")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("adminReports.title")}</h1>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          {reports.length === 0 ? (
            <p className="text-base-content/70">{t("adminReports.empty")}</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {reports.map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">
                      {r.title}{" "}
                      <span className="badge badge-ghost badge-sm">
                        {r.report_type}
                      </span>
                    </div>
                    <div className="text-sm text-base-content/70">
                      {r.first_name && r.last_name
                        ? `${r.first_name} ${r.last_name} • `
                        : ""}
                      {r.author_name && `${r.author_name} (${r.author_role}) • `}
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => downloadPdf(r.id)}
                  >
                    {t("parent.reports.download")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
