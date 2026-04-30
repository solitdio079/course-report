import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL, fetchMe, type AuthUser } from "../lib/auth";
import { StarRating } from "../components/StarRating";
import { PageLoader } from "../components/Spinner";
import {
  EVALUATION_CRITERIA,
  normalizeEvaluationCriteria,
  type EvaluationCriteria,
} from "../lib/evaluationCriteria";

type Course = { id: number; name: string; description: string | null };
type StudentRow = {
  id: number;
  first_name: string;
  last_name: string;
  course_email: string | null;
  course_id: number;
  course_name: string;
};

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

type Report = {
  id: number;
  title: string;
  report_type: string | null;
  includes_charts: boolean;
  created_at: string;
  student_id: number;
  first_name: string;
  last_name: string;
};
type Session = {
  id: number;
  student_id: number;
  session_date: string;
  objectives: string | null;
  status: "planned" | "completed" | "cancelled";
  first_name: string;
  last_name: string;
  course_name: string | null;
  evaluation_id: number | null;
};

function uniqueStudents(students: StudentRow[]) {
  return Array.from(new Map(students.map((student) => [student.id, student])).values());
}

function monthMatches(date: string) {
  const value = new Date(date);
  const now = new Date();
  return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth();
}

function ratingValue(points: string | null) {
  if (points == null) return null;
  const value = Number(points);
  return Number.isFinite(value) ? Math.max(1, Math.min(5, Math.round(value))) : null;
}

function hasPriorityCriteria(criteria: EvaluationCriteria | null) {
  const normalized = normalizeEvaluationCriteria(criteria);
  return EVALUATION_CRITERIA.some((criterion) => normalized[criterion] === "priority");
}

