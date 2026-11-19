"use client";

import { useCallback, useEffect, useState } from "react";
import { lecturaDe, quitarFurigana } from "@/lib/furigana";
import type { Comodin, OrigenComodin } from "@/shared/types/comodin";
import { ALMACEN } from "../reading/_data/almacen";
import { armarFilas, separarComodines } from "./frases";

// ─── Almacen de palabras comodin ───
// Uno solo para reading y karaoke, asi el reading-vocab test las repasa
// todas juntas. Vive en localStorage hasta que exista la tabla.

const CLAVE = "reading-vocab";

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

// Antes el comodin era una lista escrita a mano ("会議, 効果的") por texto.
// Cada palabra vieja se pasa al almacen con la primera frase del texto que
// la contiene, y la lista vieja se borra para no migrarla dos veces.
function migrarViejos(): Comodin[] {
  const migrados: Comodin[] = [];
  const pasar = (
    lista: string,
    texto: string,
    origen: OrigenComodin,
    titulo: string,
  ) => {
    const frases = armarFilas(texto, {}).map((fila) => fila.ja);
    for (const palabra of separarComodines(lista)) {
      const frase =
        frases.find((ja) => quitarFurigana(ja).includes(palabra)) ?? "";
      migrados.push(crearComodin({ palabra, significado: "", frase, origen, titulo }));
    }
  };

  try {
    const reading = JSON.parse(localStorage.getItem("reading-borrador") ?? "null");
    if (reading?.comodines) {
      for (const [titulo, lista] of Object.entries<string>(reading.comodines)) {
        const texto =
          ALMACEN.find((item) => item.titulo === titulo)?.texto ??
          (reading.titulo === titulo ? reading.texto : "");
        pasar(lista, texto ?? "", "reading", titulo);
      }
      delete reading.comodines;
      localStorage.setItem("reading-borrador", JSON.stringify(reading));
    }
  } catch {}

  try {
    const karaoke = JSON.parse(localStorage.getItem("karaoke-canciones") ?? "null");
    if (karaoke?.canciones?.some((c: { comodin?: string }) => c.comodin)) {
      for (const cancion of karaoke.canciones) {
        if (cancion.comodin) {
          pasar(cancion.comodin, cancion.texto ?? "", "karaoke", cancion.titulo ?? "");
        }
        delete cancion.comodin;
      }
      localStorage.setItem("karaoke-canciones", JSON.stringify(karaoke));
    }
  } catch {}

  return migrados;
}

export function useComodines() {
  const [comodines, setComodines] = useState<Comodin[]>([]);
  const [cargado, setCargado] = useState(false);

  // Se lee al montar (no en el render, para no romper la hidratacion).
  // Si otra pestaña cambia el almacen (por ejemplo el test abierto al lado
  // del reading), se recarga solo.
  useEffect(() => {
    const leer = () => {
      try {
        return JSON.parse(localStorage.getItem(CLAVE) ?? "[]") as Comodin[];
      } catch {
        return [];
      }
    };
    // Lo migrado se guarda de inmediato: en modo estricto este efecto corre dos
    // veces y la segunda ya no encuentra las listas viejas.
    const guardados = leer();
    const migrados = migrarViejos().filter(
      (nuevo) => !guardados.some((c) => mismoComodin(c, nuevo)),
    );
    if (migrados.length > 0) {
      try {
        localStorage.setItem(CLAVE, JSON.stringify([...guardados, ...migrados]));
      } catch {}
    }
    setComodines([...guardados, ...migrados]);
    setCargado(true);

    const alCambiarAfuera = (evento: StorageEvent) => {
      if (evento.key === CLAVE) setComodines(leer());
    };
    window.addEventListener("storage", alCambiarAfuera);
    return () => window.removeEventListener("storage", alCambiarAfuera);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(comodines));
    } catch {}
  }, [cargado, comodines]);

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

  return { comodines, setComodines, agregar, quitar, editar };
}
