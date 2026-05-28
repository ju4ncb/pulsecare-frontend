import type { Route } from "./+types/profile";
import { useNavigate } from "react-router";
import { logout } from "../lib/auth-client";
import { useCurrentUser } from "../lib/user";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [{ title: "PulseCare | Perfil" }];
}

export default function Profile() {
  const { data: profile, isLoading, error } = useCurrentUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/auth/login");
  }

  if (isLoading) {
    return <div className="p-6">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="p-6 text-rose-200">No se pudo cargar el perfil.</div>;
  }

  let roleText = "—";
  if (profile) {
    roleText = profile.role ?? (profile.id_role === 2 ? "admin" : "student");
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold text-white">Cuenta</h2>
        <p className="mt-2 text-sm text-slate-300">Resumen de la cuenta y accesos rápidos de la sesión actual.</p>
        <dl className="mt-6 space-y-4 text-sm text-slate-300">
          <div>
            <dt className="text-slate-400">Nombre</dt>
            <dd className="mt-1 text-slate-100">{profile?.name ?? profile?.nombre ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Correo</dt>
            <dd className="mt-1 text-slate-100">{profile?.email ?? profile?.correo ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Rol</dt>
            <dd className="mt-1 text-slate-100">{roleText}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <button onClick={handleLogout} className="rounded-2xl bg-rose-500 px-4 py-2 text-white hover:bg-rose-400">
            Cerrar sesión
          </button>
        </div>
      </article>

      <article className="rounded-3xl border border-indigo-400/20 bg-indigo-400/10 p-6 text-indigo-50">
        <h3 className="text-xl font-semibold">Sesión y accesos</h3>
        <p className="mt-3 text-sm leading-6 text-indigo-50/80">Usa estos accesos para volver rápido al flujo principal de PulseCare.</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link to="/wellbeing/entry" className="rounded-2xl border border-indigo-300/20 bg-slate-950/30 px-4 py-3 text-sm font-medium text-indigo-50 hover:bg-slate-950/45">
            Nuevo registro diario
          </Link>
          <Link to="/wellbeing/history" className="rounded-2xl border border-indigo-300/20 bg-slate-950/30 px-4 py-3 text-sm font-medium text-indigo-50 hover:bg-slate-950/45">
            Ver historial
          </Link>
          <Link to="/dashboard" className="rounded-2xl border border-indigo-300/20 bg-slate-950/30 px-4 py-3 text-sm font-medium text-indigo-50 hover:bg-slate-950/45">
            Ir al dashboard
          </Link>
          {roleText === "admin" && (
            <Link to="/admin" className="rounded-2xl border border-indigo-300/20 bg-slate-950/30 px-4 py-3 text-sm font-medium text-indigo-50 hover:bg-slate-950/45">
              Panel de IA
            </Link>
          )}
        </div>

        <p className="mt-5 text-sm text-indigo-50/80">La sesión actual permanece activa hasta que cierres sesión o abandones el navegador.</p>
      </article>
    </section>
  );
}