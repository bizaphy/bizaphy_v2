import KanjisExplorador from "./components/KanjisExplorador";
import { listarKanjisPorNivel } from "./db/queries";

export default async function AllAboutKanjis() {
  const [n5, n4, n3] = await Promise.all([
    listarKanjisPorNivel("n5"),
    listarKanjisPorNivel("n4"),
    listarKanjisPorNivel("n3"),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold tracking-tight">All About Kanjis</h1>
      <KanjisExplorador kanjisPorNivel={{ N5: n5, N4: n4, N3: n3 }} />
    </div>
  );
}
