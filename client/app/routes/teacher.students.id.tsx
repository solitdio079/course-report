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
  session_id: number | null;
  points: string | null;
  teacher_comment: string | null;
  progress_appreciation: string | null;
  criteria: EvaluationCriteria | null;
  created_at: string;
  teacher_name: string | null;
  course_name: string | null;
  session_date: string | null;
  session_title: string | null;
  session_objectives: string | null;
  session_status: string | null;
  session_summary: string | null;
  session_homework: string | null;
};
type Session = {
  id: number;
  student_id: number;
  course_id: number | null;
  session_date: string;
  title: string | null;
  start_time: string | null;
  end_time: string | null;
  objectives: string | null;
  status: "planned" | "completed" | "cancelled";
  notes: string | null;
  score: string | null;
  summary: string | null;
  homework: string | null;
  course_name: string | null;
  evaluation_id: number | null;
  evaluation_points: string | null;
  evaluation_comment: string | null;
};
type ParentFeedback = {
  id: number;
  feedback_date: string;
  author: string | null;
  satisfaction: string | null;
  progress: string | null;
  difficulties: string | null;
  comment: string | null;
  teacher_name?: string | null;
};

export default function TeacherStudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [parents, setParents] = useState<ParentContact[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [feedback, setFeedback] = useState<ParentFeedback[]>([]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionDate, setSessionDate] = useState("");
  const [objectives, setObjectives] = useState("");
  const [creatingSession, setCreatingSession] = useState(false);
  const [feedbackDate, setFeedbackDate] = useState(new Date().toISOString().slice(0, 10));
  const [feedbackAuthor, setFeedbackAuthor] = useState("");
  const [feedbackSatisfaction, setFeedbackSatisfaction] = useState("High");
  const [feedbackProgress, setFeedbackProgress] = useState("");
  const [feedbackDifficulties, setFeedbackDifficulties] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);

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
      setSessions(data.sessions || []);
      setFeedback(data.feedback || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  async function createSession(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreatingSession(true);
    try {
      const res = await fetch(`${API_URL}/teachers/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: Number(id),
          sessionDate,
          objectives: objectives || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.errors?.[0]?.msg || data?.message || "Could not create session");
        return;
      }
      setSessionDate("");
      setObjectives("");
      const refreshed = await fetch(`${API_URL}/teachers/students/${id}`, {
        credentials: "include",
      });
      if (refreshed.ok) {
        const payload = await refreshed.json();
        setSessions(payload.sessions || []);
      }
    } finally {
      setCreatingSession(false);
    }
  }

  async function saveFeedback(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavingFeedback(true);
    try {
      const res = await fetch(`${API_URL}/teachers/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: Number(id),
          feedbackDate,
          author: feedbackAuthor || undefined,
          satisfaction: feedbackSatisfaction || undefined,
          progress: feedbackProgress || undefined,
          difficulties: feedbackDifficulties || undefined,
          comment: feedbackComment || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.errors?.[0]?.msg || data?.message || "Could not save feedback");
        return;
      }
      setFeedback((current) => [data.feedback, ...current]);
      setFeedbackAuthor("");
      setFeedbackProgress("");
      setFeedbackDifficulties("");
      setFeedbackComment("");
    } finally {
      setSavingFeedback(false);
    }
  }

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
                  {e.session_date && (
                    <div className="mt-1 rounded-lg border border-[#ffd8ad] bg-[#fff9f0] px-3 py-2 text-sm text-base-content/70">
                      <div className="font-semibold text-[#2b1708]">
                        {e.session_title || "Session document"}
                      </div>
                      <div>{new Date(e.session_date).toLocaleString()}</div>
                      {e.session_objectives ? ` - ${e.session_objectives}` : ""}
                      {e.session_summary && (
                        <p className="mt-1 font-medium">{e.session_summary}</p>
                      )}
                      {e.session_homework && (
                        <p className="mt-1">Homework: {e.session_homework}</p>
                      )}
                    </div>
                  )}
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="card-title">Parent feedback</h2>
              <p className="text-sm text-base-content/60">
                Log what parents share about satisfaction, progress, and difficulties at home.
              </p>
            </div>
          </div>

          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={saveFeedback}>
            <label className="form-control">
              <span className="label-text">Date</span>
              <input className="input input-bordered" type="date" value={feedbackDate} onChange={(e) => setFeedbackDate(e.target.value)} required />
            </label>
            <label className="form-control">
              <span className="label-text">Author</span>
              <input className="input input-bordered" value={feedbackAuthor} onChange={(e) => setFeedbackAuthor(e.target.value)} placeholder="Parent name" />
            </label>
            <label className="form-control">
              <span className="label-text">Satisfaction</span>
              <select className="select select-bordered" value={feedbackSatisfaction} onChange={(e) => setFeedbackSatisfaction(e.target.value)}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <label className="form-control">
              <span className="label-text">Perceived progress</span>
              <textarea className="textarea textarea-bordered min-h-24" value={feedbackProgress} onChange={(e) => setFeedbackProgress(e.target.value)} />
            </label>
            <label className="form-control">
              <span className="label-text">Difficulties observed</span>
              <textarea className="textarea textarea-bordered min-h-24" value={feedbackDifficulties} onChange={(e) => setFeedbackDifficulties(e.target.value)} />
            </label>
            <label className="form-control">
              <span className="label-text">Comment</span>
              <textarea className="textarea textarea-bordered min-h-24" value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} />
            </label>
            <button className="btn btn-primary md:col-span-2" disabled={savingFeedback}>
              <ButtonContent loading={savingFeedback} loadingLabel="Saving...">
                Add parent feedback
              </ButtonContent>
            </button>
          </form>

          {feedback.length === 0 ? (
            <p className="mt-4 rounded-lg bg-base-200 p-3 text-sm text-base-content/60">
              No parent feedback yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-base-300">
              {feedback.map((item) => (
                <li key={item.id} className="py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">
                      {item.author || "Parent"} · {new Date(item.feedback_date).toLocaleDateString()}
                    </div>
                    {item.satisfaction && <span className="badge badge-outline">{item.satisfaction}</span>}
                  </div>
                  {item.progress && <p className="mt-2"><strong>Progress:</strong> {item.progress}</p>}
                  {item.difficulties && <p className="mt-1"><strong>Difficulties:</strong> {item.difficulties}</p>}
                  {item.comment && <p className="mt-1">{item.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="card-title">Sessions</h2>
              <p className="text-sm text-base-content/60">
                Plan future lessons and attach evaluations after each session.
              </p>
            </div>
            <Link className="btn btn-outline btn-sm bg-white" to={`/teacher/sessions?studentId=${id}`}>
              Calendar
            </Link>
          </div>

          <form className="mt-4 grid gap-3 md:grid-cols-[220px_1fr_auto]" onSubmit={createSession}>
            <input
              className="input input-bordered"
              type="datetime-local"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              required
            />
            <input
              className="input input-bordered"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="Objectives for the next session"
            />
            <button className="btn btn-primary" disabled={creatingSession || !sessionDate}>
              <ButtonContent loading={creatingSession} loadingLabel="Planning...">
                Plan
              </ButtonContent>
            </button>
          </form>

          {sessions.length === 0 ? (
            <p className="mt-4 rounded-lg bg-base-200 p-3 text-sm text-base-content/60">
              No sessions planned for this student yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-base-300">
              {sessions.map((session) => (
                <li key={session.id} className="py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">
                        {session.title || new Date(session.session_date).toLocaleString()}
                      </div>
                      <div className="text-xs text-base-content/60">
                        {new Date(session.session_date).toLocaleString()}
                        {session.start_time || session.end_time
                          ? ` • ${[session.start_time, session.end_time].filter(Boolean).join(" - ")}`
                          : ""}
                        {session.course_name ? ` • ${session.course_name}` : ""}
                      </div>
                      <div className="mt-1 text-sm text-base-content/70">
                        {session.objectives || "No objectives added yet."}
                      </div>
                    </div>
                    <span className="badge badge-outline capitalize">{session.status}</span>
                  </div>
                  {session.evaluation_id ? (
                    <div className="mt-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                      <div className="flex flex-wrap items-center gap-2 font-semibold">
                        Evaluation attached
                        {session.evaluation_points != null && (
                          <StarRating value={Number(session.evaluation_points)} readOnly />
                        )}
                      </div>
                      {session.summary && <p className="mt-2">{session.summary}</p>}
                      {session.homework && <p className="mt-1">Homework: {session.homework}</p>}
                    </div>
                  ) : (
                    <Link
                      className="btn btn-primary btn-xs mt-2"
                      to={`/teacher/evaluations/new?sessionId=${session.id}`}
                    >
                      Add evaluation
                    </Link>
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
