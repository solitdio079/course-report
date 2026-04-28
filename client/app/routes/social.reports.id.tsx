import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { API_URL, fetchMe } from "../lib/auth";
import { ButtonContent, PageLoader } from "../components/Spinner";

type Report = {
  id: number;
  student_id: number | null;
  title: string;
  content: string | null;
  report_type: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  author_name: string | null;
  author_role: string | null;
};

export default function SocialReportView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/sign-in");
      if (me.role !== "social_relations" && me.role !== "admin") {
        return navigate("/");
      }
      const res = await fetch(`${API_URL}/reports/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        navigate("/social");
        return;
      }
      const data = await res.json();
      setReport(data.report);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  async function downloadPdf() {
    if (!report) return;
    setDownloading(true);
    try {
      const res = await fetch(`${API_URL}/reports/${report.id}/pdf`, {
        credentials: "include",
      });
      if (!res.ok) {
        alert("Could not download report.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `social_report_${report.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  async function shareToInbox() {
    if (!report) return;
    setShareError(null);
    setSharing(true);
    try {
      const res = await fetch(
        `${API_URL}/social/reports/${report.id}/share`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setShareError(data?.message || "Could not share");
        return;
      }
      setShared(true);
    } finally {
      setSharing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <PageLoader label="Loading report..." />
      </div>
    );
  }
  if (!report) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link className="link" to="/social">
          ← Back to social
        </Link>
        <div className="flex gap-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={shareToInbox}
            disabled={sharing || shared}
          >
            <ButtonContent loading={sharing} loadingLabel="Sharing...">
              {shared ? "Shared ✓" : "Share to shared inbox"}
            </ButtonContent>
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={downloadPdf}
            disabled={downloading}
          >
            <ButtonContent loading={downloading} loadingLabel="Preparing...">
              Download PDF
            </ButtonContent>
          </button>
        </div>
      </div>

      {shareError && (
        <div className="alert alert-error">
          <span>{shareError}</span>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-semibold">{report.title}</h1>
          <div className="text-sm text-base-content/70">
            {report.first_name && report.last_name && (
              <>
                Student: {report.first_name} {report.last_name} •{" "}
              </>
            )}
            {report.author_name && (
              <>
                Author: {report.author_name}
                {report.author_role && ` (${report.author_role})`} •{" "}
              </>
            )}
            Generated: {new Date(report.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Report</h2>
          {report.content ? (
            <p className="whitespace-pre-wrap">{report.content}</p>
          ) : (
            <p className="text-base-content/70">No content.</p>
          )}
        </div>
      </div>
    </div>
  );
}
