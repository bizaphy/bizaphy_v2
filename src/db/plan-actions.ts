"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { assertAdmin } from "@/lib/auth-guards";
import { plan, estadoPlan } from "./plan-schema";

type EstadoPlan = (typeof estadoPlan.enumValues)[number];

// Crea un plan nuevo desde el formulario de /admin/planes
export async function crearPlan(formData: FormData) {
  await assertAdmin();

  const titulo = String(formData.get("titulo") ?? "").trim();
  const detalle = String(formData.get("detalle") ?? "").trim();
  const prioridad = Number(formData.get("prioridad"));

  if (!titulo || titulo.length > 120) {
    throw new Error("Título inválido");
  }
  if (![1, 2, 3].includes(prioridad)) {
    throw new Error("Prioridad inválida");
  }

  await db.insert(plan).values({
    titulo,
    detalle: detalle || null,
    prioridad,
  });

  revalidatePath("/admin/planes");
}

// Mueve un plan a otra columna del tablero
export async function cambiarEstadoPlan(id: number, estado: EstadoPlan) {
  await assertAdmin();

  if (!estadoPlan.enumValues.includes(estado)) {
    throw new Error("Estado inválido");
  }

  await db.update(plan).set({ estado }).where(eq(plan.id, id));

  revalidatePath("/admin/planes");
}

// Borra un plan (por ejemplo, una idea que descartaste)
export async function eliminarPlan(id: number) {
  await assertAdmin();

  await db.delete(plan).where(eq(plan.id, id));

  revalidatePath("/admin/planes");
}
