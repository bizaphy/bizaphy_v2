"use server";
// Autoguardado de reading, karaoke y comodines. Los editores mandan solo lo
// que cambio desde el ultimo guardado: { id: valor nuevo | null si se
// borro }. La validacion y la base estan en los services; aqui solo
// permisos y la llamada.
// Sin revalidatePath: las paginas son dinamicas (se leen de nuevo en cada
// visita) y refrescarlas en cada guardado solo gastaria consultas.

import { assertAdmin } from "@/server/auth/guards";
import {
  aplicarCambiosComodines,
  insertarComodinesNuevos,
  validarCambiosComodines,
  validarComodin,
} from "@/server/services/comodines";
import {
  aplicarCambiosCanciones,
  insertarCancionesNuevas,
  validarCambiosCanciones,
  validarCancion,
} from "@/server/services/karaoke";
import {
  aplicarCambiosTraducciones,
  guardarBorrador,
  guardarBorradorSiVacio,
  insertarTraduccionesNuevas,
  validarBorrador,
  validarCambiosTraducciones,
} from "@/server/services/reading";
import * as validar from "@/server/services/validar";
import type { Comodin } from "@/shared/types/comodin";
import type { Cancion } from "@/shared/types/karaoke";
import type {
  BorradorReading,
  Cambios,
  DatosDelNavegador,
} from "@/shared/types/reading";

// ─── Reading: el texto abierto ───
export async function guardarBorradorReading(
  cambios: Cambios<BorradorReading>,
) {
  await assertAdmin();
  const borrador = cambios.unico;
  if (borrador) await guardarBorrador(validarBorrador(borrador));
}

// ─── Reading: mis traducciones (clave = linea japonesa) ───
export async function guardarTraduccionesReading(cambios: Cambios<string>) {
  await assertAdmin();
  await aplicarCambiosTraducciones(validarCambiosTraducciones(cambios));
}

// ─── Karaoke: canciones (clave = id) ───
export async function guardarCanciones(cambios: Cambios<Cancion>) {
  await assertAdmin();
  await aplicarCambiosCanciones(validarCambiosCanciones(cambios));
}

// ─── Comodines (clave = id) ───
export async function guardarComodines(cambios: Cambios<Comodin>) {
  await assertAdmin();
  await aplicarCambiosComodines(validarCambiosComodines(cambios));
}

// ─── Subida unica de lo que habia en el localStorage ───
// Solo agrega lo que la base no tiene: nunca pisa lo ya guardado. Se puede
// llamar dos veces con lo mismo sin duplicar nada.
export async function subirDatosDelNavegador(datos: DatosDelNavegador) {
  await assertAdmin();

  const todo = validar.objeto(datos, "datos");
  if (!Array.isArray(todo.canciones) || !Array.isArray(todo.comodines)) {
    throw new Error("Datos inválidos");
  }
  if (todo.canciones.length > 5000 || todo.comodines.length > 5000) {
    throw new Error("Demasiados datos");
  }
  const canciones = todo.canciones.map((c) => ({
    ...validarCancion(c),
    id: validar.uuid(validar.objeto(c, "cancion").id),
  }));
  const comodines = todo.comodines.map((c) => ({
    ...validarComodin(c),
    id: validar.uuid(validar.objeto(c, "comodin").id),
  }));
  const traducciones = validar.mapaDeTextos(todo.traducciones, "traducciones");
  const borrador = todo.borrador === null ? null : validarBorrador(todo.borrador);

  await insertarComodinesNuevos(comodines);
  await insertarCancionesNuevas(canciones);
  await insertarTraduccionesNuevas(traducciones);
  if (borrador) await guardarBorradorSiVacio(borrador);
}
