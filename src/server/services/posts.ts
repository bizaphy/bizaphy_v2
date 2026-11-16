import "server-only";
import { cache } from "react";
import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/server/db";
import { post } from "@/server/db/schema";
import type { ValoresFormPost } from "@/shared/types/post";

// ── LECTURAS PÚBLICAS: solo posts publicados ──

// Listado del blog (sin contenido, más recientes primero)
export async function obtenerPostsPublicados() {
  return db
    .select({
      slug: post.slug,
      titulo: post.titulo,
      resumen: post.resumen,
      publicadoEn: post.publicadoEn,
    })
    .from(post)
    .where(eq(post.publicado, true))
    .orderBy(desc(post.publicadoEn));
}

// Un post por slug (null si no existe o es borrador).
// cache(): generateMetadata y la pagina la llaman en la misma peticion y
// asi la consulta a la base se hace una sola vez
export const obtenerPostPublicado = cache(async (slug: string) => {
  const [fila] = await db
    .select()
    .from(post)
    .where(and(eq(post.slug, slug), eq(post.publicado, true)))
    .limit(1);
  return fila ?? null;
});

// ── LECTURAS ADMIN: incluyen borradores. Usar solo tras requireAdminPage() ──

// Listado del admin (últimos editados primero)
export async function obtenerTodosLosPosts() {
  return db
    .select({
      id: post.id,
      titulo: post.titulo,
      slug: post.slug,
      publicado: post.publicado,
      actualizadoEn: post.actualizadoEn,
    })
    .from(post)
    .orderBy(desc(post.actualizadoEn));
}

// Un post por id, para el formulario de edición
export async function obtenerPostPorId(id: number) {
  const [fila] = await db.select().from(post).where(eq(post.id, id)).limit(1);
  return fila ?? null;
}

// ── LÓGICA DE NEGOCIO ──

// "¡Hola, Mañana!" → "hola-manana"
export function crearSlug(texto: string) {
  return texto
    .normalize("NFD") // separa "ñ" en "n" + "~"
    .replace(/[̀-ͯ]/g, "") // borra los acentos sueltos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // todo lo demás pasa a ser "-"
    .replace(/^-+|-+$/g, ""); // sin "-" al inicio ni al final
}

type DatosPost = {
  titulo: string;
  slug: string;
  resumen: string | null;
  contenido: string;
  publicado: boolean;
};

type ResultadoValidacion =
  | { error: string; valores: ValoresFormPost; datos: null }
  | { error: null; valores: ValoresFormPost; datos: DatosPost };

// Lee y valida el formulario. Devuelve los datos limpios o un error.
export function validarFormularioPost(formData: FormData): ResultadoValidacion {
  const valores: ValoresFormPost = {
    titulo: String(formData.get("titulo") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    resumen: String(formData.get("resumen") ?? "").trim(),
    contenido: String(formData.get("contenido") ?? "").trim(),
    publicado: formData.get("publicado") === "on",
  };

  // En caso de SLUG vacio, se genera desde el título
  const slug = crearSlug(valores.slug || valores.titulo);

  if (!valores.titulo || valores.titulo.length > 160) {
    return { error: "El título es obligatorio (máx. 160 caracteres).", valores, datos: null };
  }
  if (!slug) {
    return { error: "No se pudo generar el slug: escríbelo a mano.", valores, datos: null };
  }
  if (!valores.contenido) {
    return { error: "El contenido no puede estar vacío.", valores, datos: null };
  }

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

// ¿Otro post ya usa este slug? (excluirId: el post que se está editando)
export async function slugEnUso(slug: string, excluirId?: number) {
  const filtro =
    excluirId === undefined
      ? eq(post.slug, slug)
      : and(eq(post.slug, slug), ne(post.id, excluirId));
  const repetido = await db.select({ id: post.id }).from(post).where(filtro).limit(1);
  return repetido.length > 0;
}

// ── ESCRITURAS ──

export async function insertarPost(datos: DatosPost) {
  await db.insert(post).values({
    ...datos,
    publicadoEn: datos.publicado ? new Date() : null,
  });
}

// Slug y fecha de publicación actuales (null si el post no existe)
export async function obtenerEstadoPost(id: number) {
  const [actual] = await db
    .select({ slug: post.slug, publicadoEn: post.publicadoEn })
    .from(post)
    .where(eq(post.id, id))
    .limit(1);
  return actual ?? null;
}

export async function actualizarPost(id: number, datos: DatosPost, publicadoEnActual: Date | null) {
  await db
    .update(post)
    .set({
      ...datos,
      // La primera fecha de publicación se conserva
      publicadoEn: publicadoEnActual ?? (datos.publicado ? new Date() : null),
    })
    .where(eq(post.id, id));
}
