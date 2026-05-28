import type { Route } from "./+types/auth-register";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerUser, type RegisterFormValues } from "../lib/auth-client";

export function meta({}: Route.MetaArgs) {
  return [{ title: "PulseCare | Crear cuenta" }];
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Ingresa al menos 2 caracteres."),
  email: z.string().trim().min(1, "El correo es obligatorio.").email("Ingresa un correo válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export default function AuthRegister() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      await registerUser(values);
      setSuccessMessage("Cuenta creada correctamente. Ya puedes iniciar sesión.");
      reset();
      navigate("/auth/login");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No se pudo crear la cuenta.");
    }
  });

  return (
    <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div className="rounded-3xl border border-indigo-400/20 bg-indigo-400/10 p-6 text-indigo-50 shadow-2xl shadow-indigo-950/20">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Registro</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Crea tu acceso al seguimiento diario.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-indigo-50/85">
            Únete a PulseCare para monitorear tu salud cardiovascular y recibir insights personalizados. Este proyecto de Inteligencia Artificial basado en el ODS 3 <span className="font-semibold">Salud y Bienestar</span> te ayudará a mejorar tu calidad de vida.
        </p>
      </div>

      <form onSubmit={onSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
        <h2 className="text-xl font-semibold text-white">Crear cuenta</h2>

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
              <span className="text-sm font-medium text-slate-200">Nombre completo</span>
              <span className="text-xs text-slate-400">Obligatorio</span>
            </div>
            <input
              type="text"
              placeholder="Tu nombre"
              {...register("name")}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
            />
            {errors.name && <span className="mt-2 block text-sm text-rose-200">{errors.name.message}</span>}
          </label>
          <label className="block rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">Correo</span>
              <span className="text-xs text-slate-400">Formato email</span>
            </div>
            <input
              type="email"
              placeholder="estudiante@unisimon.com.co"
              {...register("email")}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
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
              placeholder="Crea una contraseña segura"
              {...register("password")}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
            />
            {errors.password && <span className="mt-2 block text-sm text-rose-200">{errors.password.message}</span>}
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="mt-4 text-sm text-slate-400">
          ¿Ya tienes cuenta? <Link to="/auth/login" className="text-indigo-300 hover:text-indigo-200">Ingresa</Link>
        </p>
      </form>
    </section>
  );
}