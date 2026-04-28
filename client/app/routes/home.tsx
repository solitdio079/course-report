import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/home";
import i18n from "../i18n";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.home.title") },
    { name: "description", content: i18n.t("meta.home.description") },
    {
      name: "keywords",
      content:
        "course report, school management, student progress, parent portal, tutor platform, evaluations, education software, kurs raporu, okul yönetimi",
    },
    { property: "og:title", content: i18n.t("meta.home.title") },
    { property: "og:description", content: i18n.t("meta.home.description") },
    { property: "og:type", content: "website" },
  ];
}

const featureTiles = [
  { key: "students", icon: "St", color: "#246bfe" },
  { key: "evaluations", icon: "Ev", color: "#6d5dfc" },
  { key: "inbox", icon: "In", color: "#0f9f8f" },
  { key: "payments", icon: "Py", color: "#c46a00" },
  { key: "roles", icon: "Rl", color: "#d94330" },
  { key: "pdf", icon: "Pdf", color: "#102033" },
] as const;

export default function Home() {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen bg-[#f5f5f3]">
      <section
        className="relative min-h-[680px] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(244,247,251,0.96), rgba(244,247,251,0.84), rgba(244,247,251,0.42)), url(https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=82)",
        }}
      >
        <div className="mx-auto flex min-h-[680px] max-w-7xl items-center px-4 py-20">
          <div className="max-w-2xl text-[#102033]">
            <div className="mb-5 inline-flex rounded-lg bg-[#dff5f1] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#075f56]">
              {t("home.heroBadge")}
            </div>
            <h1 className="max-w-2xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
              {t("home.heroTitle.before")}
              <span className="text-[#075f56]">{t("home.heroTitle.highlight")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#24384f] md:text-xl">
              {t("home.heroSubtitle")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn btn-primary btn-lg rounded-lg" to="/sign-up">
                {t("home.cta.signUp")}
              </Link>
              <Link
                className="btn btn-outline btn-lg rounded-lg bg-white"
                to="/sign-in"
              >
                {t("home.cta.signIn")}
              </Link>
            </div>
            <p className="mt-4 text-sm font-medium text-[#24384f]">
              {t("home.cta.teacher.before")}
              <Link className="font-semibold underline" to="/teacher/sign-in">
                {t("home.cta.teacher.link")}
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#cfe2ff] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-[#cfe2ff] px-4 md:grid-cols-4">
          <Stat value="5+" label={t("home.stat.roles")} />
          <Stat value="∞" label={t("home.stat.students")} />
          <Stat value="PDF" label={t("home.stat.pdf")} />
          <Stat value="EN/TR" label={t("home.stat.bilingual")} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-wide text-[#1473e6]">
            {t("home.features.title")}
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            {t("home.features.subtitle")}
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {featureTiles.map((tile) => (
            <FeatureTile
              key={tile.key}
              icon={tile.icon}
              color={tile.color}
              title={t(`home.feature.${tile.key}.title`)}
              text={t(`home.feature.${tile.key}.text`)}
            />
          ))}
        </div>
      </section>

      <section className="bg-[#e7f5f2] text-[#102033]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-20">
          <div>
            <h2 className="text-4xl font-black tracking-tight">
              {t("home.showcase.title")}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#24384f]">
              {t("home.showcase.text")}
            </p>
            <div className="mt-8 grid gap-3">
              <WorkflowStep number="1" text={t("home.showcase.step1")} />
              <WorkflowStep number="2" text={t("home.showcase.step2")} />
              <WorkflowStep number="3" text={t("home.showcase.step3")} />
            </div>
          </div>
          <div className="creative-tile bg-white p-4 text-[#102033]">
            <img
              src="https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1200&q=82"
              alt="Parent and child reviewing a school report"
              className="h-72 w-full rounded-lg object-cover"
              loading="lazy"
            />
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <MiniMetric value="PDF" label={t("home.stat.pdf")} />
              <MiniMetric value="5" label={t("home.stat.roles")} />
              <MiniMetric value="TR" label={t("language")} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#ffdc5c]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-4xl font-black tracking-tight">
              {t("home.bottomCta.title")}
            </h2>
            <p className="mt-2 max-w-2xl font-medium text-[#24384f]">
              {t("home.bottomCta.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-primary btn-lg rounded-lg" to="/sign-up">
              {t("home.bottomCta.signUp")}
            </Link>
            <Link className="btn btn-outline btn-lg rounded-lg bg-white" to="/sign-in">
              {t("home.cta.signIn")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white px-4 py-8 text-center">
      <div className="text-4xl font-black tracking-tight text-[#102033]">{value}</div>
      <div className="mt-1 text-sm font-bold text-[#536273]">{label}</div>
    </div>
  );
}

function FeatureTile({
  icon,
  color,
  title,
  text,
}: {
  icon: string;
  color: string;
  title: string;
  text: string;
}) {
  return (
    <article className="creative-tile p-5 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="creative-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight">{title}</h3>
      <p className="mt-3 text-sm font-medium leading-6 text-[#536273]">{text}</p>
    </article>
  );
}

function WorkflowStep({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-[#0f9f8f]/20 bg-white p-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#0f9f8f] text-sm font-black text-white">
        {number}
      </span>
      <span className="font-medium text-[#24384f]">{text}</span>
    </div>
  );
}

function MiniMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-[#f5f5f3] p-3">
      <div className="font-black">{value}</div>
      <div className="mt-1 text-xs font-bold text-[#536273]">{label}</div>
    </div>
  );
}
