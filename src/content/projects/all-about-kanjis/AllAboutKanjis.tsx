import KanjisExplorador from "./components/KanjisExplorador";
import { listarKanjisPorNivel } from "./db/queries";
import Info, { infoLinkClass } from "@/components/ui/Info";
import BackToTopDots from "@/components/ui/BackToTopDots";

export default async function AllAboutKanjis() {
  const [n5, n4, n3] = await Promise.all([
    listarKanjisPorNivel("n5"),
    listarKanjisPorNivel("n4"),
    listarKanjisPorNivel("n3"),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        All About Kanjis
      </h1>
      <KanjisExplorador kanjisPorNivel={{ N5: n5, N4: n4, N3: n3 }} />
      {/* Atribucion requerida por la licencia CC BY-SA 3.0 de KanjiVG,
          de donde vienen los SVG de orden de trazos (/public/svg/kanji). */}
      <Info>
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
