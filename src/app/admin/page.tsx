import { requireAdminPage } from "@/lib/auth-guards";
import Link from "next/link";

// ─── Estilos compartidos ───
const estiloTarjeta =
  "flex flex-col gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-fuchsia-500";

export default async function AdminPage() {
  const session = await requireAdminPage();

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-10">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Hola, {session.user.name}</h1>
        <p className="text-zinc-400">Panel de administración.</p>
      </div>

      {/* Accesos a cada sección */}
      <nav className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/planes" className={estiloTarjeta}>
          <span className="font-semibold">Planes futuros</span>
          <span className="text-sm text-zinc-400">
            Ideas y tareas pendientes
          </span>
        </Link>
        <Link href="/admin/blog" className={estiloTarjeta}>
          <span className="font-semibold">Blog</span>
          <span className="text-sm text-zinc-400">Crear y editar posts</span>
        </Link>
      </nav>
    </main>
  );
}
