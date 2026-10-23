"use client";

import { useEffect, useMemo, useState } from "react";
import Interruptor from "./Interruptor";
import { FiltroNivel, TarjetaEstructura } from "./GramaticaUI";
import {
  FILTROS,
  barajar,
  botonBase,
  cargarEstructuras,
  estiloOpcion,
  type Estructura,
  type Filtro,
} from "./gramatica";

// Una pregunta: un ejemplo de una estructura y 4 significados posibles.
type Pregunta = {
  estructura: Estructura;
  ejemplo: number;
  opciones: Estructura[];
};

// Para comparar significados se ignoran mayusculas, tildes, signos y lo que
// va entre parentesis.
const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, " ")
    .replace(/\.\.\.|…|[¿?¡!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Las ideas de un significado: "Por fin, finalmente." → ["por fin", "finalmente"].
const ideas = (s: string) =>
  normalizar(s)
    .split(/[,;:.]/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 4);

// Dos significados chocan si uno contiene alguna idea del otro ("Por fin,
// finalmente" / "Al final, finalmente") o si empiezan igual ("parece que" /
// "parecer"). Asi no aparecen dos opciones que el alumno podria considerar
// correctas a la vez.
function chocan(a: string, b: string) {
  const [ia, ib, na, nb] = [ideas(a), ideas(b), normalizar(a), normalizar(b)];
  if (ia.some((p) => nb.includes(p)) || ib.some((p) => na.includes(p))) {
    return true;
  }
  const [ka, kb] = [ia[0] ?? "", ib[0] ?? ""];
  return ka.length >= 5 && kb.length >= 5 && ka.slice(0, 5) === kb.slice(0, 5);
}

function elegirDistractores(correcta: Estructura, todas: Estructura[]) {
  const elegidas: Estructura[] = [];
  for (const e of barajar(todas)) {
    if (elegidas.length === 3) break;
    if (e.id === correcta.id || e.nivel !== correcta.nivel) continue;
    if (e.significado === correcta.significado) continue;
    const significados = [correcta, ...elegidas].map((x) => x.significado);
    if (significados.some((s) => chocan(s, e.significado))) continue;
    elegidas.push(e);
  }
  return elegidas;
}

function armarCola(todas: Estructura[], filtro: Filtro): Pregunta[] {
  const pool = todas.flatMap((estructura) =>
    filtro === "todos" || estructura.nivel === filtro
      ? estructura.ejemplos.map((_, ejemplo) => ({ estructura, ejemplo }))
      : [],
  );
  return barajar(pool).map((p) => ({
    ...p,
    opciones: barajar([
      p.estructura,
      ...elegirDistractores(p.estructura, todas),
    ]),
  }));
}

// La oracion con la estructura en rosa, cuando se sabe donde esta.
function Oracion({ ja, resaltado }: { ja: string; resaltado: string | null }) {
  const i = resaltado ? ja.indexOf(resaltado) : -1;
  if (!resaltado || i < 0) return <>{ja}</>;
  return (
    <>
      {ja.slice(0, i)}
      <span className="text-pink-400 underline decoration-pink-400/60 underline-offset-8">
        {resaltado}
      </span>
      {ja.slice(i + resaltado.length)}
    </>
  );
}

export default function GrammarV2() {
  const [estructuras, setEstructuras] = useState<Estructura[] | null>(null);
  const [error, setError] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [cola, setCola] = useState<Pregunta[]>([]);
  const [pos, setPos] = useState(0);
  const [intentadas, setIntentadas] = useState<number[]>([]);
  const [furigana, setFurigana] = useState(false);

  useEffect(() => {
    let vivo = true;
    cargarEstructuras()
      .then((mapa) => {
        if (!vivo) return;
        const todas = [...mapa.values()];
        setEstructuras(todas);
        setCola(armarCola(todas, "todos"));
      })
      .catch(() => vivo && setError(true));
    return () => {
      vivo = false;
    };
  }, []);

  const conteos = useMemo(() => {
    if (!estructuras) return null;
    return Object.fromEntries(
      FILTROS.map((f) => [
        f.id,
        estructuras
          .filter((e) => f.id === "todos" || e.nivel === f.id)
          .reduce((n, e) => n + e.ejemplos.length, 0),
      ]),
    ) as Record<Filtro, number>;
  }, [estructuras]);

  if (error) {
    return (
      <p className="p-4 font-mono text-sm text-zinc-400">
        No se pudieron cargar las estructuras.
      </p>
    );
  }
  if (!estructuras || !conteos) {
    return (
      <p className="animate-pulse p-4 font-mono text-sm tracking-widest text-fuchsia-300 uppercase">
        cargando estructuras
      </p>
    );
  }

  const pregunta = cola[pos];
  if (!pregunta) return null;
  const { estructura, opciones } = pregunta;
  const ejemplo = estructura.ejemplos[pregunta.ejemplo];
  const indiceCorrecta = opciones.findIndex((o) => o.id === estructura.id);
  const resuelto = intentadas.includes(indiceCorrecta);

  const cambiarFiltro = (f: Filtro) => {
    if (f === filtro) return;
    setFiltro(f);
    setCola(armarCola(estructuras, f));
    setPos(0);
    setIntentadas([]);
  };

  const elegir = (i: number) => {
    if (resuelto || intentadas.includes(i)) return;
    setIntentadas([...intentadas, i]);
  };

  const siguiente = () => {
    if (pos + 1 < cola.length) {
      setPos(pos + 1);
    } else {
      setCola(armarCola(estructuras, filtro));
      setPos(0);
    }
    setIntentadas([]);
  };

  return (
    <section className="flex flex-col gap-6 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <FiltroNivel
          activo={filtro}
          conteos={conteos}
          onCambiar={cambiarFiltro}
        />
        <div className="ml-auto rounded-md border border-dashed border-zinc-700 px-3 py-2">
          <Interruptor
            label="Furigana"
            activo={furigana}
            onToggle={() => setFurigana((f) => !f)}
          />
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-4 rounded-md border border-fuchsia-400/50 bg-zinc-900/60 px-4 py-10 shadow-[0_0_14px_rgba(217,70,239,0.2)]">
        <span className="absolute top-3 left-3 rounded border border-zinc-700 px-2 py-0.5 font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
          {estructura.nivel}
        </span>
        <span className="absolute top-3 right-3 font-mono text-[10px] tracking-widest text-zinc-500">
          {pos + 1} / {cola.length}
        </span>

        <p className="text-center font-mono text-xs tracking-widest text-zinc-500 uppercase">
          ¿Qué significa{" "}
          <span className="text-base tracking-normal text-pink-400 normal-case">
            {estructura.patron}
          </span>{" "}
          en esta oración?
        </p>

        <p
          className={`text-center font-mono text-sm text-fuchsia-300 ${
            furigana || resuelto ? "" : "invisible"
          }`}
        >
          {ejemplo.lectura}
        </p>

        <p className="text-center text-2xl leading-loose text-zinc-50 sm:text-3xl">
          <Oracion ja={ejemplo.ja} resaltado={ejemplo.resaltado} />
        </p>

        <p
          className={`text-center text-sm text-zinc-300 ${resuelto ? "" : "invisible"}`}
        >
          <span className="mr-1 text-violet-500/70">›</span>
          {ejemplo.es}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {opciones.map((o, i) => {
          const estado =
            resuelto && i === indiceCorrecta
              ? "correcta"
              : intentadas.includes(i)
                ? "fallada"
                : "normal";
          return (
            <button
              key={o.id}
              type="button"
              disabled={resuelto || intentadas.includes(i)}
              onClick={() => elegir(i)}
              className={`flex items-start gap-3 rounded-md border px-4 py-3 text-left text-sm transition disabled:cursor-default ${estiloOpcion(estado)}`}
            >
              <span className="font-mono text-xs text-zinc-500">{i + 1}</span>
              <span>
                {o.significado}
                {/* Al resolver se ve a que estructura pertenece cada
                    significado. */}
                {resuelto && (
                  <span className="mt-1 block font-mono text-xs text-zinc-500 no-underline">
                    {o.patron}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {!resuelto && intentadas.length > 0 && (
        <p className="text-center font-mono text-xs tracking-widest text-rose-300 uppercase">
          Incorrecta, intenta otra vez
        </p>
      )}

      {resuelto && (
        <TarjetaEstructura estructura={estructura} correcta conEjemplos />
      )}

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => setIntentadas([])}
          className={`${botonBase} border-violet-300/50 bg-zinc-900/80 text-violet-200 hover:border-violet-300`}
        >
          Reiniciar
        </button>
        <button
          type="button"
          onClick={siguiente}
          className={`${botonBase} border-zinc-500 bg-zinc-800 text-zinc-100 hover:border-zinc-300`}
        >
          Siguiente →
        </button>
      </div>
    </section>
  );
}
