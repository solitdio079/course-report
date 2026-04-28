import { Link } from "react-router";
import { useState } from "react";
import { API_URL } from "../lib/auth";
import { ButtonContent } from "../components/Spinner";

export default function ResetPasswordRequest() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/auth/password-reset/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">Reset password</h1>
          <p className="text-base-content/70">
            Enter your email and we’ll generate a reset link for your account.
          </p>

          {submitted ? (
            <div className="alert alert-info mt-3">
              <span>
                If that email is registered, a reset link has been issued. Check
                the server console for the token (no email service yet).
              </span>
            </div>
          ) : (
            <form className="mt-2 space-y-4" onSubmit={onSubmit}>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Email</span>
                </div>
                <input
                  className="input input-bordered"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <button
                className="btn btn-primary w-full"
                type="submit"
                disabled={submitting}
              >
                <ButtonContent loading={submitting} loadingLabel="Submitting...">
                  Send reset link
                </ButtonContent>
              </button>
            </form>
          )}

          <div className="mt-4 text-sm flex flex-col gap-2">
            <Link className="link" to="/sign-in">
              Back to sign in
            </Link>
            <Link className="link" to="/reset-password/confirm">
              I have a token
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
