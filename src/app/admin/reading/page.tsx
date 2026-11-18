import { requireAdminPage } from "@/server/auth/guards";
import ReadingEditor from "./_components/ReadingEditor";

export default async function AdminReadingPage() {
  await requireAdminPage();

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Reading</h1>
        <p className="text-sm text-zinc-400">
          Plantilla: sube un texto, sepáralo en filas, tradúcelo y exporta la
          traducción para revisarla.
        </p>
      </div>
      <ReadingEditor />
    </main>
  );
}
