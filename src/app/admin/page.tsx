import { requireAdminPage } from "@/lib/auth-guards";
import Link from "next/link";

export default async function AdminPage() {
  const session = await requireAdminPage();

  return (
    <main className="p-6">
      <h1>Hola, {session.user.name}</h1>
      <p>Panel de administración.</p>
      <nav className="mt-4 flex gap-4">
        <Link href="/admin/planes">Planes futuros</Link>
        <Link href="/admin/blog">Blog</Link>
      </nav>
    </main>
  );
}
