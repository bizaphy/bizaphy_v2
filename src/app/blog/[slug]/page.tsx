import { notFound } from "next/navigation";
import { obtenerPostPublicado } from "@/db/post-queries";

// En Next 15+ params es una Promise
type Props = { params: Promise<{ slug: string }> };

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await obtenerPostPublicado(slug);

  // No existe o es borrador → 404
  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-10">
      <h1 className="text-3xl font-semibold">{post.titulo}</h1>
      {post.publicadoEn && (
        <time className="text-sm text-zinc-400">
          {post.publicadoEn.toLocaleDateString("es-CL")}
        </time>
      )}
      {/* whitespace-pre-line respeta los saltos de línea del textarea */}
      <article className="whitespace-pre-line leading-relaxed text-zinc-200">
        {post.contenido}
      </article>
    </main>
  );
}
