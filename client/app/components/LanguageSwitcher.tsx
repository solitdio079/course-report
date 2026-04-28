import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../i18n";

const LABELS: Record<string, string> = {
  en: "EN",
  tr: "TR",
};

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { i18n, t } = useTranslation();

  function setLang(lng: string) {
    if (i18n.language === lng) return;
    i18n.changeLanguage(lng);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("lang", lng);
        document.documentElement.lang = lng;
      } catch {
        // ignore
      }
    }
  }

  return (
    <div
      className={`join ${className}`.trim()}
      role="group"
      aria-label={t("language")}
    >
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => setLang(lng)}
          className={`join-item btn btn-xs ${
            i18n.language === lng ? "btn-primary" : "btn-ghost"
          }`}
          aria-pressed={i18n.language === lng}
        >
          {LABELS[lng] || lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
