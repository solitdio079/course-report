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
  criteria: EvaluationCriteria | null;
  created_at: string;
  course_name: string | null;
};

function PointsChart({ evaluations }: { evaluations: Evaluation[] }) {
  const points = evaluations
    .map((e) => (e.points != null ? ratingValue(e.points) : null))
    .filter((p): p is number => p != null);
  if (points.length === 0) {
    return (
      <p className="text-sm text-base-content/60">
        No numeric points to chart.
      </p>
    );
  }

  const max = 5;
  return (
    <div className="space-y-2">
      {evaluations
        .filter((e) => e.points != null)
        .map((e, i) => {
          const value = ratingValue(e.points);
          const widthPct = Math.round((value / max) * 100);
          return (
            <div key={e.id || i} className="text-sm">
              <div className="flex justify-between mb-1">
                <span>
                  {e.course_name || "—"} —{" "}
                  {new Date(e.created_at).toLocaleDateString()}
                </span>
                <span className="font-medium">{value}/5</span>
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

function sameMonth(date: string, monthSource: string) {
  const left = new Date(date);
  const right = new Date(monthSource);
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth()
  );
}

function monthlyEvaluations(evaluations: Evaluation[], report: Report) {
  const inMonth = evaluations.filter((evaluation) =>
    sameMonth(evaluation.created_at, report.created_at)
  );
  return inMonth.length > 0 ? inMonth : evaluations;
}

function averageRating(evaluations: Evaluation[]) {
  const ratings = evaluations
    .map((evaluation) =>
      evaluation.points != null ? ratingValue(evaluation.points) : null
    )
    .filter((rating): rating is number => rating != null);

  if (ratings.length === 0) return null;
  const average =
    ratings.reduce((total, rating) => total + rating, 0) / ratings.length;
  return { average: average.toFixed(1), count: ratings.length };
}

function ratingValue(points: string | number | null) {
  const value = Number(points);
  if (!Number.isFinite(value)) return 0;
  return Math.max(1, Math.min(5, Math.round(value)));
}

function commentOverview(evaluations: Evaluation[]) {
  return evaluations
    .flatMap((evaluation) => [
      evaluation.teacher_comment,
      evaluation.progress_appreciation,
    ])
    .filter((comment): comment is string => Boolean(comment?.trim()))
    .slice(0, 3);
}

export default function TeacherReportView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [downloading, setDownloading] = useState(false);

  async function downloadPdf() {
    if (!report) return;
    setDownloading(true);
    try {
      const res = await fetch(pdfUrl(API_URL, report.id, i18n.language), {
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
  const reportEvaluations = monthlyEvaluations(evaluations, report);
  const ratingSummary = averageRating(reportEvaluations);
  const comments = commentOverview(reportEvaluations);

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

      <div className="card bg-base-100 shadow-xl print:shadow-none">
        <div className="card-body">
          <h2 className="card-title">{t("eval.report.summary")}</h2>
          <p className="text-sm text-base-content/80">
            {ratingSummary
              ? t("eval.report.average", {
                  rating: ratingSummary.average,
                  count: ratingSummary.count,
                })
              : t("eval.report.noRating")}
          </p>
          <h3 className="mt-3 font-medium">{t("eval.report.commentOverview")}</h3>
          {comments.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-base-content/80">
              {comments.map((comment, index) => (
                <li key={`${comment}-${index}`}>{comment}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-base-content/60">
              {t("eval.report.noComments")}
            </p>
          )}
        </div>
      </div>

      {report.includes_charts && (
        <div className="card bg-base-100 shadow-xl print:shadow-none">
          <div className="card-body">
            <h2 className="card-title">{t("eval.report.performance")}</h2>
            <PointsChart evaluations={reportEvaluations} />
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl print:shadow-none">
        <div className="card-body">
          <h2 className="card-title">{t("eval.report.timeline")}</h2>
          {reportEvaluations.length === 0 ? (
            <p className="text-base-content/70">{t("eval.none")}</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {reportEvaluations.map((e) => (
                <li key={e.id} className="py-3">
                  <div className="text-sm text-base-content/70">
                    {new Date(e.created_at).toLocaleString()}
                    {e.course_name && ` • ${e.course_name}`}
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
    </div>
  );
}
