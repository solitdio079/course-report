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
type SkillScore = { name: string; score: number };
type MoodCheck = { value?: number; label?: string };
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
  skills: SkillScore[] | null;
  mood_check: MoodCheck | null;
  summary: string | null;
  difficulties: string | null;
  mistakes: string | null;
  homework: string | null;
  recording: string | null;
  first_name: string;
  last_name: string;
  course_name: string | null;
  evaluation_id: number | null;
  evaluation_points: string | null;
  evaluation_comment: string | null;
};

const SKILLS = [
  "Vocabulary",
  "Grammar",
  "Listening comprehension",
  "Speaking",
  "Pronunciation",
  "Confidence",
  "Autonomy",
  "MoodCheck",
];

const MOOD_OPTIONS = [
  { value: 1, label: "Low" },
  { value: 2, label: "Fragile" },
  { value: 3, label: "Average" },
  { value: 4, label: "Good" },
  { value: 5, label: "Very good" },
];

const STATUS_STYLES = {
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
  const [startTime, setStartTime] = useState("17:00");
  const [endTime, setEndTime] = useState("18:00");
  const [title, setTitle] = useState("");
  const [objectives, setObjectives] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [skills, setSkills] = useState<SkillScore[]>([]);
  const [summary, setSummary] = useState("");
  const [difficulties, setDifficulties] = useState("");
  const [mistakes, setMistakes] = useState("");
  const [homework, setHomework] = useState("");
  const [recording, setRecording] = useState("");
  const [calendarStart, setCalendarStart] = useState(startOfWeek(new Date()));

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

  const uniqueStudents = useMemo(
    () => Array.from(new Map(students.map((s) => [s.id, s])).values()),
    [students]
  );

  const activeSession = sessions.find((session) => session.id === activeSessionId) || null;
  const sessionScore = average(skills.map((skill) => skill.score));
  const moodSkill = skills.find((skill) => skill.name === "MoodCheck");
  const mood = moodSkill ? moodLabel(moodSkill.score) : "Not rated";
  const weekDays = useMemo(() => getWeekDays(calendarStart), [calendarStart]);
  const weekSessions = sessions.filter((session) =>
    weekDays.includes(session.session_date.slice(0, 10))
  );
  const groupedByStudent = useMemo(() => {
    return uniqueStudents.map((student) => ({
      student,
      sessions: sessions
        .filter((session) => session.student_id === student.id)
        .sort((a, b) => b.session_date.localeCompare(a.session_date)),
    }));
  }, [sessions, uniqueStudents]);

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

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const selectedDate = sessionDate || new Date().toISOString().slice(0, 10);
      const res = await fetch(`${API_URL}/teachers/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: Number(studentId),
          courseId: courseId ? Number(courseId) : undefined,
          sessionDate: `${selectedDate}T${startTime}`,
          startTime,
          endTime,
          title: title || undefined,
          objectives: objectives || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.errors?.[0]?.msg || data?.message || "Could not create session");
        return;
      }
      setTitle("");
      setObjectives("");
      setSessionDate("");
      await loadSessions();
      setActiveSessionId(data.session?.id || null);
      hydrateEvaluationDraft(data.session);
    } finally {
      setSaving(false);
    }
  }

  function hydrateEvaluationDraft(session: Session | null) {
    if (!session) return;
    setActiveSessionId(session.id);
    setSkills(normalizeSkills(session.skills));
    setSummary(session.summary || "");
    setDifficulties(session.difficulties || "");
    setMistakes(session.mistakes || "");
    setHomework(session.homework || "");
    setRecording(session.recording || "");
  }

  function addSkill(name: string) {
    if (!name || skills.some((skill) => skill.name === name)) return;
    setSkills((current) => [...current, { name, score: 3 }]);
  }

  function updateSkill(name: string, score: number) {
    setSkills((current) =>
      current.map((skill) =>
        skill.name === name ? { ...skill, score: Math.max(1, Math.min(5, score)) } : skill
      )
    );
  }

  async function saveSessionEvaluation() {
    if (!activeSession) return;
    setSaving(true);
    try {
      const cleanScore = sessionScore || 3;
      await fetch(`${API_URL}/teachers/sessions/${activeSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: activeSession.title || undefined,
          status: "completed",
          score: cleanScore,
          skills,
          moodCheck: moodSkill
            ? { value: moodSkill.score, label: moodLabel(moodSkill.score) }
            : undefined,
          summary,
          difficulties,
          mistakes,
          homework,
          recording,
        }),
      });

      if (!activeSession.evaluation_id) {
        await fetch(`${API_URL}/teachers/evaluations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            studentId: activeSession.student_id,
            courseId: activeSession.course_id || undefined,
            sessionId: activeSession.id,
            points: Math.round(cleanScore),
            teacherComment: summary || undefined,
            progressAppreciation: homework || undefined,
            criteria: {},
          }),
        });
      }

      await loadSessions();
    } finally {
      setSaving(false);
    }
  }

  async function duplicateSession(session: Session) {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/teachers/sessions/${session.id}/duplicate`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Could not duplicate session");
        return;
      }
      await loadSessions();
      setActiveSessionId(data.session?.id || session.id);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <PageLoader label="Loading sessions..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8ef] px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link className="link text-sm font-bold" to="/teacher">
              Back to dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-semibold text-[#2b1708]">Sessions</h1>
            <p className="text-sm font-medium text-[#6d5a4a]">
              Plan the class first, then complete the same session with skills, MoodCheck, notes, homework, and an attached evaluation.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs sm:w-[360px]">
            <Metric label="Planned" value={sessions.filter((s) => s.status === "planned").length} />
            <Metric label="Completed" value={sessions.filter((s) => s.status === "completed").length} />
            <Metric label="Average" value={formatScore(average(sessions.map((s) => Number(s.score))))} />
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
          <section className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Plan a session</h2>
              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}
              <form className="grid gap-3" onSubmit={onCreate}>
                <label className="form-control">
                  <span className="label-text">Student</span>
                  <select className="select select-bordered" value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
                    <option value="">Select student</option>
                    {uniqueStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-control">
                  <span className="label-text">Course</span>
                  <select className="select select-bordered" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-control">
                  <span className="label-text">Title</span>
                  <input className="input input-bordered" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Daily routines" />
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="form-control col-span-3">
                    <span className="label-text">Date</span>
                    <input className="input input-bordered" type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} required />
                  </label>
                  <label className="form-control">
                    <span className="label-text">Start</span>
                    <input className="input input-bordered" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">End</span>
                    <input className="input input-bordered" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </label>
                </div>
                <label className="form-control">
                  <span className="label-text">Objectives parents can see</span>
                  <textarea className="textarea textarea-bordered min-h-28" value={objectives} onChange={(e) => setObjectives(e.target.value)} />
                </label>
                <button className="btn btn-primary" disabled={saving || !studentId || !sessionDate}>
                  <ButtonContent loading={saving} loadingLabel="Saving...">
                    Plan session
                  </ButtonContent>
                </button>
              </form>
            </div>
          </section>

          <section className="rounded-lg border border-[#ffd8ad] bg-white p-4 shadow-sm shadow-[#f8760f]/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#2b1708]">Calendar</h2>
                <p className="text-sm font-medium text-[#6d5a4a]">Weekly planning view inspired by the prototype.</p>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-outline btn-xs bg-white" onClick={() => setCalendarStart(addDays(calendarStart, -7))}>Previous</button>
                <button className="btn btn-outline btn-xs bg-white" onClick={() => setCalendarStart(startOfWeek(new Date()))}>Today</button>
                <button className="btn btn-outline btn-xs bg-white" onClick={() => setCalendarStart(addDays(calendarStart, 7))}>Next</button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-7">
              {weekDays.map((day) => (
                <div key={day} className="min-h-40 rounded-lg border border-[#ffd8ad] bg-[#fff9f0] p-2">
                  <div className="text-xs font-black uppercase text-[#a34400]">
                    {new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}
                  </div>
                  <div className="mt-2 grid gap-2">
                    {weekSessions
                      .filter((session) => session.session_date.slice(0, 10) === day)
                      .map((session) => (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() => hydrateEvaluationDraft(session)}
                          className={`rounded-lg border p-2 text-left text-xs ${STATUS_STYLES[session.status]}`}
                        >
                          <strong>{timeRange(session)}</strong>
                          <span className="mt-1 block">{session.first_name} {session.last_name}</span>
                          <span className="block opacity-80">{session.title || session.course_name || "Session"}</span>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
          <section className="rounded-lg border border-[#ffd8ad] bg-[#fff4e5] p-4 shadow-sm shadow-[#f8760f]/10">
            <h2 className="text-lg font-semibold text-[#2b1708]">Sessions by student</h2>
            <div className="mt-4 grid gap-3">
              {groupedByStudent.map((group) => (
                <article key={group.student.id} className="rounded-lg border border-[#ffd8ad] bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black text-[#2b1708]">{group.student.first_name} {group.student.last_name}</h3>
                      <p className="text-xs font-medium text-[#6d5a4a]">{group.sessions.length} session(s)</p>
                    </div>
                    <Link className="btn btn-primary btn-xs" to={`/teacher/sessions?studentId=${group.student.id}`}>Add</Link>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {group.sessions.length === 0 ? (
                      <p className="rounded-lg bg-[#fff9f0] p-3 text-sm text-base-content/60">No session yet.</p>
                    ) : (
                      group.sessions.map((session) => (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() => hydrateEvaluationDraft(session)}
                          className="rounded-lg border border-base-300 bg-white p-3 text-left transition hover:border-[#f8760f] hover:bg-[#fff9f0]"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold">{session.title || "Session"}</div>
                              <div className="text-xs text-base-content/60">{new Date(session.session_date).toLocaleString()} · {session.course_name || "Course"}</div>
                            </div>
                            <span className={`rounded-full border px-2 py-1 text-xs font-bold ${STATUS_STYLES[session.status]}`}>{session.status}</span>
                          </div>
                          {session.score && <div className="mt-2"><StarRating value={Number(session.score)} readOnly /></div>}
                          {session.objectives && <p className="mt-2 text-sm text-base-content/70">{session.objectives}</p>}
                          <span
                            className="btn btn-ghost btn-xs mt-2"
                            onClick={(event) => {
                              event.stopPropagation();
                              duplicateSession(session);
                            }}
                          >
                            Duplicate
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#c9ddff] bg-[#f3f8ff] p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-[#2b1708]">Session document</h2>
            {!activeSession ? (
              <p className="mt-4 rounded-lg bg-white p-4 text-sm text-base-content/60">Select a session from the calendar or student list.</p>
            ) : (
              <div className="mt-4 grid gap-4">
                <div className="rounded-lg bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#a34400]">Pedagogical summary</p>
                      <h3 className="text-2xl font-black text-[#2b1708]">{activeSession.title || "Session"}</h3>
                      <p className="text-sm text-base-content/60">{activeSession.first_name} {activeSession.last_name} · {new Date(activeSession.session_date).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <StarRating value={sessionScore || 0} readOnly />
                      <p className="text-xs font-bold text-base-content/60">Automatic session score</p>
                    </div>
                  </div>
                  {activeSession.objectives && (
                    <div className="mt-4 rounded-lg border border-[#ffd8ad] bg-[#fff9f0] p-3 text-sm">
                      <strong>Objectives</strong>
                      <p className="mt-1 text-base-content/70">{activeSession.objectives}</p>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-black text-[#2b1708]">Skills worked</h3>
                    <select className="select select-bordered select-sm w-56" onChange={(e) => { addSkill(e.target.value); e.currentTarget.value = ""; }}>
                      <option value="">Add skill...</option>
                      {SKILLS.filter((skill) => !skills.some((item) => item.name === skill)).map((skill) => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-3 grid gap-3">
                    {skills.length === 0 ? (
                      <p className="rounded-lg bg-base-200 p-3 text-sm text-base-content/60">Add and rate at least one skill.</p>
                    ) : (
                      skills.map((skill) => (
                        <div key={skill.name} className="rounded-lg border border-base-300 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <strong>{skill.name}</strong>
                            <StarRating value={skill.score} onChange={(value) => updateSkill(skill.name, value)} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-3 rounded-lg border border-[#ffd8ad] bg-[#fff9f0] p-3 text-sm">
                    <strong>MoodCheck:</strong> {mood}
                  </div>
                </div>

                <div className="grid gap-3">
                  <label className="form-control">
                    <span className="label-text">How was the student during this session?</span>
                    <textarea className="textarea textarea-bordered min-h-24" value={summary} onChange={(e) => setSummary(e.target.value)} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">What was difficult?</span>
                    <textarea className="textarea textarea-bordered min-h-24" value={difficulties} onChange={(e) => setDifficulties(e.target.value)} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">Recurring mistakes or blocks</span>
                    <textarea className="textarea textarea-bordered min-h-24" value={mistakes} onChange={(e) => setMistakes(e.target.value)} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">Homework / follow-up</span>
                    <textarea className="textarea textarea-bordered min-h-24" value={homework} onChange={(e) => setHomework(e.target.value)} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">Recording link</span>
                    <input className="input input-bordered" value={recording} onChange={(e) => setRecording(e.target.value)} />
                  </label>
                  <button className="btn btn-primary" onClick={saveSessionEvaluation} disabled={saving}>
                    <ButtonContent loading={saving} loadingLabel="Saving...">
                      Save session and attach evaluation
                    </ButtonContent>
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[#ffd8ad] bg-white p-3">
      <div className="text-xl font-black text-[#2b1708]">{value}</div>
      <div className="text-xs font-bold text-[#6d5a4a]">{label}</div>
    </div>
  );
}

function normalizeSkills(value: SkillScore[] | null | undefined) {
  return Array.isArray(value)
    ? value
        .map((skill) => ({ name: skill.name, score: Number(skill.score) }))
        .filter((skill) => skill.name && Number.isFinite(skill.score))
    : [];
}

function average(values: number[]) {
  const clean = values.filter(Number.isFinite);
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : null;
}

function moodLabel(value: number) {
  return MOOD_OPTIONS.find((option) => option.value === Math.round(value))?.label || "Average";
}

function formatScore(value: number | null) {
  return value == null || !Number.isFinite(value) ? "-" : value.toFixed(1);
}

function timeRange(session: Session) {
  const start = session.start_time?.slice(0, 5) || new Date(session.session_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return session.end_time ? `${start}-${session.end_time.slice(0, 5)}` : start;
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  return copy.toISOString().slice(0, 10);
}

function getWeekDays(start: string) {
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function addDays(value: string, amount: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().slice(0, 10);
}
