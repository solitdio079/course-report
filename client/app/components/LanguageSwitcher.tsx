import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../i18n";

const LABELS: Record<string, string> = {
  en: "EN",
  tr: "TR",
  fr: "FR",
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
      className={`join rounded-lg bg-[#111111] p-1 shadow-sm ${className}`.trim()}
      role="group"
      aria-label={t("language")}
    >
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => setLang(lng)}
          className={`join-item btn btn-xs border-0 ${
            i18n.language === lng
              ? "bg-white text-[#111111] hover:bg-white hover:text-[#111111]"
              : "bg-[#111111] text-white hover:bg-[#2b2b2b] hover:text-white"
          }`}
          aria-pressed={i18n.language === lng}
        >
          {LABELS[lng] || lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
