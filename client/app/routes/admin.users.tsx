import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL, fetchMe } from "../lib/auth";
import { ButtonContent, PageLoader } from "../components/Spinner";

type User = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
};

const ROLES = [
  "admin",
  "teacher",
  "social_relations",
  "accountant",
  "parent",
] as const;

const STAFF_ROLES = [
  "teacher",
  "accountant",
  "social_relations",
  "admin",
] as const;

export default function AdminUsers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  // Create-user form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<(typeof STAFF_ROLES)[number]>(
    "teacher"
  );
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createMessage, setCreateMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) return navigate("/sign-in");
      if (me.role !== "admin") return navigate("/");
      await load();
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function load() {
    const res = await fetch(`${API_URL}/admin/users`, {
      credentials: "include",
    });
    if (res.ok) setUsers((await res.json()).users || []);
  }

  async function setRole(id: number, role: string) {
    await fetch(`${API_URL}/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });
    await load();
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateMessage(null);
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCreateError(
          data?.errors?.[0]?.msg || data?.message || t("adminUsers.create.error")
        );
        return;
      }
      setCreateMessage(t("adminUsers.create.success", { name: data.user.full_name, role: data.user.role }));
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("teacher");
      await load();
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PageLoader label={t("common.loading")} />
      </div>
    );
  }

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-4">
      <div className="flex items-center justify-between">
        <Link className="link" to="/admin">
          ← {t("common.back")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("adminUsers.title")}</h1>
        <input
          className="input input-bordered input-sm"
          type="search"
          placeholder={t("common.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">{t("adminUsers.create.title")}</h2>
          <p className="text-sm text-base-content/70">{t("adminUsers.create.note")}</p>

          {createError && (
            <div className="alert alert-error mt-2">
              <span>{createError}</span>
            </div>
          )}
          {createMessage && (
            <div className="alert alert-success mt-2">
              <span>{createMessage}</span>
            </div>
          )}

          <form
            className="grid gap-3 md:grid-cols-4 mt-2"
            onSubmit={createUser}
          >
            <input
              className="input input-bordered md:col-span-2"
              placeholder={t("common.fullName")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <input
              className="input input-bordered md:col-span-2"
              type="email"
              placeholder={t("common.email")}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <input
              className="input input-bordered md:col-span-2"
              type="password"
              placeholder={t("adminUsers.create.password")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
            <select
              className="select select-bordered"
              value={newRole}
              onChange={(e) =>
                setNewRole(e.target.value as (typeof STAFF_ROLES)[number])
              }
            >
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
            >
              <ButtonContent loading={creating} loadingLabel={t("common.creating")}>
                {t("adminUsers.create.submit")}
              </ButtonContent>
            </button>
          </form>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("adminUsers.col.name")}</th>
                  <th>{t("adminUsers.col.email")}</th>
                  <th>{t("adminUsers.col.role")}</th>
                  <th>{t("adminUsers.col.created")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name}</td>
                    <td className="text-sm text-base-content/70">{u.email}</td>
                    <td>
                      <select
                        className="select select-bordered select-xs"
                        value={u.role}
                        onChange={(e) => setRole(u.id, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-sm text-base-content/70">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
