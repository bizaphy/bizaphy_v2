import { memo } from "react";
import KanjiStrokeOrder from "./KanjiStrokeOrder";
import KanjiRadicals from "./KanjiRadicals";
import type { KanjiEnListado } from "../db/queries";

type Props = {
  caracter: string;
  radicales: KanjiEnListado["kanjiRadicales"];
};

// Como esta construido el kanji: orden de trazos + radicales, uno al lado
// del otro. memo evita re-render cuando las props no cambian. Sin re-render
// el navegador no repinta el bloque, y la etiqueta vertical "ORDEN DE TRAZOS"
// no parpadea.
function KanjiStructure({ caracter, radicales }: Props) {
  return (
    // contain:paint aisla el painting de la seccion: cualquier repaint que
    // se dispare aca queda contenido, y cualquier repaint de afuera (tooltip
    // de una card, cambio de seleccionado) tampoco alcanza al label vertical.
    <section className="flex flex-wrap items-stretch gap-4 p-4 [contain:paint]">
      <KanjiStrokeOrder caracter={caracter} />
      <KanjiRadicals radicales={radicales} />
    </section>
  );
}

export default memo(KanjiStructure);
