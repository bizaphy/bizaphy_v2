"use client";

/**
 * Separador visual de tres luces neon que ademas actua como boton
 * para volver al inicio de la pagina con scroll suave.
 */
export default function BackToTopDots() {
  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", //scroll animado para evitar salto instantaneo
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Volver al inicio"
      className="group flex w-full cursor-pointer justify-center gap-4 pt-2 pb-10"
    >
      <span className="neon-led inline-block h-2 w-2 rounded-full bg-fuchsia-500 transition-transform group-hover:scale-125" />
      <span className="neon-led inline-block h-2 w-2 rounded-full bg-fuchsia-500 transition-transform delay-75 group-hover:scale-125" />
      <span className="neon-led inline-block h-2 w-2 rounded-full bg-fuchsia-500 transition-transform delay-150 group-hover:scale-125" />
    </button>
  );
}
