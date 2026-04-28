import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/home";
import i18n from "../i18n";

export function meta({}: Route.MetaArgs) {
  // SSR uses default lang; client may swap on hydration via useTranslation
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

export default function Home() {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-base-200">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 grid gap-10 md:grid-cols-2 items-center">
          <div className="text-center md:text-left">
            <span className="badge badge-primary badge-outline mb-4">
              {t("home.heroBadge")}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              {t("home.heroTitle.before")}
              <span className="text-primary">
                {t("home.heroTitle.highlight")}
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-base-content/70 max-w-xl mx-auto md:mx-0">
              {t("home.heroSubtitle")}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link className="btn btn-primary btn-lg" to="/sign-up">
                {t("home.cta.signUp")}
              </Link>
              <Link className="btn btn-outline btn-lg" to="/sign-in">
                {t("home.cta.signIn")}
              </Link>
            </div>
            <p className="mt-3 text-sm text-base-content/60">
              {t("home.cta.teacher.before")}
              <Link className="link" to="/teacher/sign-in">
                {t("home.cta.teacher.link")}
              </Link>
              .
            </p>
          </div>

          <div className="relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-primary/20 blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-secondary/20 blur-2xl" />
            <div className="grid grid-cols-5 grid-rows-5 gap-3 relative">
              <img
                src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80"
                alt="Children reading together"
                className="col-span-3 row-span-3 rounded-2xl shadow-xl object-cover w-full h-full"
                loading="eager"
              />
              <img
                src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=600&q=80"
                alt="Teacher reviewing notes"
                className="col-span-2 row-span-2 rounded-2xl shadow-xl object-cover w-full h-full"
                loading="lazy"
              />
              <img
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80"
                alt="Notebook and learning materials"
                className="col-span-2 row-span-3 rounded-2xl shadow-xl object-cover w-full h-full"
                loading="lazy"
              />
              <img
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80"
                alt="Books on a desk"
                className="col-span-3 row-span-2 rounded-2xl shadow-xl object-cover w-full h-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-base-100 border-y border-base-300">
        <div className="mx-auto max-w-6xl px-4 py-10 grid gap-6 grid-cols-2 md:grid-cols-4 text-center">
          <Stat value="5+" label={t("home.stat.roles")} />
          <Stat value="∞" label={t("home.stat.students")} />
          <Stat value="PDF" label={t("home.stat.pdf")} />
          <Stat value="EN/TR" label={t("home.stat.bilingual")} />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold">{t("home.features.title")}</h2>
          <p className="mt-2 text-base-content/70">
            {t("home.features.subtitle")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Feature
            title={t("home.feature.students.title")}
            text={t("home.feature.students.text")}
          />
          <Feature
            title={t("home.feature.evaluations.title")}
            text={t("home.feature.evaluations.text")}
          />
          <Feature
            title={t("home.feature.inbox.title")}
            text={t("home.feature.inbox.text")}
          />
          <Feature
            title={t("home.feature.payments.title")}
            text={t("home.feature.payments.text")}
          />
          <Feature
            title={t("home.feature.roles.title")}
            text={t("home.feature.roles.text")}
          />
          <Feature
            title={t("home.feature.pdf.title")}
            text={t("home.feature.pdf.text")}
          />
        </div>
      </section>

      {/* Showcase */}
      <section className="bg-base-200">
        <div className="mx-auto max-w-6xl px-4 py-16 grid gap-10 md:grid-cols-2 items-center">
          <img
            src="https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1200&q=80"
            alt="Parent and child reviewing a school report"
            className="rounded-2xl shadow-xl object-cover w-full h-full max-h-[420px]"
            loading="lazy"
          />
          <div>
            <h2 className="text-3xl font-semibold">
              {t("home.showcase.title")}
            </h2>
            <p className="mt-4 text-base-content/70">{t("home.showcase.text")}</p>
            <ul className="mt-6 space-y-3 text-base-content/80">
              <li className="flex items-start gap-2">
                <span className="badge badge-primary badge-sm mt-1">1</span>
                <span>{t("home.showcase.step1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="badge badge-primary badge-sm mt-1">2</span>
                <span>{t("home.showcase.step2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="badge badge-primary badge-sm mt-1">3</span>
                <span>{t("home.showcase.step3")}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-content">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-3xl font-semibold">
            {t("home.bottomCta.title")}
          </h2>
          <p className="mt-3 opacity-90">{t("home.bottomCta.subtitle")}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link className="btn btn-secondary btn-lg" to="/sign-up">
              {t("home.bottomCta.signUp")}
            </Link>
            <Link
              className="btn btn-ghost btn-lg text-primary-content"
              to="/sign-in"
            >
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
    <div>
      <div className="text-3xl md:text-4xl font-bold text-primary">{value}</div>
      <div className="text-sm text-base-content/70 mt-1">{label}</div>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        <p className="text-sm text-base-content/70">{text}</p>
      </div>
    </div>
  );
}
