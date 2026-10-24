import NeonnaHero from "@/components/neonna/NeonnaHero";

export default function Hero() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {/* Neonna en la tele: v19 en modo oscuro, v9.2 en modo claro. Zoom de 10%
          priorizando la cara: el origen va cerca del borde de abajo, asi lo que se
          recorta es sobre todo el pelo de arriba (el contenedor recorta lo que sobra) */}
      <div style={{ transform: "scale(1.1)", transformOrigin: "50% 90%" }}>
        <NeonnaHero />
      </div>
      {/* scanline sutil encima para amarrarla a la estetica */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] bg-[length:100%_3px] mix-blend-overlay"
      />
    </div>
  );
}
