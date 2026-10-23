"use client";

import { useState } from "react";
import Interruptor from "./Interruptor";
import gramaticaJson from "../data/gramatica.json";
import ejerciciosJson from "../data/ejercicios-gramatica.json";

type Estructura = {
  patron: string;
  forma: string;
  nivel: string;
  significado: string;
  conexion: string[];
};

// Un segmento es texto (con lectura opcional para furigana) o el hueco
// donde va la estructura a elegir.
type Segmento = { t?: string; r?: string; hueco?: boolean };

type Ejercicio = {
  id: string;
  nivel: string;
  oracion: Segmento[];
  traduccion: string;
  opciones: string[];
  correcta: string;
  explicaciones: Record<string, string>;
};

// TS infiere un tipo distinto por cada objeto del JSON (con claves que
// faltan en unos y sobran en otros), asi que se pasa por `unknown`.
const gramatica = gramaticaJson as Record<string, Estructura>;
const ejercicios = ejerciciosJson as unknown as Ejercicio[];

const botonBase =
  "rounded-md border px-4 py-2 font-mono text-xs tracking-widest uppercase transition";

const estiloOpcion = (estado: "normal" | "fallada" | "correcta") =>
  ({
    normal:
      "border-violet-300/50 bg-zinc-900/80 text-zinc-100 hover:border-violet-300 hover:shadow-[0_0_10px_rgba(196,181,253,0.4)]",
    fallada: "border-rose-500/60 bg-rose-500/10 text-rose-300 line-through",
    correcta:
      "border-emerald-400 bg-emerald-500/15 text-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.4)]",
  })[estado];

export default function GrammarBeta() {
  const [pos, setPos] = useState(0);
  // Opciones ya intentadas: las incorrectas quedan marcadas y bloqueadas.
  const [intentadas, setIntentadas] = useState<string[]>([]);
  const [furigana, setFurigana] = useState(false);

  const ejercicio = ejercicios[pos];
  const resuelto = intentadas.includes(ejercicio.correcta);
  const verFurigana = furigana || resuelto;

  const elegir = (id: string) => {
    if (resuelto || intentadas.includes(id)) return;
    setIntentadas([...intentadas, id]);
  };

  const siguiente = () => {
    setPos((pos + 1) % ejercicios.length);
    setIntentadas([]);
  };

  // La correcta va primero en la explicacion; el resto en el orden del
  // ejercicio.
  const ordenExplicacion = [
    ejercicio.correcta,
    ...ejercicio.opciones.filter((o) => o !== ejercicio.correcta),
  ];

  return (
    <section className="flex flex-col gap-6 p-4">
      {/* Config de vista, a la derecha como en el trainer */}
      <div className="ml-auto rounded-md border border-dashed border-zinc-700 px-3 py-2">
        <Interruptor
          label="Furigana"
          activo={furigana}
          onToggle={() => setFurigana((f) => !f)}
        />
      </div>

      <div className="relative flex flex-col items-center gap-4 rounded-md border border-fuchsia-400/50 bg-zinc-900/60 px-4 py-10 shadow-[0_0_14px_rgba(217,70,239,0.2)]">
        <span className="absolute top-3 left-3 rounded border border-zinc-700 px-2 py-0.5 font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
          {ejercicio.nivel}
        </span>
        <span className="absolute top-3 right-3 font-mono text-[10px] tracking-widest text-zinc-500">
          {pos + 1} / {ejercicios.length}
        </span>

        <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
          つぎの文の（　）に入れるのに最もよいものを選びなさい
        </p>

        {/* El furigana reserva su alto aunque este oculto: se muestra con el
            interruptor o al resolver, igual que en el trainer. */}
        <p className="text-center text-2xl leading-loose text-zinc-50 sm:text-3xl">
          {ejercicio.oracion.map((s, i) =>
            s.hueco ? (
              <span key={i} className="mx-1 text-pink-400">
                {resuelto ? gramatica[ejercicio.correcta].forma : "＿＿＿＿"}
              </span>
            ) : s.r ? (
              <ruby key={i}>
                {s.t}
                <rt
                  className={`text-xs text-fuchsia-300 ${verFurigana ? "" : "invisible"}`}
                >
                  {s.r}
                </rt>
              </ruby>
            ) : (
              <span key={i}>{s.t}</span>
            ),
          )}
        </p>

        <p
          className={`text-center text-sm text-zinc-300 ${resuelto ? "" : "invisible"}`}
        >
          <span className="mr-1 text-violet-500/70">›</span>
          {ejercicio.traduccion}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ejercicio.opciones.map((id, i) => {
          const estado =
            resuelto && id === ejercicio.correcta
              ? "correcta"
              : intentadas.includes(id)
                ? "fallada"
                : "normal";
          return (
            <button
              key={id}
              type="button"
              disabled={resuelto || intentadas.includes(id)}
              onClick={() => elegir(id)}
              className={`flex items-center gap-3 rounded-md border px-4 py-3 text-left text-lg transition disabled:cursor-default ${estiloOpcion(estado)}`}
            >
              <span className="font-mono text-xs text-zinc-500">{i + 1}</span>
              {gramatica[id].forma}
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
          {ordenExplicacion.map((id) => {
            const e = gramatica[id];
            const esCorrecta = id === ejercicio.correcta;
            return (
              <div
                key={id}
                className={`flex flex-col gap-2 rounded-md border bg-zinc-900/60 p-4 ${
                  esCorrecta ? "border-emerald-400/60" : "border-zinc-700"
                }`}
              >
                <div className="flex items-baseline gap-3">
                  <span
                    className={`text-xl ${esCorrecta ? "text-emerald-300" : "text-zinc-100"}`}
                  >
                    {e.patron}
                  </span>
                  <span
                    className={`font-mono text-[10px] tracking-widest uppercase ${
                      esCorrecta ? "text-emerald-400" : "text-zinc-500"
                    }`}
                  >
                    {esCorrecta ? "Correcta" : "Incorrecta"}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">{e.significado}</p>
                <p className="text-sm text-zinc-200">
                  {ejercicio.explicaciones[id]}
                </p>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                    Estructura base
                  </span>
                  <ul className="flex flex-col gap-0.5 font-mono text-xs text-violet-200">
                    {e.conexion.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
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
