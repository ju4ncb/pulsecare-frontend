import type { Route } from "./+types/app-layout";
import { NavLink, Outlet } from "react-router";
import { requireAuth } from "../lib/session";
import { isAdminUser, useCurrentUser } from "~/lib/user";

export function loader({ request }: Route.LoaderArgs) {
  return requireAuth(request);
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-full px-4 py-2 text-sm font-medium transition",
    isActive
      ? "border border-indigo-300/40 bg-indigo-400/20 text-indigo-100"
      : "border border-white/10 text-slate-200 hover:bg-white/5",
  ].join(" ");
}

function navLinkClassLogout({ isActive }: { isActive: boolean }) {
  return [
    "rounded-full px-4 py-2 text-sm font-medium transition",
    isActive      ? "border border-rose-300/40 bg-rose-400/20 text-rose-100"
      : "border border-rose-400/30 text-rose-200 hover:bg-rose-400/10",
  ].join(" ");
}

export default function AppLayout() {
  const { data: profile } = useCurrentUser();
  const isAdmin = isAdminUser(profile);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/85 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">PulseCare</p>
              <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Panel principal</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-300">
                Bienestar, historial, perfil y administración organizados sobre la API de autenticación y bienestar del backend.
              </p>
            </div>
            <nav className="flex flex-wrap gap-2">
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/wellbeing/entry" className={navLinkClass}>
                Nuevo registro
              </NavLink>
              <NavLink to="/wellbeing/history" className={navLinkClass}>
                Historial
              </NavLink>
              <NavLink to="/ai/predict" className={navLinkClass}>
                Predicción IA
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Perfil
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass}>
                  Admin
                </NavLink>
              )}
              <NavLink to="/logout" className={navLinkClassLogout}>
                Cerrar sesión
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-8 pt-44 sm:px-6 sm:pt-40 lg:px-8 lg:pt-36">
        <div className="flex items-center justify-center">
            <Outlet />
        </div>
      </main>
      <footer className="border-t border-white/10 bg-slate-950/80 px-4 py-8 backdrop-blur">
        <div className="mx-auto grid w-full max-w-7xl gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/30 p-6 shadow-2xl shadow-indigo-950/20 md:grid-cols-[1.2fr_1fr] md:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">PulseCare</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Proyecto de Inteligencia Artificial orientado al ODS 3 (Salud y Bienestar), enfocado en seguimiento emocional y apoyo temprano.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Sistema activo
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Equipo</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Fares Acosta</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Michael Borrego</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Felipe Jaramillo</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Joel Marquez</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Jose Morales</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Eyner Schoonewolff</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 text-xs text-slate-400 md:col-span-2 md:flex md:items-center md:justify-between">
            <p>PulseCare © {new Date().getFullYear()}</p>
            <p className="mt-2 md:mt-0">Bienestar universitario con IA responsable</p>
          </div>
        </div>
      </footer>
    </>
  );
}