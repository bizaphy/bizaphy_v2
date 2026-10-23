//Interruptor de tema de la navbar (oscuro neon / claro pastel). Navbar es un
//server component, por eso va aparte.
"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

export type Tema = "dark" | "light";

export const CLAVE_TEMA = "tema";

// El script del <head> (ver layout.tsx) aplica el tema guardado antes de
// pintar; este componente solo lee y cambia el atributo de <html>.
const leerTema = (): Tema =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

// Se re-renderiza cuando cambia data-theme, venga de donde venga.
function suscribirse(avisar: () => void) {
  const observador = new MutationObserver(avisar);
  observador.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observador.disconnect();
}

function aplicarTema(tema: Tema) {
  const html = document.documentElement;
  // Mientras dura la transicion, el CSS funde colores y bordes en vez de
  // cambiarlos de golpe (ver tema-claro.css).
  html.setAttribute("data-theme-transicion", "");
  html.dataset.theme = tema;
  window.setTimeout(() => html.removeAttribute("data-theme-transicion"), 400);
}

export default function ThemeToggle() {
  // En el servidor no hay localStorage: se asume oscuro y React corrige al
  // hidratar, sin error de hidratacion.
  const tema = useSyncExternalStore(suscribirse, leerTema, () => "dark");
  const claro = tema === "light";

  // En desarrollo, el remontaje de Strict Mode borra el atributo que puso el
  // script del <head>: se vuelve a aplicar antes de pintar. En produccion no
  // cambia nada.
  useLayoutEffect(() => {
    try {
      if (localStorage.getItem(CLAVE_TEMA) === "light") {
        document.documentElement.dataset.theme = "light";
      }
    } catch {}
  }, []);

  const alternar = () => {
    const siguiente: Tema = claro ? "dark" : "light";
    aplicarTema(siguiente);
    try {
      localStorage.setItem(CLAVE_TEMA, siguiente);
    } catch {}
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={claro}
      aria-label="Modo claro"
      title={claro ? "Pasar a modo oscuro" : "Pasar a modo claro"}
      onClick={alternar}
      className="group flex items-center gap-1.5"
    >
      {/* Luna / sol: muestran el modo al que se pasa con el clic */}
      <span
        aria-hidden="true"
        className="text-xs text-zinc-500 transition group-hover:text-fuchsia-400"
      >
        {/* ︎ fuerza la version de texto: sin el, algunos sistemas
            dibujan el sol como emoji a color */}
        {claro ? "☾︎" : "☀︎"}
      </span>
      <span
        className={`relative h-4 w-7 rounded-full border transition ${
          claro
            ? "border-fuchsia-500 bg-fuchsia-500/30"
            : "border-zinc-600 bg-zinc-800 group-hover:border-fuchsia-500"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-2.5 w-2.5 rounded-full transition ${
            claro
              ? "translate-x-3 bg-fuchsia-500"
              : "bg-zinc-500 group-hover:bg-fuchsia-400"
          }`}
        />
      </span>
    </button>
  );
}
