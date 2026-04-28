import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL } from "../lib/auth";
import { ButtonContent } from "../components/Spinner";

export default function SignUp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName,
          email,
          password,
          phoneNumber,
          address,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data?.errors?.[0]?.msg ||
            data?.message ||
            t("auth.error.signUp")
        );
        return;
      }
      navigate("/parent");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">{t("auth.signUp.title")}</h1>
          <p className="text-base-content/70">{t("auth.signUp.subtitle")}</p>

          {error && (
            <div className="alert alert-error mt-2">
              <span>{error}</span>
            </div>
          )}

          <form className="mt-2 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <label className="form-control md:col-span-2">
              <div className="label">
                <span className="label-text">{t("common.fullName")}</span>
              </div>
              <input
                className="input input-bordered"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">{t("common.email")}</span>
              </div>
              <input
                className="input input-bordered"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">{t("common.password")}</span>
                <span className="label-text-alt">{t("common.minChars", { n: 8 })}</span>
              </div>
              <input
                className="input input-bordered"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">{t("common.phone")}</span>
              </div>
              <input
                className="input input-bordered"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoComplete="tel"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">{t("common.address")}</span>
              </div>
              <input
                className="input input-bordered"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
              />
            </label>

            <button
              className="btn btn-primary md:col-span-2"
              type="submit"
              disabled={submitting}
            >
              <ButtonContent
                loading={submitting}
                loadingLabel={t("common.creating")}
              >
                {t("auth.signUp.submit")}
              </ButtonContent>
            </button>
          </form>

          <div className="mt-4 text-sm">
            {t("auth.signUp.haveAccount")}{" "}
            <Link className="link link-primary" to="/sign-in">
              {t("auth.signUp.signIn")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
