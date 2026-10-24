"use client";

import { useLayoutEffect, useRef } from "react";
import { COLS, ROWS, PALETA, filasConColor, type FotogramaAscii } from "@/lib/neonna-ascii";

//Dibuja un fotograma ASCII de Neonna como texto coloreado.
//
//El ancho de cada letra depende de la fuente monoespaciada y del redondeo
//del navegador (a 5px Chrome da 0.75em en vez de ~0.6em y Neonna sale
//estirada). Por eso el texto se dibuja a 10px y despues se escala con
//transform hasta llenar la caja, que tiene la proporcion real del dibujo.

const FUENTE_PX = 10;

export default function AsciiPantalla({
  fotograma,
  cols = COLS,
  rows = ROWS,
  proporcion = 260 / 324,
  alto,
  paleta = PALETA,
  fondo = "#000",
  className = "",
}: {
  fotograma: FotogramaAscii | null;
  cols?: number;
  rows?: number;
  //ancho / alto del dibujo original
  proporcion?: number;
  //alto fijo en px. Sin alto, ocupa todo el ancho del contenedor
  alto?: number;
  //colores de las letras (PALETA o PALETA_CLARA) y fondo de la caja
  paleta?: string[];
  fondo?: string;
  className?: string;
}) {
  const cajaRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  //se mide antes de pintar (offsetWidth no se ve afectado por el transform).
  //Corre en cada fotograma, asi tambien sigue los cambios de ancho de la caja
  useLayoutEffect(() => {
    const caja = cajaRef.current;
    const pre = preRef.current;
    if (!caja || !pre || !fotograma) return;
    const sx = caja.clientWidth / pre.offsetWidth;
    const sy = caja.clientHeight / (rows * FUENTE_PX);
    pre.style.transform = `scale(${sx}, ${sy})`;
  });

  return (
    <div
      ref={cajaRef}
      className={`relative overflow-hidden ${className}`}
      //en linea: en modo claro bg-black pasa a blanco y las letras no se verian
      style={{
        background: fondo,
        aspectRatio: proporcion,
        ...(alto ? { height: alto } : { width: "100%" }),
      }}
    >
      <pre
        ref={preRef}
        aria-hidden="true"
        className="absolute top-0 left-0 m-0 select-none font-mono"
        //el origen va en linea: el escalado depende de el
        style={{ fontSize: FUENTE_PX, lineHeight: `${FUENTE_PX}px`, transformOrigin: "0 0" }}
      >
        {fotograma &&
          filasConColor(fotograma, cols, paleta).map((tramos, y) => (
            <span key={y}>
              {tramos.map(({ texto, color }, i) => (
                <span key={i} style={{ color }}>
                  {texto}
                </span>
              ))}
              {"\n"}
            </span>
          ))}
      </pre>
    </div>
  );
}
