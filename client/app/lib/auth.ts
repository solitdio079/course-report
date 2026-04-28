export const API_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

export type Role =
  | "admin"
  | "teacher"
  | "social_relations"
  | "accountant"
  | "parent";

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
};

export async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: "include",
  }).catch(() => null);
  if (!res || !res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.user ?? null;
}

export async function logoutRequest(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => null);
}

export function dashboardPathForRole(role: Role | undefined | null): string {
  switch (role) {
    case "teacher":
      return "/teacher";
    case "parent":
      return "/parent";
    default:
      return "/";
  }
}
