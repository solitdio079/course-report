import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { API_URL, fetchMe } from "../lib/auth";
import { PageLoader } from "../components/Spinner";

type Evaluation = {
  id: number;
  student_id: number;
  course_id: number | null;
  points: string | null;
  teacher_comment: string | null;
  progress_appreciation: string | null;
  created_at: string;
  first_name: string;
  last_name: string;
  course_name: string | null;
};

export default function TeacherEvaluations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Evaluation[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/teacher/sign-in");
      if (me.role !== "teacher") return navigate("/");
      const res = await fetch(`${API_URL}/teachers/evaluations`, {
        credentials: "include",
      });
      if (res.ok) setItems((await res.json()).evaluations || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <PageLoader label="Loading evaluations..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Evaluations</h1>
        <Link className="btn btn-primary btn-sm" to="/teacher/evaluations/new">
          New evaluation
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {items.length === 0 ? (
            <p className="text-base-content/70">No evaluations yet.</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {items.map((e) => (
                <li key={e.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">
                        {e.first_name} {e.last_name}
                        {e.course_name && (
                          <span className="text-base-content/60">
                            {" "}
                            • {e.course_name}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-base-content/70">
                        {new Date(e.created_at).toLocaleString()}
                        {e.points != null && ` • ${e.points} pts`}
                      </div>
                      {e.teacher_comment && (
                        <p className="text-sm mt-1">{e.teacher_comment}</p>
                      )}
                    </div>
                    <Link
                      className="btn btn-ghost btn-xs"
                      to={`/teacher/students/${e.student_id}`}
                    >
                      Open student
                    </Link>
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
