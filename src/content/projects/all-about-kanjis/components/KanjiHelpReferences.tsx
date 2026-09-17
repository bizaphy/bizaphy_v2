import { memo } from "react";
import Image from "next/image";

type Props = {
  urlImagenMnemotecnica?: string | null;
  fraseMnemotecnica?: string | null;
};

function KanjiHelpReferences({
  urlImagenMnemotecnica,
  fraseMnemotecnica,
}: Props) {
  return (
    <section className="flex items-stretch gap-4 p-4 [contain:paint]">
      <div className="flex overflow-hidden rounded-md border border-fuchsia-500/40 bg-zinc-900/60 shadow-[0_0_10px_rgba(217,70,239,0.25)]">
        <div className="flex items-center justify-center border-r border-zinc-700 px-2">
          <span className="rotate-180 font-mono text-xs tracking-widest text-fuchsia-300 [writing-mode:vertical-rl]">
            AYUDA MEMORIA
          </span>
        </div>

        <div className="p-3">
          <div className="flex size-48 items-center justify-center overflow-hidden rounded border border-dashed border-zinc-700 bg-zinc-900/40">
            {urlImagenMnemotecnica ? (
              <Image
                src={urlImagenMnemotecnica}
                alt="Imagen mnemotecnica del kanji"
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

        <div className="flex flex-1 items-center border-l border-zinc-700 p-4">
          {fraseMnemotecnica ? (
            <p className="text-sm italic leading-relaxed text-zinc-300">
              &ldquo;{fraseMnemotecnica}&rdquo;
            </p>
          ) : (
            <span className="font-mono text-[10px] tracking-wider text-zinc-600">
              sin frase
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(KanjiHelpReferences);
