"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { quitarFurigana } from "@/lib/furigana";
import type { Comodin } from "@/shared/types/comodin";
import { estiloBotonChico, estiloCampo } from "./frases";

// ─── Comodines de una fila ───
// "+ comodín" abre un mini formulario: escribes la palabra que te costo
// (tiene que estar en la frase) y, si quieres, su significado. Se guarda la
// palabra junto a la frase entera. Truco: si seleccionas la palabra en la
// frase antes de apretar el boton, se escribe sola.
export function ComodinesFila({
  frase,
  comodines,
  onAgregar,
  onQuitar,
}: {
  frase: string;
  comodines: Comodin[];
  onAgregar: (palabra: string, significado: string) => boolean;
  onQuitar: (id: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [palabra, setPalabra] = useState("");
  const [significado, setSignificado] = useState("");
  const limpia = quitarFurigana(frase);
  const valida = palabra.trim() !== "" && limpia.includes(palabra.trim());

  const abrir = () => {
    const seleccion = window.getSelection()?.toString().trim() ?? "";
    setPalabra(seleccion && limpia.includes(seleccion) ? seleccion : "");
    setSignificado("");
    setAbierto(true);
  };

  const guardar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!valida) return;
    if (onAgregar(palabra.trim(), significado.trim())) {
      toast.success(`「${palabra.trim()}」 al comodín`);
      setAbierto(false);
    } else {
      toast.error("Esa palabra ya está en el comodín con esta frase");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {comodines.map((comodin) => (
          <span
            key={comodin.id}
            className="flex items-center gap-1.5 rounded-md border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 font-mono text-sm text-violet-100"
          >
            {comodin.palabra}
            {comodin.lectura && comodin.lectura !== comodin.palabra && (
              <span className="text-xs text-violet-300/80">
                {comodin.lectura}
              </span>
            )}
            <button
              type="button"
              onClick={() => onQuitar(comodin.id)}
              className="text-zinc-500 hover:text-red-400"
              aria-label={`Quitar ${comodin.palabra} del comodín`}
            >
              ✕
            </button>
          </span>
        ))}
        {!abierto && (
          <button
            type="button"
            // mousedown sin default: no se pierde la seleccion de la frase
            onMouseDown={(e) => e.preventDefault()}
            onClick={abrir}
            className={`${estiloBotonChico} border-dashed`}
          >
            + comodín
          </button>
        )}
      </div>

      {abierto && (
        <form
          onSubmit={guardar}
          className="flex flex-wrap items-center gap-2 rounded-md border border-violet-500/40 bg-zinc-900 p-2"
        >
          <input
            // biome-ignore lint/a11y/noAutofocus: el formulario se abre para escribir aqui
            autoFocus
            className={`${estiloCampo} w-36 px-2 py-1 font-mono`}
            value={palabra}
            onChange={(e) => setPalabra(e.target.value)}
            placeholder="Palabra"
            aria-label="Palabra que te costó"
          />
          <input
            className={`${estiloCampo} min-w-40 flex-1 px-2 py-1 text-sm`}
            value={significado}
            onChange={(e) => setSignificado(e.target.value)}
            placeholder="Significado (opcional)"
            aria-label="Significado"
          />
          <button
            type="submit"
            disabled={!valida}
            className={`${estiloBotonChico} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Guardar
          </button>
          <button
            type="button"
            className={estiloBotonChico}
            onClick={() => setAbierto(false)}
          >
            Cancelar
          </button>
          {palabra.trim() && !valida && (
            <span className="w-full text-xs text-fuchsia-300">
              La palabra tiene que estar escrita tal cual en la frase (sin
              furigana).
            </span>
          )}
        </form>
      )}
    </div>
  );
}

// ─── Resumen de los comodines del texto abierto ───
export function ComodinesDelTexto({ comodines }: { comodines: Comodin[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-violet-500/40 bg-zinc-900/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs tracking-widest text-violet-300 uppercase">
          Comodín · {comodines.length}
        </span>
        <Link
          href="/admin/reading-vocab"
          className="ml-auto font-mono text-xs text-zinc-400 hover:text-fuchsia-300"
        >
          Ir al reading-vocab test →
        </Link>
      </div>
      {comodines.length === 0 ? (
        <p className="text-sm text-zinc-400">
          ¿Una palabra te costó? Usa{" "}
          <span className="text-violet-300">+ comodín</span> en su frase. Si
          antes la seleccionas con el mouse, se escribe sola.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {comodines.map((comodin) => (
            <li
              key={comodin.id}
              className="rounded-md border border-violet-500/40 bg-violet-500/10 px-2.5 py-1 font-mono text-base text-violet-100"
            >
              {comodin.palabra}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
