"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { assertAdmin } from "@/lib/auth-guards";
import { post } from "./post-schema";
import { crearSlug, type EstadoFormPost } from "./post-utils";

// ─── Leer y validar el formulario ───
// Devuelve los datos limpios o un error.
function leerFormulario(formData: FormData) {
  const valores = {
    titulo: String(formData.get("titulo") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    resumen: String(formData.get("resumen") ?? "").trim(),
    contenido: String(formData.get("contenido") ?? "").trim(),
    publicado: formData.get("publicado") === "on",
  };

  // En caso de SLUG vacio, se genera desde el título
  const slug = crearSlug(valores.slug || valores.titulo);

  // Validaciones
  if (!valores.titulo || valores.titulo.length > 160) {
    return {
      error: "El título es obligatorio (máx. 160 caracteres).",
      valores,
      datos: null,
    };
  }
  if (!slug) {
    return {
      error: "No se pudo generar el slug: escríbelo a mano.",
      valores,
      datos: null,
    };
  }
  if (!valores.contenido) {
    return {
      error: "El contenido no puede estar vacío.",
      valores,
      datos: null,
    };
  }

  // Todo válido: datos listos para la BD
  return {
    error: null,
    valores,
    datos: {
      titulo: valores.titulo,
      slug,
      resumen: valores.resumen || null,
      contenido: valores.contenido,
      publicado: valores.publicado,
    },
  };
}

// ─── Crear post ───
export async function crearPost(
  _estadoAnterior: EstadoFormPost,
  formData: FormData,
): Promise<EstadoFormPost> {
  // Permisos y validación
  await assertAdmin();

  const { error, valores, datos } = leerFormulario(formData);
  if (!datos) return { error, valores };

  // ¿Slug repetido?
  const repetido = await db
    .select({ id: post.id })
    .from(post)
    .where(eq(post.slug, datos.slug))
    .limit(1);

  if (repetido.length > 0) {
    return { error: `Ya existe un post con el slug "${datos.slug}".`, valores };
  }

  // Guardar
  await db.insert(post).values({
    ...datos,
    publicadoEn: datos.publicado ? new Date() : null,
  });

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
  // Permisos y validación
  await assertAdmin();

  const { error, valores, datos } = leerFormulario(formData);
  if (!datos) return { error, valores };

  // Post actual (existe + slug viejo)
  const [actual] = await db
    .select({ slug: post.slug, publicadoEn: post.publicadoEn })
    .from(post)
    .where(eq(post.id, id))
    .limit(1);

  if (!actual) {
    return { error: "Ese post ya no existe.", valores };
  }

  // ¿Slug repetido? (mismo slug, pero en OTRO post)
  const repetido = await db
    .select({ id: post.id })
    .from(post)
    .where(and(eq(post.slug, datos.slug), ne(post.id, id)))
    .limit(1);

  if (repetido.length > 0) {
    return {
      error: `Ya existe otro post con el slug "${datos.slug}".`,
      valores,
    };
  }

  // Guardar
  await db
    .update(post)
    .set({
      ...datos,
      // La primera fecha de publicación se conserva
      publicadoEn: actual.publicadoEn ?? (datos.publicado ? new Date() : null),
    })
    .where(eq(post.id, id));

  // Refrescar caché y volver al listado
  revalidatePath("/blog");
  revalidatePath(`/blog/${actual.slug}`); // la URL vieja, por si se cambio el slug
  revalidatePath(`/blog/${datos.slug}`);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}
