export const API_BASE_URL = "https://pulsecare-backend-25uo.onrender.com";

type JsonValue = Record<string, unknown>;

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${encodeURIComponent(name)}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(name.length + 1));
}

export async function fetchJson<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "detail" in data
        ? String((data as JsonValue).detail ?? "")
        : response.statusText || "Request failed";

    throw new Error(message);
  }

  return data as TResponse;
}

export async function fetchAuthedJson<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const token = getCookie("pulsecare_token");

  return fetchJson<TResponse>(path, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
}
