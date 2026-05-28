import { redirect } from "react-router";

export const AUTH_TOKEN_COOKIE = "pulsecare_token";
export const AUTH_ROLE_COOKIE = "pulsecare_role";

export type SessionContext = {
  token: string | null;
  role: "student" | "admin" | null;
};

function parseCookies(header: string | null): Record<string, string> {
  if (!header) {
    return {};
  }

  return header.split(";").reduce<Record<string, string>>((cookies, pair) => {
    const [rawName, ...rawValue] = pair.trim().split("=");

    if (!rawName) {
      return cookies;
    }

    cookies[decodeURIComponent(rawName)] = decodeURIComponent(rawValue.join("=") || "");
    return cookies;
  }, {});
}

export function getSessionContext(request: Request): SessionContext {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const roleValue = cookies[AUTH_ROLE_COOKIE];

  return {
    token: cookies[AUTH_TOKEN_COOKIE] || null,
    role: roleValue === "admin" || roleValue === "student" ? roleValue : null,
  };
}

export function requireAuth(request: Request) {
  const session = getSessionContext(request);

  if (!session.token) {
    throw redirect("/auth/login");
  }

  return session;
}

export function requirePublic(request: Request) {
  const session = getSessionContext(request);

  if (session.token) {
    throw redirect("/dashboard");
  }

  return session;
}

export function requireAdmin(request: Request) {
  const session = requireAuth(request);

  if (session.role !== "admin") {
    throw redirect("/dashboard");
  }

  return session;
}