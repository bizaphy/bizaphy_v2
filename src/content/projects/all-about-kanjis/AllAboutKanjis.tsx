import KanjisExplorador from "./components/KanjisExplorador";
import { listarKanjisPorNivel } from "./db/queries";

export default async function AllAboutKanjis() {
  const [n5, n4] = await Promise.all([
    listarKanjisPorNivel("n5"),
    listarKanjisPorNivel("n4"),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold tracking-tight">All About Kanjis</h1>
      <KanjisExplorador kanjisPorNivel={{ N5: n5, N4: n4 }} />
    </div>
  );
}
