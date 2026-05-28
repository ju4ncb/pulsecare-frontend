import type { Route } from "./+types/ai-predict";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { requireAuth } from "../lib/session";
import { predictRiskWithGet, predictRiskWithPost, type AiPredictResponse, type AiPredictResponseMapped } from "../lib/ai-client";

export function loader({ request }: Route.LoaderArgs) {
  return requireAuth(request);
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "PulseCare | Predicción IA" }];
}

function ProbabilityBar({ label, value }: { label: string; value: number }) {
  const percentage = Math.max(0, Math.min(100, value * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span>{percentage.toFixed(1)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-indigo-400" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export default function AiPredict() {
  const [entryId, setEntryId] = useState("");
  const [result, setResult] = useState<AiPredictResponse | null>(null);
  const [resultMapped, setResultMapped] = useState<AiPredictResponseMapped | null>(null);

  const setDataAndMap = (data: AiPredictResponse) => {
    setResult(data);
    const labelsMap: Record<string, string> = {
      "0": "Riesgo bajo",
      "1": "Riesgo medio",
      "2": "Riesgo alto",
    };
    setResultMapped({
      predictedLabel: "" + data.predicted_label,
      predictedLabelName: labelsMap[data.predicted_label ?? ""] ?? "Desconocida",
    });
  }

  const getMutation = useMutation<AiPredictResponse, Error, string>({
    mutationFn: predictRiskWithGet,
    onSuccess: (data) => setDataAndMap(data),
  });

  const postMutation = useMutation<AiPredictResponse, Error, string>({
    mutationFn: predictRiskWithPost,
    onSuccess: (data) => setDataAndMap(data),
  });

  const errorMessage = getMutation.error?.message || postMutation.error?.message || null;

  const probabilities = result?.probabilities ?? {};
  const entries = Object.entries(probabilities)
    .map(([label, value]) => [label, Number(value)] as const)
    .filter(([, value]) => Number.isFinite(value));

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Predicción IA</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Evalúa el riesgo de un registro</h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          Usa `GET /api/ai/predict/{`{entry_id}`}` o `POST /api/ai/predict/{`{entry_id}`}` con el mismo formato de respuesta.
        </p>

        <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-200">Entry ID</span>
            <input
              type="text"
              value={entryId}
              onChange={(event) => setEntryId(event.target.value)}
              placeholder="Ej. 123"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => getMutation.mutate(entryId)}
              disabled={getMutation.isPending || !entryId.trim()}
              className="rounded-2xl bg-indigo-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {getMutation.isPending ? "Consultando..." : "Predecir con GET"}
            </button>
            <button
              type="button"
              onClick={() => postMutation.mutate(entryId)}
              disabled={postMutation.isPending || !entryId.trim()}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {postMutation.isPending ? "Consultando..." : "Predecir con POST"}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {errorMessage}
          </div>
        )}
      </article>

      <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <h2 className="text-xl font-semibold text-white">Resultado</h2>
        {resultMapped ? (
          <div className="mt-5 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Etiqueta</p>
                <p className="mt-2 text-2xl font-semibold text-white">{resultMapped.predictedLabelName ?? "—"}</p>
                <p className="mt-1 text-sm text-slate-400">Clase: {resultMapped.predictedLabel ?? "—"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Entrada</p>
                <p className="mt-2 text-2xl font-semibold text-white">{entryId || "—"}</p>
                <p className="mt-1 text-sm text-slate-400">Registro analizado</p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Probabilidades</p>
              {entries.length > 0 ? (
                entries.map(([label, value]) => <ProbabilityBar key={label} label={`Clase ${label}`} value={value} />)
              ) : (
                <p className="text-sm text-slate-400">No se recibieron probabilidades.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            Ejecuta una predicción para ver la clase estimada y las probabilidades por clase.
          </div>
        )}
      </article>
    </section>
  );
}
