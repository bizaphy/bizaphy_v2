"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
};

// Miniatura clickeable que abre un lightbox a pantalla completa con la
// imagen ampliada. Usa portal a document.body para no verse afectado por
// z-index / overflow del contenedor padre. Cierre por ESC, click en el
// backdrop o boton X.
export default function KanjiImageZoom({ src, alt }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    // bloqueo de scroll de fondo mientras el modal esta abierto
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Ampliar: ${alt}`}
        className="block cursor-zoom-in transition hover:opacity-90"
      >
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          sizes="288px"
          className="block h-72 w-auto"
          unoptimized
        />
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          >
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-fuchsia-500/60 bg-black/70 text-fuchsia-300 transition hover:bg-fuchsia-500 hover:text-black"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* stopPropagation en la imagen para que hacer click sobre ella
                no dispare el onClick del backdrop y cierre el modal */}
            <Image
              src={src}
              alt={alt}
              width={0}
              height={0}
              sizes="90vw"
              onClick={(e) => e.stopPropagation()}
              className="h-auto max-h-[90vh] w-auto max-w-[90vw] cursor-default object-contain"
              unoptimized
            />
          </div>,
          document.body,
        )}
    </>
  );
}
