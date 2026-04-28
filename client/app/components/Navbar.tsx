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
    <nav className="navbar rounded-box shadow-base-300/20 shadow-sm">
      <div className="w-full md:flex md:items-center md:gap-2">
        <div className="flex items-center justify-between">
          <div className="navbar-start items-center justify-between max-md:w-full">
            <Link
              className="link text-base-content link-neutral text-xl font-bold no-underline"
              to="/"
            >
              CourseReport
            </Link>
            <div className="md:hidden">
              <button
                type="button"
                className="collapse-toggle btn btn-outline btn-secondary btn-sm btn-square"
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
            <ul className="menu md:menu-horizontal gap-2 p-0 text-base">
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

            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />
              {user ? (
                <>
                  <Link className="btn btn-ghost btn-sm" to="/profile">
                    {t("nav.profile")}
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={logout}
                  >
                    {t("nav.signOut")}
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn btn-ghost btn-sm" to="/sign-in">
                    {t("nav.signIn")}
                  </Link>
                  <Link className="btn btn-primary btn-sm" to="/sign-up">
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
