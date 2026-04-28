import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { API_URL, fetchMe } from "../lib/auth";
import { PageLoader } from "../components/Spinner";

type Student = {
  id: number;
  first_name: string;
  last_name: string;
  course_email: string | null;
  date_of_birth: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  parent_email: string | null;
};

type SocialReport = {
  id: number;
  title: string;
  created_at: string;
  student_id: number | null;
  first_name: string | null;
  last_name: string | null;
};

export default function SocialDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<SocialReport[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/sign-in");
      if (me.role !== "social_relations" && me.role !== "admin") {
        return navigate("/");
      }

      const [sRes, rRes] = await Promise.all([
        fetch(`${API_URL}/social/students`, { credentials: "include" }),
        fetch(`${API_URL}/social/reports`, { credentials: "include" }),
      ]);
      if (sRes.ok) setStudents((await sRes.json()).students || []);
      if (rRes.ok) setReports((await rRes.json()).reports || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageLoader label="Loading social relations..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Social relations</h1>
        <Link className="btn btn-primary btn-sm" to="/social/reports/new">
          New social report
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Students</h2>
          {students.length === 0 ? (
            <p className="text-base-content/70">No students yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course email</th>
                    <th>Parent</th>
                    <th>Phone</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>
                        {s.first_name} {s.last_name}
                      </td>
                      <td className="text-base-content/70">
                        {s.course_email || "—"}
                      </td>
                      <td>{s.parent_name || "—"}</td>
                      <td className="text-base-content/70">
                        {s.parent_phone || "—"}
                      </td>
                      <td className="text-right">
                        <Link
                          to={`/social/students/${s.id}`}
                          className="btn btn-ghost btn-xs"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">My social reports</h2>
          {reports.length === 0 ? (
            <p className="text-base-content/70">No social reports yet.</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {reports.map((r) => (
                <li key={r.id} className="py-3">
                  <Link
                    to={`/social/reports/${r.id}`}
                    className="block hover:opacity-80"
                  >
                    <div className="font-medium">{r.title}</div>
                    <div className="text-sm text-base-content/70">
                      {r.first_name && r.last_name
                        ? `${r.first_name} ${r.last_name} • `
                        : ""}
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="text-sm">
        <Link className="link" to="/inbox">
          Go to shared inbox →
        </Link>
      </div>
    </div>
  );
}
