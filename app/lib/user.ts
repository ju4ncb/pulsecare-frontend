import { useQuery } from "@tanstack/react-query";
import { fetchAuthedJson, getCookie } from "./api";

export type CurrentUser = {
  id?: number;
  name?: string;
  nombre?: string;
  email?: string;
  correo?: string;
  role?: string;
  id_role?: number | string;
  user?: {
    role?: string;
    id_role?: number | string;
  };
};

export async function fetchCurrentUser(): Promise<CurrentUser> {
  return fetchAuthedJson<CurrentUser>("/auth/me");
}

export function useCurrentUser() {
  return useQuery<CurrentUser, Error>({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUser,
    retry: false,
  });
}

export function isAdminUser(profile?: CurrentUser | null): boolean {
  const cookieRole = (getCookie("pulsecare_role") || "").toLowerCase();
  if (cookieRole === "admin") {
    return true;
  }

  const rawRole = profile?.role ?? profile?.user?.role;
  const role = typeof rawRole === "string" ? rawRole.toLowerCase() : "";
  if (role === "admin") {
    return true;
  }

  const rawIdRole = profile?.id_role ?? profile?.user?.id_role;
  return Number(rawIdRole) === 2;
}
