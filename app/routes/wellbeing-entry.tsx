import type { Route } from "./+types/wellbeing-entry";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createWellbeingEntry, type WellbeingEntryResponse } from "../lib/wellbeing-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function meta({}: Route.MetaArgs) {
  return [{ title: "PulseCare | Nuevo registro" }];
}

const fields = [
  { name: "mood_score", label: "Estado de ánimo", type: "number", min: 1, max: 5, step: 1, hint: "1 a 5" },
  { name: "sleep_hours", label: "Horas de sueño", type: "number", min: 0, max: 24, step: 0.1, hint: "0 a 24" },
  { name: "academic_load", label: "Carga académica", type: "number", min: 1, max: 5, step: 1, hint: "1 a 5" },
  { name: "energy_fatigue", label: "Energía o fatiga", type: "number", min: 1, max: 5, step: 1, hint: "1 a 5" },
] as const;

const wellbeingEntrySchema = z.object({
  mood_score: z.number().min(1, "Debe estar entre 1 y 5").max(5, "Debe estar entre 1 y 5"),
  sleep_hours: z.number().min(0, "Debe estar entre 0 y 24").max(24, "Debe estar entre 0 y 24"),
  academic_load: z.number().min(1, "Debe estar entre 1 y 5").max(5, "Debe estar entre 1 y 5"),
  energy_fatigue: z.number().min(1, "Debe estar entre 1 y 5").max(5, "Debe estar entre 1 y 5"),
});

type WellbeingEntryFormData = z.infer<typeof wellbeingEntrySchema>;

export default function WellbeingEntry() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WellbeingEntryFormData>({
    resolver: zodResolver(wellbeingEntrySchema),
    defaultValues: {
      mood_score: 3,
      sleep_hours: 7,
      academic_load: 3,
      energy_fatigue: 3,
    },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation<WellbeingEntryResponse, Error, WellbeingEntryFormData>({
    mutationFn: createWellbeingEntry,
    onSuccess(data: WellbeingEntryResponse) {
      queryClient.invalidateQueries({ queryKey: ["wellbeing", "entries"] });
      setSuccessMessage(`Registro guardado correctamente${data?.id ? ` (#${data.id})` : ""}.`);
      reset();
    },
    onError(error: any) {
      setServerError(error instanceof Error ? error.message : "No se pudo guardar el registro.");
    },
  });

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    setSuccessMessage(null);

    mutation.mutate(values);
  });

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={onSubmit} className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-indigo-950/20 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
        <h2 className="text-2xl font-semibold text-white">Autorregistro diario</h2>
        <p className="mt-2 text-sm text-slate-300">
          Campos alineados con <span className="text-indigo-300">POST /api/wellbeing/entries</span>. La regularidad y las tendencias se calculan en el backend, por eso no aparecen en el formulario.
        </p>

        {serverError && (
          <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {successMessage}
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className="block rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-100">{field.label}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400">{field.hint}</span>
              </div>
              <input
                type={field.type}
                min={field.min}
                max={field.max}
                step={field.step}
                placeholder={field.hint}
                {...register(field.name, { valueAsNumber: true })}
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
              />
              {errors[field.name] && <span className="mt-2 block text-sm text-rose-200">{errors[field.name]?.message}</span>}
            </label>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-indigo-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Guardando..." : "Guardar registro"}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/5"
          >
            Restablecer
          </button>
        </div>
      </form>

      <aside className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <h3 className="text-xl font-semibold text-white">Qué ocurre después</h3>
        <ol className="mt-4 space-y-3 text-sm text-slate-300">
          <li>1. El backend valida el payload con Pydantic.</li>
          <li>2. Guarda el registro en SQLite vía SQLAlchemy.</li>
          <li>3. Deriva el snapshot para la capa IA.</li>
          <li>4. Queda listo para etiquetado y entrenamiento supervisado.</li>
        </ol>

        <div className="mt-6 rounded-2xl border border-indigo-300/20 bg-indigo-400/10 p-4 text-sm text-indigo-100">
          Consejo: registra tus datos a la misma hora para mejorar la calidad de las tendencias y predicciones.
        </div>
      </aside>
    </section>
  );
}