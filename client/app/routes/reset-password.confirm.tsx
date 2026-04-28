import { Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { API_URL } from "../lib/auth";
import { ButtonContent } from "../components/Spinner";

export default function ResetPasswordConfirm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = params.get("token");
    if (t) setToken(t);
  }, [params]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/password-reset/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Reset failed");
        return;
      }
      navigate("/sign-in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">Set a new password</h1>

          {error && (
            <div className="alert alert-error mt-2">
              <span>{error}</span>
            </div>
          )}

          <form className="mt-2 space-y-4" onSubmit={onSubmit}>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Reset token</span>
              </div>
              <input
                className="input input-bordered"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
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
                minLength={8}
                required
              />
            </label>

            <button
              className="btn btn-primary w-full"
              type="submit"
              disabled={submitting}
            >
              <ButtonContent loading={submitting} loadingLabel="Updating...">
                Update password
              </ButtonContent>
            </button>
          </form>

          <div className="mt-4 text-sm">
            <Link className="link" to="/sign-in">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
