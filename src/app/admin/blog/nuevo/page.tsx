import { requireAdminPage } from "@/lib/auth-guards";
import { crearPost } from "@/db/post-actions";
import PostForm from "../_components/PostForm";

export default async function NuevoPostPage() {
  await requireAdminPage();

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <h1 className="text-center text-2xl font-semibold">Nuevo post</h1>
      <PostForm accion={crearPost} />
    </main>
  );
}
