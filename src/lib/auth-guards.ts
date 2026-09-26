//Cada lugar privado va a llamar a una de estas funciones en su primera línea.

import "server-only";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";

// Devuelve la sesión actual o null.
// lee la cookie de sesión de la petición y la valida contra la tabla: session
// Aparte de existir, la cookie tiene que ser válida y no estar vencida.
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

// Para PÁGINAS privadas: si no eres admin, la página "no existe" (404).
export async function requireAdminPage() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    notFound();
  }
  return session;
}

// Para SERVER ACTIONS: si no eres admin, lanza un error y no se ejecuta nada.
export async function assertAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    throw new Error("No autorizado");
  }
  return session;
}
