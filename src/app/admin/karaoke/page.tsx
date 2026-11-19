import { requireAdminPage } from "@/server/auth/guards";
import KaraokeEditor from "./_components/KaraokeEditor";

export default async function AdminKaraokePage() {
  await requireAdminPage();

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Karaoke</h1>
        <p className="text-sm text-zinc-400">
          Reading con música: pega la letra, carga el video desde tu PC, marca
          cuándo sale cada frase y tradúcela mientras suena.
        </p>
      </div>
      <KaraokeEditor />
    </main>
  );
}
