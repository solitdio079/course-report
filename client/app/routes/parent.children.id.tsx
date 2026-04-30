import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { API_URL, fetchMe } from "../lib/auth";
import { ButtonContent, PageLoader } from "../components/Spinner";
import { StarRating } from "../components/StarRating";

type Child = {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  address: string | null;
  course_email: string | null;
};

type ParentInfo = {
  user_id: number;
  full_name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  relationship: string | null;
};

type Course = { id: number; name: string; description: string | null };
type TeacherRow = {
  id: number;
  full_name: string;
  email: string;
  course_id: number;
  course_name: string;
};
type Session = {
  id: number;
  session_date: string;
  title: string | null;
  start_time: string | null;
  end_time: string | null;
  objectives: string | null;
  status: "planned" | "completed" | "cancelled";
  score: string | null;
  skills: unknown;
  mood_check: unknown;
  summary: string | null;
  difficulties: string | null;
  mistakes: string | null;
  homework: string | null;
  recording: string | null;
  course_name: string | null;
  teacher_name: string | null;
  evaluation_id: number | null;
  evaluation_points: string | null;
  evaluation_comment: string | null;
  evaluation_progress: string | null;
};
type ParentFeedback = {
  id: number;
  feedback_date: string;
  author: string | null;
  satisfaction: string | null;
  progress: string | null;
  difficulties: string | null;
  comment: string | null;
  teacher_name: string | null;
};

function sessionSkillItems(skills: unknown) {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    return skills
      .map((skill) => {
        if (!skill || typeof skill !== "object") return null;
        const item = skill as { label?: unknown; name?: unknown; key?: unknown; score?: unknown };
        const label =
          typeof item.label === "string"
            ? item.label
            : typeof item.name === "string"
              ? item.name
              : typeof item.key === "string"
                ? item.key
                : null;
        const score = Number(item.score);
        return label && Number.isFinite(score)
          ? { label, score: Math.max(1, Math.min(5, Math.round(score))) }
          : null;
      })
      .filter((item): item is { label: string; score: number } => Boolean(item));
  }
  if (typeof skills === "object") {
    return Object.entries(skills as Record<string, unknown>)
      .map(([label, value]) => {
        const score = Number(value);
        return Number.isFinite(score)
          ? { label, score: Math.max(1, Math.min(5, Math.round(score))) }
          : null;
      })
      .filter((item): item is { label: string; score: number } => Boolean(item));
  }
  return [];
}

function moodText(moodCheck: unknown) {
  if (!moodCheck) return null;
  if (typeof moodCheck === "string") return moodCheck.trim() || null;
  if (typeof moodCheck !== "object" || Array.isArray(moodCheck)) return null;
  const entries = Object.entries(moodCheck as Record<string, unknown>)
    .filter(([, value]) => value != null && value !== "")
    .map(([key, value]) => `${key}: ${String(value)}`);
  return entries.length > 0 ? entries.join(" • ") : null;
}

