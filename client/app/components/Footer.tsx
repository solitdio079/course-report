import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer border-t border-[#102033]/10 bg-white p-10 text-[#102033]">
      <aside className="gap-6">
        <div className="flex items-center gap-2 text-xl font-black text-[#102033]">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0f9f8f] text-sm text-white">
            CR
          </span>
          <span>CourseReport</span>
        </div>
        <p className="max-w-xs text-sm text-[#536273]">{t("footer.tagline")}</p>
      </aside>

      <nav className="text-[#102033]">
        <h6 className="footer-title">{t("nav.teacher")}</h6>
        <Link to="/teacher/sign-in" className="link link-hover">
          {t("nav.signIn")}
        </Link>
        <Link to="/teacher" className="link link-hover">
          {t("nav.teacherDashboard")}
        </Link>
      </nav>

      <nav className="text-[#102033]">
        <h6 className="footer-title">{t("footer.platform")}</h6>
        <Link to="/" className="link link-hover">
          {t("nav.home")}
        </Link>
        <Link to="/about" className="link link-hover">
          {t("nav.about")}
        </Link>
        <Link to="/contact" className="link link-hover">
          {t("nav.contact")}
        </Link>
      </nav>

      <nav className="text-[#102033]">
        <h6 className="footer-title">{t("footer.legal")}</h6>
        <a href="#" className="link link-hover">
          {t("footer.terms")}
        </a>
        <a href="#" className="link link-hover">
          {t("footer.privacy")}
        </a>
        <a href="#" className="link link-hover">
          {t("footer.cookies")}
        </a>
      </nav>
    </footer>
  );
}
