import { requireAdminPage } from "@/server/auth/guards";
import { obtenerComodines } from "@/server/services/comodines";
import {
  obtenerBorrador,
  obtenerTraducciones,
} from "@/server/services/reading";
import ReadingEditor from "./_components/ReadingEditor";

export default async function AdminReadingPage() {
  await requireAdminPage();

  const [borrador, traducciones, comodines] = await Promise.all([
    obtenerBorrador(),
    obtenerTraducciones(),
    obtenerComodines(),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Reading</h1>
        <p className="text-sm text-zinc-400">
          Plantilla: sube un texto, sepáralo en filas, tradúcelo y exporta la
          traducción para revisarla.
        </p>
      </div>
      <ReadingEditor
        borradorInicial={borrador}
        traduccionesIniciales={traducciones}
        comodinesIniciales={comodines}
      />
    </main>
  );
}
