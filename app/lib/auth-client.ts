import { fetchJson } from "./api";

export type LoginFormValues = {
  email: string;
  password: string;
};

export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
};

type UserProfile = {
  id?: number;
  name?: string;
  nombre?: string;
  email?: string;
  correo?: string;
  role?: string;
  id_role?: number;
};

function setCookie(name: string, value: string) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=86400; samesite=lax`;
}

export async function loginUser(values: LoginFormValues) {
  const response = await fetchJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: {
      email: values.email.trim(),
      password: values.password,
    },
  });

  setCookie("pulsecare_token", response.access_token);

  try {
    const profile = await fetchJson<UserProfile>("/auth/me", {
      headers: {
        Authorization: `Bearer ${response.access_token}`,
      },
    });

    const role = profile.role || (profile.id_role === 2 ? "admin" : "student");
    setCookie("pulsecare_role", role);
  } catch {
    setCookie("pulsecare_role", "student");
  }
}

export async function registerUser(values: RegisterFormValues) {
  await fetchJson<unknown>("/auth/register", {
    method: "POST",
    body: {
      email: values.email.trim(),
      password: values.password,
    },
  });
}

export function logout() {
  // remove cookies by expiring them
  const expire = (name: string) => {
    document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; samesite=lax`;
  };

  expire("pulsecare_token");
  expire("pulsecare_role");
}
