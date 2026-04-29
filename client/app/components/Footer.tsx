import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer border-t border-[#f8760f]/20 bg-white p-10 text-[#2b1708]">
      <aside className="gap-6">
        <div className="flex items-center gap-3 text-xl font-black text-[#2b1708]">
          <img
            src="/hello-academy-logo.png"
            alt="Hello Academy"
            className="h-10 w-28 object-contain object-right"
          />
          <span>Hello Academy</span>
        </div>
        <p className="max-w-xs text-sm text-[#6d5a4a]">{t("footer.tagline")}</p>
      </aside>

      <nav className="text-[#2b1708]">
        <h6 className="footer-title">{t("nav.teacher")}</h6>
        <Link to="/teacher/sign-in" className="link link-hover">
          {t("nav.signIn")}
        </Link>
        <Link to="/teacher" className="link link-hover">
          {t("nav.teacherDashboard")}
        </Link>
      </nav>

      <nav className="text-[#2b1708]">
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

      <nav className="text-[#2b1708]">
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
