# PULSECARE FRONTEND

Frontend de PulseCare, una aplicación de seguimiento de bienestar construida con React, React Router, TypeScript, Tailwind CSS, React Hook Form, Zod y React Query.

## Demo

Funcionalidades principales:

- Autenticación con login y registro.
- Dashboard con resumen de actividad y accesos rápidos.
- Autorregistro diario con validación Zod.
- Historial con filtros y paginación.
- Perfil con accesos rápidos y cierre de sesión.
- Panel admin para entrenamiento de IA y consulta de runs.

## Requisitos

- Node.js 20 o superior.
- Backend disponible en `https://pulsecare-backend-25uo.onrender.com/`.

## Comandos

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Rutas

- `/auth/login`
- `/auth/register`
- `/dashboard`
- `/wellbeing/entry`
- `/wellbeing/history`
- `/profile`
- `/admin`

## Notas

- El frontend usa cookies para mantener la sesión.
- Algunos datos del dashboard se calculan desde el historial de bienestar.
- La vista de administración consume los endpoints de IA del backend para demo y supervisión.
