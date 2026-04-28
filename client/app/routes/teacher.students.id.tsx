import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { API_URL, fetchMe } from "../lib/auth";
import { ButtonContent, PageLoader } from "../components/Spinner";

type Student = {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  course_email: string | null;
};

type Evaluation = {
  id: number;
  course_id: number | null;
  points: string | null;
  teacher_comment: string | null;
  progress_appreciation: string | null;
  created_at: string;
  teacher_name: string | null;
  course_name: string | null;
};

export default function TeacherStudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/teacher/sign-in");
      if (me.role !== "teacher") return navigate("/");

      const res = await fetch(`${API_URL}/teachers/students/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        navigate("/teacher");
        return;
      }
      const data = await res.json();
      setStudent(data.student);
      setEvaluations(data.evaluations || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  async function generateReport() {
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/teachers/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: Number(id),
          includesCharts: includeCharts,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Could not generate report");
        return;
      }

      const reportId = data.report.id;
      try {
        const pdfRes = await fetch(`${API_URL}/reports/${reportId}/pdf`, {
          credentials: "include",
        });
        if (pdfRes.ok) {
          const blob = await pdfRes.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          const safe = `${student?.first_name || "student"}_${
            student?.last_name || ""
          }_report_${reportId}.pdf`.replace(/\s+/g, "_");
          a.download = safe;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }
      } catch {
        // best-effort download; still navigate to view
      }

      navigate(`/teacher/reports/${reportId}`);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <PageLoader label="Loading student..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div>
        <Link className="link" to="/teacher">
          ← Back to teacher dashboard
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between gap-3">
            <h1 className="card-title text-2xl">
              {student?.first_name} {student?.last_name}
            </h1>
            <Link
              className="btn btn-primary btn-sm"
              to={`/teacher/evaluations/new?studentId=${id}`}
            >
              Add evaluation
            </Link>
          </div>
          {student?.course_email && (
            <p className="text-base-content/70">{student.course_email}</p>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Evaluations</h2>
          {evaluations.length === 0 ? (
            <p className="text-base-content/70">No evaluations yet.</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {evaluations.map((e) => (
                <li key={e.id} className="py-3">
                  <div className="text-sm text-base-content/70">
                    {new Date(e.created_at).toLocaleString()}
                    {e.course_name && ` • ${e.course_name}`}
                    {e.teacher_name && ` • by ${e.teacher_name}`}
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

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Generate report</h2>

          {error && (
            <div className="alert alert-error mt-2">
              <span>{error}</span>
            </div>
          )}

          <label className="label cursor-pointer justify-start gap-3 mt-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
            />
            <span className="label-text">Include charts</span>
          </label>

          <button
            className="btn btn-primary mt-2"
            onClick={generateReport}
            disabled={generating || evaluations.length === 0}
          >
            <ButtonContent loading={generating} loadingLabel="Generating...">
              Generate report
            </ButtonContent>
          </button>
          {evaluations.length === 0 && (
            <p className="text-sm text-base-content/60 mt-1">
              Add at least one evaluation first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
