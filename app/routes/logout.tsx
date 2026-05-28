import { useEffect } from "react";
import { useNavigate } from "react-router";
import { logout } from "../lib/auth-client";

export default function LogoutRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    logout();

    // Keep compatibility with previous localStorage-based checks.
    localStorage.removeItem("session");

    navigate("/auth/login", { replace: true });
  }, [navigate]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-200">
      Cerrando sesión...
    </section>
  );
}
