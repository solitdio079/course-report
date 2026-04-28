import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/contact";
import i18n from "../i18n";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.contact.title") },
    { name: "description", content: i18n.t("meta.contact.description") },
    { property: "og:title", content: i18n.t("meta.contact.title") },
  ];
}

export default function Contact() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 100);
  }

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden bg-[#fff8e6]">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <span className="badge badge-primary badge-outline mb-3">
              {t("contact.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {t("contact.heroTitle")}
            </h1>
            <p className="mt-6 text-lg text-base-content/70">{t("contact.heroText")}</p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-lg border border-[#ffe2aa] bg-white p-5 shadow-sm">
              <div className="text-sm font-bold uppercase tracking-wide text-[#c46a00]">
                {t("contact.info.email")}
              </div>
              <a className="mt-2 block text-2xl font-black text-[#102033]" href="mailto:hello@coursereport.app">
                hello@coursereport.app
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[#b8eee6] bg-white p-5 shadow-sm">
                <div className="text-sm font-bold uppercase tracking-wide text-[#075f56]">
                  {t("contact.info.phone")}
                </div>
                <a className="mt-2 block text-lg font-bold" href="tel:+905550000000">
                  +90 555 000 00 00
                </a>
              </div>
              <div className="rounded-lg border border-[#cfe2ff] bg-white p-5 shadow-sm">
                <div className="text-sm font-bold uppercase tracking-wide text-[#246bfe]">
                  {t("contact.info.hours")}
                </div>
                <div className="mt-2 text-lg font-bold">
                  {t("contact.info.hoursValue")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 grid gap-10 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <ContactCard title={t("contact.info.email")} value="hello@coursereport.app" href="mailto:hello@coursereport.app" />
          <ContactCard title={t("contact.info.phone")} value="+90 555 000 00 00" href="tel:+905550000000" />
          <ContactCard title={t("contact.info.office")} value={t("contact.info.officeValue")} />
          <ContactCard title={t("contact.info.hours")} value={t("contact.info.hoursValue")} />
        </div>

        <div className="md:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{t("contact.form.title")}</h2>
              <p className="text-sm text-base-content/70">{t("contact.form.note")}</p>

              {sent && (
                <div className="alert alert-success mt-2">
                  <span>{t("contact.form.success")}</span>
                </div>
              )}

              <form className="grid gap-4 md:grid-cols-2 mt-4" onSubmit={onSubmit}>
                <label className="form-control">
                  <div className="label">
                    <span className="label-text">{t("contact.form.name")}</span>
                  </div>
                  <input
                    className="input input-bordered"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>
                <label className="form-control">
                  <div className="label">
                    <span className="label-text">{t("contact.form.email")}</span>
                  </div>
                  <input
                    className="input input-bordered"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                <label className="form-control md:col-span-2">
                  <div className="label">
                    <span className="label-text">{t("contact.form.subject")}</span>
                  </div>
                  <input
                    className="input input-bordered"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </label>
                <label className="form-control md:col-span-2">
                  <div className="label">
                    <span className="label-text">{t("contact.form.message")}</span>
                  </div>
                  <textarea
                    className="textarea textarea-bordered min-h-32"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    required
                  />
                </label>
                <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-base-content/60">{t("contact.form.consent")}</p>
                  <button type="submit" className="btn btn-primary">
                    {t("contact.form.send")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-base-200">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold mb-6">{t("contact.where.title")}</h2>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=1600&q=80"
              alt=""
              className="w-full h-72 md:h-96 object-cover"
              loading="lazy"
            />
          </div>
          <p className="mt-4 text-sm text-base-content/70">{t("contact.where.text")}</p>
        </div>
      </section>

      <section className="bg-[#dff5f1] text-[#102033]">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-3xl font-semibold">{t("contact.cta.title")}</h2>
          <p className="mt-3 font-medium text-[#24384f]">{t("contact.cta.subtitle")}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link className="btn btn-primary btn-lg" to="/sign-up">
              {t("about.cta.parent")}
            </Link>
            <Link className="btn btn-outline btn-lg bg-white" to="/about">
              {t("nav.about")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ContactCard({ title, value, href }: { title: string; value: string; href?: string }) {
  const inner = (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="text-sm text-base-content/60">{title}</div>
        <div className="text-lg font-medium">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} className="block">{inner}</a> : inner;
}
