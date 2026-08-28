"use client";

import { useEffect, useState } from "react";

type TextScrambleProps = {
  /** Texto final que se revelará. */
  text: string;
  /** Clases CSS para el elemento contenedor. */
  className?: string;
};

const SCRAMBLE_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789";

/**
 * Texto que se revela progresivamente pasando por caracteres aleatorios.
 * Efecto de "descifrado" cyberpunk (client component).
 */
export default function TextScramble({
  text,
  className = "",
}: TextScrambleProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let frame = 0;
    const totalFrames = text.length * 3;
    let animationId: number;

    /**
     * Avanza un frame de la animación de scramble.
     */
    const animate = () => {
      frame++;
      const revealedCount = Math.floor((frame / totalFrames) * text.length);

      const result = text
        .split("")
        .map((char, i) => {
          if (i < revealedCount) return char;
          if (char === " ") return " ";
          return SCRAMBLE_CHARS[
            Math.floor(Math.random() * SCRAMBLE_CHARS.length)
          ];
        })
        .join("");

      setDisplayed(result);

      if (frame < totalFrames) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [text]);

  return (
    <span className={className} aria-label={text}>
      {displayed}
    </span>
  );
}
