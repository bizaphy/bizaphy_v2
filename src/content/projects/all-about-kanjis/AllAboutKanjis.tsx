import KanjiLevel from "./components/KanjiLevel";

export default function AllAboutKanjis() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold tracking-tight">All About Kanjis</h1>
      <KanjiLevel />
    </div>
  );
}
