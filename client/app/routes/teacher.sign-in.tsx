import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { API_URL } from "../lib/auth";

export default function TeacherSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/auth/teacher/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Unable to sign in");
        return;
      }

      navigate("/teacher");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="hidden lg:block">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h1 className="text-3xl font-semibold">Teacher Portal</h1>
                <p className="text-base-content/70">
                  Sign in to manage courses, track student progress, and generate
                  reports.
                </p>

                <div className="mt-6 overflow-hidden rounded-xl border border-base-300">
                  <img
                    alt="Students studying with notebooks"
                    className="h-64 w-full object-cover"
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
                  />
                </div>

                <div className="mt-4 text-sm text-base-content/60">
                  Use your teacher account email and password.
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl">Sign in</h2>

                {error && (
                  <div className="alert alert-error">
                    <span>{error}</span>
                  </div>
                )}

                <form className="mt-2 space-y-4" onSubmit={onSubmit}>
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text">Email</span>
                    </div>
                    <input
                      className="input input-bordered w-full"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </label>

                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text">Password</span>
                    </div>
                    <input
                      className="input input-bordered w-full"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </label>

                  <button
                    className="btn btn-primary w-full"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Signing in..." : "Sign in"}
                  </button>
                </form>

                <div className="mt-4 text-sm text-base-content/70">
                  Don’t have a teacher account?{" "}
                  <Link className="link link-primary" to="/teacher/sign-up">
                    Create one
                  </Link>
                </div>

                <div className="mt-2 text-sm">
                  <Link className="link" to="/">
                    Back to home
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 lg:hidden">
              <div className="overflow-hidden rounded-xl border border-base-300">
                <img
                  alt="Students studying with notebooks"
                  className="h-52 w-full object-cover"
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