export default function ParentChildDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState<Child | null>(null);
  const [parents, setParents] = useState<ParentInfo[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [feedback, setFeedback] = useState<ParentFeedback[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [courseEmail, setCourseEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/sign-in");
      if (me.role !== "parent") return navigate("/");

      const res = await fetch(`${API_URL}/parents/children/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        navigate("/parent");
        return;
      }
      const data = await res.json();
      if (cancelled) return;
      const c: Child = data.child;
      setChild(c);
      setParents(data.parents || []);
      setCourses(data.courses || []);
      setTeachers(data.teachers || []);
      setSessions(data.sessions || []);
      setFeedback(data.feedback || []);
      setFirstName(c.first_name || "");
      setLastName(c.last_name || "");
      setDateOfBirth(c.date_of_birth ? c.date_of_birth.slice(0, 10) : "");
      setAddress(c.address || "");
      setCourseEmail(c.course_email || "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/parents/children/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          dateOfBirth: dateOfBirth || null,
          address: address || null,
          courseEmail: courseEmail || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data?.errors?.[0]?.msg || data?.message || "Update failed"
        );
        return;
      }
      setChild(data.child);
      setMessage("Saved");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <PageLoader label="Loading child profile..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div>
        <Link className="link" to="/parent">
          ← Back to dashboard
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">
            {child?.first_name} {child?.last_name}
          </h1>

          {message && (
            <div className="alert alert-success mt-2">
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="alert alert-error mt-2">
              <span>{error}</span>
            </div>
          )}

          <form className="grid gap-4 md:grid-cols-2 mt-2" onSubmit={onSave}>
            <label className="form-control">
              <div className="label">
                <span className="label-text">First name</span>
              </div>
              <input
                className="input input-bordered"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Last name</span>
              </div>
              <input
                className="input input-bordered"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Date of birth</span>
              </div>
              <input
                className="input input-bordered"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Course email</span>
              </div>
              <input
                className="input input-bordered"
                type="email"
                value={courseEmail}
                onChange={(e) => setCourseEmail(e.target.value)}
              />
            </label>
            <label className="form-control md:col-span-2">
              <div className="label">
                <span className="label-text">Address</span>
              </div>
              <input
                className="input input-bordered"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>
            <button
              className="btn btn-primary md:col-span-2"
              type="submit"
              disabled={submitting}
            >
              <ButtonContent loading={submitting} loadingLabel="Saving...">
                Save
              </ButtonContent>
            </button>
          </form>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Parents</h2>
          {parents.length === 0 ? (
            <p className="text-base-content/70">No parents linked.</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {parents.map((p) => (
                <li key={p.user_id} className="py-3 text-sm">
                  <div className="font-medium">
                    {p.full_name}{" "}
                    {p.relationship && (
                      <span className="text-base-content/60">
                        ({p.relationship})
                      </span>
                    )}
                  </div>
                  <div className="text-base-content/70">
                    {p.email}
                    {p.phone_number ? ` • ${p.phone_number}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Linked courses</h2>
            {courses.length === 0 ? (
              <p className="text-base-content/70">No courses yet.</p>
            ) : (
              <ul className="space-y-1">
                {courses.map((c) => (
                  <li key={c.id} className="text-sm">
                    <span className="font-medium">{c.name}</span>
                    {c.description && (
                      <div className="text-base-content/70">
                        {c.description}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Linked teachers</h2>
            {teachers.length === 0 ? (
              <p className="text-base-content/70">No teachers yet.</p>
            ) : (
              <ul className="space-y-1">
                {teachers.map((t) => (
                  <li key={`${t.id}-${t.course_id}`} className="text-sm">
                    <span className="font-medium">{t.full_name}</span>
                    <div className="text-base-content/70">
                      {t.course_name} • {t.email}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Sessions</h2>
          <p className="text-sm text-base-content/60">
            Planned session objectives appear here before class. Evaluations appear after the teacher completes the session.
          </p>
          {sessions.length === 0 ? (
            <p className="mt-3 rounded-lg bg-base-200 p-3 text-sm text-base-content/60">
              No sessions planned yet.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-base-300">
              {sessions.map((session) => (
                <li key={session.id} className="py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">
                        {session.title || new Date(session.session_date).toLocaleString()}
                      </div>
                      <div className="text-sm text-base-content/60">
                        {new Date(session.session_date).toLocaleString()}
                        {session.start_time || session.end_time
                          ? ` • ${[session.start_time, session.end_time].filter(Boolean).join(" - ")}`
                          : ""}
                      </div>
                      <div className="text-sm text-base-content/60">
                        {session.course_name || "Course"}{" "}
                        {session.teacher_name ? `- ${session.teacher_name}` : ""}
                      </div>
                    </div>
                    <span className="badge badge-outline capitalize">{session.status}</span>
                  </div>
                  {session.objectives && (
                    <div className="mt-2 rounded-lg border border-base-300 bg-base-200/60 p-3 text-sm">
                      <div className="font-semibold">Objectives</div>
                      <p className="mt-1 text-base-content/70">{session.objectives}</p>
                    </div>
                  )}
                  {session.evaluation_id && (
                    <div className="mt-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                      <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
                        <span>Evaluation attached</span>
                        {session.evaluation_points && (
                          <StarRating value={Number(session.evaluation_points)} readOnly />
                        )}
                      </div>
                      {session.summary && (
                        <div className="mt-3">
                          <div className="font-semibold">Session summary</div>
                          <p className="mt-1">{session.summary}</p>
                        </div>
                      )}
                      {session.evaluation_comment && <p className="mt-1">{session.evaluation_comment}</p>}
                      {session.evaluation_progress && <p className="mt-1">{session.evaluation_progress}</p>}
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {session.difficulties && (
                          <div className="rounded-md bg-white/75 p-2 text-success">
                            <div className="font-semibold">Difficulties</div>
                            <p className="mt-1">{session.difficulties}</p>
                          </div>
                        )}
                        {session.mistakes && (
                          <div className="rounded-md bg-white/75 p-2 text-success">
                            <div className="font-semibold">Mistakes noticed</div>
                            <p className="mt-1">{session.mistakes}</p>
                          </div>
                        )}
                        {session.homework && (
                          <div className="rounded-md bg-white/75 p-2 text-success">
                            <div className="font-semibold">Homework</div>
                            <p className="mt-1">{session.homework}</p>
                          </div>
                        )}
                        {moodText(session.mood_check) && (
                          <div className="rounded-md bg-white/75 p-2 text-success">
                            <div className="font-semibold">MoodCheck</div>
                            <p className="mt-1">{moodText(session.mood_check)}</p>
                          </div>
                        )}
                      </div>
                      {sessionSkillItems(session.skills).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {sessionSkillItems(session.skills).map((skill) => (
                            <span
                              key={`${skill.label}-${skill.score}`}
                              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-success"
                            >
                              {skill.label}: {skill.score}/5
                            </span>
                          ))}
                        </div>
                      )}
                      {session.recording && (
                        <a
                          className="link mt-3 inline-block font-semibold"
                          href={session.recording}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open recording
                        </a>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Parent feedback history</h2>
          <p className="text-sm text-base-content/60">
            Feedback shared with the school about progress, satisfaction, and difficulties.
          </p>
          {feedback.length === 0 ? (
            <p className="mt-3 rounded-lg bg-base-200 p-3 text-sm text-base-content/60">
              No parent feedback recorded yet.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-base-300">
              {feedback.map((item) => (
                <li key={item.id} className="py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">
                      {item.author || "Parent"} · {new Date(item.feedback_date).toLocaleDateString()}
                    </div>
                    {item.satisfaction && <span className="badge badge-outline">{item.satisfaction}</span>}
                  </div>
                  {item.teacher_name && (
                    <div className="mt-1 text-xs text-base-content/60">Logged by {item.teacher_name}</div>
                  )}
                  {item.progress && <p className="mt-2"><strong>Progress:</strong> {item.progress}</p>}
                  {item.difficulties && <p className="mt-1"><strong>Difficulties:</strong> {item.difficulties}</p>}
                  {item.comment && <p className="mt-1">{item.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
