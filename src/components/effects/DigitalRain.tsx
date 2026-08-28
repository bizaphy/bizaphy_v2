"use client";

import { useEffect, useRef } from "react";

type DigitalRainProps = {
  /** Opacidad general del canvas (0-1). */
  opacity?: number;
};

type Line = {
  y: number;
  speed: number;
  text: string;
  offset: number;
  hue: number;
  brightness: number;
  glitchTimer: number;
  glitchShiftY: number;
};

const HEX_CHARS = "0123456789ABCDEF::<>//{}[]&&||!=+-*%$#@";

/**
 * Genera una cadena aleatoria de caracteres hex/código.
 *
 * @param length - Largo de la cadena.
 * @returns Cadena aleatoria.
 */
function randomText(length: number): string {
  return Array.from(
    { length },
    () => HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)],
  ).join("");
}

/**
 * Genera una cadena con fragmentos cortos de texto separados por espacios.
 * Crea un aspecto disperso con más espacio negro entre caracteres.
 *
 * @param length - Largo total de la cadena.
 * @returns Cadena con huecos de espacios.
 */
function randomSparseText(length: number): string {
  const result: string[] = [];
  let i = 0;
  while (i < length) {
    if (Math.random() < 0.35) {
      const chunk = 2 + Math.floor(Math.random() * 5);
      for (let j = 0; j < chunk && i < length; j++, i++) {
        result.push(HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)]);
      }
    } else {
      const gap = 3 + Math.floor(Math.random() * 8);
      for (let j = 0; j < gap && i < length; j++, i++) {
        result.push(" ");
      }
    }
  }
  return result.join("");
}

/**
 * Fondo animado con líneas horizontales de datos binarios/hex que se desplazan
 * lentamente como un feed de datos corrupto. Periódicamente una línea sufre un
 * glitch visual (client component).
 */
export default function DigitalRain({ opacity = 0.1 }: DigitalRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lineHeight = 32;
    const fontSize = 12;
    let lines: Line[] = [];
    let lastGlitch = 0;

    /**
     * Crea una línea con propiedades aleatorias.
     *
     * @param y - Posición vertical de la línea.
     * @returns Línea inicializada.
     */
    const createLine = (y: number): Line => ({
      y,
      speed: 0.1 + Math.random() * 0.3,
      text: randomSparseText(
        Math.ceil(window.innerWidth / (fontSize * 0.6)) + 20,
      ),
      offset: Math.random() * 500,
      hue: 292,
      brightness: 0.08 + Math.random() * 0.22,
      glitchTimer: 0,
      glitchShiftY: 0,
    });

    /**
     * Ajusta el canvas al viewport e inicializa las líneas.
     */
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.ceil(canvas.height / lineHeight) + 2;
      lines = Array.from({ length: count }, (_, i) =>
        createLine(i * lineHeight),
      );
    };

    resize();
    window.addEventListener("resize", resize);

    let animationId: number;

    /**
     * Dibuja un frame de la animación.
     *
     * @param now - Timestamp del requestAnimationFrame.
     */
    const draw = (now: number) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Disparar glitches cada ~2.5s
      if (now - lastGlitch > 2500 && Math.random() > 0.3) {
        lastGlitch = now;
        const count = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          const line = lines[Math.floor(Math.random() * lines.length)];
          line.glitchTimer = 20 + Math.floor(Math.random() * 15);
          line.glitchShiftY = (Math.random() - 0.5) * 8;
          line.brightness = 2.5 + Math.random() * 1.5;
          line.hue = Math.random() > 0.5 ? 292 : 190;
          line.text = randomSparseText(line.text.length);
        }
      }

      ctx.font = `${fontSize}px monospace`;

      for (const line of lines) {
        line.offset += line.speed;

        if (line.glitchTimer > 0) {
          line.glitchTimer--;
          if (line.glitchTimer === 0) {
            line.glitchShiftY = 0;
            line.brightness = 0.08 + Math.random() * 0.22;
            line.hue = 292;
          }
        }

        const drawY = line.y + line.glitchShiftY;

        // Texto principal
        ctx.fillStyle = `hsla(${line.hue}, 80%, 65%, ${line.brightness})`;
        ctx.fillText(line.text, -line.offset % (canvas.width + 200), drawY);
        ctx.fillText(
          line.text,
          (-line.offset % (canvas.width + 200)) + canvas.width + 200,
          drawY,
        );

        // Chromatic split durante glitch
        if (line.glitchTimer > 0 && line.brightness > 0.5) {
          ctx.fillStyle = `hsla(330, 90%, 60%, ${line.brightness * 0.25})`;
          ctx.fillText(
            line.text,
            -line.offset % (canvas.width + 200),
            drawY - 1,
          );
          ctx.fillStyle = `hsla(190, 90%, 60%, ${line.brightness * 0.25})`;
          ctx.fillText(
            line.text,
            -line.offset % (canvas.width + 200),
            drawY + 1,
          );
        }

        // Mutar caracteres esporádicamente
        if (Math.random() < 0.002) {
          const idx = Math.floor(Math.random() * line.text.length);
          const arr = line.text.split("");
          arr[idx] = HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
          line.text = arr.join("");
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
