import Link from "next/link";
import { requireAdminPage } from "@/lib/auth-guards";
import { obtenerTodosLosPosts } from "@/db/post-queries";

// ─── Estilos compartidos ───
const estiloBotonChico =
  "rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 transition hover:border-fuchsia-500 hover:text-white";

export default async function AdminBlogPage() {
  await requireAdminPage();

  const posts = await obtenerTodosLosPosts();

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog</h1>
        <Link
          href="/admin/blog/nuevo"
          className="rounded-md bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-fuchsia-500"
        >
          + Nuevo post
        </Link>
      </div>

      {/* Lista de posts */}
      <ul className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        {posts.length === 0 && (
          <li className="py-6 text-center text-sm text-zinc-400">
            Todavía no hay posts.
          </li>
        )}
        {posts.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 p-3"
          >
            <span className="shrink-0 text-xs text-zinc-400">
              {p.publicado ? "🟢" : "⚪ Borrador"}
            </span>
            <strong className="min-w-0 flex-1 truncate">{p.titulo}</strong>
            <div className="flex shrink-0 gap-2">
              <Link
                href={`/admin/blog/${p.id}/editar`}
                className={estiloBotonChico}
              >
                Editar
              </Link>
              {p.publicado && (
                <Link href={`/blog/${p.slug}`} className={estiloBotonChico}>
                  Ver
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
