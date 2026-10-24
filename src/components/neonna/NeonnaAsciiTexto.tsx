"use client";

//Opcion "texto": reproduce los fotogramas ASCII que genero
//scripts/neonna-ascii.ts (npm run neonna:ascii). No calcula nada en el
//navegador: solo cambia de fotograma.

import { useEffect, useState } from "react";
import AsciiPantalla from "./AsciiPantalla";
import type { FotogramaAscii } from "@/lib/neonna-ascii";

type Datos = { fps: number; frames: FotogramaAscii[] };

const URL_DATOS = "/images/neonna/ascii/neonna-ascii.json";

export default function NeonnaAsciiTexto({ className = "" }: { className?: string }) {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [frame, setFrame] = useState(0);

  //el JSON vive en public/ y se pide aparte: no engorda el bundle
  useEffect(() => {
    let vivo = true;
    fetch(URL_DATOS)
      .then((r) => r.json())
      .then((d: Datos) => vivo && setDatos(d))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    if (!datos) return;
    //con movimiento reducido se queda en el primer fotograma
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % datos.frames.length), 1000 / datos.fps);
    return () => clearInterval(id);
  }, [datos]);

  return (
    <div role="img" aria-label="Neonna en arte ASCII" className={className}>
      <AsciiPantalla fotograma={datos?.frames[frame] ?? null} alto={300} />
    </div>
  );
}
