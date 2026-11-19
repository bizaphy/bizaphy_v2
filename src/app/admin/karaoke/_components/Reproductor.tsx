"use client";

import { type ReactNode, type RefObject, useRef } from "react";
import { estiloBotonChico } from "../../_compartido/frases";

// ─── Video con la letra encima ───
// El video sale de un archivo del PC (URL temporal del navegador), asi no
// pasa por YouTube ni se sube a ningun lado. Tambien sirve un .mp3: se ve el
// fondo negro con la letra.
// `@container` + tamaños en cqw: la letra crece con el video, tambien en
// pantalla completa.
export default function Reproductor({
  url,
  videoRef,
  letra,
  compacto,
}: {
  url: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  letra: ReactNode;
  compacto: boolean;
}) {
  const contenedorRef = useRef<HTMLDivElement>(null);

  const pantallaCompleta = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else contenedorRef.current?.requestFullscreen();
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={contenedorRef}
        className={`@container relative w-full overflow-hidden rounded-xl border border-zinc-800 bg-black ${
          compacto ? "aspect-video max-h-[32vh]" : "aspect-video"
        }`}
      >
        {/* biome-ignore lint/a11y/useMediaCaption: la letra es el subtitulo */}
        <video
          ref={videoRef}
          src={url}
          controls
          className="h-full w-full object-contain"
        />
        {/* Encima del video pero sin tapar los controles nativos */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[12%] flex justify-center px-[4cqw]">
          {letra}
        </div>
      </div>
      {!compacto && (
        <button
          type="button"
          className={`${estiloBotonChico} self-end`}
          onClick={pantallaCompleta}
        >
          Pantalla completa
        </button>
      )}
    </div>
  );
}
