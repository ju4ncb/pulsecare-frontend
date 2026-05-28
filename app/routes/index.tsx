import type { Route } from "./+types/index";
import { redirect } from "react-router";
import { getSessionContext } from "../lib/session";

export function loader({ request }: Route.LoaderArgs) {
  const session = getSessionContext(request);

  throw redirect(session.token ? "/dashboard" : "/auth/login");
}

export default function Index() {
  return null;
}