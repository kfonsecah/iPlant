import { Redirect } from "expo-router";

// El guard en _layout.tsx redirige según el estado de auth.
// Este fallback apunta a login por si el guard aún no evaluó el estado.
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
