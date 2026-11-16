"use server";
// Acciones del tablero /admin/planes. La lógica y la base están en
// services/planes.ts; aquí solo permisos, llamada al servicio y caché.

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/server/auth/guards";
import {
  actualizarEstadoPlan,
  borrarPlan,
  esEstadoValido,
  insertarPlan,
  validarFormularioPlan,
  type EstadoPlan,
} from "@/server/services/planes";

// Crea un plan nuevo desde el formulario de /admin/planes
export async function crearPlan(formData: FormData) {
  await assertAdmin();

  await insertarPlan(validarFormularioPlan(formData));

  revalidatePath("/admin/planes");
}

// Mueve un plan a otra columna del tablero
export async function cambiarEstadoPlan(id: number, estado: EstadoPlan) {
  await assertAdmin();

  if (!esEstadoValido(estado)) {
    throw new Error("Estado inválido");
  }

  await actualizarEstadoPlan(id, estado);

  revalidatePath("/admin/planes");
}

// Borra un plan (por ejemplo, una idea que descartaste)
export async function eliminarPlan(id: number) {
  await assertAdmin();

  await borrarPlan(id);

  revalidatePath("/admin/planes");
}
