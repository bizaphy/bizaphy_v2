"use client";

//Neonna dentro de la tele para el Hero del home, en ASCII en vivo.
//Modo oscuro: v19 (toc toc, con la cabeza ladeada, los brazos abiertos y
//sombreado sutil en cara y manos). Modo claro: v22 (la misma con lentes de sol,
//boca en V invertida, luz gris en ASCII en los bordes y paleta brillante). Una
//sola animacion a la vez: cambia el SVG segun el tema.

import { useSyncExternalStore } from "react";
import NeonnaAsciiVivo from "./NeonnaAsciiVivo";
import { leerTema, suscribirse } from "@/components/ui/ThemeToggle";

const VERSIONES = {
  dark: {
    src: "/images/neonna/neonna-tele-ladeada.svg",
    luz: undefined,
    brillante: false,
    mascaraOriginal: undefined,
    etiqueta:
      "Neonna dentro de una tele, con la cabeza ladeada y una mano dandole toques a la pantalla",
  },
  light: {
    //v22: la v19 con lentes de sol y boca en V invertida, luz gris en ASCII
    //que entra unas pocas letras desde los bordes y paleta brillante (los
    //lentes conservan sus colores originales gracias a la mascara)
    src: "/images/neonna/neonna-tele-lentes-v.svg",
    luz: 4,
    brillante: true,
    mascaraOriginal: "/images/neonna/neonna-tele-lentes-mascara.svg",
    etiqueta:
      "Neonna dentro de una tele, con lentes de sol, la boca en V invertida y luz gris que llega desde los bordes",
  },
};

export default function NeonnaHero() {
  // En el servidor se asume oscuro y React corrige al hidratar (igual que ThemeToggle)
  const tema = useSyncExternalStore(suscribirse, leerTema, () => "dark" as const);
  const { src, luz, brillante, mascaraOriginal, etiqueta } = VERSIONES[tema];

  return (
    <NeonnaAsciiVivo
      src={src}
      //180 x 47 letras: 47 ≈ 180 / (640 / 280) * 0.6
      cols={180}
      rows={47}
      proporcion={640 / 280}
      alto={null}
      saltos
      //zoom de 10% priorizando la cara: el punto fijo va cerca del borde de
      //abajo, asi lo que se recorta es sobre todo el pelo de arriba
      zoom={{ escala: 1.1, origen: [0.5, 0.9] }}
      luz={luz}
      brillante={brillante}
      mascaraOriginal={mascaraOriginal}
      etiqueta={etiqueta}
      className="w-full"
    />
  );
}
