import { memo } from "react";
import KanjiImageZoom from "./KanjiImageZoom";
import KanjiOracionEjemplo from "./KanjiOracionEjemplo";

type Props = {
  caracter: string;
  urlImagenMnemotecnica?: string | null;
  fraseMnemotecnica?: string | null;
  oracionEjemplo: string | null;
  traduccionOracion: string | null;
};

function KanjiHelpReferences({
  caracter,
  urlImagenMnemotecnica,
  fraseMnemotecnica,
  oracionEjemplo,
  traduccionOracion,
}: Props) {
  return (
    // Ayuda memoria a la izquierda y oracion de ejemplo a la derecha, mitad y
    // mitad (ambos flex-1). En pantallas angostas la oracion baja.
    <section className="flex flex-col items-stretch gap-4 p-4 contain-[paint] md:flex-row">
      <div className="flex flex-1 flex-col overflow-hidden rounded-md border border-zinc-700 bg-zinc-900/60">
        <div className="border-b border-zinc-700 px-3 py-2 font-mono text-xs tracking-widest text-fuchsia-300">
          AYUDA MEMORIA
        </div>

        {/* imagen | frase */}
        <div className="flex flex-1">
          <div className="p-3">
            <div className="flex items-center justify-center overflow-hidden rounded">
              {urlImagenMnemotecnica ? (
                <KanjiImageZoom
                  src={urlImagenMnemotecnica}
                  alt="Imagen mnemotecnica del kanji"
                />
              ) : (
                <div className="flex size-72 items-center justify-center lg:size-80">
                  <span className="font-mono text-[10px] tracking-wider text-zinc-600">
                    sin imagen
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 items-center border-l border-zinc-700 p-4">
            {fraseMnemotecnica ? (
              <p className="text-sm italic leading-relaxed text-zinc-300 lg:text-base">
                &ldquo;{fraseMnemotecnica}&rdquo;
              </p>
            ) : (
              <span className="font-mono text-[10px] tracking-wider text-zinc-600">
                sin frase
              </span>
            )}
          </div>
        </div>
      </div>
      <KanjiOracionEjemplo
        caracter={caracter}
        oracion={oracionEjemplo}
        traduccion={traduccionOracion}
      />
    </section>
  );
}

export default memo(KanjiHelpReferences);
