import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { API_URL, fetchMe } from "../lib/auth";
import { ButtonContent, PageLoader } from "../components/Spinner";

type StudentRow = {
  id: number;
  first_name: string;
  last_name: string;
};

type ParentFeedback = {
  id: number;
  student_id: number;
  feedback_date: string;
  author: string | null;
  satisfaction: string | null;
  progress: string | null;
  difficulties: string | null;
  comment: string | null;
  first_name: string;
  last_name: string;
};

export default function TeacherFeedback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [feedback, setFeedback] = useState<ParentFeedback[]>([]);
  const [studentId, setStudentId] = useState("");
  const [feedbackDate, setFeedbackDate] = useState(new Date().toISOString().slice(0, 10));
  const [author, setAuthor] = useState("");
  const [satisfaction, setSatisfaction] = useState("High");
  const [progress, setProgress] = useState("");
  const [difficulties, setDifficulties] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/teacher/sign-in");
      if (me.role !== "teacher") return navigate("/");
      await Promise.all([loadStudents(), loadFeedback()]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function loadStudents() {
    const res = await fetch(`${API_URL}/teachers/students`, { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    const unique = Array.from(
      new Map((data.students || []).map((student: StudentRow) => [student.id, student])).values()
    ) as StudentRow[];
    setStudents(unique);
    if (!studentId && unique[0]) setStudentId(String(unique[0].id));
  }

  async function loadFeedback() {
    const res = await fetch(`${API_URL}/teachers/feedback`, { credentials: "include" });
    if (res.ok) setFeedback((await res.json()).feedback || []);
  }

  async function saveFeedback(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/teachers/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: Number(studentId),
          feedbackDate,
          author: author || undefined,
          satisfaction,
          progress: progress || undefined,
          difficulties: difficulties || undefined,
          comment: comment || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.errors?.[0]?.msg || data?.message || "Could not save feedback");
        return;
      }
      setAuthor("");
      setProgress("");
      setDifficulties("");
      setComment("");
      await loadFeedback();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PageLoader label="Loading parent feedback..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8ef] px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Link className="link text-sm font-bold" to="/teacher">
            Back to dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-[#2b1708]">Parent feedback</h1>
          <p className="text-sm font-medium text-[#6d5a4a]">
            Track parent satisfaction, perceived progress, difficulties, and comments.
          </p>
        </div>

        <section className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Add feedback</h2>
            {error && <div className="alert alert-error"><span>{error}</span></div>}
            <form className="grid gap-3 md:grid-cols-2" onSubmit={saveFeedback}>
              <label className="form-control">
                <span className="label-text">Student</span>
                <select className="select select-bordered" value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control">
                <span className="label-text">Date</span>
                <input className="input input-bordered" type="date" value={feedbackDate} onChange={(e) => setFeedbackDate(e.target.value)} required />
              </label>
              <label className="form-control">
                <span className="label-text">Author</span>
                <input className="input input-bordered" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Parent name" />
              </label>
              <label className="form-control">
                <span className="label-text">Satisfaction</span>
                <select className="select select-bordered" value={satisfaction} onChange={(e) => setSatisfaction(e.target.value)}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              <label className="form-control">
                <span className="label-text">Perceived progress</span>
                <textarea className="textarea textarea-bordered min-h-24" value={progress} onChange={(e) => setProgress(e.target.value)} />
              </label>
              <label className="form-control">
                <span className="label-text">Difficulties observed</span>
                <textarea className="textarea textarea-bordered min-h-24" value={difficulties} onChange={(e) => setDifficulties(e.target.value)} />
              </label>
              <label className="form-control md:col-span-2">
                <span className="label-text">Comment</span>
                <textarea className="textarea textarea-bordered min-h-24" value={comment} onChange={(e) => setComment(e.target.value)} />
              </label>
              <button className="btn btn-primary md:col-span-2" disabled={saving || !studentId}>
                <ButtonContent loading={saving} loadingLabel="Saving...">
                  Save feedback
                </ButtonContent>
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-lg border border-[#ffd25a] bg-[#fff9d9] p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2b1708]">Recent feedback</h2>
          {feedback.length === 0 ? (
            <p className="mt-3 rounded-lg bg-white p-3 text-sm text-base-content/60">
              No parent feedback yet.
            </p>
          ) : (
            <ul className="mt-3 grid gap-3">
              {feedback.map((item) => (
                <li key={item.id} className="rounded-lg border border-[#ffd25a] bg-white p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link className="font-semibold hover:underline" to={`/teacher/students/${item.student_id}`}>
                      {item.first_name} {item.last_name}
                    </Link>
                    {item.satisfaction && <span className="badge badge-outline">{item.satisfaction}</span>}
                  </div>
                  <div className="mt-1 text-xs text-base-content/60">
                    {item.author || "Parent"} · {new Date(item.feedback_date).toLocaleDateString()}
                  </div>
                  {item.progress && <p className="mt-2"><strong>Progress:</strong> {item.progress}</p>}
                  {item.difficulties && <p className="mt-1"><strong>Difficulties:</strong> {item.difficulties}</p>}
                  {item.comment && <p className="mt-1">{item.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
