"use client";

import { useEffect, useMemo, useState } from "react";
import Interruptor from "@/components/ui/Interruptor";
import { FiltroNivel, TarjetaEstructura, TarjetaTexto } from "./GramaticaUI";
import {
  FILTROS,
  barajar,
  botonBase,
  cargarEstructuras,
  estiloOpcion,
  type Estructura,
  type Filtro,
  type Nivel,
} from "./gramatica";

type Opcion = {
  texto: string;
  // Estructura del catalogo a la que corresponde la opcion, si la hay.
  estructura?: string;
  nota?: string;
};

type Ejercicio = {
  id: string;
  estructura: string;
  nivel: Nivel;
  antes: string;
  hueco: string;
  despues: string;
  // Lectura cortada en el hueco; falta cuando el corte seria ambiguo.
  lecturaAntes?: string;
  lecturaDespues?: string;
  lectura: string;
  traduccion: string;
  // Explicacion propia de la respuesta correcta (ejercicios hechos a mano).
  nota?: string;
  opciones: Opcion[];
};

// Una pregunta de la cola: el ejercicio con sus opciones ya barajadas, para
// que no cambien de orden en cada render.
type Pregunta = {
  ejercicio: Ejercicio;
  opciones: (Opcion & { correcta: boolean })[];
};

const armarCola = (ejercicios: Ejercicio[], filtro: Filtro): Pregunta[] =>
  barajar(
    ejercicios.filter((e) => filtro === "todos" || e.nivel === filtro),
  ).map((ejercicio) => ({
    ejercicio,
    opciones: barajar([
      {
        texto: ejercicio.hueco,
        estructura: ejercicio.estructura,
        nota: ejercicio.nota,
        correcta: true,
      },
      ...ejercicio.opciones.map((o) => ({ ...o, correcta: false })),
    ]),
  }));

export default function GrammarV1() {
  const [estructuras, setEstructuras] = useState<Map<
    string,
    Estructura
  > | null>(null);
  const [ejercicios, setEjercicios] = useState<Ejercicio[] | null>(null);
  const [error, setError] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [cola, setCola] = useState<Pregunta[]>([]);
  const [pos, setPos] = useState(0);
  // Indices de las opciones ya intentadas: las incorrectas quedan bloqueadas.
  const [intentadas, setIntentadas] = useState<number[]>([]);
  const [furigana, setFurigana] = useState(false);

  useEffect(() => {
    let vivo = true;
    Promise.all([
      cargarEstructuras(),
      import("../data/ejercicios-gramatica.json"),
    ])
      .then(([est, m]) => {
        if (!vivo) return;
        const ej = m.default as unknown as Ejercicio[];
        setEstructuras(est);
        setEjercicios(ej);
        setCola(armarCola(ej, "todos"));
      })
      .catch(() => vivo && setError(true));
    return () => {
      vivo = false;
    };
  }, []);

  const conteos = useMemo(() => {
    if (!ejercicios) return null;
    return Object.fromEntries(
      FILTROS.map((f) => [
        f.id,
        ejercicios.filter((e) => f.id === "todos" || e.nivel === f.id).length,
      ]),
    ) as Record<Filtro, number>;
  }, [ejercicios]);

  if (error) {
    return (
      <p className="p-4 font-mono text-sm text-zinc-400">
        No se pudieron cargar los ejercicios.
      </p>
    );
  }
  if (!estructuras || !ejercicios || !conteos) {
    return (
      <p className="animate-pulse p-4 font-mono text-sm tracking-widest text-fuchsia-300 uppercase">
        cargando ejercicios
      </p>
    );
  }

  const pregunta = cola[pos];
  if (!pregunta) return null;
  const { ejercicio, opciones } = pregunta;
  const indiceCorrecta = opciones.findIndex((o) => o.correcta);
  const resuelto = intentadas.includes(indiceCorrecta);
  const tieneCorte = ejercicio.lecturaAntes !== undefined;

  const cambiarFiltro = (f: Filtro) => {
    if (f === filtro) return;
    setFiltro(f);
    setCola(armarCola(ejercicios, f));
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
      // Cola agotada: se vuelve a barajar y arranca otra vuelta.
      setCola(armarCola(ejercicios, filtro));
      setPos(0);
    }
    setIntentadas([]);
  };

  // La correcta va primero en la explicacion; el resto en el orden en que
  // aparecieron.
  const ordenExplicacion = [
    opciones[indiceCorrecta],
    ...opciones.filter((o) => !o.correcta),
  ];
  const estructuraCorrecta = estructuras.get(ejercicio.estructura);

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
          {ejercicio.nivel}
        </span>
        <span className="absolute top-3 right-3 font-mono text-[10px] tracking-widest text-zinc-500">
          {pos + 1} / {cola.length}
        </span>

        <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
          つぎの文の（　）に入れるのに最もよいものを選びなさい
        </p>

        {/* La lectura reserva su alto aunque este oculta. Antes de resolver
            solo se puede mostrar si se pudo cortar en el hueco. */}
        <p
          className={`text-center font-mono text-sm text-fuchsia-300 ${
            resuelto || (furigana && tieneCorte) ? "" : "invisible"
          }`}
        >
          {resuelto ? (
            ejercicio.lectura
          ) : (
            <>
              {ejercicio.lecturaAntes}
              <span className="text-pink-400">＿＿</span>
              {ejercicio.lecturaDespues}
            </>
          )}
        </p>

        <p className="text-center text-2xl leading-loose text-zinc-50 sm:text-3xl">
          {ejercicio.antes}
          <span className="mx-1 text-pink-400">
            {resuelto ? ejercicio.hueco : "＿＿＿＿"}
          </span>
          {ejercicio.despues}
        </p>

        <p
          className={`text-center text-sm text-zinc-300 ${resuelto ? "" : "invisible"}`}
        >
          <span className="mr-1 text-violet-500/70">›</span>
          {ejercicio.traduccion}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {opciones.map((o, i) => {
          const estado =
            resuelto && o.correcta
              ? "correcta"
              : intentadas.includes(i)
                ? "fallada"
                : "normal";
          return (
            <button
              key={o.texto}
              type="button"
              disabled={resuelto || intentadas.includes(i)}
              onClick={() => elegir(i)}
              className={`flex items-center gap-3 rounded-md border px-4 py-3 text-left text-lg transition disabled:cursor-default ${estiloOpcion(estado)}`}
            >
              <span className="font-mono text-xs text-zinc-500">{i + 1}</span>
              {o.texto}
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
        <div className="flex flex-col gap-3">
          {ordenExplicacion.map((o) => {
            const est = o.estructura
              ? estructuras.get(o.estructura)
              : undefined;
            return est ? (
              <TarjetaEstructura
                key={o.texto}
                estructura={est}
                correcta={o.correcta}
                nota={o.nota}
                conEjemplos={o.correcta}
              />
            ) : (
              <TarjetaTexto key={o.texto} texto={o.texto} nota={o.nota} />
            );
          })}
          {!estructuraCorrecta && (
            <p className="font-mono text-xs text-zinc-500">
              No se encontró la estructura {ejercicio.estructura}.
            </p>
          )}
        </div>
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
