import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { obtenerPostPublicado } from "@/db/post-queries";

// En Next 15+ params es una Promise
type Props = { params: Promise<{ slug: string }> };

// Titulo y resumen del post para la pestaña y para OpenGraph.
// obtenerPostPublicado esta envuelta en cache(): la consulta se hace una sola vez
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post = await obtenerPostPublicado(slug);
  if (!post) return { title: "Post no encontrado" };

  //un openGraph propio reemplaza entero al del layout: se traen del padre
  //la imagen, el nombre del sitio y el idioma para no perderlos
  const og = (await parent).openGraph;

  return {
    title: post.titulo,
    description: post.resumen ?? undefined,
    openGraph: {
      images: og?.images,
      siteName: og?.siteName,
      locale: og?.locale,
      type: "article",
      publishedTime: post.publicadoEn?.toISOString(),
    },
  };
}

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
