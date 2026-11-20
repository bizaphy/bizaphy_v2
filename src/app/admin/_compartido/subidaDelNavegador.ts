"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { quitarFurigana } from "@/lib/furigana";
import { subirDatosDelNavegador } from "@/server/actions/reading";
import type { Comodin, OrigenComodin } from "@/shared/types/comodin";
import type { Cancion } from "@/shared/types/karaoke";
import type { DatosDelNavegador } from "@/shared/types/reading";
import { ALMACEN } from "../reading/_data/almacen";
import { crearComodin } from "./comodines";
import { armarFilas, separarComodines } from "./frases";

// ─── Subida unica: localStorage -> base ───
// Antes de las tablas, reading, karaoke y comodines vivian en el
// localStorage del navegador. La primera vez que abres cualquiera de las
// tres paginas en ese navegador, todo se sube a la base y cada clave se
// renombra a "<clave>-respaldo" (no se borra: queda de copia por si acaso).
// La base nunca se pisa: solo se agrega lo que no tenia.

const CLAVE_READING = "reading-borrador";
const CLAVE_KARAOKE = "karaoke-canciones";
const CLAVE_VOCAB = "reading-vocab";
// El karaoke recuerda en este navegador que cancion tenias abierta
export const CLAVE_CANCION_ABIERTA = "karaoke-abierta";

function leerJson(clave: string): unknown {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

// El comodin mas viejo era una lista escrita a mano ("会議, 効果的") por
// texto. Cada palabra se guarda con la primera frase del texto que la tiene.
function comodinesDeLista(
  lista: string,
  texto: string,
  origen: OrigenComodin,
  titulo: string,
): Comodin[] {
  const frases = armarFilas(texto, {}).map((fila) => fila.ja);
  return separarComodines(lista).map((palabra) =>
    crearComodin({
      palabra,
      significado: "",
      frase: frases.find((ja) => quitarFurigana(ja).includes(palabra)) ?? "",
      origen,
      titulo,
    }),
  );
}

// null si en este navegador no hay nada que subir
function leerDatosDelNavegador(): DatosDelNavegador | null {
  // biome-ignore lint/suspicious/noExplicitAny: datos viejos sin forma fija
  const reading = leerJson(CLAVE_READING) as any;
  // biome-ignore lint/suspicious/noExplicitAny: datos viejos sin forma fija
  const karaoke = leerJson(CLAVE_KARAOKE) as any;
  const vocab = leerJson(CLAVE_VOCAB);
  if (!reading && !karaoke && !vocab) return null;

  // Comodines ya con frase (los de la version anterior)
  const comodines: Comodin[] = Array.isArray(vocab)
    ? vocab.map((c) => ({
        id: c.id ?? crypto.randomUUID(),
        palabra: c.palabra ?? "",
        lectura: c.lectura ?? "",
        significado: c.significado ?? "",
        frase: c.frase ?? "",
        origen: c.origen === "karaoke" ? "karaoke" : "reading",
        titulo: c.titulo ?? "",
        creado: c.creado ?? new Date().toISOString(),
        aciertos: c.aciertos ?? 0,
        fallos: c.fallos ?? 0,
      }))
    : [];

  if (reading?.comodines) {
    for (const [titulo, lista] of Object.entries<string>(reading.comodines)) {
      const texto =
        ALMACEN.find((item) => item.titulo === titulo)?.texto ??
        (reading.titulo === titulo ? reading.texto : "");
      comodines.push(
        ...comodinesDeLista(lista, texto ?? "", "reading", titulo),
      );
    }
  }

  const canciones: Cancion[] = [];
  for (const c of karaoke?.canciones ?? []) {
    if (c.comodin) {
      comodines.push(
        ...comodinesDeLista(c.comodin, c.texto ?? "", "karaoke", c.titulo ?? ""),
      );
    }
    // Una cancion recien creada y nunca escrita no vale la pena subirla
    if (!c.id || !(c.texto || c.titulo)) continue;
    canciones.push({
      id: c.id,
      titulo: c.titulo ?? "",
      fuente: c.fuente ?? "",
      texto: c.texto ?? "",
      traducciones: c.traducciones ?? {},
      real: c.real ?? {},
      tiempos: c.tiempos ?? [],
      video: c.video ?? "",
    });
  }

  return {
    borrador: reading?.texto
      ? {
          titulo: reading.titulo ?? "",
          fuente: reading.fuente ?? "",
          texto: reading.texto,
        }
      : null,
    traducciones: reading?.traducciones ?? {},
    canciones,
    comodines,
  };
}

function renombrarClaves() {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: datos viejos sin forma fija
    const karaoke = leerJson(CLAVE_KARAOKE) as any;
    if (karaoke?.idActual) {
      localStorage.setItem(CLAVE_CANCION_ABIERTA, karaoke.idActual);
    }
    for (const clave of [CLAVE_READING, CLAVE_KARAOKE, CLAVE_VOCAB]) {
      const valor = localStorage.getItem(clave);
      if (valor === null) continue;
      localStorage.setItem(`${clave}-respaldo`, valor);
      localStorage.removeItem(clave);
    }
  } catch {}
}

// En modo estricto el efecto corre dos veces: esto evita subir dos veces
let subiendo = false;

// Lo llaman las tres paginas al montar. Si sube algo, recarga la pagina
// para leer de la base lo que quedo despues de juntar todo.
export function useSubidaDelNavegador() {
  useEffect(() => {
    if (subiendo) return;
    const datos = leerDatosDelNavegador();
    if (!datos) return;

    subiendo = true;
    const aviso = toast.loading("Subiendo a la base lo que tenías en este navegador…");
    subirDatosDelNavegador(datos)
      .then(() => {
        renombrarClaves();
        toast.success("Listo: tus datos del navegador ya están en la base", {
          id: aviso,
        });
        setTimeout(() => window.location.reload(), 1200);
      })
      .catch(() => {
        subiendo = false;
        toast.error(
          "No se pudieron subir tus datos del navegador. Siguen ahí: se reintenta al recargar.",
          { id: aviso, duration: 10000 },
        );
      });
  }, []);
}
