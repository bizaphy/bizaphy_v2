"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import TextScramble from "@/components/effects/TextScramble";
import { GITHUB_URL, LINKEDIN_URL } from "@/components/about-me/SocialLinks";

//secciones del indice. El id tiene que coincidir con el <section id> de la pagina
const SECCIONES = [
  { id: "idiomas", archivo: "idiomas.md" },
  { id: "certificaciones", archivo: "certificaciones.md" },
  { id: "educacion", archivo: "educacion.md" },
  { id: "skills", archivo: "skills.json" },
  { id: "hobbies", archivo: "hobbies/" },
  { id: "setup", archivo: ".setup" },
];

const N = ({ children }: { children: React.ReactNode }) => (
  <span className="font-bold text-purple-400 transition group-hover:text-purple-300">
    {children}
  </span>
);

//Barra lateral de about-me: ventana de terminal con foto, @bout me y un
//indice tipo `tree` que marca la seccion visible.
export default function AboutSidebar() {
  const [activa, setActiva] = useState(SECCIONES[0].id);
  //al apretar el animal favorito, la foto se cambia por el cachalote
  const [cachalote, setCachalote] = useState(false);
  //seccion elegida en el indice: se respeta durante el salto, aunque la
  //pagina no alcance a subirla hasta arriba (las ultimas) o vaya lado a lado
  const elegida = useRef<string | null>(null);

  //activa = la seccion cuyo borde superior paso mas abajo de los 100px de
  //arriba. (Con IntersectionObserver las secciones cortas, como hobbies,
  //quedaban saltadas por la siguiente.) Si dos empatan (idiomas y educacion
  //van lado a lado en xl) gana la primera. Al llegar al fondo, la ultima.
  useEffect(() => {
    const LIMITE = 100;
    const actualizar = () => {
      if (elegida.current) return;
      const alFondo =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      let actual = SECCIONES[0].id;
      let mejorTop = -Infinity;
      for (const { id } of SECCIONES) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= LIMITE && top > mejorTop + 1) {
          actual = id;
          mejorTop = top;
        }
      }
      setActiva(alFondo ? SECCIONES[SECCIONES.length - 1].id : actual);
    };
    actualizar();
    window.addEventListener("scroll", actualizar, { passive: true });
    window.addEventListener("resize", actualizar);
    return () => {
      window.removeEventListener("scroll", actualizar);
      window.removeEventListener("resize", actualizar);
    };
  }, []);

  return (
    <aside className="overflow-hidden rounded-xl border border-fuchsia-500/50 bg-zinc-950/60 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:w-72 lg:shrink-0 lg:overflow-y-auto">
      {/* barra de titulo de la "ventana" */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 bg-zinc-900 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="ml-auto font-mono text-[11px] text-zinc-500">
          ~/about-me
        </span>
      </div>

      {/* perfil */}
      <div className="flex flex-col gap-3 border-b border-zinc-800 p-5">
        <div className="relative mb-1 h-32 w-32 self-center overflow-hidden rounded-full border-2 border-zinc-600 bg-zinc-900">
          {cachalote ? (
            <a
              href="https://es.wikipedia.org/wiki/Cachalote"
              target="_blank"
              rel="noopener noreferrer"
              title="Ver en Wikipedia"
              className="flex h-full w-full items-center justify-center p-3"
            >
              <Image
                src="/cachalote-plano.svg"
                alt="Cachalote"
                width={104}
                height={104}
              />
            </a>
          ) : (
            <Image
              src="/images/profile/bizaphy.webp"
              alt="Profile picture"
              fill
              sizes="128px"
              className="object-cover filter-[grayscale(75%)]"
            />
          )}
        </div>
        <p className="font-mono text-xs">
          <span className="text-fuchsia-400">$</span> whoami
        </p>
        <h1 className="text-2xl font-bold text-zinc-100">
          <TextScramble text="@bout me" />
        </h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          <N>B</N>enjamin <N>I</N>gnacio <N>Z</N>uniga <N>A</N>vila.
        </p>
        <p className="text-xs leading-relaxed text-zinc-500">
          Animal favorito:{" "}
          <button
            type="button"
            onClick={() => setCachalote((v) => !v)}
            aria-pressed={cachalote}
            className="group cursor-pointer transition hover:text-zinc-300"
          >
            <N>Phy</N>seter Macrocephalus
          </button>
        </p>
      </div>

      {/* indice: en mobile se oculta, la pagina se lee de corrido */}
      <div className="hidden flex-col p-3 lg:flex">
        <p className="mx-2.5 mb-2 font-mono text-[13px] text-zinc-300">
          <span className="text-fuchsia-400">$</span> tree ~/about-me
        </p>
        <nav aria-label="Secciones" className="flex flex-col font-mono text-[13px]">
          {SECCIONES.map((s) => {
            const esActiva = activa === s.id;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={esActiva ? "true" : undefined}
                onClick={() => {
                  elegida.current = s.id;
                  setActiva(s.id);
                  setTimeout(() => (elegida.current = null), 150);
                }}
                className={`flex min-h-9 items-center rounded-md px-2.5 whitespace-pre transition ${
                  esActiva
                    ? "bg-fuchsia-500/10 text-fuchsia-200"
                    : "text-zinc-500 hover:bg-violet-300/5 hover:text-violet-300"
                }`}
              >
                <span className={esActiva ? "text-fuchsia-400" : "text-zinc-700"}>
                  ├──{" "}
                </span>
                {s.archivo}
                {esActiva && (
                  <span className="cursor-consola text-violet-300"> _</span>
                )}
              </a>
            );
          })}
          <Link
            href="/compendio"
            className="flex min-h-9 items-center rounded-md px-2.5 whitespace-pre text-zinc-500 transition hover:bg-violet-300/5 hover:text-violet-300"
          >
            <span className="text-zinc-700">└── </span>compendio/ ↗
          </Link>
        </nav>
      </div>

      {/* enlaces */}
      <div className="flex gap-5 border-t border-zinc-800 px-5 py-2.5 font-mono text-[13px]">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-9 items-center text-fuchsia-400 transition hover:text-fuchsia-200"
        >
          <span className="text-zinc-500">./</span>github ↗
        </a>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-9 items-center text-fuchsia-400 transition hover:text-fuchsia-200"
        >
          <span className="text-zinc-500">./</span>linkedin ↗
        </a>
      </div>
    </aside>
  );
}
