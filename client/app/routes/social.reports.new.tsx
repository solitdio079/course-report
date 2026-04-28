import { Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { API_URL, fetchMe } from "../lib/auth";
import { ButtonContent, PageLoader } from "../components/Spinner";

type Student = {
  id: number;
  first_name: string;
  last_name: string;
};

export default function NewSocialReport() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState(params.get("studentId") || "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/sign-in");
      if (me.role !== "social_relations" && me.role !== "admin") {
        return navigate("/");
      }
      try {
        const res = await fetch(`${API_URL}/social/students`, {
          credentials: "include",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setStudentsError(
            `Could not load students (HTTP ${res.status}): ${body?.message || res.statusText}`
          );
        } else {
          const data = await res.json().catch(() => ({}));
          setStudents(data?.students || []);
        }
      } catch (e: any) {
        setStudentsError(`Network error: ${e?.message || e}`);
      }
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
      const res = await fetch(`${API_URL}/social/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: Number(studentId),
          title,
          content,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data?.errors?.[0]?.msg || data?.message || "Could not save report"
        );
        return;
      }
      navigate(`/social/reports/${data.report.id}`);
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
      <div>
        <Link className="link" to="/social">
          ← Back to social
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">New social report</h1>

          {error && (
            <div className="alert alert-error mt-2">
              <span>{error}</span>
            </div>
          )}
          {studentsError && (
            <div className="alert alert-error mt-2">
              <span>{studentsError}</span>
            </div>
          )}
          {!studentsError && students.length === 0 && (
            <div className="alert alert-warning mt-2">
              <span>
                No students found in the database. Parents must add a child
                profile (via parent sign-up + dashboard) before reports can be
                created.
              </span>
            </div>
          )}

          <form className="grid gap-4" onSubmit={onSubmit}>
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
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Title</span>
              </div>
              <input
                className="input input-bordered"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Content</span>
              </div>
              <textarea
                className="textarea textarea-bordered min-h-48"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Observations, family situation, action plan..."
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !studentId || !title}
            >
              <ButtonContent loading={submitting} loadingLabel="Saving...">
                Save report
              </ButtonContent>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
