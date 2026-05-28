import type { Route } from "./+types/auth-login";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser, type LoginFormValues } from "../lib/auth-client";

export function meta({}: Route.MetaArgs) {
  return [{ title: "PulseCare | Iniciar sesión" }];
}

const loginSchema = z.object({
  email: z.string().trim().min(1, "El correo es obligatorio.").email("Ingresa un correo válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export default function AuthLogin() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      await loginUser(values);
      setSuccessMessage("Sesión iniciada correctamente.");
      navigate("/dashboard");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
    }
  });

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Acceso</p>
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Entra al panel de bienestar y seguimiento longitudinal.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-300">
          Proyecto de Inteligencia Artificial basado en el ODS 3 <span className="text-indigo-300 font-semibold">Salud y Bienestar</span>.
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-slate-300">
          <span className="rounded-full border border-white/10 px-3 py-1">Fares Acosta</span>
          <span className="rounded-full border border-white/10 px-3 py-1">Michael Borrego</span>
          <span className="rounded-full border border-white/10 px-3 py-1">Felipe Jaramillo</span>
          <span className="rounded-full border border-white/10 px-3 py-1">Joel Márquez</span>
          <span className="rounded-full border border-white/10 px-3 py-1">José Morales</span>
          <span className="rounded-full border border-white/10 px-3 py-1">Eyner Schoonewolff</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
        <h2 className="text-xl font-semibold text-white">Iniciar sesión</h2>
        <p className="mt-2 text-sm text-slate-300">Usa tu correo institucional y contraseña.</p>

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

        <div className="mt-6 space-y-4">
          <label className="block rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">Correo</span>
              <span className="text-xs text-slate-400">Obligatorio</span>
            </div>
            <input
              type="email"
              placeholder="estudiante@unisimon.com.co"
              {...register("email")}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-indigo-400"
            />
            {errors.email && <span className="mt-2 block text-sm text-rose-200">{errors.email.message}</span>}
          </label>
          <label className="block rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">Contraseña</span>
              <span className="text-xs text-slate-400">Mínimo 6</span>
            </div>
            <input
              type="password"
              placeholder="Tu contraseña"
              {...register("password")}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-indigo-400"
            />
            {errors.password && <span className="mt-2 block text-sm text-rose-200">{errors.password.message}</span>}
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-2xl bg-indigo-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
        </button>

        <p className="mt-4 text-sm text-slate-400">
          ¿No tienes cuenta? <Link to="/auth/register" className="text-indigo-300 hover:text-indigo-200">Regístrate</Link>
        </p>
      </form>
    </section>
  );
}