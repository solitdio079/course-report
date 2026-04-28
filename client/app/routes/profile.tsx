import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { API_URL, type AuthUser, fetchMe } from "../lib/auth";
import { ButtonContent, PageLoader } from "../components/Spinner";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) {
        navigate("/sign-in");
        return;
      }
      setUser(me);
      setFullName(me.fullName);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const body: Record<string, string> = { fullName };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Update failed");
        return;
      }
      setUser(data.user);
      setMessage("Profile updated");
      setCurrentPassword("");
      setNewPassword("");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <PageLoader label="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">Profile</h1>
          <p className="text-base-content/70">
            Signed in as {user?.email} ({user?.role})
          </p>

          {message && (
            <div className="alert alert-success mt-2">
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="alert alert-error mt-2">
              <span>{error}</span>
            </div>
          )}

          <form className="mt-2 space-y-4" onSubmit={onSubmit}>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Full name</span>
              </div>
              <input
                className="input input-bordered"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </label>

            <div className="divider">Change password</div>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Current password</span>
              </div>
              <input
                className="input input-bordered"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">New password</span>
                <span className="label-text-alt">Min 8 chars</span>
              </div>
              <input
                className="input input-bordered"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
              />
            </label>

            <button
              className="btn btn-primary w-full"
              type="submit"
              disabled={submitting}
            >
              <ButtonContent loading={submitting} loadingLabel="Saving...">
                Save changes
              </ButtonContent>
            </button>
          </form>

          <div className="mt-4 text-sm">
            <Link className="link" to="/">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
