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
        {data ? (
          <div className="mt-5 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard label="Samples" value={data.sample_count} />
              <MetricCard label="Accuracy" value={data.accuracy} />
              <MetricCard label="Precision" value={data.precision} />
              <MetricCard label="Recall" value={data.recall} />
              <MetricCard label="F1" value={data.f1} />
            </div>

            {data.confusion_matrix && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Matriz de confusión</p>
                <div className="mt-4 overflow-auto">
                  <table className="min-w-full border-separate border-spacing-2 text-sm text-slate-200">
                    <tbody>
                      {data.confusion_matrix.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-center">
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
                <div className="mt-4 grid gap-3">
                  {reportEntries.map(([label, metrics]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                      <p className="text-sm font-semibold text-indigo-200">{label}</p>
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
