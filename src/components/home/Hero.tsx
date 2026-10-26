import NeonnaHero from "@/components/neonna/NeonnaHero";

export default function Hero() {
  return (
    //marco de pantalla CRT: borde fino (1px en oscuro, 2px en claro) sin borde
    //inferior, y esquinas curvas
    <div className="relative w-full overflow-hidden rounded-[1.5rem] border border-b-0 claro:border-2 claro:border-b-0 border-zinc-800 claro:border-zinc-700 bg-black shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      {/* Neonna en la tele: v19 en modo oscuro, v22 en modo claro (el zoom lo
          hace NeonnaHero) */}
      <NeonnaHero />
      {/* scanline sutil encima para amarrarla a la estetica */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] bg-size-[100%_3px] mix-blend-overlay"
      />
      {/* vineta y sombra interior: bordes curvos del tubo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.6)_100%)] shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]"
      />
    </div>
  );
}
