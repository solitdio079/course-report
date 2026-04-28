import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export default function TeacherSignUp() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-base-200">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="text-3xl font-semibold">
              {t("teacherAuth.signUp.title")}
            </h1>
            <p className="text-base-content/70 mt-2">
              {t("teacherAuth.signUp.text")}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="btn btn-primary" to="/teacher/sign-in">
                {t("nav.teacherSignIn")}
              </Link>
              <Link className="btn btn-outline" to="/sign-up">
                {t("nav.signUp")}
              </Link>
            </div>

            <div className="mt-2 text-sm">
              <Link className="link" to="/">
                {t("common.backHome")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
