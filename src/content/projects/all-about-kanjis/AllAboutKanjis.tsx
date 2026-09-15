import KanjiCardList from "./components/KanjiCardList";
import KanjiDisplay from "./components/KanjiDisplay";
import KanjiDisplayImgs from "./components/KanjiDisplayImgs";
import KanjiLevel from "./components/KanjiLevel";
import KanjiSearch from "./components/KanjiSearch";

export default function AllAboutKanjis() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold tracking-tight">All About Kanjis</h1>
      <KanjiLevel />
      <KanjiSearch />
      <KanjiCardList />
      {/* Fila responsive: si caben, KanjiDisplay + las dos imagenes van todo en horizontal.
          Si no, KanjiDisplayImgs (bloque entero, con sus dos imagenes horizontales)
          se baja a la fila siguiente y KanjiDisplay queda solo arriba. */}
      <div className="flex flex-wrap items-start gap-2">
        <KanjiDisplay
          caracter="一"
          significado="uno"
          onyomi="イチ、イツ"
          kunyomi="ひと・つ"
          numeroTrazos={1}
        />
        <KanjiDisplayImgs />
      </div>
    </div>
  );
}
