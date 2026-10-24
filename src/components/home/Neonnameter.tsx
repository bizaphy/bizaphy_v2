import Image from "next/image";

//Neonna dentro de un circulo. En modo claro se cambia a la version con lentes
//de sol (el tema la deslumbra). El cambio es solo CSS con la variante claro:,
//asi que sigue a data-theme sin JS y sin parpadeo al cargar.

const MODELOS = [
  {
    src: "/images/neonna/neonna-base.svg",
    alt: "Neonna, chica chibi cyberpunk",
    clase: "claro:hidden",
  },
  {
    src: "/images/neonna/neonna-sunglasses.svg",
    alt: "Neonna con lentes de sol, deslumbrada por el modo claro",
    clase: "hidden claro:block",
  },
];

export default function Neonnameter({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative size-32 shrink-0 overflow-hidden rounded-full border border-fuchsia-500/40 bg-black shadow-[0_0_18px_rgba(217,70,239,0.25)] claro:bg-[radial-gradient(circle_at_50%_30%,#fff7d6,#fde68a_35%,#fbcfe8_75%,#f5d0fe_100%)] ${className}`}
    >
      {MODELOS.map((m) => (
        //el SVG mide 260x324: anclado arriba, asi el circulo
        //muestra cabeza y torso y recorta las piernas. La coleta alarga el
        //lienzo hacia la izquierda, asi que Neonna queda ~6% a la derecha del
        //centro: -translate-x-[6%] la centra. El circulo es ~15% mas grande que
        //el dibujo (w-[87%]) para que tenga aire y el pelo asimetrico no se vea
        //descuadrado
        <Image
          key={m.src}
          src={m.src}
          alt={m.alt}
          width={260}
          height={324}
          unoptimized
          className={`absolute inset-x-0 top-3 mx-auto h-auto w-[87%] -translate-x-[6%] ${m.clase}`}
        />
      ))}
    </div>
  );
}
