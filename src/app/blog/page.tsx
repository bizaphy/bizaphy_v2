import Link from "next/link";
import TextScramble from "@/components/effects/TextScramble";
import { obtenerPostsPublicados } from "@/db/post-queries";

// "2026-09-30" → "30 SEP 2026"
function formatearFecha(fecha: Date) {
  return fecha
    .toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(".", "")
    .toUpperCase();
}

export default async function BlogPage() {
  // Solo los publicados, más recientes primero
  const posts = await obtenerPostsPublicados();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      {/* Encabezado tipo consola */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">
          <TextScramble text="Blog" />
        </h1>
        <p className="font-mono text-sm text-zinc-400">
          <span className="text-fuchsia-500">~/blog</span> $ ls -t{" "}
          <span className="text-zinc-600">
            ({posts.length} {posts.length === 1 ? "entrada" : "entradas"})
          </span>
          <span className="cursor-consola text-violet-300">_</span>
        </p>
      </header>

      {posts.length === 0 && (
        <p className="mt-12 font-mono text-sm text-zinc-500">
          // Todavía no hay posts.
        </p>
      )}

      {/* Línea de tiempo: borde izquierdo = el "cable" */}
      <ol className="relative mt-12 space-y-10 border-l border-violet-300/20 pl-8">
        {posts.map((p, i) => (
          <li key={p.slug} className="relative">
            {/* Punto en la línea (el más reciente parpadea) */}
            <span
              className={`absolute top-6 -left-9.25 size-2.5 rounded-full ${
                i === 0 ? "neon-led bg-fuchsia-400" : "bg-violet-300/40"
              }`}
            />

            <Link href={`/blog/${p.slug}`} className="group block">
              <article className="rounded-xl border border-violet-300/20 bg-zinc-950/60 p-5 transition duration-300 group-hover:translate-x-1 group-hover:border-violet-300 group-hover:shadow-[0_0_24px_rgba(196,181,253,0.3)]">
                {/* Meta: número y fecha */}
                <div className="flex items-center gap-3 font-mono text-xs tracking-widest">
                  <span className="text-fuchsia-500">
                    #{String(posts.length - i).padStart(2, "0")}
                  </span>
                  {p.publicadoEn && (
                    <time
                      dateTime={p.publicadoEn.toISOString()}
                      className="text-zinc-500"
                    >
                      {formatearFecha(p.publicadoEn)}
                    </time>
                  )}
                </div>

                <h2 className="mt-2 text-xl font-bold tracking-wide text-white transition group-hover:text-violet-200">
                  {p.titulo}
                </h2>

                {p.resumen && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                    {p.resumen}
                  </p>
                )}

                <span className="mt-4 inline-block font-mono text-xs tracking-widest text-fuchsia-500 transition group-hover:text-fuchsia-300">
                  [ LEER ]
                </span>
              </article>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
