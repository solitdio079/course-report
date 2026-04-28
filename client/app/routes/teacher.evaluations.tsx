import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL, fetchMe } from "../lib/auth";
import { StarRating } from "../components/StarRating";
import { PageLoader } from "../components/Spinner";
import {
  EVALUATION_CRITERIA,
  normalizeEvaluationCriteria,
  type EvaluationCriteria,
} from "../lib/evaluationCriteria";

type Evaluation = {
  id: number;
  student_id: number;
  course_id: number | null;
  points: string | null;
  teacher_comment: string | null;
  progress_appreciation: string | null;
  criteria: EvaluationCriteria | null;
  created_at: string;
  first_name: string;
  last_name: string;
  course_name: string | null;
};

export default function TeacherEvaluations() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        <h1 className="text-2xl font-semibold">{t("teacher.evaluations")}</h1>
        <Link className="btn btn-primary btn-sm" to="/teacher/evaluations/new">
          {t("teacher.newEvaluation")}
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {items.length === 0 ? (
            <p className="text-base-content/70">{t("eval.empty")}</p>
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
                      </div>
                      {e.points != null && (
                        <div className="mt-1">
                          <StarRating value={Number(e.points)} readOnly />
                        </div>
                      )}
                      {e.teacher_comment && (
                        <p className="text-sm mt-1">{e.teacher_comment}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {EVALUATION_CRITERIA.map((criterion) => {
                          const status = normalizeEvaluationCriteria(
                            e.criteria
                          )[criterion];
                          if (!status) return null;
                          return (
                            <span
                              key={criterion}
                              className="badge badge-outline badge-sm"
                            >
                              {t(`eval.criteria.${criterion}`)}:{" "}
                              {t(`eval.status.${status}`)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <Link
                      className="btn btn-ghost btn-xs"
                      to={`/teacher/students/${e.student_id}`}
                    >
                      {t("eval.openStudent")}
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
