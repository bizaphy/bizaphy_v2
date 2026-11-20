"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Cambios } from "@/shared/types/reading";

// ─── Autoguardado en la base ───
// El editor trabaja con su estado como siempre; este hook mira ese estado
// como un diccionario { id: valor } y, un rato despues de que dejas de
// escribir, manda a la base solo lo que cambio desde el ultimo guardado
// (null = se borro). Si falla, reintenta solo y avisa antes de cerrar la
// pestaña para que no se pierda nada.

export type EstadoGuardado = "guardado" | "pendiente" | "guardando" | "error";

const REINTENTO_MS = 5000;

function diferencias<Valor>(
  actuales: Record<string, Valor>,
  guardado: Map<string, string>,
) {
  const cambios: Cambios<Valor> = {};
  const json = new Map<string, string>();
  for (const [id, valor] of Object.entries(actuales)) {
    const texto = JSON.stringify(valor);
    if (guardado.get(id) !== texto) {
      cambios[id] = valor;
      json.set(id, texto);
    }
  }
  for (const id of guardado.keys()) {
    if (!(id in actuales)) cambios[id] = null;
  }
  return { cambios, json, hay: Object.keys(cambios).length > 0 };
}

export function useAutoguardado<Valor>(
  // Lo que hay ahora en el editor
  actuales: Record<string, Valor>,
  // Lo que vino de la base al cargar la pagina
  iniciales: Record<string, Valor>,
  // Server action que recibe los cambios
  guardar: (cambios: Cambios<Valor>) => Promise<void>,
  demora = 800,
): EstadoGuardado {
  const [estado, setEstado] = useState<EstadoGuardado>("guardado");
  const guardadoRef = useRef<Map<string, string> | null>(null);
  if (guardadoRef.current === null) {
    guardadoRef.current = new Map(
      Object.entries(iniciales).map(([id, v]) => [id, JSON.stringify(v)]),
    );
  }
  const actualesRef = useRef(actuales);
  actualesRef.current = actuales;
  const guardarRef = useRef(guardar);
  guardarRef.current = guardar;
  const enCurso = useRef(false);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  const enviar = useCallback(async () => {
    clearTimeout(temporizador.current);
    const guardado = guardadoRef.current;
    if (enCurso.current || !guardado) return;
    const { cambios, json, hay } = diferencias(actualesRef.current, guardado);
    if (!hay) {
      setEstado("guardado");
      return;
    }

    enCurso.current = true;
    setEstado("guardando");
    try {
      await guardarRef.current(cambios);
      for (const [id, valor] of Object.entries(cambios)) {
        if (valor === null) guardado.delete(id);
        else guardado.set(id, json.get(id) ?? JSON.stringify(valor));
      }
      enCurso.current = false;
      // Mientras se guardaba pudiste seguir escribiendo
      if (diferencias(actualesRef.current, guardado).hay) {
        setEstado("pendiente");
        temporizador.current = setTimeout(enviar, demora);
      } else {
        setEstado("guardado");
      }
    } catch {
      enCurso.current = false;
      setEstado("error");
      temporizador.current = setTimeout(enviar, REINTENTO_MS);
    }
  }, [demora]);

  // Cada cambio reinicia la espera
  useEffect(() => {
    const guardado = guardadoRef.current;
    if (!guardado || !diferencias(actuales, guardado).hay) return;
    if (!enCurso.current) setEstado((e) => (e === "error" ? e : "pendiente"));
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(enviar, demora);
  }, [actuales, enviar, demora]);

  // Al esconder la pestaña o salir de la pagina se guarda sin esperar
  useEffect(() => {
    const alOcultar = () => {
      if (document.visibilityState === "hidden") enviar();
    };
    document.addEventListener("visibilitychange", alOcultar);
    return () => {
      document.removeEventListener("visibilitychange", alOcultar);
      enviar();
    };
  }, [enviar]);

  // Si quedan cambios sin guardar, el navegador pregunta antes de cerrar
  useEffect(() => {
    if (estado === "guardado") return;
    const alCerrar = (evento: BeforeUnloadEvent) => evento.preventDefault();
    window.addEventListener("beforeunload", alCerrar);
    return () => window.removeEventListener("beforeunload", alCerrar);
  }, [estado]);

  return estado;
}

// El peor de varios estados, para mostrar un solo indicador
export function peorEstado(...estados: EstadoGuardado[]): EstadoGuardado {
  for (const candidato of ["error", "guardando", "pendiente"] as const) {
    if (estados.includes(candidato)) return candidato;
  }
  return "guardado";
}

const TEXTO_ESTADO: Record<EstadoGuardado, string> = {
  guardado: "✓ Guardado en la base",
  pendiente: "Cambios sin guardar…",
  guardando: "Guardando…",
  error: "No se pudo guardar · reintentando",
};

export function IndicadorGuardado({ estado }: { estado: EstadoGuardado }) {
  return (
    <span
      role="status"
      className={`font-mono text-xs ${
        estado === "error"
          ? "text-red-400"
          : estado === "guardado"
            ? "text-violet-300"
            : "text-zinc-400"
      }`}
    >
      {TEXTO_ESTADO[estado]}
    </span>
  );
}
