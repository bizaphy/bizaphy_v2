"use client";

import { type KeyboardEvent, useLayoutEffect, useRef, useState } from "react";

export type VerboUnir = {
  verbo: string;
  kana: string;
  romaji: string;
  significado: string;
};

// "sig-kanji": significados a la izquierda, kanjis a la derecha.
// "kanji-sig": al reves. En los dos casos el romaji se escribe junto al
// kanji, en el lado de afuera, para no tapar las lineas.
export type VarianteUnir = "sig-kanji" | "kanji-sig";

type Props = {
  variante: VarianteUnir;
  izquierda: VerboUnir[];
  derecha: VerboUnir[];
  // izquierda (verbo) -> derecha (verbo). Correcta si son el mismo.
  uniones: Record<string, string>;
  onUnir: (izquierda: string, derecha: string) => void;
  onDesunir: (izquierda: string) => void;
  respuestas: Record<string, string>;
  onRespuesta: (verbo: string, texto: string) => void;
  romajiOk: (verbo: VerboUnir) => boolean;
  corregido: boolean;
  onCorregir: () => void;
};

type Linea = { izquierda: string; x1: number; y1: number; x2: number; y2: number };
type Seleccion = { lado: "izquierda" | "derecha"; verbo: string } | null;

const estiloRomaji = (estado: "neutro" | "ok" | "mal") =>
  `w-full rounded-md border bg-zinc-800 px-2 py-1 font-mono text-sm outline-none transition focus:border-fuchsia-500 sm:w-28 ${
    estado === "neutro"
      ? "border-zinc-700 text-zinc-100"
      : estado === "ok"
        ? "border-emerald-400/60 text-emerald-200"
        : "border-rose-400/60 text-rose-200 line-through"
  }`;

