import { Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { API_URL, fetchMe } from "../lib/auth";
import { ButtonContent, PageLoader } from "../components/Spinner";
import { StarRating } from "../components/StarRating";

type Course = { id: number; name: string; description: string | null };
type StudentRow = {
  id: number;
  first_name: string;
  last_name: string;
  course_id: number;
  course_name: string;
};
type Session = {
  id: number;
  student_id: number;
  course_id: number | null;
  session_date: string;
  objectives: string | null;
  status: "planned" | "completed" | "cancelled";
  notes: string | null;
  first_name: string;
  last_name: string;
  course_name: string | null;
  evaluation_id: number | null;
  evaluation_points: string | null;
  evaluation_comment: string | null;
};

const SESSION_STATUS_STYLES = {
  planned: "border-[#f2a900] bg-[#fff5cc] text-[#6f4d00]",
  completed: "border-[#24a148] bg-[#defbe6] text-[#0e5f2c]",
  cancelled: "border-[#8d8d8d] bg-[#f4f4f4] text-[#393939]",
} as const;

export default function TeacherSessions() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentId, setStudentId] = useState(params.get("studentId") || "");
  const [courseId, setCourseId] = useState(params.get("courseId") || "");
  const [sessionDate, setSessionDate] = useState("");
  const [objectives, setObjectives] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editObjectives, setEditObjectives] = useState("");
  const [editStatus, setEditStatus] = useState<Session["status"]>("planned");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/teacher/sign-in");
      if (me.role !== "teacher") return navigate("/");
      await Promise.all([loadSessions(), loadStudentsAndCourses()]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function loadSessions() {
    const res = await fetch(`${API_URL}/teachers/sessions`, {
      credentials: "include",
    });
    if (res.ok) setSessions((await res.json()).sessions || []);
  }

  async function loadStudentsAndCourses() {
    const [sRes, cRes] = await Promise.all([
      fetch(`${API_URL}/teachers/students`, { credentials: "include" }),
      fetch(`${API_URL}/teachers/courses`, { credentials: "include" }),
    ]);
    if (sRes.ok) setStudents((await sRes.json()).students || []);
    if (cRes.ok) setCourses((await cRes.json()).courses || []);
  }

  const uniqueStudents = useMemo(
    () => Array.from(new Map(students.map((s) => [s.id, s])).values()),
    [students]
  );

  const groupedSessions = useMemo(() => {
    const map = new Map<string, Session[]>();
    sessions.forEach((session) => {
      const key = session.session_date.slice(0, 10);
      map.set(key, [...(map.get(key) || []), session]);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [sessions]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/teachers/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: Number(studentId),
          courseId: courseId ? Number(courseId) : undefined,
          sessionDate,
          objectives: objectives || undefined,
          notes: notes || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.errors?.[0]?.msg || data?.message || "Could not create session");
        return;
      }
      setSessionDate("");
      setObjectives("");
      setNotes("");
      await loadSessions();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(session: Session) {
    setEditing(session.id);
    setEditDate(toDateTimeInput(session.session_date));
    setEditObjectives(session.objectives || "");
    setEditStatus(session.status);
  }

  async function saveEdit(sessionId: number) {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/teachers/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sessionDate: editDate || undefined,
          objectives: editObjectives || undefined,
          status: editStatus,
        }),
      });
      if (res.ok) {
        setEditing(null);
        await loadSessions();
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageLoader label="Loading sessions..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link className="link text-sm font-bold" to="/teacher">
            Back to dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-[#2b1708]">Session planner</h1>
          <p className="text-sm font-medium text-[#6d5a4a]">
            Plan objectives before class, then attach the evaluation after the session.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Create session</h2>
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}
            <form className="grid gap-4" onSubmit={onCreate}>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Student</span>
                </div>
                <select
                  className="select select-bordered"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                >
                  <option value="">Select student</option>
                  {uniqueStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Course</span>
                </div>
                <select
                  className="select select-bordered"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Session date</span>
                </div>
                <input
                  className="input input-bordered"
                  type="datetime-local"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  required
                />
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Objectives</span>
                </div>
                <textarea
                  className="textarea textarea-bordered min-h-28"
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="What should this student work on in this session?"
                />
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Private notes</span>
                </div>
                <textarea
                  className="textarea textarea-bordered"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
              <button className="btn btn-primary" disabled={saving || !studentId || !sessionDate}>
                <ButtonContent loading={saving} loadingLabel="Saving...">
                  Plan session
                </ButtonContent>
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-lg border border-[#ffd8ad] bg-[#fff4e5] p-4 shadow-sm shadow-[#f8760f]/10">
          <h2 className="text-lg font-semibold text-[#2b1708]">Calendar agenda</h2>
          <p className="text-sm font-medium text-[#6d5a4a]">
            Sessions are grouped by date. Completed sessions show their attached evaluation.
          </p>

          {groupedSessions.length === 0 ? (
            <p className="mt-4 rounded-lg bg-white p-4 text-sm text-base-content/60">
              No sessions planned yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              {groupedSessions.map(([date, items]) => (
                <section key={date} className="rounded-lg border border-[#ffd8ad] bg-white p-3">
                  <h3 className="font-black text-[#a34400]">
                    {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <div className="mt-3 grid gap-3">
                    {items.map((session) => (
                      <article key={session.id} className="rounded-lg border border-base-300 p-3">
                        {editing === session.id ? (
                          <div className="grid gap-3">
                            <input
                              className="input input-bordered input-sm"
                              type="datetime-local"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                            />
                            <textarea
                              className="textarea textarea-bordered"
                              value={editObjectives}
                              onChange={(e) => setEditObjectives(e.target.value)}
                            />
                            <select
                              className="select select-bordered select-sm"
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value as Session["status"])}
                            >
                              <option value="planned">planned</option>
                              <option value="completed">completed</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                            <div className="flex gap-2">
                              <button className="btn btn-primary btn-xs" onClick={() => saveEdit(session.id)}>
                                Save
                              </button>
                              <button className="btn btn-outline btn-xs" onClick={() => setEditing(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="font-semibold">
                                  {new Date(session.session_date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  - {session.first_name} {session.last_name}
                                </div>
                                <div className="text-xs text-base-content/60">
                                  {session.course_name || "Course not selected"}
                                </div>
                              </div>
                              <span className={`rounded-full border px-2 py-1 text-xs font-bold ${SESSION_STATUS_STYLES[session.status]}`}>
                                {session.status}
                              </span>
                            </div>
                            {session.objectives && (
                              <p className="mt-3 text-sm text-base-content/75">{session.objectives}</p>
                            )}
                            {session.evaluation_id ? (
                              <div className="mt-3 rounded-lg bg-[#defbe6] p-3 text-sm text-[#0e5f2c]">
                                <div className="font-bold">Evaluation attached</div>
                                {session.evaluation_points != null && (
                                  <StarRating value={Number(session.evaluation_points)} readOnly />
                                )}
                                {session.evaluation_comment && (
                                  <p className="mt-1">{session.evaluation_comment}</p>
                                )}
                              </div>
                            ) : (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Link
                                  className="btn btn-primary btn-xs"
                                  to={`/teacher/evaluations/new?sessionId=${session.id}`}
                                >
                                  Add evaluation
                                </Link>
                                <button className="btn btn-outline btn-xs bg-white" onClick={() => startEdit(session)}>
                                  Modify session
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function toDateTimeInput(value: string) {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
