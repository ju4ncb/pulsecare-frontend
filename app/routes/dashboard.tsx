import { isAdminUser, useCurrentUser } from "../lib/user";
import type { Route } from "./+types/dashboard";
import { Link } from "react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAuthedJson } from "../lib/api";

export function meta({}: Route.MetaArgs) {
  return [{ title: "PulseCare | Dashboard" }];
}

type DashboardEntry = {
  id?: number;
  entry_id?: number;
  created_at?: string;
  timestamp?: string;
  mood_score?: number;
  mood?: number;
  sleep_hours?: number;
  sleep?: number;
};

export default function Dashboard() {
  const { data: profile } = useCurrentUser();
  const isAdmin = isAdminUser(profile);
  const { data: entries = [], isLoading } = useQuery<DashboardEntry[], Error>({
    queryKey: ["wellbeing", "entries"],
    queryFn: () => fetchAuthedJson("/api/wellbeing/entries"),
    retry: false,
  });

  const summary = useMemo(() => {
    const normalized = entries
      .map((entry) => ({
        id: entry.id ?? entry.entry_id,
        createdAt: entry.created_at ?? entry.timestamp,
        mood: entry.mood_score ?? entry.mood,
        sleep: entry.sleep_hours ?? entry.sleep,
      }))
      .sort((left, right) => {
        const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
        const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;

        return rightTime - leftTime;
      });

    const latest = normalized[0] ?? null;
    const moodValues = normalized.map((entry) => entry.mood).filter((value): value is number => typeof value === "number");
    const sleepValues = normalized.map((entry) => entry.sleep).filter((value): value is number => typeof value === "number");

    const averageMood = moodValues.length ? moodValues.reduce((sum, value) => sum + value, 0) / moodValues.length : null;
    const averageSleep = sleepValues.length ? sleepValues.reduce((sum, value) => sum + value, 0) / sleepValues.length : null;

    return {
      totalEntries: normalized.length,
      latestLabel: latest?.createdAt ? new Date(latest.createdAt).toLocaleDateString() : "Sin registros",
      latestMood: latest?.mood ?? null,
      averageMood: averageMood ? averageMood.toFixed(1) : null,
      averageSleep: averageSleep ? averageSleep.toFixed(1) : null,
      latestRecordLabel: latest?.id ? `#${latest.id}` : "—",
    };
  }, [entries]);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Último registro</p>
          <p className="mt-3 text-2xl font-semibold text-white">{isLoading ? "..." : summary.latestLabel}</p>
          <p className="mt-1 text-xs text-slate-400">{summary.latestRecordLabel}</p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Promedio ánimo</p>
          <p className="mt-3 text-2xl font-semibold text-white">{isLoading ? "..." : summary.averageMood ?? "—"}</p>
          <p className="mt-1 text-xs text-slate-400">Basado en los registros disponibles</p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Promedio sueño</p>
          <p className="mt-3 text-2xl font-semibold text-white">{isLoading ? "..." : summary.averageSleep ?? "—"}</p>
          <p className="mt-1 text-xs text-slate-400">Horas por noche</p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Registros totales</p>
          <p className="mt-3 text-2xl font-semibold text-white">{isLoading ? "..." : summary.totalEntries}</p>
          <p className="mt-1 text-xs text-slate-400">Historial sincronizado</p>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">Acciones rápidas</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link to="/wellbeing/entry" className="rounded-2xl border border-indigo-400/30 bg-indigo-400/10 px-4 py-4 text-indigo-100 hover:bg-indigo-400/15">
              Registrar bienestar diario
            </Link>
            <Link to="/wellbeing/history" className="rounded-2xl border border-white/10 px-4 py-4 text-slate-200 hover:bg-white/5">
              Ver historial y tendencias
            </Link>
            <Link to="/ai/predict" className="rounded-2xl border border-white/10 px-4 py-4 text-slate-200 hover:bg-white/5">
              Predecir riesgo de un registro
            </Link>
            <Link to="/profile" className="rounded-2xl border border-white/10 px-4 py-4 text-slate-200 hover:bg-white/5">
              Revisar perfil
            </Link>
            {/* Solo mostrar admin si el usuario tiene rol admin */}
            {isAdmin && (
              <Link to="/admin" className="rounded-2xl border border-white/10 px-4 py-4 text-slate-200 hover:bg-white/5">
                Panel de administración
              </Link>
            )}

          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Bienvenido {profile?.name || "Usuario"}!</h2>
          <h3 className="mt-2 text-sm text-slate-300">Rol: {profile?.role || "Usuario"}</h3>
          <p className="mt-4 text-sm text-slate-300">
            Desde aquí puedes revisar tus registros recientes, entrar al autorregistro diario y seguir el estado general de PulseCare.
          </p>
          {summary.latestMood !== null && (
            <p className="mt-2 text-sm text-slate-300">Tu último ánimo registrado fue {summary.latestMood}.</p>
          )}
          {isAdmin && (
            <p className="mt-2 text-sm text-slate-300">Como administrador, también puedes acceder al panel de IA para entrenamiento y revisión de artefactos.</p>
          )}
        </article>
      </div>
    </section>
  );
}