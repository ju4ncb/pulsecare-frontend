import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
	index("routes/index.tsx"),
	layout("routes/public-layout.tsx", [
		route("auth/login", "routes/auth-login.tsx"),
		route("auth/register", "routes/auth-register.tsx"),
	]),
	layout("routes/app-layout.tsx", [
		route("dashboard", "routes/dashboard.tsx"),
		route("wellbeing/entry", "routes/wellbeing-entry.tsx"),
		route("wellbeing/history", "routes/wellbeing-history.tsx"),
		route("profile", "routes/profile.tsx"),
		route("admin", "routes/admin.tsx"),
		route("logout", "routes/logout.tsx"),
	]),
] satisfies RouteConfig;
