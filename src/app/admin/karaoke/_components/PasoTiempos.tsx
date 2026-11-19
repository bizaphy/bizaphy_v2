"use client";

import { type RefObject, useEffect, useState } from "react";
import { quitarFurigana } from "@/lib/furigana";
import type { FilaReading } from "@/shared/types/reading";
import { estiloBotonChico, estiloCampo } from "../../_compartido/frases";
import { formatearTiempo, parsearTiempo } from "../_lib/tiempos";

// ─── Paso de tiempos: a cada fila se le asigna cuando sale ───
// Flujo rapido: dale play y presiona Enter justo cuando empieza cada frase.
// El tiempo va a la fila marcada como "siguiente" y el cursor avanza solo.
// Despues se afina fila por fila con ±0.1 s o escribiendo el tiempo.
export default function PasoTiempos({
  filas,
  tiempos,
  activa,
  videoRef,
  hayVideo,
  onCambiar,
  onMoverTodos,
}: {
  filas: FilaReading[];
  tiempos: (number | null)[];
  activa: number;
  videoRef: RefObject<HTMLVideoElement | null>;
  hayVideo: boolean;
  onCambiar: (indice: number, t: number | null) => void;
  onMoverTodos: (delta: number) => void;
}) {
  // Arranca en la primera fila sin tiempo
  const [cursor, setCursor] = useState(() => {
    const libre = tiempos.indexOf(null);
    return libre === -1 ? 0 : libre;
  });
  const marcadas = tiempos.filter((t) => t !== null).length;

  // Atajos de teclado. Se ignoran mientras escribes en un campo, para que
  // Enter y Retroceso funcionen normal ahi.
  useEffect(() => {
    const alTeclear = (evento: KeyboardEvent) => {
      const objetivo = evento.target as HTMLElement;
      if (objetivo.closest("input, textarea")) return;
      const video = videoRef.current;
      if (!video) return;

      if (evento.key === "Enter") {
        evento.preventDefault();
        if (cursor >= filas.length) return;
        onCambiar(cursor, Math.round(video.currentTime * 10) / 10);
        setCursor(cursor + 1);
      } else if (evento.key === "Backspace") {
        // Deshace la ultima marca: borra el tiempo de la fila anterior
        evento.preventDefault();
        if (cursor === 0) return;
        onCambiar(cursor - 1, null);
        setCursor(cursor - 1);
      } else if (evento.key === " " && objetivo.tagName !== "VIDEO") {
        // El video con foco ya maneja el espacio por su cuenta
        evento.preventDefault();
        if (video.paused) video.play();
        else video.pause();
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [cursor, filas.length, onCambiar, videoRef]);

  const ir = (t: number | null) => {
    const video = videoRef.current;
    if (!video || t === null) return;
    video.currentTime = t;
    video.play();
  };

  if (filas.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-400">
        No hay filas. Escribe la letra en el paso 1.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-700 p-3 text-sm text-zinc-400">
        <p>
          <kbd className="text-violet-300">Enter</kbd> marca la fila siguiente
          con el tiempo actual · <kbd className="text-violet-300">Retroceso</kbd>{" "}
          deshace la última · <kbd className="text-violet-300">Espacio</kbd>{" "}
          play/pausa · clic en una frase para moverla a &quot;siguiente&quot;.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-zinc-500">
            {marcadas}/{filas.length} marcadas
          </span>
          <span className="ml-auto font-mono text-xs text-zinc-500">
            Mover todos
          </span>
          {[-0.5, -0.1, 0.1, 0.5].map((delta) => (
            <button
              key={delta}
              type="button"
              className={estiloBotonChico}
              disabled={marcadas === 0}
              onClick={() => onMoverTodos(delta)}
            >
              {delta > 0 ? "+" : ""}
              {delta} s
            </button>
          ))}
        </div>
        {!hayVideo && (
          <p className="text-fuchsia-300">
            Carga un video o audio arriba para poder marcar.
          </p>
        )}
      </div>

      <ol className="flex flex-col gap-1.5">
        {filas.map((fila, indice) => {
          const t = tiempos[indice];
          const esCursor = indice === cursor;
          return (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: dos filas pueden tener el mismo texto
              key={indice}
              className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 ${
                indice === activa
                  ? "border-violet-400 bg-violet-500/10"
                  : esCursor
                    ? "border-fuchsia-500/70 bg-zinc-900/60"
                    : "border-zinc-800 bg-zinc-900/60"
              }`}
            >
              <span className="w-6 font-mono text-xs text-zinc-500">
                {String(indice + 1).padStart(2, "0")}
              </span>
              {/* key con el tiempo: si cambia desde afuera (Enter, ±0.1),
                  el campo se vuelve a armar con el valor nuevo */}
              <input
                key={t ?? "vacio"}
                defaultValue={t === null ? "" : formatearTiempo(t)}
                placeholder="—:—"
                aria-label={`Tiempo de la fila ${indice + 1}`}
                className={`${estiloCampo} w-20 px-2 py-1 font-mono text-sm`}
                onBlur={(e) => {
                  const nuevo = parsearTiempo(e.target.value);
                  if (nuevo === undefined) {
                    e.target.value = t === null ? "" : formatearTiempo(t);
                  } else if (nuevo !== t) {
                    onCambiar(indice, nuevo);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  className={estiloBotonChico}
                  disabled={t === null}
                  onClick={() =>
                    t !== null &&
                    onCambiar(
                      indice,
                      Math.max(0, Math.round((t - 0.1) * 10) / 10),
                    )
                  }
                >
                  −0.1
                </button>
                <button
                  type="button"
                  className={estiloBotonChico}
                  disabled={t === null}
                  onClick={() =>
                    t !== null &&
                    onCambiar(indice, Math.round((t + 0.1) * 10) / 10)
                  }
                >
                  +0.1
                </button>
                <button
                  type="button"
                  className={estiloBotonChico}
                  disabled={t === null || !hayVideo}
                  onClick={() => ir(t)}
                  aria-label={`Escuchar desde la fila ${indice + 1}`}
                >
                  ▶
                </button>
                <button
                  type="button"
                  className={`${estiloBotonChico} hover:border-red-500`}
                  disabled={t === null}
                  onClick={() => onCambiar(indice, null)}
                  aria-label={`Borrar el tiempo de la fila ${indice + 1}`}
                >
                  ✕
                </button>
              </div>
              <button
                type="button"
                onClick={() => setCursor(indice)}
                className="min-w-0 flex-1 truncate text-left font-mono text-base text-zinc-200 hover:text-white"
              >
                {quitarFurigana(fila.ja)}
              </button>
              {esCursor && (
                <span className="font-mono text-[10px] tracking-widest text-fuchsia-300 uppercase">
                  siguiente
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
