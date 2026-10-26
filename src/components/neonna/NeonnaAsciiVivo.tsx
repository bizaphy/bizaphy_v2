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
  PALETA_BRILLANTE,
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
  saltos = false,
  claro = false,
  fondo,
  luz,
  brillante = false,
  mascaraOriginal,
  zoom,
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
  //la imagen salta de lado a lado con glitch, como el gif del Hero
  saltos?: boolean;
  //fondo claro (el del modo claro), tinta oscura y densidad invertida
  //(ver pixelesAAscii)
  claro?: boolean;
  //color de fondo de la caja. Por defecto negro (o el claro, con claro)
  fondo?: string;
  //luz gris que llega desde todos los bordes, en ASCII: cuantas letras (de
  //alto) entra hacia adentro. Se ve solo detras de Neonna (ver pixelesAAscii)
  luz?: number;
  //paleta mas blanca, como si todo tuviera mas luz (PALETA_BRILLANTE)
  brillante?: boolean;
  //con brillante: SVG con solo las piezas que conservan su color original (los
  //lentes en la v22). Mismas animaciones que src, asi se mueven juntas
  mascaraOriginal?: string;
  //acerca el dibujo: escala y punto que queda fijo (0 a 1 en x e y). Se hace
  //en el canvas, no con CSS: asi lo que se recorta es el SVG y la luz queda
  //pareja en los cuatro bordes
  zoom?: { escala: number; origen: [number, number] };
  className?: string;
}) {
  const escala = zoom?.escala ?? 1;
  const [ox, oy] = zoom?.origen ?? [0.5, 0.5];
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
    const crearImagen = (ruta: string) => {
      const img = new Image();
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      img.style.cssText =
        "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none";
      img.src = ruta;
      document.body.appendChild(img);
      return img;
    };
    const img = crearImagen(src);
    //mascara de lo que conserva su color original: se dibuja en su propio
    //canvas y solo se mira el alfa. Se crea junto con img para que sus
    //animaciones arranquen a la par
    const usarMascara = brillante && !!mascaraOriginal;
    const imgMascara = usarMascara ? crearImagen(mascaraOriginal) : undefined;
    const ctxMascara = imgMascara
      ? Object.assign(document.createElement("canvas"), { width: cols, height: rows }).getContext("2d", {
          willReadFrequently: true,
        })
      : null;
    //momento en que arranca: el fotograma sale del tiempo real, igual que las
    //animaciones del SVG, asi el glitch y lo que pasa en el SVG (parpadeo)
    //quedan sincronizados. Contar con setInterval se va desfasando
    let inicio = 0;
    let id: ReturnType<typeof setInterval> | undefined;
    let vivo = true;

    //intensidad de la luz en cada celda: 1 en la orilla y se apaga hacia
    //adentro. La distancia al borde se mide en altos de letra (una letra mide
    //~0.6 de ancho, por eso se escala x). En las esquinas se suman los dos bordes
    let mapaLuz: Float32Array | undefined;
    if (luz) {
      mapaLuz = new Float32Array(cols * rows);
      const anchoLetra = (proporcion * rows) / cols;
      const brillo = (d: number) => Math.max(0, 1 - d / luz) ** 2;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const bx = brillo((Math.min(x, cols - 1 - x) + 0.5) * anchoLetra);
          const by = brillo(Math.min(y, rows - 1 - y) + 0.5);
          mapaLuz[y * cols + x] = 1 - (1 - bx) * (1 - by);
        }
      }
    }

    const dibujar = () => {
      //en claro (y con luz) se deja transparente: asi se distingue el fondo
      //del dibujo. Lo transparente se convierte igual que el negro
      if (claro || mapaLuz) ctx.clearRect(0, 0, cols, rows);
      else {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cols, rows);
      }
      //estira el SVG a cols x rows: compensa que las letras son mas altas que
      //anchas. Con zoom se dibuja mas grande y corrido, y el canvas recorta
      const posicion = [
        -(escala - 1) * cols * ox,
        -(escala - 1) * rows * oy,
        cols * escala,
        rows * escala,
      ] as const;
      ctx.drawImage(img, ...posicion);
      let original: Uint8Array | undefined;
      if (imgMascara && ctxMascara) {
        ctxMascara.clearRect(0, 0, cols, rows);
        ctxMascara.drawImage(imgMascara, ...posicion);
        const alfa = ctxMascara.getImageData(0, 0, cols, rows).data;
        original = new Uint8Array(cols * rows);
        for (let n = 0; n < cols * rows; n++) original[n] = alfa[n * 4 + 3] > 127 ? 1 : 0;
      }
      const frame = Math.floor(((performance.now() - inicio) / 1000) * FPS) % CICLO;
      setFotograma(
        pixelesAAscii(ctx.getImageData(0, 0, cols, rows).data, frame, cols, rows, {
          saltos,
          claro,
          luz: mapaLuz,
          original,
        }),
      );
    };

    Promise.all([img.decode(), imgMascara?.decode()])
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
      imgMascara?.remove();
    };
  }, [src, mascaraOriginal, brillante, cols, rows, proporcion, saltos, claro, luz, escala, ox, oy]);

  return (
    <div role="img" aria-label={etiqueta} className={className}>
      <AsciiPantalla
        fotograma={fotograma}
        cols={cols}
        rows={rows}
        proporcion={proporcion}
        alto={alto ?? undefined}
        paleta={claro ? PALETA_CLARA : brillante ? PALETA_BRILLANTE : PALETA}
        //#eeeef1: el fondo del modo claro (tema-claro.css). Fijo, asi tambien se
        //ve bien si la pagina esta en modo oscuro
        fondo={fondo ?? (claro ? "#eeeef1" : "#000")}
      />
    </div>
  );
}
