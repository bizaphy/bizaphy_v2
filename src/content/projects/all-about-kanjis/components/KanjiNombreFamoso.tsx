"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { tipoNombre } from "../db/schema";

type TipoNombre = (typeof tipoNombre.enumValues)[number];

type ImagenInfo = {
  image?: string;
  url: string; // pagina de origen (click en la imagen)
  fuente: "Wikipedia" | "AniList";
};

// ja.wikipedia: los nombres ya estan en japones y solo tiene imagenes libres
async function fetchWikipedia(
  title: string,
  signal: AbortSignal,
): Promise<ImagenInfo> {
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));
  const fallbackUrl = `https://ja.wikipedia.org/wiki/${encoded}`;
  const res = await fetch(
    `https://ja.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
    { signal },
  );
  if (!res.ok) return { url: fallbackUrl, fuente: "Wikipedia" };
  const data = await res.json();
  return {
    // en desambiguaciones la imagen puede no corresponder
    image: data.type === "disambiguation" ? undefined : data.thumbnail?.source,
    url: data.content_urls?.desktop?.page ?? fallbackUrl,
    fuente: "Wikipedia",
  };
}

// AniList (GraphQL, sin clave): acepta titulos nativos en japones
const QUERY_SERIE = `query ($s: String, $t: MediaType) {
  Media(search: $s, type: $t) { siteUrl coverImage { large } }
}`;
const QUERY_PERSONAJE = `query ($s: String) {
  Character(search: $s) { siteUrl image { large } }
}`;

async function fetchAniList(
  nombre: string,
  tipo: "anime" | "manga" | "personaje",
  signal: AbortSignal,
): Promise<ImagenInfo | null> {
  const esPersonaje = tipo === "personaje";
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      query: esPersonaje ? QUERY_PERSONAJE : QUERY_SERIE,
      variables: esPersonaje
        ? { s: nombre }
        : { s: nombre, t: tipo === "anime" ? "ANIME" : "MANGA" },
    }),
    signal,
  });
  if (!res.ok) return null;
  const { data } = await res.json();
  const item = esPersonaje ? data?.Character : data?.Media;
  const image = esPersonaje ? item?.image?.large : item?.coverImage?.large;
  if (!image) return null;
  return { image, url: item.siteUrl, fuente: "AniList" };
}

// Elige la fuente segun el tipo; si AniList falla, usa Wikipedia
async function fetchImagen(
  nombre: string,
  tipo: TipoNombre | undefined,
  signal: AbortSignal,
): Promise<ImagenInfo> {
  // musica: sin busqueda, los titulos suelen ser palabras comunes (糸, 卒業)
  if (tipo === "musica") {
    return {
      url: `https://ja.wikipedia.org/wiki/${encodeURIComponent(nombre)}`,
      fuente: "Wikipedia",
    };
  }
  if (tipo === "anime" || tipo === "manga" || tipo === "personaje") {
    const anilist = await fetchAniList(nombre, tipo, signal).catch((err) => {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      return null;
    });
    if (anilist) return anilist;
  }
  return fetchWikipedia(nombre, signal);
}

export type NombreFamoso = {
  nombre: string;
  tipo?: TipoNombre;
  furigana?: string | null;
  descripcion?: string | null;
  urlImagen?: string | null;
};

type Props = {
  nombres?: NombreFamoso[];
};

