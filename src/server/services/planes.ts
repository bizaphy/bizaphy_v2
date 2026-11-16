import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { plan, estadoPlan } from "@/server/db/schema";

export type EstadoPlan = (typeof estadoPlan.enumValues)[number];

// Columnas del tablero, en orden (vienen del enum de la base)
export const ESTADOS_PLAN = estadoPlan.enumValues;

// ── LECTURAS ──

// Todos los planes, primero los de mayor prioridad y luego los más nuevos
export async function obtenerPlanes() {
  return db
    .select()
    .from(plan)
    .orderBy(desc(plan.prioridad), desc(plan.creadoEn));
}

// ── LÓGICA DE NEGOCIO ──

// Lee y valida el formulario de plan nuevo. Lanza error si algo es inválido.
export function validarFormularioPlan(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const detalle = String(formData.get("detalle") ?? "").trim();
  const prioridad = Number(formData.get("prioridad"));

  if (!titulo || titulo.length > 120) {
    throw new Error("Título inválido");
  }
  if (![1, 2, 3].includes(prioridad)) {
    throw new Error("Prioridad inválida");
  }

  return { titulo, detalle: detalle || null, prioridad };
}

export function esEstadoValido(estado: string): estado is EstadoPlan {
  return (ESTADOS_PLAN as readonly string[]).includes(estado);
}

// ── ESCRITURAS ──

export async function insertarPlan(datos: ReturnType<typeof validarFormularioPlan>) {
  await db.insert(plan).values(datos);
}

export async function actualizarEstadoPlan(id: number, estado: EstadoPlan) {
  await db.update(plan).set({ estado }).where(eq(plan.id, id));
}

export async function borrarPlan(id: number) {
  await db.delete(plan).where(eq(plan.id, id));
}
