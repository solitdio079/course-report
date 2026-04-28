import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { API_URL, fetchMe } from "../lib/auth";
import { PageLoader } from "../components/Spinner";

type Student = {
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

export default function SocialStudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [parents, setParents] = useState<ParentInfo[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/sign-in");
      if (me.role !== "social_relations" && me.role !== "admin") {
        return navigate("/");
      }

      const res = await fetch(`${API_URL}/social/students/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        navigate("/social");
        return;
      }
      const data = await res.json();
      setStudent(data.student);
      setParents(data.parents || []);
      setCourses(data.courses || []);
      setTeachers(data.teachers || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <PageLoader label="Loading student..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link className="link" to="/social">
          ← Back to social
        </Link>
        <Link
          className="btn btn-primary btn-sm"
          to={`/social/reports/new?studentId=${id}`}
        >
          New social report
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">
            {student?.first_name} {student?.last_name}
          </h1>
          <div className="text-sm text-base-content/70 space-y-1">
            {student?.date_of_birth && (
              <div>
                DOB: {new Date(student.date_of_birth).toLocaleDateString()}
              </div>
            )}
            {student?.address && <div>Address: {student.address}</div>}
            {student?.course_email && (
              <div>Course email: {student.course_email}</div>
            )}
          </div>
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
                    {p.full_name}
                    {p.relationship && (
                      <span className="text-base-content/60">
                        {" "}
                        ({p.relationship})
                      </span>
                    )}
                  </div>
                  <div className="text-base-content/70">
                    {p.email}
                    {p.phone_number ? ` • ${p.phone_number}` : ""}
                    {p.address ? ` • ${p.address}` : ""}
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
            <h2 className="card-title">Courses</h2>
            {courses.length === 0 ? (
              <p className="text-base-content/70">No courses.</p>
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

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Teachers</h2>
            {teachers.length === 0 ? (
              <p className="text-base-content/70">No teachers.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {teachers.map((t) => (
                  <li key={`${t.id}-${t.course_id}`}>
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
    </div>
  );
}
