import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL, fetchMe, type AuthUser } from "../lib/auth";
import { PageLoader } from "../components/Spinner";

type Course = { id: number; name: string; description: string | null };
type StudentRow = {
  id: number;
  first_name: string;
  last_name: string;
  course_email: string | null;
  course_id: number;
  course_name: string;
};

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) {
        navigate("/teacher/sign-in");
        return;
      }
      if (me.role !== "teacher") {
        navigate("/");
        return;
      }
      setUser(me);

      const [cRes, sRes] = await Promise.all([
        fetch(`${API_URL}/teachers/courses`, { credentials: "include" }),
        fetch(`${API_URL}/teachers/students`, { credentials: "include" }),
      ]);
      if (cRes.ok) {
        const data = await cRes.json();
        if (!cancelled) setCourses(data.courses || []);
      }
      if (sRes.ok) {
        const data = await sRes.json();
        if (!cancelled) setStudents(data.students || []);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function logout() {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/teacher/sign-in");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <PageLoader label="Loading teacher dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold">{t("teacher.title")}</h1>
                <p className="text-base-content/70">
                  Welcome{user?.fullName ? `, ${user.fullName}` : ""}. Manage your
                  course work and communications.
                </p>
              </div>

              <button className="btn btn-outline" onClick={logout}>
                Sign out
              </button>
            </div>

            <div className="divider" />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="card bg-base-200">
                <div className="card-body">
                  <h2 className="card-title">{t("teacher.evaluations")}</h2>
                  {courses.length === 0 ? (
                    <p className="text-sm text-base-content/70">
                      {t("teacher.empty")}
                    </p>
                  ) : (
                    <ul className="space-y-1 text-sm">
                      {courses.map((c) => (
                        <li key={c.id}>
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

              <div className="card bg-base-200">
                <div className="card-body">
                  <h2 className="card-title">{t("teacher.students")}</h2>
                  {students.length === 0 ? (
                    <p className="text-sm text-base-content/70">
                      {t("teacher.empty")}
                    </p>
                  ) : (
                    <ul className="divide-y divide-base-300 text-sm">
                      {students.map((s) => (
                        <li
                          key={`${s.id}-${s.course_id}`}
                          className="py-2"
                        >
                          <Link
                            to={`/teacher/students/${s.id}`}
                            className="block hover:opacity-80"
                          >
                            <div className="font-medium">
                              {s.first_name} {s.last_name}
                            </div>
                            <div className="text-base-content/70">
                              {s.course_name}
                              {s.course_email ? ` • ${s.course_email}` : ""}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="btn btn-primary btn-sm" to="/teacher/evaluations/new">
                New evaluation
              </Link>
              <Link className="btn btn-outline btn-sm" to="/teacher/evaluations">
                All evaluations
              </Link>
            </div>

            <div className="mt-6 text-sm">
              <Link className="link" to="/">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
