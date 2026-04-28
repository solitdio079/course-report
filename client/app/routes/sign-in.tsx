import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL, dashboardPathForRole } from "../lib/auth";
import { ButtonContent } from "../components/Spinner";

export default function SignIn() {
  const { t } = useTranslation();
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
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || t("auth.error.signIn"));
        return;
      }
      navigate(dashboardPathForRole(data.user?.role));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">{t("auth.signIn.title")}</h1>
          <p className="text-base-content/70">{t("auth.signIn.subtitle")}</p>

          {error && (
            <div className="alert alert-error mt-2">
              <span>{error}</span>
            </div>
          )}

          <form className="mt-2 space-y-4" onSubmit={onSubmit}>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">{t("common.email")}</span>
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
                <span className="label-text">{t("common.password")}</span>
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
              <ButtonContent
                loading={submitting}
                loadingLabel={t("auth.signIn.signingIn")}
              >
                {t("auth.signIn.submit")}
              </ButtonContent>
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-2 text-sm">
            <div>
              {t("auth.signIn.noAccount")}{" "}
              <Link className="link link-primary" to="/sign-up">
                {t("auth.signIn.create")}
              </Link>
            </div>
            <div>
              {t("auth.signIn.forgot")}{" "}
              <Link className="link" to="/reset-password">
                {t("reset.submit")}
              </Link>
            </div>
            <div>
              {t("home.cta.teacher.before")}
              <Link className="link" to="/teacher/sign-in">
                {t("nav.teacherSignIn")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
