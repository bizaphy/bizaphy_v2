export default function Hero() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/misc/valhalla.gif"
        alt="Valhalla"
        className="block h-auto w-full"
      />
      {/* scanline sutil sobre el gif para amarrarlo a la estetica */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] bg-[length:100%_3px] mix-blend-overlay"
      />
    </div>
  );
}
