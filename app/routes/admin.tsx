import type { Route } from "./+types/admin";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router";
import { requireAdmin } from "../lib/session";
import {
  getModelArtifact,
  getTrainRunStatus,
  trainModelAsync,
  trainModelSync,
  type AiArtifactJsonResponse,
  type AiTrainAsyncResponse,
  type AiTrainStatusResponse,
  type AiTrainSyncResponse,
} from "../lib/ai-client";

export function loader({ request }: Route.LoaderArgs) {
  return requireAdmin(request);
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "PulseCare | Administración" }];
}

export default function Admin() {
  const [runId, setRunId] = useState("");
  const [statusResult, setStatusResult] = useState<AiTrainStatusResponse | null>(null);
  const [artifactInfo, setArtifactInfo] = useState<AiArtifactJsonResponse | null>(null);

  const syncTrainMutation = useMutation<AiTrainSyncResponse, Error>({
    mutationFn: trainModelSync,
  });

  const asyncTrainMutation = useMutation<AiTrainAsyncResponse, Error>({
    mutationFn: trainModelAsync,
    onSuccess: (data) => {
      if (data.run_id) {
        setRunId(String(data.run_id));
      }
    },
  });

  const statusMutation = useMutation<AiTrainStatusResponse, Error, string>({
    mutationFn: getTrainRunStatus,
    onSuccess: (data) => {
      setStatusResult(data);
    },
  });

  const artifactMutation = useMutation({
    mutationFn: getModelArtifact,
    onSuccess: (data) => {
      if (data.kind === "json") {
        setArtifactInfo(data.data);
        return;
      }

      const url = URL.createObjectURL(data.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setArtifactInfo({ message: `Descarga iniciada: ${data.filename}` });
    },
  });

  useEffect(() => {
    if (!runId.trim() || statusMutation.isPending) {
      return;
    }

    const timer = window.setTimeout(() => {
      statusMutation.mutate(runId.trim());
    }, 35000);

    return () => window.clearTimeout(timer);
  }, [runId, statusMutation]);

  const statusLabel =
    statusResult?.status?.toLowerCase() ||
    asyncTrainMutation.data?.status?.toLowerCase() ||
    syncTrainMutation.data?.status?.toLowerCase() ||
    "idle";

  const statusTone =
    statusLabel.includes("fail") || statusLabel.includes("error")
      ? "border-rose-300/30 bg-rose-400/10 text-rose-100"
      : statusLabel.includes("pending") || statusLabel.includes("running")
        ? "border-amber-300/30 bg-amber-400/10 text-amber-100"
        : "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";

  const errorMessage =
    syncTrainMutation.error?.message ||
    asyncTrainMutation.error?.message ||
    statusMutation.error?.message ||
    artifactMutation.error?.message ||
    null;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-2xl font-semibold text-white">Administración y IA</h2>
      <p className="mt-2 text-sm text-slate-300">
        Ruta reservada para rol administrador, alineada con los endpoints de entrenamiento del backend.
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link to="/admin/validate" className="rounded-2xl border border-white/10 px-4 py-2 text-slate-100 hover:bg-white/5">
          Validación del modelo
        </Link>
        <Link to="/ai/predict" className="rounded-2xl border border-white/10 px-4 py-2 text-slate-100 hover:bg-white/5">
          Ir a predicción IA
        </Link>
      </div>

      <div className={`mt-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusTone}`}>
        Estado actual: {statusLabel}
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{errorMessage}</div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <h3 className="text-base font-semibold text-white">Entrenamiento síncrono</h3>
          <p className="mt-2 text-sm text-slate-300">Ejecuta `/api/ai/train` y espera resultado inmediato.</p>
          <button
            type="button"
            onClick={() => syncTrainMutation.mutate()}
            disabled={syncTrainMutation.isPending}
            className="mt-4 rounded-xl bg-indigo-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {syncTrainMutation.isPending ? "Entrenando..." : "Iniciar entrenamiento"}
          </button>
          <p className="mt-3 text-xs text-slate-400">Ideal para una demo controlada cuando quieres ver el resultado al instante.</p>
          {syncTrainMutation.data && (
            <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-200">
              <p className="font-medium text-white">{syncTrainMutation.data.message ?? "Entrenamiento completado"}</p>
              {syncTrainMutation.data.run_id && <p className="mt-1 text-xs text-slate-400">Run: {syncTrainMutation.data.run_id}</p>}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <h3 className="text-base font-semibold text-white">Entrenamiento asíncrono</h3>
          <p className="mt-2 text-sm text-slate-300">Dispara `/api/ai/train/async` y obtiene un `run_id`.</p>
          <button
            type="button"
            onClick={() => asyncTrainMutation.mutate()}
            disabled={asyncTrainMutation.isPending}
            className="mt-4 rounded-xl bg-indigo-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {asyncTrainMutation.isPending ? "Enviando..." : "Crear run asíncrono"}
          </button>
          <p className="mt-3 text-xs text-slate-400">Pensado para dejar el entrenamiento corriendo mientras sigues navegando.</p>
          {asyncTrainMutation.data && (
            <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-200">
              <p className="font-medium text-white">Run creado</p>
              <p className="mt-1 text-xs text-slate-400">{asyncTrainMutation.data.run_id ? `ID: ${asyncTrainMutation.data.run_id}` : asyncTrainMutation.data.message ?? "Respuesta recibida"}</p>
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 md:col-span-2">
          <h3 className="text-base font-semibold text-white">Estado de ejecución</h3>
          <p className="mt-2 text-sm text-slate-300">Consulta `/api/ai/train/` + run_id para revisar progreso y estado.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={runId}
              onChange={(event) => setRunId(event.target.value)}
              placeholder="Ingresa run_id"
              className="min-w-72 flex-1 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => statusMutation.mutate(runId.trim())}
              disabled={statusMutation.isPending || !runId.trim()}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {statusMutation.isPending ? "Consultando..." : "Consultar estado"}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">Si acabas de lanzar un run asíncrono, copia su ID aquí para revisar el progreso.</p>
          {statusResult && (
            <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-200">
              <p className="font-medium text-white">{statusResult.status ?? "Estado disponible"}</p>
              {statusResult.message && <p className="mt-1 text-xs text-slate-400">{statusResult.message}</p>}
              {statusResult.run_id && <p className="mt-1 text-xs text-slate-400">Run: {statusResult.run_id}</p>}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 md:col-span-2">
          <h3 className="text-base font-semibold text-white">Artefacto del modelo</h3>
          <p className="mt-2 text-sm text-slate-300">Obtiene `/api/ai/artifact` y descarga archivo si el backend lo retorna.</p>
          <button
            type="button"
            onClick={() => artifactMutation.mutate()}
            disabled={artifactMutation.isPending}
            className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {artifactMutation.isPending ? "Descargando..." : "Obtener artefacto"}
          </button>
          <p className="mt-3 text-xs text-slate-400">Si el backend devuelve un archivo, se descarga automáticamente; si devuelve JSON, lo verás aquí.</p>
          {artifactInfo && (
            <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-200">
              <p className="font-medium text-white">Artefacto recibido</p>
              {artifactInfo.message && <p className="mt-1 text-xs text-slate-400">{artifactInfo.message}</p>}
              {artifactInfo.path && <p className="mt-1 text-xs text-slate-400">Ruta: {artifactInfo.path}</p>}
            </div>
          )}
        </article>
      </div>

    </section>
  );
}