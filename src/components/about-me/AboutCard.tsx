"use client";

import Image from "next/image";
import { ReactNode, createContext, useContext, useState } from "react";
import TextScramble from "@/components/effects/TextScramble";

type AboutCardProps = {
  imageSrc: string;
  imageAlt?: string;
  summary: ReactNode;
  extra?: ReactNode;
  // Imagen que aparece a la derecha de la card al apretar un <AboutCardReveal>.
  // href opcional: la imagen se vuelve un link externo (pestaña nueva).
  revealImage?: { src: string; alt: string; href?: string };
};

// El disparador vive dentro de `extra`, que llega armado desde la página
// (server component). Por eso no se le puede pasar un onClick: se comparte
// el estado con un contexto.
const RevealContext = createContext<{
  revelado: boolean;
  alternar: () => void;
} | null>(null);

// Texto clickeable dentro de `extra` que muestra/oculta la revealImage.
export function AboutCardReveal({ children }: { children: ReactNode }) {
  const ctx = useContext(RevealContext);
  if (!ctx) return <>{children}</>;

  return (
    <button
      type="button"
      onClick={ctx.alternar}
      aria-pressed={ctx.revelado}
      className="cursor-pointer underline decoration-fuchsia-500/50 decoration-dotted underline-offset-4 transition hover:text-zinc-300 hover:decoration-fuchsia-400"
    >
      {children}
    </button>
  );
}

export default function AboutCard({
  imageSrc,
  imageAlt = "Profile picture",
  summary,
  extra,
  revealImage,
}: AboutCardProps) {
  const [revelado, setRevelado] = useState(false);

  const imagenRevelada = revealImage && (
    <Image
      src={revealImage.src}
      alt={revealImage.alt}
      width={128}
      height={128}
      className="h-32 w-32 drop-shadow-[0_0_10px_rgba(217,70,239,0.45)]"
    />
  );

  return (
    <RevealContext.Provider
      value={{ revelado, alternar: () => setRevelado((v) => !v) }}
    >
      <div className="flex flex-col items-center gap-6 rounded-xl bg-zinc-950/60 px-8 py-6 sm:flex-row sm:items-center sm:gap-8">
        {/* Con revealImage, foto e ícono usan columnas del mismo ancho (1/4)
            para que queden simétricos respecto al texto. */}
        <div
          className={`flex shrink-0 justify-center ${revealImage ? "sm:w-1/4" : "sm:w-1/3"}`}
        >
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-zinc-600">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="128px"
              className="object-cover filter-[grayscale(75%)]"
            />
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 text-center sm:flex-1 sm:text-left">
          <h2 className="text-xl font-bold text-zinc-100">
            <TextScramble text="@bout me" />
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">{summary}</p>
          {extra && (
            <p className="text-xs leading-relaxed text-zinc-500">{extra}</p>
          )}
        </div>

        {/* En desktop el hueco queda reservado siempre (sin saltos de layout)
            y solo cambia la opacidad; en mobile aparece debajo al revelarse. */}
        {revealImage && (
          <div
            aria-hidden={!revelado}
            className={`shrink-0 justify-center transition duration-500 sm:w-1/4 ${
              revelado
                ? "flex scale-100 opacity-100"
                : // pointer-events-none: oculta sigue ocupando espacio en desktop,
                  // y sin esto el link invisible seguiría recibiendo clics.
                  "pointer-events-none hidden scale-75 opacity-0 sm:flex"
            }`}
          >
            {revealImage.href ? (
              <a
                href={revealImage.href}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={revelado ? undefined : -1}
                title="Ver en Wikipedia"
                className="block rounded-full transition hover:scale-105"
              >
                {imagenRevelada}
              </a>
            ) : (
              imagenRevelada
            )}
          </div>
        )}
      </div>
    </RevealContext.Provider>
  );
}
