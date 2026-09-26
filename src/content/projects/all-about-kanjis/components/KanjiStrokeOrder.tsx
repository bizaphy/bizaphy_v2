"use client";

import { memo, useState } from "react";
import KanjiImageZoom from "./KanjiImageZoom";
import type { KanjiEnListado } from "../db/queries";

type Props = {
  caracter: string;
  nivel: KanjiEnListado["nivel"];
};

// Los SVG de KanjiVG viven en /public/svg/kanji/<nivel> (n5, n4, n3; el
// resto de KanjiVG en others/) y se nombran con el code point del caracter
// en hex, 5 digitos y minusculas (一 -> n5/04e00.svg).
function rutaSvgKanji(caracter: string, nivel: string) {
  const codigo = caracter.codePointAt(0)!.toString(16).padStart(5, "0");
  return `/svg/kanji/${nivel}/${codigo}.svg`;
}

// memo evita re-render cuando el caracter no cambia: sin re-render el
// navegador no repinta el bloque.
function KanjiStrokeOrder({ caracter, nivel }: Props) {
  const src = rutaSvgKanji(caracter, nivel);

  // Guardamos la ruta que fallo (no un boolean) para que el error se "resetee" solo al cambiar de kanji
  const [srcFallido, setSrcFallido] = useState<string | null>(null);
  const sinImagen = srcFallido === src;

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-zinc-700 bg-zinc-900/60">
      <div className="border-b border-zinc-700 px-3 py-2 font-mono text-xs tracking-widest text-violet-300">
        ORDEN DE TRAZOS
      </div>
      <div className="p-3">
        <div className="flex items-center justify-center overflow-hidden rounded">
          {sinImagen ? (
            <div className="flex size-72 items-center justify-center lg:size-80">
              <span className="font-mono text-[10px] tracking-wider text-zinc-600">
                sin imagen
              </span>
            </div>
          ) : (
            // invert: los trazos de KanjiVG son negros sobre transparente,
            // invisibles sobre el fondo oscuro.
            <KanjiImageZoom
              src={src}
              alt={`Orden de trazos de ${caracter}`}
              imgClassName="invert"
              vectorial
              onError={() => setSrcFallido(src)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(KanjiStrokeOrder);
