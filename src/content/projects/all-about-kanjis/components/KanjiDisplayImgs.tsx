import { memo } from "react";
import KanjiStrokeOrder from "./KanjiStrokeOrder";

type Props = {
  caracter: string;
  radicales?: string | null;
};

// memo evita re-render cuando las props no cambian. Sin re-render el
// navegador no repinta el bloque, y la etiqueta vertical "ORDEN DE TRAZOS"
// no parpadea.
function KanjiDisplayImgs({ caracter, radicales }: Props) {
  // Radicales llegan como texto separado por "、" (misma convencion que
  // onyomi/kunyomi). Filtramos strings vacios por si acaso.
  const listaRadicales =
    radicales
      ?.split("、")
      .map((r) => r.trim())
      .filter(Boolean) ?? [];

  return (
    // contain:paint aisla el painting de la seccion: cualquier repaint que
    // se dispare aca queda contenido, y cualquier repaint de afuera (tooltip
    // de una card, cambio de seleccionado) tampoco alcanza al label vertical.
    <section className="flex flex-wrap items-stretch gap-4 p-4 [contain:paint]">
      <KanjiStrokeOrder caracter={caracter} />

      {/* RADICALES: label arriba (no lateral) y sin borde/shadow fuchsia,
          solo fondo gris, para no sobresaturar el estilo del bloque vecino. */}
      <div className="flex flex-col overflow-hidden rounded-md bg-zinc-900/60">
        <div className="flex items-center justify-center border-b border-zinc-700 py-2">
          <span className="font-mono text-xs tracking-widest text-zinc-400">
            RADICALES
          </span>
        </div>
        <div className="p-3">
          <div className="flex size-72 flex-wrap items-center justify-center gap-3 overflow-hidden rounded bg-zinc-900/40 p-4 lg:size-80">
            {listaRadicales.length > 0 ? (
              listaRadicales.map((r) => (
                <span
                  key={r}
                  className="rounded border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-3xl text-zinc-200 lg:text-4xl"
                >
                  {r}
                </span>
              ))
            ) : (
              <span className="font-mono text-sm tracking-wider text-zinc-500">
                N/A
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(KanjiDisplayImgs);
