import KanjiCardList from "./components/KanjiCardList";
import KanjiDisplay from "./components/KanjiDisplay";
import KanjiLevel from "./components/KanjiLevel";
import KanjiSearch from "./components/KanjiSearch";

export default function AllAboutKanjis() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold tracking-tight">All About Kanjis</h1>
      <KanjiLevel />
      <KanjiSearch />
      <KanjiDisplay
        caracter="一"
        significado="uno"
        onyomi="イチ、イツ"
        kunyomi="ひと・つ"
      />
      <KanjiCardList />
    </div>
  );
}
