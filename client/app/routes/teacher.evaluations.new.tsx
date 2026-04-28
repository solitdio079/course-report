import { Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { API_URL, fetchMe } from "../lib/auth";
import { ButtonContent, PageLoader } from "../components/Spinner";

type Course = { id: number; name: string; description: string | null };
type StudentRow = {
  id: number;
  first_name: string;
  last_name: string;
  course_id: number;
  course_name: string;
};

export default function NewEvaluation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);

  const [studentId, setStudentId] = useState(params.get("studentId") || "");
  const [courseId, setCourseId] = useState(params.get("courseId") || "");
  const [points, setPoints] = useState("");
  const [comment, setComment] = useState("");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/teacher/sign-in");
      if (me.role !== "teacher") return navigate("/");

      const [cRes, sRes] = await Promise.all([
        fetch(`${API_URL}/teachers/courses`, { credentials: "include" }),
        fetch(`${API_URL}/teachers/students`, { credentials: "include" }),
      ]);
      if (cRes.ok) setCourses((await cRes.json()).courses || []);
      if (sRes.ok) setStudents((await sRes.json()).students || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

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
          points: points ? Number(points) : undefined,
          teacherComment: comment || undefined,
          progressAppreciation: progress || undefined,
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
          ← Back to teacher dashboard
        </Link>
      </div>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">New evaluation</h1>

          {error && (
            <div className="alert alert-error mt-2">
              <span>{error}</span>
            </div>
          )}

          <form className="grid gap-4 md:grid-cols-2 mt-2" onSubmit={onSubmit}>
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
                <option value="">Select student...</option>
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
                <option value="">Select course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Points (0–100)</span>
              </div>
              <input
                className="input input-bordered"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </label>

            <div className="md:col-span-2 grid gap-4">
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Course comment</span>
                </div>
                <textarea
                  className="textarea textarea-bordered min-h-24"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text">Progress appreciation</span>
                </div>
                <textarea
                  className="textarea textarea-bordered min-h-24"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  placeholder="e.g., strong improvement, struggling with..."
                />
              </label>
            </div>

            <button
              className="btn btn-primary md:col-span-2"
              type="submit"
              disabled={submitting || !studentId}
            >
              <ButtonContent loading={submitting} loadingLabel="Saving...">
                Save evaluation
              </ButtonContent>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
