"use client";

//Opcion "en vivo": dibuja el SVG animado de Neonna en un canvas chico
//(cols x rows) y convierte sus pixeles a ASCII en cada fotograma. Depende de
//que el navegador respete las animaciones CSS del SVG al pasarlo por
//drawImage (probado en Chromium); si no, queda quieta pero se ve igual.

import { useEffect, useState } from "react";
import AsciiPantalla from "./AsciiPantalla";
import {
  COLS,
  ROWS,
  FPS,
  CICLO,
  PALETA,
  PALETA_CLARA,
  pixelesAAscii,
  type FotogramaAscii,
} from "@/lib/neonna-ascii";

export default function NeonnaAsciiVivo({
  src = "/images/neonna/neonna-base.svg",
  cols = COLS,
  rows = ROWS,
  proporcion = 260 / 324,
  alto = 300,
  etiqueta = "Neonna en arte ASCII, convertida en vivo",
  bordes = false,
  saltos = false,
  claro = false,
  fondo,
  className = "",
}: {
  src?: string;
  //resolucion en letras. Para que no se deforme:
  //rows ≈ cols / proporcion * 0.6 (las letras son mas altas que anchas)
  cols?: number;
  rows?: number;
  //ancho / alto del SVG
  proporcion?: number;
  //alto en px; null = ocupa todo el ancho del contenedor
  alto?: number | null;
  etiqueta?: string;
  //contornos donde el brillo cambia fuerte (ver pixelesAAscii)
  bordes?: boolean;
  //la imagen salta de lado a lado con glitch, como el gif del Hero
  saltos?: boolean;
  //fondo claro (el del modo claro), tinta oscura y densidad invertida
  //(ver pixelesAAscii)
  claro?: boolean;
  //color de fondo de la caja. Por defecto negro (o el claro, con claro)
  fondo?: string;
  className?: string;
}) {
  const [fotograma, setFotograma] = useState<FotogramaAscii | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = cols;
    canvas.height = rows;
    //willReadFrequently: getImageData en cada fotograma, mejor en CPU
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    //la imagen tiene que estar en la pagina: si no, el navegador no avanza las
    //animaciones del SVG y drawImage dibuja siempre el mismo fotograma.
    //Invisible, de 1px y fuera del flujo
    const img = new Image();
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.style.cssText =
      "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none";
    img.src = src;
    document.body.appendChild(img);
    //momento en que arranca: el fotograma sale del tiempo real, igual que las
    //animaciones del SVG, asi el glitch y lo que pasa en el SVG (parpadeo)
    //quedan sincronizados. Contar con setInterval se va desfasando
    let inicio = 0;
    let id: ReturnType<typeof setInterval> | undefined;
    let vivo = true;

    const dibujar = () => {
      //en claro se deja transparente: asi se distingue el fondo del dibujo
      if (claro) ctx.clearRect(0, 0, cols, rows);
      else {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cols, rows);
      }
      //estira el SVG a cols x rows: compensa que las letras son mas altas que anchas
      ctx.drawImage(img, 0, 0, cols, rows);
      const frame = Math.floor(((performance.now() - inicio) / 1000) * FPS) % CICLO;
      setFotograma(pixelesAAscii(ctx.getImageData(0, 0, cols, rows).data, frame, cols, rows, { bordes, saltos, claro }));
    };

    img
      .decode()
      .then(() => {
        if (!vivo) return;
        inicio = performance.now();
        dibujar();
        //con movimiento reducido se queda en el primer fotograma
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          id = setInterval(dibujar, 1000 / FPS);
        }
      })
      .catch(() => {});

    return () => {
      vivo = false;
      clearInterval(id);
      img.remove();
    };
  }, [src, cols, rows, bordes, saltos, claro]);

  return (
    <div role="img" aria-label={etiqueta} className={className}>
      <AsciiPantalla
        fotograma={fotograma}
        cols={cols}
        rows={rows}
        proporcion={proporcion}
        alto={alto ?? undefined}
        paleta={claro ? PALETA_CLARA : PALETA}
        //#f7f7f9: el fondo del modo claro (tema-claro.css). Fijo, asi tambien se
        //ve bien si la pagina esta en modo oscuro
        fondo={fondo ?? (claro ? "#f7f7f9" : "#000")}
      />
    </div>
  );
}
