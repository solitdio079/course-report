import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL, fetchMe } from "../lib/auth";
import { ButtonContent, PageLoader } from "../components/Spinner";

type User = {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  created_at: string;
};

type Role = "admin" | "teacher" | "social_relations" | "accountant" | "parent";

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

const roleStyles: Record<Role, string> = {
  admin: "border-[#7857ff] bg-[#f7f4ff] text-[#3f278f]",
  teacher: "border-[#f8760f] bg-[#fff0dd] text-[#7d3300]",
  accountant: "border-[#2478ff] bg-[#eef6ff] text-[#174ea6]",
  social_relations: "border-[#00a88f] bg-[#e8fff9] text-[#007c68]",
  parent: "border-[#ff6b57] bg-[#fff4f1] text-[#8f2518]",
};

function roleLabel(role: Role) {
  return role.replace("_", " ");
}

export default function AdminUsers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");

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

  const roleCounts = useMemo(() => {
    return ROLES.reduce(
      (counts, role) => ({
        ...counts,
        [role]: users.filter((user) => user.role === role).length,
      }),
      {} as Record<Role, number>
    );
  }, [users]);

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    const roleMatches = roleFilter === "all" || u.role === roleFilter;
    const textMatches =
      !q ||
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q);
    return roleMatches && textMatches;
  });

  return (
    <div className="min-h-screen bg-[#fff8ef] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link className="link text-sm font-bold" to="/admin">
            ← {t("common.back")}
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-[#2b1708]">
            {t("adminUsers.title")}
          </h1>
          <p className="text-sm font-medium text-[#6d5a4a]">
            Manage every account by role, and jump into the relevant workspace.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="input input-bordered input-sm"
            type="search"
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select select-bordered select-sm"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as Role | "all")}
          >
            <option value="all">All roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {roleLabel(role)}
              </option>
            ))}
          </select>
        </div>
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
                  {roleLabel(r)}
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-lg border px-3 py-2 text-sm font-bold ${
            roleFilter === "all"
              ? "border-[#f8760f] bg-[#ffe0b8] text-[#7d3300]"
              : "border-[#ffd8ad] bg-[#fff9f0] text-[#6d5a4a]"
          }`}
          onClick={() => setRoleFilter("all")}
        >
          All {users.length}
        </button>
        {ROLES.map((role) => (
          <button
            key={role}
            type="button"
            className={`rounded-lg border px-3 py-2 text-sm font-bold capitalize ${
              roleFilter === role ? roleStyles[role] : "border-[#ffd8ad] bg-[#fff9f0] text-[#6d5a4a]"
            }`}
            onClick={() => setRoleFilter(role)}
          >
            {roleLabel(role)} {roleCounts[role] || 0}
          </button>
        ))}
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
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium text-[#2b1708]">{u.full_name}</td>
                    <td className="text-sm text-base-content/70">{u.email}</td>
                    <td>
                      <select
                        className={`select select-bordered select-xs font-bold capitalize ${roleStyles[u.role]}`}
                        value={u.role}
                        onChange={(e) => setRole(u.id, e.target.value as Role)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {roleLabel(r)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-sm text-base-content/70">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      {u.role === "teacher" ? (
                        <Link className="btn btn-primary btn-xs" to={`/admin/teachers/${u.id}`}>
                          Dashboard
                        </Link>
                      ) : u.role === "accountant" ? (
                        <Link className="btn btn-outline btn-xs bg-white" to="/accountant">
                          Accounting
                        </Link>
                      ) : u.role === "social_relations" ? (
                        <Link className="btn btn-outline btn-xs bg-white" to="/social">
                          Social
                        </Link>
                      ) : (
                        <span className="text-xs text-base-content/50">Managed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
