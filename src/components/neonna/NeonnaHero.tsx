"use client";

//Neonna dentro de la tele para el Hero del home, en ASCII en vivo.
//Modo oscuro: v18 (toc toc, con los brazos abiertos y las manos grandes, con
//sombreado sutil en cara y manos). Modo claro: v9.2 (la v9, le llega el sol: ojos
//cerrados y boca en V, sobre fondo gris zinc-800). Una sola animacion a la
//vez: cambia el SVG segun el tema.

import { useSyncExternalStore } from "react";
import NeonnaAsciiVivo from "./NeonnaAsciiVivo";
import { leerTema, suscribirse } from "@/components/ui/ThemeToggle";

const VERSIONES = {
  dark: {
    src: "/images/neonna/neonna-tele-sombra.svg",
    fondo: "#000",
    etiqueta:
      "Neonna dentro de una tele, con los brazos abiertos y una mano dandole toques a la pantalla",
  },
  light: {
    src: "/images/neonna/neonna-tele-sol.svg",
    fondo: "#27272a",
    etiqueta: "Neonna dentro de una tele, apretando los ojos por la luz del sol",
  },
};

export default function NeonnaHero() {
  // En el servidor se asume oscuro y React corrige al hidratar (igual que ThemeToggle)
  const tema = useSyncExternalStore(suscribirse, leerTema, () => "dark" as const);
  const { src, fondo, etiqueta } = VERSIONES[tema];

  return (
    <NeonnaAsciiVivo
      src={src}
      //180 x 47 letras: 47 ≈ 180 / (640 / 280) * 0.6
      cols={180}
      rows={47}
      proporcion={640 / 280}
      alto={null}
      saltos
      fondo={fondo}
      etiqueta={etiqueta}
      className="w-full"
    />
  );
}
