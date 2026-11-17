import { notFound } from "next/navigation";
import { requireAdminPage } from "@/server/auth/guards";
import { obtenerPostPorId } from "@/server/services/posts";
import { editarPost } from "@/server/actions/posts";
import PostForm from "../../_components/PostForm";

export default async function EditarPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();

  const { id } = await params;
  const post = await obtenerPostPorId(Number(id));
  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <h1 className="text-center text-2xl font-semibold">
        Editar: {post.titulo}
      </h1>
      <PostForm accion={editarPost.bind(null, post.id)} post={post} />
    </main>
  );
}
