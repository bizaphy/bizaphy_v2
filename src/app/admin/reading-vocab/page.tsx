import { requireAdminPage } from "@/server/auth/guards";
import { obtenerComodines } from "@/server/services/comodines";
import VocabTest from "./_components/VocabTest";

export default async function AdminReadingVocabPage() {
  await requireAdminPage();

  const comodines = await obtenerComodines();

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Reading-vocab test</h1>
        <p className="text-sm text-zinc-400">
          Repaso de las palabras comodín que anotaste en reading y karaoke,
          cada una dentro de la frase donde te costó.
        </p>
      </div>
      <VocabTest comodinesIniciales={comodines} />
    </main>
  );
}
