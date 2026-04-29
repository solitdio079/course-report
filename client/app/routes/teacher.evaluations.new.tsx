import { Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL, fetchMe } from "../lib/auth";
import { StarRating } from "../components/StarRating";
import { ButtonContent, PageLoader } from "../components/Spinner";
import {
  defaultEvaluationCriteria,
  EVALUATION_CRITERIA,
  EVALUATION_STATUS_OPTIONS,
  type EvaluationCriteria,
  type EvaluationStatus,
} from "../lib/evaluationCriteria";

type Course = { id: number; name: string; description: string | null };
type StudentRow = {
  id: number;
  first_name: string;
  last_name: string;
  course_id: number;
  course_name: string;
};
type SessionRow = {
  id: number;
  student_id: number;
  course_id: number | null;
  session_date: string;
  objectives: string | null;
  status: "planned" | "completed" | "cancelled";
  first_name: string;
  last_name: string;
  course_name: string | null;
  evaluation_id: number | null;
};

export default function NewEvaluation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  const [studentId, setStudentId] = useState(params.get("studentId") || "");
  const [courseId, setCourseId] = useState(params.get("courseId") || "");
  const [sessionId, setSessionId] = useState(params.get("sessionId") || "");
  const [points, setPoints] = useState(3);
  const [comment, setComment] = useState("");
  const [progress, setProgress] = useState("");
  const [criteria, setCriteria] = useState<EvaluationCriteria>(
    defaultEvaluationCriteria()
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/teacher/sign-in");
      if (me.role !== "teacher") return navigate("/");

      const [cRes, sRes, sessionsRes] = await Promise.all([
        fetch(`${API_URL}/teachers/courses`, { credentials: "include" }),
        fetch(`${API_URL}/teachers/students`, { credentials: "include" }),
        fetch(`${API_URL}/teachers/sessions`, { credentials: "include" }),
      ]);
      if (cRes.ok) setCourses((await cRes.json()).courses || []);
      if (sRes.ok) setStudents((await sRes.json()).students || []);
      if (sessionsRes.ok) setSessions((await sessionsRes.json()).sessions || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (!sessionId || sessions.length === 0) return;
    const session = sessions.find((item) => String(item.id) === sessionId);
    if (!session) return;
    setStudentId(String(session.student_id));
    if (session.course_id) setCourseId(String(session.course_id));
    if (session.objectives && !progress) setProgress(session.objectives);
  }, [sessionId, sessions, progress]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/teachers/evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: Number(studentId),
          courseId: courseId ? Number(courseId) : undefined,
          sessionId: sessionId ? Number(sessionId) : undefined,
          points,
          teacherComment: comment || undefined,
          progressAppreciation: progress || undefined,
          criteria,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data?.errors?.[0]?.msg || data?.message || "Could not save evaluation"
        );
        return;
      }
      navigate(`/teacher/students/${studentId}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <PageLoader label="Loading..." />
      </div>
    );
  }

  // Unique student list (students endpoint returns one row per course)
  const uniqueStudents = Array.from(
    new Map(students.map((s) => [s.id, s])).values()
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
      <div>
        <Link className="link" to="/teacher">
          ← {t("eval.backTeacher")}
        </Link>
      </div>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">{t("eval.newTitle")}</h1>

          {error && (
            <div className="alert alert-error mt-2">
              <span>{error}</span>
            </div>
          )}

          <form className="grid gap-4 md:grid-cols-2 mt-2" onSubmit={onSubmit}>
            <label className="form-control">
              <div className="label">
                <span className="label-text">{t("eval.student")}</span>
              </div>
              <select
                className="select select-bordered"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              >
                <option value="">{t("eval.selectStudent")}</option>
                {uniqueStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">{t("eval.course")}</span>
              </div>
              <select
                className="select select-bordered"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="">{t("eval.selectCourse")}</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control md:col-span-2">
              <div className="label">
                <span className="label-text">Session</span>
              </div>
              <select
                className="select select-bordered"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
              >
                <option value="">No planned session</option>
                {sessions
                  .filter((session) => !session.evaluation_id)
                  .map((session) => (
                    <option key={session.id} value={session.id}>
                      {new Date(session.session_date).toLocaleString()} -{" "}
                      {session.first_name} {session.last_name}
                      {session.course_name ? ` - ${session.course_name}` : ""}
                    </option>
                  ))}
              </select>
              {sessionId && (
                <div className="mt-2 rounded-lg border border-[#ffd8ad] bg-[#fff9f0] p-3 text-sm text-base-content/70">
                  This evaluation will be attached to the selected session.
                </div>
              )}
            </label>

            <div className="form-control">
              <div className="label">
                <span className="label-text">{t("eval.points")}</span>
              </div>
              <div className="rounded-lg border border-base-300 px-3 py-2">
                <StarRating
                  value={points}
                  onChange={setPoints}
                  label={t("eval.points")}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <h2 className="font-semibold">{t("eval.parameters")}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {EVALUATION_CRITERIA.map((criterion) => (
                  <label
                    key={criterion}
                    className="form-control rounded-lg border border-base-300 bg-base-100 p-3"
                  >
                    <div className="label p-0 pb-2">
                      <span className="label-text font-medium">
                        {t(`eval.criteria.${criterion}`)}
                      </span>
                    </div>
                    <select
                      className="select select-bordered select-sm"
                      value={criteria[criterion] || "needs_work"}
                      onChange={(e) =>
                        setCriteria((current) => ({
                          ...current,
                          [criterion]: e.target.value as EvaluationStatus,
                        }))
                      }
                    >
                      {EVALUATION_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {t(`eval.status.${status}`)}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 grid gap-4">
              <label className="form-control">
                <div className="label">
                  <span className="label-text">{t("eval.comment")}</span>
                </div>
                <textarea
                  className="textarea textarea-bordered min-h-24"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text">{t("eval.progress")}</span>
                </div>
                <textarea
                  className="textarea textarea-bordered min-h-24"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  placeholder={t("eval.progressPlaceholder")}
                />
              </label>
            </div>

            <button
              className="btn btn-primary md:col-span-2"
              type="submit"
              disabled={submitting || !studentId}
            >
              <ButtonContent
                loading={submitting}
                loadingLabel={t("common.saving")}
              >
                {t("eval.save")}
              </ButtonContent>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
