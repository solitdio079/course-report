import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { API_URL, fetchMe } from "../lib/auth";
import {
  ButtonContent,
  PageLoader,
  SectionLoader,
} from "../components/Spinner";

type Course = { id: number; name: string; description: string | null };
type CourseDetail = Course & {
  teachers: { id: number; full_name: string; email: string }[];
  students: {
    id: number;
    first_name: string;
    last_name: string;
    course_email: string | null;
  }[];
};
type Teacher = { id: number; full_name: string; email: string };
type StudentRow = {
  id: number;
  first_name: string;
  last_name: string;
  course_email: string | null;
};

export default function AdminCourses() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<CourseDetail | null>(null);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [assignTeacherId, setAssignTeacherId] = useState<string>("");
  const [enrollStudentId, setEnrollStudentId] = useState<string>("");

  const [creating, setCreating] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/sign-in");
      if (me.role !== "admin") return navigate("/");
      await Promise.all([loadCourses(), loadTeachers(), loadStudents()]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (selectedId == null) {
      setDetail(null);
      return;
    }
    (async () => {
      setDetailLoading(true);
      try {
        const res = await fetch(`${API_URL}/courses/${selectedId}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setDetail(data.course);
      } finally {
        setDetailLoading(false);
      }
    })();
  }, [selectedId]);

  async function loadCourses() {
    const res = await fetch(`${API_URL}/courses`, { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    setCourses(data.courses || []);
  }

  async function loadTeachers() {
    const res = await fetch(`${API_URL}/courses/teachers`, {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json();
    setTeachers(data.teachers || []);
  }

  async function loadStudents() {
    const res = await fetch(`${API_URL}/courses/students`, {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json();
    setStudents(data.students || []);
  }

  async function reloadDetail() {
    if (selectedId == null) return;
    const res = await fetch(`${API_URL}/courses/${selectedId}`, {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json();
    setDetail(data.course);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.errors?.[0]?.msg || data?.message || "Create failed");
        return;
      }
      setNewName("");
      setNewDesc("");
      await loadCourses();
    } finally {
      setCreating(false);
    }
  }

  async function onAssignTeacher() {
    if (selectedId == null || !assignTeacherId) return;
    setAssigning(true);
    try {
      await fetch(
        `${API_URL}/courses/${selectedId}/teachers/${assignTeacherId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      setAssignTeacherId("");
      await reloadDetail();
    } finally {
      setAssigning(false);
    }
  }

  async function onRemoveTeacher(userId: number) {
    if (selectedId == null) return;
    await fetch(`${API_URL}/courses/${selectedId}/teachers/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    await reloadDetail();
  }

  async function onEnrollStudent() {
    if (selectedId == null || !enrollStudentId) return;
    setEnrolling(true);
    try {
      await fetch(
        `${API_URL}/courses/${selectedId}/students/${enrollStudentId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      setEnrollStudentId("");
      await reloadDetail();
    } finally {
      setEnrolling(false);
    }
  }

  async function onUnenrollStudent(studentId: number) {
    if (selectedId == null) return;
    await fetch(`${API_URL}/courses/${selectedId}/students/${studentId}`, {
      method: "DELETE",
      credentials: "include",
    });
    await reloadDetail();
  }

  async function onDeleteCourse(id: number) {
    if (!confirm("Delete this course?")) return;
    await fetch(`${API_URL}/courses/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (selectedId === id) setSelectedId(null);
    await loadCourses();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageLoader label="Loading admin..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1 space-y-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Courses</h2>
            {courses.length === 0 ? (
              <p className="text-base-content/70 text-sm">No courses yet.</p>
            ) : (
              <ul className="divide-y divide-base-300">
                {courses.map((c) => (
                  <li
                    key={c.id}
                    className={`py-2 flex items-center justify-between gap-2`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`text-left flex-1 ${
                        selectedId === c.id ? "font-semibold" : ""
                      }`}
                    >
                      {c.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCourse(c.id)}
                      className="btn btn-ghost btn-xs"
                      aria-label="Delete"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">New course</h2>
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}
            <form className="space-y-3" onSubmit={onCreate}>
              <input
                className="input input-bordered w-full"
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <button
                className="btn btn-primary w-full"
                type="submit"
                disabled={creating}
              >
                <ButtonContent loading={creating} loadingLabel="Creating...">
                  Create
                </ButtonContent>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        {detailLoading ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <SectionLoader label="Loading course..." />
            </div>
          </div>
        ) : !detail ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <p className="text-base-content/70">
                Select a course to manage teachers and enrollment.
              </p>
            </div>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body space-y-4">
              <div>
                <h1 className="card-title text-2xl">{detail.name}</h1>
                {detail.description && (
                  <p className="text-base-content/70">{detail.description}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold">Teachers</h3>
                <div className="flex gap-2 mt-2">
                  <select
                    className="select select-bordered flex-1"
                    value={assignTeacherId}
                    onChange={(e) => setAssignTeacherId(e.target.value)}
                  >
                    <option value="">Add teacher...</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} ({t.email})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onAssignTeacher}
                    disabled={!assignTeacherId || assigning}
                  >
                    <ButtonContent loading={assigning} loadingLabel="Assigning...">
                      Assign
                    </ButtonContent>
                  </button>
                </div>
                <ul className="mt-2 divide-y divide-base-300">
                  {detail.teachers.map((t) => (
                    <li
                      key={t.id}
                      className="py-2 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{t.full_name}</div>
                        <div className="text-sm text-base-content/70">
                          {t.email}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => onRemoveTeacher(t.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">Enrolled students</h3>
                <div className="flex gap-2 mt-2">
                  <select
                    className="select select-bordered flex-1"
                    value={enrollStudentId}
                    onChange={(e) => setEnrollStudentId(e.target.value)}
                  >
                    <option value="">Enroll student...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.last_name}, {s.first_name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onEnrollStudent}
                    disabled={!enrollStudentId || enrolling}
                  >
                    <ButtonContent loading={enrolling} loadingLabel="Enrolling...">
                      Enroll
                    </ButtonContent>
                  </button>
                </div>
                <ul className="mt-2 divide-y divide-base-300">
                  {detail.students.map((s) => (
                    <li
                      key={s.id}
                      className="py-2 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">
                          {s.first_name} {s.last_name}
                        </div>
                        {s.course_email && (
                          <div className="text-sm text-base-content/70">
                            {s.course_email}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => onUnenrollStudent(s.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
