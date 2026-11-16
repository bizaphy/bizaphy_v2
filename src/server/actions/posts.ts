"use server";
// Sin "server-only": PostForm (client) recibe estas acciones y Next las llama
// por POST. "use server" ya garantiza que el código no viaja al navegador.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/server/auth/guards";
import {
  actualizarPost,
  insertarPost,
  obtenerEstadoPost,
  slugEnUso,
  validarFormularioPost,
} from "@/server/services/posts";
import type { EstadoFormPost } from "@/types/post";

// ─── Crear post ───
export async function crearPost(
  _estadoAnterior: EstadoFormPost,
  formData: FormData,
): Promise<EstadoFormPost> {
  await assertAdmin();

  const { error, valores, datos } = validarFormularioPost(formData);
  if (!datos) return { error, valores };

  if (await slugEnUso(datos.slug)) {
    return { error: `Ya existe un post con el slug "${datos.slug}".`, valores };
  }

  await insertarPost(datos);

  // Refrescar caché y volver al listado
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

// ─── Editar post ───
export async function editarPost(
  id: number,
  _estadoAnterior: EstadoFormPost,
  formData: FormData,
): Promise<EstadoFormPost> {
  await assertAdmin();

  const { error, valores, datos } = validarFormularioPost(formData);
  if (!datos) return { error, valores };

  // Post actual (existe + slug viejo)
  const actual = await obtenerEstadoPost(id);
  if (!actual) {
    return { error: "Ese post ya no existe.", valores };
  }

  // ¿Slug repetido? (mismo slug, pero en OTRO post)
  if (await slugEnUso(datos.slug, id)) {
    return { error: `Ya existe otro post con el slug "${datos.slug}".`, valores };
  }

  await actualizarPost(id, datos, actual.publicadoEn);

  // Refrescar caché y volver al listado
  revalidatePath("/blog");
  revalidatePath(`/blog/${actual.slug}`); // la URL vieja, por si se cambio el slug
  revalidatePath(`/blog/${datos.slug}`);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}