// Muestra un nombre famoso a la vez; con 2+ nombres aparecen flechas (circular).
// El consumidor debe pasar un `key` por kanji para reiniciar el indice.
export default function KanjiNombreFamoso({ nombres = [] }: Props) {
  const [indice, setIndice] = useState(0);
  const total = nombres.length;
  const entrada = nombres[indice];
  const conFlechas = total > 1;

  const mover = (paso: number) => setIndice((i) => (i + paso + total) % total);

  // Cache por nombre para no repetir el fetch al volver con las flechas
  const [imagenes, setImagenes] = useState<Record<string, ImagenInfo>>({});
  const nombre = entrada?.nombre;
  const tipo = entrada?.tipo;

  useEffect(() => {
    if (!nombre || nombre in imagenes) return;
    const controller = new AbortController();
    fetchImagen(nombre, tipo, controller.signal)
      .then((info) => setImagenes((m) => ({ ...m, [nombre]: info })))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // error de red: se marca sin imagen para no quedar en "…"
        setImagenes((m) => ({
          ...m,
          [nombre]: {
            url: `https://ja.wikipedia.org/wiki/${encodeURIComponent(nombre)}`,
            fuente: "Wikipedia",
          },
        }));
      });
    return () => controller.abort();
  }, [nombre, tipo, imagenes]);

  const imagenActual = nombre ? imagenes[nombre] : undefined;
  // urlImagen local tiene prioridad sobre las APIs
  const imagen = entrada?.urlImagen ?? imagenActual?.image;

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-zinc-700 bg-zinc-900/60">
      <div className="flex items-center justify-between border-b border-zinc-700 px-3 py-2 font-mono text-xs tracking-widest text-violet-300">
        CELEBRIDAD / SERIE
        {conFlechas && (
          <span className="text-zinc-500">
            {indice + 1}/{total}
          </span>
        )}
      </div>

      {entrada ? (
        <div className="flex flex-col items-center gap-3 p-3">
          <div className="flex items-center gap-3">
            {conFlechas && (
              <BotonFlecha
                direccion="izq"
                onClick={() => mover(-1)}
                label="Anterior"
              />
            )}
            <div className="relative size-36 shrink-0 overflow-hidden rounded border border-dashed border-zinc-700 bg-zinc-900/40 lg:size-44">
              {imagen ? (
                <a
                  href={imagenActual?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${entrada.nombre} en ${imagenActual?.fuente ?? "Wikipedia"}`}
                >
                  <Image
                    src={imagen}
                    alt={entrada.nombre}
                    fill
                    sizes="176px"
                    className="object-cover object-top" // prioriza la cara en retratos
                    unoptimized
                  />
                </a>
              ) : imagenActual || entrada.tipo === "musica" ? (
                <Marcador nombre={entrada.nombre} tipo={entrada.tipo} />
              ) : (
                <span className="flex h-full items-center justify-center font-mono text-[9px] tracking-wider text-zinc-600">
                  …
                </span>
              )}
            </div>
            {conFlechas && (
              <BotonFlecha
                direccion="der"
                onClick={() => mover(1)}
                label="Siguiente"
              />
            )}
          </div>

          <div className="flex min-w-0 flex-col items-center gap-1 text-center">
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(entrada.nombre)}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`Buscar ${entrada.nombre} en Google`}
              className="w-fit font-mono text-base text-violet-200 underline decoration-violet-500/40 underline-offset-4 transition hover:text-white hover:decoration-violet-300 lg:text-lg"
            >
              {entrada.nombre}
            </a>
            {entrada.furigana && (
              <span className="font-mono text-sm text-violet-300/80">
                {entrada.furigana}
              </span>
            )}
            {entrada.descripcion && (
              <span className="line-clamp-3 text-sm leading-snug text-zinc-400">
                {entrada.descripcion}
              </span>
            )}
          </div>
        </div>
      ) : (
        <span className="p-3 font-mono text-[10px] tracking-wider text-zinc-600">
          sin datos
        </span>
      )}
    </div>
  );
}

const ETIQUETA_TIPO: Record<TipoNombre, string> = {
  persona: "PERSONA",
  personaje: "PERSONAJE",
  anime: "ANIME",
  manga: "MANGA",
  pelicula: "PELÍCULA",
  dorama: "DORAMA",
  libro: "LIBRO",
  juego: "JUEGO",
  musica: "♪ MÚSICA",
  otro: "",
};

// Sin imagen: primer caracter del nombre + tipo.
// [...nombre][0] evita cortar caracteres fuera del BMP.
function Marcador({ nombre, tipo }: { nombre: string; tipo?: TipoNombre }) {
  const etiqueta = tipo ? ETIQUETA_TIPO[tipo] : "";
  return (
    <div
      aria-hidden="true"
      className="flex h-full flex-col items-center justify-center gap-2"
    >
      <span className="font-mono text-6xl leading-none text-violet-300/50 lg:text-7xl">
        {[...nombre][0]}
      </span>
      {etiqueta && (
        <span className="font-mono text-[10px] tracking-widest text-zinc-500">
          {etiqueta}
        </span>
      )}
    </div>
  );
}

function BotonFlecha({
  direccion,
  onClick,
  label,
}: {
  direccion: "izq" | "der";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="p-1 text-fuchsia-400 transition hover:scale-110 hover:text-fuchsia-200"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={direccion === "izq" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
      </svg>
    </button>
  );
}
