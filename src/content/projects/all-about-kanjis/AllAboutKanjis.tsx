import KanjiExplorer from "./components/explorador/KanjiExplorer";
import KanjiTrainer from "./components/trainer/KanjiTrainer";
import { listarKanjisPorNivel } from "./db/queries";
import Tabs from "@/components/ui/Tabs";
import Info, { infoLinkClass } from "@/components/ui/Info";
import BackToTopDots from "@/components/ui/BackToTopDots";

export default async function AllAboutKanjis() {
  const [n5, n4, n3] = await Promise.all([
    listarKanjisPorNivel("n5"),
    listarKanjisPorNivel("n4"),
    listarKanjisPorNivel("n3"),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 py-4 sm:p-4">
      <Tabs
        ariaLabel="Secciones de All About Kanjis"
        pestanas={[
          {
            id: "explorador",
            label: "Explorador",
            contenido: (
              <KanjiExplorer kanjisPorNivel={{ N5: n5, N4: n4, N3: n3 }} />
            ),
            className: "flex flex-col gap-6",
          },
          {
            id: "trainer",
            label: "KanjiTrainer",
            contenido: <KanjiTrainer />,
          },
        ]}
      />
      {/* Atribucion requerida por la licencia CC BY-SA 3.0 de KanjiVG,
          de donde vienen los SVG de orden de trazos (/public/svg/kanji).
          mt-42 va aqui y no en cada pestana: asi la separacion es la misma
          en todas las pestanas. */}
      <Info className="mt-42">
        Los diagramas de orden de trazos provienen de{" "}
        <a
          href="https://kanjivg.tagaini.net"
          target="_blank"
          rel="noopener noreferrer"
          className={infoLinkClass}
        >
          KanjiVG
        </a>
        , © Ulrich Apel, bajo licencia{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/3.0/"
          target="_blank"
          rel="noopener noreferrer"
          className={infoLinkClass}
        >
          CC BY-SA 3.0
        </a>
        . Se muestran con los colores invertidos. Las imágenes de celebridades
        provienen de{" "}
        <a
          href="https://ja.wikipedia.org"
          target="_blank"
          rel="noopener noreferrer"
          className={infoLinkClass}
        >
          Wikipedia en japonés
        </a>{" "}
        (licencias libres), y las de anime, manga y personajes de{" "}
        <a
          href="https://anilist.co"
          target="_blank"
          rel="noopener noreferrer"
          className={infoLinkClass}
        >
          AniList
        </a>
        ; haz clic en cada imagen para ver su fuente.
      </Info>
      <BackToTopDots />
    </div>
  );
}
