"use client";

import { useEffect, useState } from "react";

//pool de caracteres para el "ruido" mientras cada posicion se estabiliza en su valor final
const SCRAMBLE_CHARS =
  "!@#$%&*()_+-=<>?/|\\{}[]:;.abcdefghijklmnopqrstuvwxyz0123456789";

//tags permitidos como contenedor. Se restringe la union para mantener el tipado estricto sin recurrir a ElementType generico.
type AllowedTag = "span" | "pre" | "div" | "p" | "h1" | "h2" | "h3" | "code";

type TextScramble2Props = {
  /** Texto final que se revelara. */
  text: string;
  /** Clases CSS para el contenedor. */
  className?: string;
  /** Duracion total del scramble en ms. Default 2500. */
  scrambleDurationMs?: number;
  /** Tag HTML del contenedor. Usar "pre" cuando el texto tenga saltos de linea (ej. ASCII art). Default "span". */
  as?: AllowedTag;
  /** aria-label opcional; si no se pasa, se usa el texto final. */
  ariaLabel?: string;
};

/**
 * Variante del efecto scramble: cada caracter se asienta en un momento aleatorio
 * dentro de la ventana de duracion, produciendo un "materializado" no lineal
 * (a diferencia del reveal izquierda-a-derecha de <TextScramble>).
 *
 * Preserva `\n` y espacios en toda la animacion, lo que lo hace apto para
 * texto multilinea y ASCII art sin romper el trazo.
 */
export default function TextScramble2({
  text,
  className = "",
  scrambleDurationMs = 2500,
  as: Tag = "span",
  ariaLabel,
}: TextScramble2Props) {
  //Estado inicial = texto final para que SSR y primer render del cliente coincidan (evita hydration mismatch).
  //El scramble arranca en el useEffect, ya en cliente.
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const chars = [...text];

    //A cada posicion no-whitespace se le asigna un instante aleatorio dentro de la ventana
    //en el que "se estabiliza" a su valor final. Saltos y espacios se dejan fijos desde el frame 0.
    const settleAt = chars.map((ch) =>
      ch === "\n" || ch === " " ? 0 : Math.random() * scrambleDurationMs,
    );

    const startedAt = performance.now();
    let rafId = 0;
    let finished = false;

    function tick(now: number) {
      const elapsed = now - startedAt;
      const out: string[] = [];

      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (ch === "\n" || ch === " " || elapsed >= settleAt[i]) {
          out.push(ch);
        } else {
          out.push(
            SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
          );
        }
      }

      setDisplay(out.join(""));

      if (elapsed < scrambleDurationMs) {
        rafId = requestAnimationFrame(tick);
      } else if (!finished) {
        finished = true;
        setDisplay(text); //snap final al valor limpio
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [text, scrambleDurationMs]);

  return (
    <Tag className={className} aria-label={ariaLabel ?? text}>
      {display}
    </Tag>
  );
}
