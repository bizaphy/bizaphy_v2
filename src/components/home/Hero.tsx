import NeonnaHero from "@/components/neonna/NeonnaHero";

export default function Hero() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {/* Neonna en la tele: v19 en modo oscuro, v9.2 en modo claro */}
      <NeonnaHero />
      {/* scanline sutil encima para amarrarla a la estetica */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] bg-[length:100%_3px] mix-blend-overlay"
      />
    </div>
  );
}
