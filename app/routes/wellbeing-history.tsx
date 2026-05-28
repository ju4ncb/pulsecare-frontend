import type { Route } from "./+types/wellbeing-history";
import { useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import { requireAuth } from "../lib/session";
import { useQuery } from "@tanstack/react-query";
import { fetchAuthedJson } from "../lib/api";

export function loader({ request }: Route.LoaderArgs) {
  // ensure user is authenticated server-side; actual data will be fetched client-side
  return requireAuth(request);
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "PulseCare | Historial" }];
}

type HistoryEntry = {
  id?: number;
  entry_id?: number;
  recorded_at?: string;
  timestamp?: string;
  mood_score?: number;
  mood?: number;
  sleep_hours?: number;
  sleep?: number;
};

export default function WellbeingHistory() {
  const _session = useLoaderData();
  const [searchText, setSearchText] = useState("");
  const [minMood, setMinMood] = useState("");
  const [maxMood, setMaxMood] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: entries = [], isLoading, error } = useQuery<HistoryEntry[], Error>({
    queryKey: ["wellbeing", "entries"],
    queryFn: () => fetchAuthedJson("/api/wellbeing/entries"),
  });

  const filteredEntries = useMemo(() => {
    const normalized = entries.map((item) => {
      const id = item.id ?? item.entry_id;
      const createdAtRaw = item.recorded_at ?? item.timestamp;
      const createdAt = createdAtRaw ? new Date(createdAtRaw) : null;
      const mood = item.mood_score ?? item.mood;
      const sleep = item.sleep_hours ?? item.sleep;

      return {
        id,
        createdAt,
        createdAtLabel: createdAt ? createdAt.toLocaleString() : "-",
        mood,
        sleep,
      };
    });

    return normalized
      .filter((entry) => {
        if (!searchText.trim()) {
          return true;
        }

        const target = `${entry.id ?? ""} ${entry.createdAtLabel} ${entry.mood ?? ""} ${entry.sleep ?? ""}`.toLowerCase();
        return target.includes(searchText.trim().toLowerCase());
      })
      .filter((entry) => {
        if (!minMood) {
          return true;
        }

        if (typeof entry.mood !== "number") {
          return false;
        }

        return entry.mood >= Number(minMood);
      })
      .filter((entry) => {
        if (!maxMood) {
          return true;
        }

        if (typeof entry.mood !== "number") {
          return false;
        }

        return entry.mood <= Number(maxMood);
      })
      .filter((entry) => {
        if (!startDate || !entry.createdAt) {
          return true;
        }

        const start = new Date(`${startDate}T00:00:00`);
        return entry.createdAt >= start;
      })
      .filter((entry) => {
        if (!endDate || !entry.createdAt) {
          return true;
        }

        const end = new Date(`${endDate}T23:59:59`);
        return entry.createdAt <= end;
      })
      .sort((a, b) => {
        const aTime = a.createdAt?.getTime() ?? 0;
        const bTime = b.createdAt?.getTime() ?? 0;
        return sortBy === "newest" ? bTime - aTime : aTime - bTime;
      });
  }, [entries, searchText, minMood, maxMood, startDate, endDate, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, currentPage, pageSize]);

  function clearFilters() {
    setSearchText("");
    setMinMood("");
    setMaxMood("");
    setStartDate("");
    setEndDate("");
    setSortBy("newest");
    setPage(1);
  }

  if (isLoading) {
    return <div className="p-6">Cargando historial...</div>;
  }

  if (error) {
    return <div className="p-6 text-rose-200">Error al cargar historial.</div>;
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-2xl font-semibold text-white">Historial de bienestar</h2>
      <p className="mt-2 text-sm text-slate-300">Vista base para tendencias, predicciones y snapshot del modelo.</p>

      <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 md:grid-cols-2 lg:grid-cols-3">
        <input
          type="text"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar por ID, fecha, ánimo o sueño"
          className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={1}
            max={5}
            value={minMood}
            onChange={(event) => {
              setMinMood(event.target.value);
              setPage(1);
            }}
            placeholder="Ánimo mín"
            className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
          <input
            type="number"
            min={1}
            max={5}
            value={maxMood}
            onChange={(event) => {
              setMaxMood(event.target.value);
              setPage(1);
            }}
            placeholder="Ánimo máx"
            className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
          />
          <input
            type="date"
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <select
          value={sortBy}
          onChange={(event) => {
            setSortBy(event.target.value as "newest" | "oldest");
            setPage(1);
          }}
          className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
        </select>

        <select
          value={pageSize}
          onChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(1);
          }}
          className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
        >
          <option value={5}>5 por página</option>
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
        </select>

        <button
          type="button"
          onClick={clearFilters}
          className="rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5"
        >
          Limpiar filtros
        </button>
      </div>

      <p className="mt-3 text-sm text-slate-300">{filteredEntries.length} registros encontrados.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-300">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Ánimo</th>
              <th className="px-4 py-3 font-medium">Sueño</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-200">
            {paginatedEntries.length > 0 ? (
              paginatedEntries.map((item) => (
                <tr key={item.id ?? item.createdAtLabel}>
                  <td className="px-4 py-3">{item.id ?? "-"}</td>
                  <td className="px-4 py-3">{item.createdAtLabel}</td>
                  <td className="px-4 py-3">{item.mood ?? "-"}</td>
                  <td className="px-4 py-3">{item.sleep ?? "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-3" colSpan={4}>
                  No hay entradas de bienestar disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  );
}