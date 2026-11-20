"use client";

import { useCallback, useMemo, useState } from "react";
import { lecturaDe } from "@/lib/furigana";
import { guardarComodines } from "@/server/actions/reading";
import type { Comodin, OrigenComodin } from "@/shared/types/comodin";
import { useAutoguardado } from "./autoguardado";

// ─── Almacen de palabras comodin ───
// Uno solo para reading y karaoke, asi el reading-vocab test las repasa
// todas juntas. Vive en la tabla `comodin`: la pagina lo lee en el servidor
// y lo pasa como `iniciales`; cada cambio se autoguarda.

export type NuevoComodin = {
  palabra: string;
  significado: string;
  frase: string;
  origen: OrigenComodin;
  titulo: string;
};

export function crearComodin(datos: NuevoComodin): Comodin {
  return {
    id: crypto.randomUUID(),
    palabra: datos.palabra,
    lectura: lecturaDe(datos.frase, datos.palabra),
    significado: datos.significado,
    frase: datos.frase,
    origen: datos.origen,
    titulo: datos.titulo,
    creado: new Date().toISOString(),
    aciertos: 0,
    fallos: 0,
  };
}

// Misma palabra en la misma frase = el mismo comodin
export function mismoComodin(a: Comodin, b: Comodin): boolean {
  return a.palabra === b.palabra && a.frase === b.frase;
}

function porId(lista: Comodin[]): Record<string, Comodin> {
  return Object.fromEntries(lista.map((c) => [c.id, c]));
}

export function useComodines(iniciales: Comodin[]) {
  const [comodines, setComodines] = useState(iniciales);
  const [inicialesPorId] = useState(() => porId(iniciales));
  const actuales = useMemo(() => porId(comodines), [comodines]);
  const estado = useAutoguardado(actuales, inicialesPorId, guardarComodines);

  // Devuelve false si ese comodin ya estaba
  const agregar = useCallback(
    (datos: NuevoComodin) => {
      const nuevo = crearComodin(datos);
      if (comodines.some((c) => mismoComodin(c, nuevo))) return false;
      setComodines((anteriores) => [...anteriores, nuevo]);
      return true;
    },
    [comodines],
  );

  const quitar = useCallback(
    (id: string) =>
      setComodines((anteriores) => anteriores.filter((c) => c.id !== id)),
    [],
  );

  const editar = useCallback(
    (id: string, cambio: Partial<Comodin>) =>
      setComodines((anteriores) =>
        anteriores.map((c) => (c.id === id ? { ...c, ...cambio } : c)),
      ),
    [],
  );

  return { comodines, setComodines, agregar, quitar, editar, estado };
}
