import type { Route } from "./+types/ai-validate";
import { useMutation } from "@tanstack/react-query";
import { requireAdmin } from "../lib/session";
import { validateModel, type AiValidateResponse } from "../lib/ai-client";

export function loader({ request }: Route.LoaderArgs) {
  return requireAdmin(request);
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "PulseCare | Validación IA" }];
}

function MetricCard({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{typeof value === "number" ? value.toFixed(3) : "—"}</p>
    </div>
  );
}

export default function AiValidate() {
  const mutation = useMutation<AiValidateResponse, Error>({
    mutationFn: validateModel,
  });

  const data = mutation.data;
  const errorMessage = mutation.error?.message || null;

  const reportEntries = data?.classification_report ? Object.entries(data.classification_report) : [];

  const metricCopy = [
    {
      label: "Samples",
      help: "Cantidad de registros evaluados. Indica sobre cuántas muestras se calcularon las métricas.",
    },
    {
      label: "Accuracy",
      help: "Proporción total de aciertos sobre el conjunto completo. Más alto es mejor.",
    },
    {
      label: "Precision",
      help: "De las predicciones positivas, cuántas fueron realmente correctas.",
    },
    {
      label: "Recall",
      help: "De los casos reales de una clase, cuántos detectó el modelo.",
    },
    {
      label: "F1",
      help: "Balance entre precision y recall. Útil cuando quieres una visión general única.",
    },
  ] as const;

  const classLabels: Record<string, string> = {
    "0": "Clase 0 - Riesgo bajo",
    "1": "Clase 1 - Riesgo medio",
    "2": "Clase 2 - Riesgo alto",
    "macro avg": "Promedio macro",
    "weighted avg": "Promedio ponderado",
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Validación IA</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Evalúa el rendimiento del modelo</h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          Endpoint admin-only `GET /api/ai/validate` para revisar métricas globales, matriz de confusión y reporte por clase.
        </p>

        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="mt-6 rounded-2xl bg-indigo-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? "Validando..." : "Ejecutar validación"}
        </button>

        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {errorMessage}
          </div>
        )}
      </article>

      <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <h2 className="text-xl font-semibold text-white">Métricas</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          El JSON de validación resume el rendimiento global del modelo y también el comportamiento por clase. Lee primero las métricas generales y luego la matriz y el reporte.
        </p>
        {data ? (
          <div className="mt-5 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {metricCopy.map((metric) => (
                <div key={metric.label} className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <MetricCard
                    label={metric.label}
                    value={
                      metric.label === "Samples"
                        ? data.sample_count
                        : metric.label === "Accuracy"
                          ? data.accuracy
                          : metric.label === "Precision"
                            ? data.precision
                            : metric.label === "Recall"
                              ? data.recall
                              : data.f1
                    }
                  />
                  <p className="text-xs leading-5 text-slate-400">{metric.help}</p>
                </div>
              ))}
            </div>

            {data.confusion_matrix && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Matriz de confusión</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Cada fila representa la clase real y cada columna la clase predicha. Los valores en la diagonal son aciertos; los fuera de la diagonal son confusiones entre clases.
                </p>
                <div className="mt-4 overflow-auto">
                  <table className="min-w-full border-separate border-spacing-2 text-sm text-slate-200">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Real / Predicha</th>
                        <th className="px-2 py-1 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">0</th>
                        <th className="px-2 py-1 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">1</th>
                        <th className="px-2 py-1 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">2</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.confusion_matrix.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                            {rowIndex}
                          </td>
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className={`rounded-xl border px-4 py-2 text-center ${
                                rowIndex === cellIndex
                                  ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                                  : "border-white/10 bg-slate-950/60 text-slate-200"
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportEntries.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Classification report</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Cada bloque resume una clase o un promedio. Precision, recall y f1-score te dicen qué tan confiable es el modelo para ese grupo; support es la cantidad de muestras reales.
                </p>
                <div className="mt-4 grid gap-3">
                  {reportEntries.map(([label, metrics]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                      <p className="text-sm font-semibold text-indigo-200">{classLabels[label] ?? label}</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm text-slate-300">
                        <span>Precision: {metrics.precision?.toFixed?.(3) ?? metrics.precision ?? "—"}</span>
                        <span>Recall: {metrics.recall?.toFixed?.(3) ?? metrics.recall ?? "—"}</span>
                        <span>F1-score: {metrics["f1-score"]?.toFixed?.(3) ?? metrics["f1-score"] ?? "—"}</span>
                        <span>Support: {metrics.support ?? "—"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            Ejecuta la validación para ver las métricas del modelo.
          </div>
        )}
      </article>
    </section>
  );
}
