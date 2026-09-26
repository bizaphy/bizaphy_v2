import { requireAdminPage } from "@/lib/auth-guards";

export default async function AdminPage() {
  const session = await requireAdminPage();

  return (
    <main className="p-6">
      <h1>Hola, {session.user.name}</h1>
      <p>Panel de administración.</p>
    </main>
  );
}
