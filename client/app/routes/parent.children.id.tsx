import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { API_URL, fetchMe } from "../lib/auth";
import { ButtonContent, PageLoader } from "../components/Spinner";

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
  objectives: string | null;
  status: "planned" | "completed" | "cancelled";
  course_name: string | null;
  teacher_name: string | null;
  evaluation_id: number | null;
  evaluation_points: string | null;
  evaluation_comment: string | null;
  evaluation_progress: string | null;
};

export default function ParentChildDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState<Child | null>(null);
  const [parents, setParents] = useState<ParentInfo[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

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
                        {new Date(session.session_date).toLocaleString()}
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
                      <div className="font-semibold">
                        Evaluation: {session.evaluation_points || "-"} / 5
                      </div>
                      {session.evaluation_comment && <p className="mt-1">{session.evaluation_comment}</p>}
                      {session.evaluation_progress && <p className="mt-1">{session.evaluation_progress}</p>}
                    </div>
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
