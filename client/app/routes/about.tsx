import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/about";
import i18n from "../i18n";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.about.title") },
    { name: "description", content: i18n.t("meta.about.description") },
    { property: "og:title", content: i18n.t("meta.about.title") },
  ];
}

export default function About() {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-base-200">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <span className="badge badge-primary badge-outline mb-3">
              {t("about.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {t("about.heroTitle")}
            </h1>
            <p className="mt-6 text-lg text-base-content/70">{t("about.heroText")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn btn-primary" to="/sign-up">
                {t("about.cta.parent")}
              </Link>
              <Link className="btn btn-outline" to="/contact">
                {t("about.cta.contact")}
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary/20 blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80"
              alt=""
              className="relative rounded-2xl shadow-xl object-cover w-full max-h-[480px]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 grid gap-10 md:grid-cols-2 items-center">
        <img
          src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1200&q=80"
          alt=""
          className="rounded-2xl shadow-xl object-cover w-full max-h-[420px] order-2 md:order-1"
        />
        <div className="order-1 md:order-2">
          <h2 className="text-3xl font-semibold">{t("about.mission.title")}</h2>
          <p className="mt-4 text-base-content/70">{t("about.mission.text")}</p>
          <ul className="mt-6 space-y-3 text-base-content/80">
            <li className="flex gap-2">
              <span className="badge badge-primary badge-sm mt-1">•</span>
              <span>
                <b>{t("about.mission.b1.bold")}</b> — {t("about.mission.b1.text")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="badge badge-primary badge-sm mt-1">•</span>
              <span>
                <b>{t("about.mission.b2.bold")}</b> — {t("about.mission.b2.text")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="badge badge-primary badge-sm mt-1">•</span>
              <span>
                <b>{t("about.mission.b3.bold")}</b> — {t("about.mission.b3.text")}
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="bg-base-200">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold">{t("about.values.title")}</h2>
            <p className="mt-2 text-base-content/70">{t("about.values.subtitle")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Value
              title={t("about.value1.title")}
              text={t("about.value1.text")}
              img="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80"
            />
            <Value
              title={t("about.value2.title")}
              text={t("about.value2.text")}
              img="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
            />
            <Value
              title={t("about.value3.title")}
              text={t("about.value3.text")}
              img="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold">{t("about.team.title")}</h2>
          <p className="mt-2 text-base-content/70">{t("about.team.subtitle")}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <TeamCard
            name="Aylin Kaya"
            role={t("about.team.aylin")}
            img="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
          />
          <TeamCard
            name="Mehmet Yıldız"
            role={t("about.team.mehmet")}
            img="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80"
          />
          <TeamCard
            name="Lara Demir"
            role={t("about.team.lara")}
            img="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
          />
        </div>
      </section>

      <section className="bg-primary text-primary-content">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-3xl font-semibold">{t("about.cta2.title")}</h2>
          <p className="mt-3 opacity-90">{t("about.cta2.subtitle")}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link className="btn btn-secondary btn-lg" to="/contact">
              {t("about.cta2.contact")}
            </Link>
            <Link
              className="btn btn-ghost btn-lg text-primary-content"
              to="/sign-up"
            >
              {t("about.cta.parent")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Value({
  title,
  text,
  img,
}: {
  title: string;
  text: string;
  img: string;
}) {
  return (
    <div className="card bg-base-100 shadow overflow-hidden">
      <figure>
        <img src={img} alt="" className="h-48 w-full object-cover" loading="lazy" />
      </figure>
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        <p className="text-sm text-base-content/70">{text}</p>
      </div>
    </div>
  );
}

function TeamCard({
  name,
  role,
  img,
}: {
  name: string;
  role: string;
  img: string;
}) {
  return (
    <div className="card bg-base-100 shadow text-center">
      <div className="card-body items-center">
        <div className="avatar">
          <div className="w-28 rounded-full ring ring-primary/30 ring-offset-base-100 ring-offset-2 overflow-hidden">
            <img src={img} alt={name} loading="lazy" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mt-3">{name}</h3>
        <p className="text-sm text-base-content/70">{role}</p>
      </div>
    </div>
  );
}
