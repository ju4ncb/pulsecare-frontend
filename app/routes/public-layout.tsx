import type { Route } from "./+types/public-layout";
import { Link, Outlet } from "react-router";
import { requirePublic } from "../lib/session";

export function loader({ request }: Route.LoaderArgs) {
  return requirePublic(request);
}

export default function PublicLayout() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 backdrop-blur">
        <span className="font-semibold tracking-wide text-indigo-300">PulseCare</span>
        <div className="flex gap-4">
          <Link to="/auth/login" className="hover:text-white">
            Iniciar sesión
          </Link>
          <Link to="/auth/register" className="hover:text-white">
            Crear cuenta
          </Link>
        </div>
      </div>
      <Outlet />
    </main>
  );
}