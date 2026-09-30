import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { post } from "./post-schema";

// ── PÚBLICAS: solo posts publicados ──

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

// Un post por slug (null si no existe o es borrador)
export async function obtenerPostPublicado(slug: string) {
  const [fila] = await db
    .select()
    .from(post)
    .where(and(eq(post.slug, slug), eq(post.publicado, true)))
    .limit(1);
  return fila ?? null;
}

// ── ADMIN: incluyen borradores. Usar solo en páginas con requireAdminPage() ──

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
