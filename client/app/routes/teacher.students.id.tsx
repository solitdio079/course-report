import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL, fetchMe } from "../lib/auth";
import { pdfUrl } from "../lib/reportLanguage";
import { StarRating } from "../components/StarRating";
import { ButtonContent, PageLoader } from "../components/Spinner";
import {
  EVALUATION_CRITERIA,
  normalizeEvaluationCriteria,
  type EvaluationCriteria,
} from "../lib/evaluationCriteria";

type Student = {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  course_email: string | null;
};

type ParentContact = {
  user_id: number;
  full_name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  relationship: string | null;
};

type Evaluation = {
  id: number;
  course_id: number | null;
  points: string | null;
  teacher_comment: string | null;
  progress_appreciation: string | null;
  criteria: EvaluationCriteria | null;
  created_at: string;
  teacher_name: string | null;
  course_name: string | null;
};

export default function TeacherStudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [parents, setParents] = useState<ParentContact[]>([]);
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
      setParents(data.parents || []);
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
          language: i18n.language,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Could not generate report");
        return;
      }

      const reportId = data.report.id;
      try {
        const pdfRes = await fetch(pdfUrl(API_URL, reportId, i18n.language), {
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

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="card-title text-2xl">
                  {student?.first_name} {student?.last_name}
                </h1>
                <p className="text-sm text-base-content/60">Student profile</p>
              </div>
              <Link
                className="btn btn-primary btn-sm"
                to={`/teacher/evaluations/new?studentId=${id}`}
              >
                {t("eval.add")}
              </Link>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              {student?.course_email && (
                <div className="rounded-lg border border-base-300 bg-base-200/60 p-3">
                  <div className="text-xs uppercase text-base-content/50">
                    Course email
                  </div>
                  <a className="link font-medium" href={`mailto:${student.course_email}`}>
                    {student.course_email}
                  </a>
                </div>
              )}
              {student?.date_of_birth && (
                <div className="rounded-lg border border-base-300 bg-base-200/60 p-3">
                  <div className="text-xs uppercase text-base-content/50">
                    Date of birth
                  </div>
                  <div className="font-medium">
                    {new Date(student.date_of_birth).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="card-title">Parents</h2>
                <p className="text-sm text-base-content/60">
                  Contact details and inbox shortcuts.
                </p>
              </div>
              <span className="badge badge-ghost">{parents.length}</span>
            </div>

            {parents.length === 0 ? (
              <p className="mt-3 rounded-lg bg-base-200 p-3 text-sm text-base-content/60">
                No parent contact is linked to this student yet.
              </p>
            ) : (
              <div className="mt-3 grid gap-3">
                {parents.map((parent) => {
                  const subject = encodeURIComponent(
                    `${student?.first_name || "Student"} ${
                      student?.last_name || ""
                    }`.trim()
                  );
                  return (
                    <div
                      key={parent.user_id}
                      className="rounded-lg border border-base-300 bg-[#fbfcfa] p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="font-semibold">{parent.full_name}</div>
                          {parent.relationship && (
                            <div className="text-xs text-base-content/55">
                              {parent.relationship}
                            </div>
                          )}
                          <div className="mt-2 grid gap-1 text-sm">
                            <a className="link" href={`mailto:${parent.email}`}>
                              {parent.email}
                            </a>
                            {parent.phone_number && (
                              <a className="link" href={`tel:${parent.phone_number}`}>
                                {parent.phone_number}
                              </a>
                            )}
                            {parent.address && (
                              <div className="text-base-content/65">
                                {parent.address}
                              </div>
                            )}
                          </div>
                        </div>
                        <Link
                          className="btn btn-primary btn-sm"
                          to={`/inbox?recipientId=${parent.user_id}&subject=${subject}`}
                        >
                          Message parent
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">{t("teacher.evaluations")}</h2>
          {evaluations.length === 0 ? (
            <p className="text-base-content/70">{t("eval.empty")}</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {evaluations.map((e) => (
                <li key={e.id} className="py-3">
                  <div className="text-sm text-base-content/70">
                    {new Date(e.created_at).toLocaleString()}
                    {e.course_name && ` • ${e.course_name}`}
                    {e.teacher_name && ` • by ${e.teacher_name}`}
                  </div>
                  {e.points != null && (
                    <div className="mt-1">
                      <StarRating value={Number(e.points)} readOnly />
                    </div>
                  )}
                  {e.teacher_comment && (
                    <p className="mt-1">{e.teacher_comment}</p>
                  )}
                  {e.progress_appreciation && (
                    <p className="mt-1 text-sm italic text-base-content/80">
                      {t("eval.progressShort")}: {e.progress_appreciation}
                    </p>
                  )}
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {EVALUATION_CRITERIA.map((criterion) => {
                      const status = normalizeEvaluationCriteria(e.criteria)[
                        criterion
                      ];
                      if (!status) return null;
                      return (
                        <div
                          key={criterion}
                          className="flex items-center justify-between gap-2 rounded-md border border-base-300 px-3 py-2 text-sm"
                        >
                          <span>{t(`eval.criteria.${criterion}`)}</span>
                          <span className="badge badge-outline">
                            {t(`eval.status.${status}`)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
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
