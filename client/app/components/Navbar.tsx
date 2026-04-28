import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type User = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      }).catch(() => null);

      if (!res || !res.ok) {
        if (!cancelled) setUser(null);
        return;
      }

      const data = await res.json().catch(() => null);
      if (!cancelled) setUser(data?.user ?? null);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (typeof window === "undefined") return;

    const collection = (window as any).$hsDropdownCollection;
    if (!collection) {
      console.warn("FlyonUI dropdown collection not found; using fallback toggle.");
    }
  }, []);

  async function logout() {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => null);

    setUser(null);
    navigate("/teacher/sign-in");
  }

  return (
    <nav className="navbar sticky top-0 z-40 px-4">
      <div className="mx-auto w-full max-w-7xl md:flex md:items-center md:gap-4">
        <div className="flex items-center justify-between">
          <div className="navbar-start items-center justify-between max-md:w-full">
            <Link
              className="flex items-center gap-2 text-base-content no-underline"
              to="/"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0f9f8f] text-sm font-black text-white">
                CR
              </span>
              <span className="text-lg font-black tracking-tight text-[#102033]">
                Course Report
              </span>
            </Link>
            <div className="flex items-center gap-2 md:hidden">
              <LanguageSwitcher />
              <button
                type="button"
                className="collapse-toggle btn btn-outline btn-sm btn-square"
                data-collapse="#navbar-collapse"
                aria-controls="navbar-collapse"
                aria-label="Toggle navigation"
              >
                <span className="icon-[tabler--menu-2] collapse-open:hidden size-4"></span>
                <span className="icon-[tabler--x] collapse-open:block hidden size-4"></span>
              </button>
            </div>
          </div>
        </div>
        <div
          id="navbar-collapse"
          className="md:navbar-end collapse hidden grow basis-full max-md:overflow-hidden md:overflow-visible transition-[height] duration-300 max-md:w-full"
        >
          <div className="flex flex-col gap-2 max-md:mt-2 md:flex-row md:items-center md:justify-end">
            <ul className="menu md:menu-horizontal gap-1 p-0 text-sm font-bold">
              <li>
                <NavLink to="/" end>
                  {t("nav.home")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/about">{t("nav.about")}</NavLink>
              </li>
              <li>
                <NavLink to="/contact">{t("nav.contact")}</NavLink>
              </li>

              {user?.role === "parent" && (
                <li>
                  <NavLink to="/parent">{t("nav.parent")}</NavLink>
                </li>
              )}
              {user?.role === "teacher" && (
                <li>
                  <NavLink to="/teacher">{t("nav.teacher")}</NavLink>
                </li>
              )}
              {user?.role === "admin" && (
                <li>
                  <NavLink to="/admin">{t("nav.admin")}</NavLink>
                </li>
              )}
              {(user?.role === "accountant" || user?.role === "admin") && (
                <li>
                  <NavLink to="/accountant">{t("nav.accounting")}</NavLink>
                </li>
              )}
              {(user?.role === "social_relations" ||
                user?.role === "admin") && (
                <li>
                  <NavLink to="/social">{t("nav.social")}</NavLink>
                </li>
              )}
              {user && (
                <li>
                  <NavLink to="/inbox">{t("nav.inbox")}</NavLink>
                </li>
              )}
              {user && (
                <li>
                  <NavLink to="/notifications">
                    {t("nav.notifications")}
                  </NavLink>
                </li>
              )}

            </ul>

            <div className="grid gap-2 border-t border-[#d8e0ea] pt-3 md:hidden">
              {user ? (
                <>
                  <Link className="btn btn-outline btn-sm rounded-lg" to="/profile">
                    {t("nav.profile")}
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm rounded-lg"
                    onClick={logout}
                  >
                    {t("nav.signOut")}
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn btn-outline btn-sm rounded-lg" to="/sign-in">
                    {t("nav.signIn")}
                  </Link>
                  <Link className="btn btn-primary btn-sm rounded-lg" to="/sign-up">
                    {t("nav.signUp")}
                  </Link>
                </>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />
              {user ? (
                <>
                  <Link className="btn btn-ghost btn-sm rounded-lg" to="/profile">
                    {t("nav.profile")}
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm rounded-lg"
                    onClick={logout}
                  >
                    {t("nav.signOut")}
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn btn-ghost btn-sm rounded-lg" to="/sign-in">
                    {t("nav.signIn")}
                  </Link>
                  <Link className="btn btn-primary btn-sm rounded-lg" to="/sign-up">
                    {t("nav.signUp")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