function StatTile({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <div className="rounded-lg border border-[#ffd8ad] bg-white p-4 shadow-sm shadow-[#f8760f]/10">
      <div className="text-sm font-bold text-[#a34400]">{label}</div>
      <div className="mt-2 text-3xl font-black text-[#2b1708]">{value}</div>
      {note && <div className="mt-1 text-xs text-base-content/60">{note}</div>}
    </div>
  );
}

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/teacher/sign-in");
      if (me.role !== "teacher") return navigate("/");
      setUser(me);

      const [cRes, sRes, eRes, rRes, sessionsRes] = await Promise.all([
        fetch(`${API_URL}/teachers/courses`, { credentials: "include" }),
        fetch(`${API_URL}/teachers/students`, { credentials: "include" }),
        fetch(`${API_URL}/teachers/evaluations`, { credentials: "include" }),
        fetch(`${API_URL}/teachers/reports`, { credentials: "include" }),
        fetch(`${API_URL}/teachers/sessions`, { credentials: "include" }),
      ]);
      if (cancelled) return;
      if (cRes.ok) setCourses((await cRes.json()).courses || []);
      if (sRes.ok) setStudents((await sRes.json()).students || []);
      if (eRes.ok) setEvaluations((await eRes.json()).evaluations || []);
      if (rRes.ok) setReports((await rRes.json()).reports || []);
      if (sessionsRes.ok) setSessions((await sessionsRes.json()).sessions || []);
      setLoading(false);
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

  const studentList = useMemo(() => uniqueStudents(students), [students]);
  const courseNamesByStudent = useMemo(() => {
    const map = new Map<number, string[]>();
    students.forEach((student) => {
      const current = map.get(student.id) || [];
      if (!current.includes(student.course_name)) current.push(student.course_name);
      map.set(student.id, current);
    });
    return map;
  }, [students]);

  const filteredStudents = studentList.filter((student) => {
    const haystack = `${student.first_name} ${student.last_name} ${student.course_email || ""} ${
      courseNamesByStudent.get(student.id)?.join(" ") || ""
    }`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const recentEvaluations = evaluations.slice(0, 4);
  const upcomingSessions = sessions
    .filter(
      (session) =>
        session.status === "planned" &&
        new Date(session.session_date).getTime() >= Date.now() - 1000 * 60 * 60 * 24
    )
    .slice(0, 5);
  const reportsThisMonth = reports.filter((report) => monthMatches(report.created_at));
  const evaluationsThisMonth = evaluations.filter((evaluation) =>
    monthMatches(evaluation.created_at)
  );
  const rated = evaluations
    .map((evaluation) => ratingValue(evaluation.points))
    .filter((value): value is number => value != null);
  const averageRating =
    rated.length > 0
      ? (rated.reduce((sum, value) => sum + value, 0) / rated.length).toFixed(1)
      : "—";
  const attentionItems = evaluations
    .filter((evaluation) => {
      const rating = ratingValue(evaluation.points);
      return (rating != null && rating <= 2) || hasPriorityCriteria(evaluation.criteria);
    })
    .slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <PageLoader label="Loading teacher dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8ef] text-base-content">
      <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
        <aside className="border-r border-[#f8760f]/20 bg-white px-4 py-6 text-[#2b1708] lg:min-h-screen">
          <div className="flex items-center gap-3">
            <img
              src="/hello-academy-logo.png"
              alt="Hello Academy"
              className="h-12 w-28 object-contain object-right"
            />
          </div>

          <nav className="mt-8 grid gap-2 text-sm">
            <Link className="rounded-lg bg-[#ffe0b8] px-3 py-3 font-bold text-[#7d3300]" to="/teacher">
              {t("teacher.title")}
            </Link>
            <Link className="rounded-lg px-3 py-3 font-bold text-[#2b1708] hover:bg-[#fff0dd]" to="/teacher/evaluations">
              {t("teacher.evaluations")}
            </Link>
            <Link className="rounded-lg px-3 py-3 font-bold text-[#2b1708] hover:bg-[#fff0dd]" to="/teacher/evaluations/new">
              {t("teacher.newEvaluation")}
            </Link>
            <Link className="rounded-lg px-3 py-3 font-bold text-[#2b1708] hover:bg-[#fff0dd]" to="/teacher/sessions">
              Sessions
            </Link>
            <Link className="rounded-lg px-3 py-3 font-bold text-[#2b1708] hover:bg-[#fff0dd]" to="/teacher/feedback">
              Parent feedback
            </Link>
            <Link className="rounded-lg px-3 py-3 font-bold text-[#2b1708] hover:bg-[#fff0dd]" to="/inbox">
              {t("nav.inbox")}
            </Link>
          </nav>

          <button
            className="btn btn-outline btn-sm mt-10 w-full"
            onClick={logout}
          >
            {t("nav.signOut")}
          </button>
        </aside>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-[#a34400]">
                  {t("nav.teacherPortal")}
                </div>
                <h1 className="mt-1 text-3xl font-semibold">{t("teacher.title")}</h1>
                <p className="mt-1 text-sm text-base-content/65">
                  Welcome{user?.fullName ? `, ${user.fullName}` : ""}. Your students,
                  evaluations, and reports are ready in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link className="btn btn-primary btn-sm" to="/teacher/evaluations/new">
                  {t("teacher.newEvaluation")}
                </Link>
                <Link className="btn btn-outline btn-sm bg-white" to="/teacher/sessions">
                  Plan session
                </Link>
                <Link className="btn btn-outline btn-sm" to="/teacher/evaluations">
                  {t("teacher.evaluations")}
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile label="Active students" value={studentList.length} note={`${courses.length} courses`} />
              <StatTile
                label="Evaluations this month"
                value={evaluationsThisMonth.length}
                note={`${evaluations.length} total`}
              />
              <StatTile
                label="Planned sessions"
                value={upcomingSessions.length}
                note={`${sessions.length} total`}
              />
              <StatTile
                label="Reports generated"
                value={reports.length}
                note={`${reportsThisMonth.length} this month`}
              />
              <StatTile label="Average rating" value={averageRating} note="1-5 star scale" />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
              <section className="rounded-lg border border-[#ffd8ad] bg-[#fff4e5] p-4 shadow-sm shadow-[#f8760f]/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{t("teacher.students")}</h2>
                    <p className="text-sm text-base-content/60">
                      Open a student quickly to add evaluations or generate a report.
                    </p>
                  </div>
                  <input
                    className="input input-bordered input-sm w-full sm:w-72"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search students..."
                  />
                </div>

                {filteredStudents.length === 0 ? (
                  <p className="mt-4 text-sm text-base-content/60">{t("teacher.empty")}</p>
                ) : (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {filteredStudents.map((student) => {
                      const latest = evaluations.find(
                        (evaluation) => evaluation.student_id === student.id
                      );
                      return (
                        <Link
                          key={student.id}
                          to={`/teacher/students/${student.id}`}
                          className="rounded-lg border border-[#ffd8ad] bg-white p-4 transition hover:border-[#f8760f] hover:bg-[#fff9f0]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold">
                                {student.first_name} {student.last_name}
                              </div>
                              <div className="mt-1 text-xs text-base-content/60">
                                {(courseNamesByStudent.get(student.id) || []).join(", ") ||
                                  student.course_name}
                              </div>
                            </div>
                            {latest?.points != null && (
                              <StarRating value={Number(latest.points)} readOnly />
                            )}
                          </div>
                          {student.course_email && (
                            <div className="mt-3 text-xs text-base-content/55">
                              {student.course_email}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="rounded-lg border border-[#ffd25a] bg-[#fff9d9] p-4 shadow-sm shadow-[#f8760f]/10">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Attention</h2>
                  <span className="badge badge-outline">{attentionItems.length}</span>
                </div>
                <p className="mt-1 text-sm text-base-content/60">
                  Students with low ratings or priority criteria.
                </p>

                {attentionItems.length === 0 ? (
                  <p className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success">
                    No priority items right now.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {attentionItems.map((evaluation) => (
                      <li key={evaluation.id} className="rounded-lg border border-[#ffd25a] bg-white p-3">
                        <Link
                          to={`/teacher/students/${evaluation.student_id}`}
                          className="font-medium hover:underline"
                        >
                          {evaluation.first_name} {evaluation.last_name}
                        </Link>
                        <div className="mt-1 text-xs text-base-content/60">
                          {evaluation.course_name || "Course"} ·{" "}
                          {new Date(evaluation.created_at).toLocaleDateString()}
                        </div>
                        {evaluation.points != null && (
                          <div className="mt-2">
                            <StarRating value={Number(evaluation.points)} readOnly />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
              <section className="rounded-lg border border-[#ffd8ad] bg-[#fff4e5] p-4 shadow-sm shadow-[#f8760f]/10">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Upcoming sessions</h2>
                  <Link className="btn btn-ghost btn-xs" to="/teacher/sessions">
                    Calendar
                  </Link>
                </div>

                {upcomingSessions.length === 0 ? (
                  <p className="mt-4 rounded-lg bg-white p-4 text-sm text-base-content/60">
                    No upcoming sessions planned.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {upcomingSessions.map((session) => (
                      <li key={session.id} className="rounded-lg border border-[#ffd8ad] bg-white p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              to={`/teacher/students/${session.student_id}`}
                              className="font-medium hover:underline"
                            >
                              {session.first_name} {session.last_name}
                            </Link>
                            <div className="text-xs text-base-content/60">
                              {new Date(session.session_date).toLocaleString()}
                              {session.course_name ? ` - ${session.course_name}` : ""}
                            </div>
                          </div>
                          <Link
                            className="btn btn-primary btn-xs"
                            to={`/teacher/evaluations/new?sessionId=${session.id}`}
                          >
                            Evaluate
                          </Link>
                        </div>
                        {session.objectives && (
                          <p className="mt-2 text-sm text-base-content/75">
                            {session.objectives}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-lg border border-[#c9ddff] bg-[#f3f8ff] p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Recent evaluations</h2>
                  <Link className="btn btn-ghost btn-xs" to="/teacher/evaluations">
                    View all
                  </Link>
                </div>

                {recentEvaluations.length === 0 ? (
                  <p className="mt-4 text-sm text-base-content/60">{t("eval.empty")}</p>
                ) : (
                  <ul className="mt-3 divide-y divide-base-300">
                    {recentEvaluations.map((evaluation) => (
                      <li key={evaluation.id} className="py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              to={`/teacher/students/${evaluation.student_id}`}
                              className="font-medium hover:underline"
                            >
                              {evaluation.first_name} {evaluation.last_name}
                            </Link>
                            <div className="text-xs text-base-content/60">
                              {evaluation.course_name || "Course"} ·{" "}
                              {new Date(evaluation.created_at).toLocaleString()}
                            </div>
                          </div>
                          {evaluation.points != null && (
                            <StarRating value={Number(evaluation.points)} readOnly />
                          )}
                        </div>
                        {evaluation.teacher_comment && (
                          <p className="mt-2 text-sm text-base-content/75">
                            {evaluation.teacher_comment}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-lg border border-[#ffcfc7] bg-[#fff4f1] p-4 shadow-sm shadow-[#ff6b57]/10">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Reports</h2>
                  <span className="badge badge-ghost">{reports.length}</span>
                </div>

                {reports.length === 0 ? (
                  <div className="mt-4 rounded-lg bg-base-200 p-4 text-sm text-base-content/65">
                    Generate a report from a student profile after adding an evaluation.
                  </div>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {reports.slice(0, 4).map((report) => (
                      <li key={report.id} className="rounded-lg border border-[#ffcfc7] bg-white p-3">
                        <div className="font-medium">{report.title}</div>
                        <div className="mt-1 text-xs text-base-content/60">
                          {report.first_name} {report.last_name} ·{" "}
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                        <Link
                          className="btn btn-outline btn-xs mt-3"
                          to={`/teacher/reports/${report.id}`}
                        >
                          Open report
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