// Unir con lineas: se hace clic en un elemento de una columna y despues en
// uno de la otra. Clic en algo ya unido deshace esa union y lo selecciona.
export default function UnirColumnas({
  variante,
  izquierda,
  derecha,
  uniones,
  onUnir,
  onDesunir,
  respuestas,
  onRespuesta,
  romajiOk,
  corregido,
  onCorregir,
}: Props) {
  const [seleccion, setSeleccion] = useState<Seleccion>(null);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const contenedor = useRef<HTMLDivElement>(null);
  const puntosIzquierda = useRef<Record<string, HTMLSpanElement | null>>({});
  const puntosDerecha = useRef<Record<string, HTMLSpanElement | null>>({});
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Las lineas se calculan con la posicion real de cada punto. Se
  // recalculan al cambiar las uniones y cuando el contenedor cambia de
  // tamano (ventana, o el texto de correccion que aparece al corregir).
  useLayoutEffect(() => {
    const calcular = () => {
      const caja = contenedor.current?.getBoundingClientRect();
      if (!caja) return;
      const nuevas: Linea[] = [];
      for (const [deIzquierda, deDerecha] of Object.entries(uniones)) {
        const a = puntosIzquierda.current[deIzquierda]?.getBoundingClientRect();
        const b = puntosDerecha.current[deDerecha]?.getBoundingClientRect();
        if (!a || !b) continue;
        nuevas.push({
          izquierda: deIzquierda,
          x1: a.left + a.width / 2 - caja.left,
          y1: a.top + a.height / 2 - caja.top,
          x2: b.left + b.width / 2 - caja.left,
          y2: b.top + b.height / 2 - caja.top,
        });
      }
      setLineas(nuevas);
    };
    calcular();
    const observador = new ResizeObserver(calcular);
    if (contenedor.current) observador.observe(contenedor.current);
    return () => observador.disconnect();
  }, [uniones]);

  const unidaA = (deDerecha: string) =>
    Object.keys(uniones).find((clave) => uniones[clave] === deDerecha);

  const clicIzquierda = (verbo: string) => {
    if (corregido) return;
    if (seleccion?.lado === "derecha") {
      onUnir(verbo, seleccion.verbo);
      setSeleccion(null);
    } else if (seleccion?.verbo === verbo) {
      setSeleccion(null);
    } else {
      if (uniones[verbo]) onDesunir(verbo);
      setSeleccion({ lado: "izquierda", verbo });
    }
  };

  const clicDerecha = (verbo: string) => {
    if (corregido) return;
    if (seleccion?.lado === "izquierda") {
      onUnir(seleccion.verbo, verbo);
      setSeleccion(null);
    } else if (seleccion?.verbo === verbo) {
      setSeleccion(null);
    } else {
      const anterior = unidaA(verbo);
      if (anterior) onDesunir(anterior);
      setSeleccion({ lado: "derecha", verbo });
    }
  };

  // Enter recorre los campos de romaji (en el orden de la columna de
  // kanjis); en el ultimo, corrige.
  const columnaKanjis = variante === "sig-kanji" ? derecha : izquierda;
  const alPresionar = (evento: KeyboardEvent<HTMLInputElement>, indice: number) => {
    if (evento.key !== "Enter") return;
    evento.preventDefault();
    const siguiente = inputs.current[indice + 1];
    if (siguiente) siguiente.focus();
    else onCorregir();
  };

  const estiloElemento = (lado: "izquierda" | "derecha", verbo: string) => {
    const seleccionado = seleccion?.lado === lado && seleccion.verbo === verbo;
    const unido = lado === "izquierda" ? !!uniones[verbo] : !!unidaA(verbo);
    return `flex min-w-0 flex-1 items-center gap-2 rounded-md border px-3 py-2 text-left transition ${
      corregido ? "cursor-default" : "cursor-pointer hover:border-fuchsia-400"
    } ${
      seleccionado
        ? "border-fuchsia-400 bg-fuchsia-500/15 shadow-[0_0_10px_rgba(217,70,239,0.5)]"
        : unido
          ? "border-violet-300/50 bg-zinc-900/80"
          : "border-zinc-700 bg-zinc-900/60"
    }`;
  };

  const punto = "h-2.5 w-2.5 shrink-0 rounded-full border border-violet-300 bg-zinc-900";

  // Campo de romaji de un kanji
  // En movil va debajo del kanji (al lado lo aplasta); desde sm, al costado
  // de afuera. `orden` lo pone a la izquierda en la columna izquierda.
  const campoRomaji = (verbo: VerboUnir, orden = "") => {
    const indice = columnaKanjis.indexOf(verbo);
    const estado = !corregido ? "neutro" : romajiOk(verbo) ? "ok" : "mal";
    return (
      <span className={`flex shrink-0 flex-col gap-0.5 ${orden}`}>
        <input
          ref={(elemento) => {
            inputs.current[indice] = elemento;
          }}
          value={respuestas[verbo.verbo] ?? ""}
          disabled={corregido}
          onChange={(e) => onRespuesta(verbo.verbo, e.target.value)}
          onKeyDown={(e) => alPresionar(e, indice)}
          placeholder="romaji…"
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
          aria-label={`Romaji de ${verbo.verbo}`}
          className={estiloRomaji(estado)}
        />
        {estado === "mal" && (
          <span className="font-mono text-xs text-emerald-300">{verbo.romaji}</span>
        )}
      </span>
    );
  };

  const textoKanji = (verbo: VerboUnir) => (
    <span className="font-mono text-xl whitespace-nowrap text-zinc-50 sm:text-2xl">
      {verbo.verbo}
    </span>
  );
  const textoSignificado = (verbo: VerboUnir) => (
    <span className="text-sm text-zinc-200">{verbo.significado}</span>
  );

  return (
    <div ref={contenedor} className="relative">
      {/* Lineas por debajo de los elementos: no capturan clics */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        {lineas.map((linea) => {
          const bien = uniones[linea.izquierda] === linea.izquierda;
          return (
            <line
              key={linea.izquierda}
              x1={linea.x1}
              y1={linea.y1}
              x2={linea.x2}
              y2={linea.y2}
              strokeWidth={2}
              strokeLinecap="round"
              className={
                !corregido
                  ? "stroke-violet-300/80"
                  : bien
                    ? "stroke-emerald-400"
                    : "stroke-rose-400"
              }
            />
          );
        })}
      </svg>

      {/* gap-x amplio: es el espacio por donde pasan las lineas */}
      <div className="grid grid-cols-2 gap-x-8 sm:gap-x-24">
        <ol className="flex flex-col gap-2">
          {izquierda.map((verbo) => {
            const correcta = uniones[verbo.verbo] === verbo.verbo;
            return (
              <li key={verbo.verbo} className="flex flex-col gap-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <button
                    type="button"
                    onClick={() => clicIzquierda(verbo.verbo)}
                    className={estiloElemento("izquierda", verbo.verbo)}
                  >
                    <span className="min-w-0 flex-1">
                      {variante === "sig-kanji"
                        ? textoSignificado(verbo)
                        : textoKanji(verbo)}
                    </span>
                    <span
                      ref={(elemento) => {
                        puntosIzquierda.current[verbo.verbo] = elemento;
                      }}
                      className={punto}
                    />
                  </button>
                  {variante === "kanji-sig" && campoRomaji(verbo, "sm:order-first")}
                </div>
                {/* Al corregir, la pareja correcta de las uniones malas */}
                {corregido && !correcta && (
                  <span className="text-right text-xs text-emerald-300">
                    →{" "}
                    {variante === "sig-kanji"
                      ? `${verbo.verbo} (${verbo.kana})`
                      : verbo.significado}
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        <ol className="flex flex-col gap-2">
          {derecha.map((verbo) => (
            <li
              key={verbo.verbo}
              className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2"
            >
              <button
                type="button"
                onClick={() => clicDerecha(verbo.verbo)}
                className={estiloElemento("derecha", verbo.verbo)}
              >
                <span
                  ref={(elemento) => {
                    puntosDerecha.current[verbo.verbo] = elemento;
                  }}
                  className={punto}
                />
                <span className="min-w-0 flex-1">
                  {variante === "sig-kanji"
                    ? textoKanji(verbo)
                    : textoSignificado(verbo)}
                </span>
              </button>
              {variante === "sig-kanji" && campoRomaji(verbo)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
