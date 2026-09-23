"use client";

import { memo, useState } from "react";
import KanjiImageZoom from "./KanjiImageZoom";

type Props = {
  caracter: string;
};

// Los SVG de KanjiVG viven en /public/svg/kanji y se nombran con el code
// point del caracter en hex, 5 digitos y minusculas (一 -> 04e00.svg).
function rutaSvgKanji(caracter: string) {
  const codigo = caracter.codePointAt(0)!.toString(16).padStart(5, "0");
  return `/svg/kanji/${codigo}.svg`;
}

// memo evita re-render cuando el caracter no cambia. Sin re-render el
// navegador no repinta el bloque, y la etiqueta vertical "ORDEN DE TRAZOS"
// no parpadea.
function KanjiStrokeOrder({ caracter }: Props) {
  const src = rutaSvgKanji(caracter);

  // Guardamos la ruta que fallo (no un boolean) para que el error se
  // "resetee" solo al cambiar de kanji, sin necesidad de un useEffect.
  const [srcFallido, setSrcFallido] = useState<string | null>(null);
  const sinImagen = srcFallido === src;

  return (
    <div className="flex overflow-hidden rounded-md border border-fuchsia-500/40 bg-zinc-900/60 shadow-[0_0_10px_rgba(217,70,239,0.25)]">
      <div className="flex items-center justify-center border-r border-zinc-700 px-2">
        <span className="rotate-180 font-mono text-xs tracking-widest text-fuchsia-300 [writing-mode:vertical-rl]">
          ORDEN DE TRAZOS
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-center overflow-hidden rounded border border-dashed border-zinc-700 bg-zinc-900/40">
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
