import Image from "next/image";

type Props = {
  urlOrdenTrazos?: string | null;
  urlImagenMnemotecnica?: string | null;
};

export default function KanjiDisplayImgs({
  urlOrdenTrazos,
  urlImagenMnemotecnica,
}: Props) {
  return (
    <section className="flex flex-wrap items-stretch gap-4 p-4">
      {/* Zona 1: orden de trazos con etiqueta vertical "N° TRAZOS" (mismo patron que FraseDelDia). */}
      <div className="flex overflow-hidden rounded-md border border-fuchsia-500/40 bg-zinc-900/60 shadow-[0_0_10px_rgba(217,70,239,0.25)]">
        <div className="flex items-center justify-center border-r border-zinc-700 px-2">
          <span className="rotate-180 font-mono text-xs tracking-widest text-fuchsia-300 [writing-mode:vertical-rl]">
            ORDEN DE TRAZOS
          </span>
        </div>
        <div className="p-3">
          <div className="flex size-48 items-center justify-center overflow-hidden rounded border border-dashed border-zinc-700 bg-zinc-900/40">
            {urlOrdenTrazos ? (
              <Image
                src={urlOrdenTrazos}
                alt="Orden de trazos del kanji"
                width={192}
                height={192}
                className="h-full w-full object-contain"
                unoptimized
              />
            ) : (
              <span className="font-mono text-[10px] tracking-wider text-zinc-600">
                sin imagen
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Zona 2: guia-truco / mnemotecnica. Sin etiqueta al lado. */}
      <div className="rounded-md border border-fuchsia-500/40 bg-zinc-900/60 p-3 shadow-[0_0_10px_rgba(217,70,239,0.25)]">
        <div className="flex size-48 items-center justify-center overflow-hidden rounded border border-dashed border-zinc-700 bg-zinc-900/40">
          {urlImagenMnemotecnica ? (
            <Image
              src={urlImagenMnemotecnica}
              alt="Guia mnemotecnica del kanji"
              width={128}
              height={128}
              className="h-full w-full object-contain"
              unoptimized
            />
          ) : (
            <span className="font-mono text-[10px] tracking-wider text-zinc-600">
              sin imagen
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
