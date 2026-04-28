import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { API_URL, fetchMe } from "../lib/auth";
import { ButtonContent, PageLoader } from "../components/Spinner";

type Report = {
  id: number;
  student_id: number;
  title: string;
  report_type: string | null;
  includes_charts: boolean;
  created_at: string;
  first_name: string;
  last_name: string;
  author_name: string | null;
};

type Evaluation = {
  id: number;
  course_id: number | null;
  points: string | null;
  teacher_comment: string | null;
  progress_appreciation: string | null;
  created_at: string;
  course_name: string | null;
};

function PointsChart({ evaluations }: { evaluations: Evaluation[] }) {
  const points = evaluations
    .map((e) => (e.points != null ? Number(e.points) : null))
    .filter((p): p is number => p != null);
  if (points.length === 0) {
    return (
      <p className="text-sm text-base-content/60">
        No numeric points to chart.
      </p>
    );
  }

  const max = Math.max(100, ...points);
  return (
    <div className="space-y-2">
      {evaluations
        .filter((e) => e.points != null)
        .map((e, i) => {
          const value = Number(e.points);
          const widthPct = Math.round((value / max) * 100);
          return (
            <div key={e.id || i} className="text-sm">
              <div className="flex justify-between mb-1">
                <span>
                  {e.course_name || "—"} —{" "}
                  {new Date(e.created_at).toLocaleDateString()}
                </span>
                <span className="font-medium">{value}</span>
              </div>
              <div className="h-2 w-full rounded bg-base-200 overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default function TeacherReportView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [downloading, setDownloading] = useState(false);

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
      a.download = `${report.first_name}_${report.last_name}_report_${report.id}.pdf`.replace(
        /\s+/g,
        "_"
      );
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/teacher/sign-in");
      if (me.role !== "teacher") return navigate("/");

      const res = await fetch(`${API_URL}/teachers/reports/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        navigate("/teacher");
        return;
      }
      const data = await res.json();
      setReport(data.report);
      setEvaluations(data.evaluations || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <PageLoader label="Loading report..." />
      </div>
    );
  }
  if (!report) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6 print:py-4">
      <div className="print:hidden flex justify-between">
        <Link className="link" to={`/teacher/students/${report.student_id}`}>
          ← Back to student
        </Link>
        <button
          className="btn btn-primary btn-sm"
          onClick={downloadPdf}
          disabled={downloading}
        >
          <ButtonContent loading={downloading} loadingLabel="Preparing PDF...">
            Download PDF
          </ButtonContent>
        </button>
      </div>

      <div className="card bg-base-100 shadow-xl print:shadow-none">
        <div className="card-body">
          <h1 className="text-2xl font-semibold">{report.title}</h1>
          <div className="text-sm text-base-content/70">
            Student: {report.first_name} {report.last_name}
            {report.author_name && ` • Author: ${report.author_name}`}
            {` • ${new Date(report.created_at).toLocaleString()}`}
          </div>
        </div>
      </div>

      {report.includes_charts && (
        <div className="card bg-base-100 shadow-xl print:shadow-none">
          <div className="card-body">
            <h2 className="card-title">Performance</h2>
            <PointsChart evaluations={evaluations} />
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl print:shadow-none">
        <div className="card-body">
          <h2 className="card-title">Evaluations</h2>
          {evaluations.length === 0 ? (
            <p className="text-base-content/70">No evaluations.</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {evaluations.map((e) => (
                <li key={e.id} className="py-3">
                  <div className="text-sm text-base-content/70">
                    {new Date(e.created_at).toLocaleString()}
                    {e.course_name && ` • ${e.course_name}`}
                    {e.points != null && ` • ${e.points} pts`}
                  </div>
                  {e.teacher_comment && (
                    <p className="mt-1">{e.teacher_comment}</p>
                  )}
                  {e.progress_appreciation && (
                    <p className="mt-1 text-sm italic text-base-content/80">
                      Progress: {e.progress_appreciation}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
