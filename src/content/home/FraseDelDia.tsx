import Image from "next/image";

type Frase = {
  texto: string;
  autor: string;
  imagen: string;
};

const frase: Frase = {
  texto: "Apurarse es perder el tiempo",
  autor: "Mujer del sur",
  imagen: "/images/misc/dorothy_placeholder.webp",
};

export default function FraseDelDia() {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 flex">
      <div className="flex items-center justify-center px-3 border-r border-zinc-700">
        <span className="font-mono text-xs tracking-widest text-zinc-500 [writing-mode:vertical-rl] rotate-180">
          FRASE DEL DIA
        </span>
      </div>

      <div className="flex flex-col items-center gap-4 px-6 py-6 flex-1">
      <div className="relative h-32 w-32 overflow-hidden rounded-lg">
        <Image
          src={frase.imagen}
          alt="Frase del día"
          fill
          sizes="128px"
          className="object-cover"
          unoptimized
        />
      </div>
      <p className="italic text-center text-zinc-300 text-sm max-w-sm">
        &ldquo;{frase.texto}&rdquo;
      </p>
      <span className="font-mono text-xs text-fuchsia-400">
        — {frase.autor}
      </span>
      </div>
    </div>
  );
}
