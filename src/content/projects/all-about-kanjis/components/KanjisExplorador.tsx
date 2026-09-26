"use client";

// Cliente wrapper que enlaza KanjiLevelsPanel, KanjiCardList y los paneles
// de detalle (KanjiDisplay + KanjiStructure). Mantiene el nivel seleccionado
// y el kanji actualmente enfocado, ambos entre los precargados del servidor.

import { useMemo, useRef, useState, useTransition } from "react";
import KanjiCardList from "./KanjiCardList";
import KanjiDisplay from "./KanjiDisplay";
import KanjiStructure from "./KanjiStructure";
import KanjiExtras from "./KanjiExtras";
import KanjiHelpReferences from "./KanjiHelpReferences";
import KanjiLevelsPanel from "./KanjiLevelsPanel";
import KanjiSearch, { type AnioFiltro, type TrazosFiltro } from "./KanjiSearch";
import KanjiTrap from "./KanjiTrap";
import { alternarDestacado } from "../db/actions";
import type { KanjiEnListado } from "../db/queries";
import SeparatorLine from "@/components/ui/SeparatorLine";
import { toast } from "sonner";

export type NivelDisponible = "N5" | "N4" | "N3";

type Props = {
  kanjisPorNivel: Record<NivelDisponible, KanjiEnListado[]>;
};

export default function KanjisExplorador({ kanjisPorNivel }: Props) {
  const [nivel, setNivel] = useState<NivelDisponible>("N5");
  const [busqueda, setBusqueda] = useState("");
  const [soloDestacados, setSoloDestacados] = useState(false);
  const [anio, setAnio] = useState<AnioFiltro>("todos");
  const [trazos, setTrazos] = useState<TrazosFiltro>("todos");

  // Overrides locales para "destacado": id -> nuevo valor confirmado por el
  // server action. Evita mutar la prop y sobrevive a cambios de nivel.
  const [destacadoOverrides, setDestacadoOverrides] = useState<
    Record<number, boolean>
  >({});
  const [togglePendiente, iniciarToggle] = useTransition();

  const kanjis = useMemo(() => {
    const base = kanjisPorNivel[nivel];
    if (Object.keys(destacadoOverrides).length === 0) return base;
    return base.map((k) =>
      k.id in destacadoOverrides
        ? { ...k, destacado: destacadoOverrides[k.id] }
        : k,
    );
  }, [kanjisPorNivel, nivel, destacadoOverrides]);

  // Filtrado combinado: significado + destacados + anio escolar + rango de trazos.
  // Se recorre una sola vez la lista aplicando todas las condiciones activas.
  const kanjisFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return kanjis.filter((k) => {
      if (q && !(k.significado ?? "").toLowerCase().includes(q)) return false;

      if (soloDestacados && !k.destacado) return false;

      if (anio !== "todos") {
        if (anio === "sin-dato") {
          if (k.anioEscolarJapon !== null) return false;
        } else if (k.anioEscolarJapon !== Number(anio)) {
          return false;
        }
      }

      if (trazos !== "todos") {
        const t = k.numeroTrazos;
        const enRango =
          (trazos === "1-5" && t >= 1 && t <= 5) ||
          (trazos === "6-10" && t >= 6 && t <= 10) ||
          (trazos === "11-15" && t >= 11 && t <= 15) ||
          (trazos === "16+" && t >= 16);
        if (!enRango) return false;
      }

      return true;
    });
  }, [kanjis, busqueda, soloDestacados, anio, trazos]);

  // Kanji actualmente destacado en los paneles de detalle. Arranca en el
  // primero del nivel; al cambiar de nivel se reinicia al primero del nuevo.
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(
    kanjis[0]?.id ?? null,
  );

  // Bloque de detalle: al elegir un kanji se hace scroll hasta aca, porque
  // con 80 tarjetas por pagina el detalle queda muy abajo de la grilla y
  // sin scroll no se ve que cambio.
  const detalleRef = useRef<HTMLDivElement>(null);

  const seleccionar = (id: number) => {
    setSeleccionadoId(id);
    detalleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cambiarNivel = (nuevo: NivelDisponible) => {
    setNivel(nuevo);
    setSeleccionadoId(kanjisPorNivel[nuevo][0]?.id ?? null);
  };

  const seleccionado = useMemo(
    () => kanjis.find((k) => k.id === seleccionadoId) ?? null,
    [kanjis, seleccionadoId],
  );

  const manejarToggleDestacado = () => {
    if (!seleccionado) return;
    const id = seleccionado.id;
    iniciarToggle(async () => {
      const resultado = await alternarDestacado(id);
      // Rechazo esperado (sin sesión o sin rol admin): avisar y no tocar el estado.
      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }
      setDestacadoOverrides((prev) => ({ ...prev, [id]: resultado.destacado }));
      toast.success(
        resultado.destacado
          ? "Marcado como destacado"
          : "Quitado de destacados",
      );
    });
  };

  return (
    <>
      <KanjiLevelsPanel selected={nivel} onSelect={cambiarNivel} />
      <KanjiSearch
        value={busqueda}
        onChange={setBusqueda}
        soloDestacados={soloDestacados}
        onSoloDestacadosChange={setSoloDestacados}
        anio={anio}
        onAnioChange={setAnio}
        trazos={trazos}
        onTrazosChange={setTrazos}
      />
      {/* La key reinicia la paginacion al cambiar nivel o filtros, pero no al
          marcar un kanji como destacado. */}
      <KanjiCardList
        key={`${nivel}|${busqueda}|${soloDestacados}|${anio}|${trazos}`}
        kanjis={kanjisFiltrados}
        selectedId={seleccionadoId}
        onSelect={(k) => seleccionar(k.id)}
      />
      <SeparatorLine className="my-4" />
      {seleccionado && (
        // Tres grupos: que es (display), como se escribe y recuerda
        // (estructura + ayuda memoria) y como se usa (palabras, nombres,
        // trampas). gap-8 + el p-4 de cada seccion = 64px entre grupos.
        <div ref={detalleRef} className="flex scroll-mt-4 flex-col gap-8">
          <KanjiDisplay
            caracter={seleccionado.caracter}
            significado={seleccionado.significado ?? "—"}
            onyomi={seleccionado.onyomi}
            kunyomi={seleccionado.kunyomi}
            numeroTrazos={seleccionado.numeroTrazos}
            anioEscolarJapon={seleccionado.anioEscolarJapon}
            destacado={seleccionado.destacado}
            onToggleDestacado={manejarToggleDestacado}
            toggleDeshabilitado={togglePendiente}
          />
          {/* flex-col y no flex-wrap: la ayuda memoria va siempre debajo de
              los radicales. */}
          <div className="flex flex-col gap-0">
            <KanjiStructure
              caracter={seleccionado.caracter}
              radicales={seleccionado.kanjiRadicales}
            />
            <KanjiHelpReferences
              caracter={seleccionado.caracter}
              urlImagenMnemotecnica={seleccionado.urlImagenMnemotecnica}
              fraseMnemotecnica={seleccionado.fraseMnemotecnica}
              oracionEjemplo={seleccionado.oracionEjemplo}
              traduccionOracion={seleccionado.traduccionOracion}
            />
          </div>
          <section className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
            <KanjiExtras
              palabras={seleccionado.palabras}
              nombres={seleccionado.nombres}
            />
            <KanjiTrap
              caracter={seleccionado.caracter}
              kanjiTraps={seleccionado.kanjiTrapsDesde.map((t) => ({
                caracter: t.destino.caracter,
                significado: t.destino.significado,
              }))}
            />
          </section>
        </div>
      )}
    </>
  );
}
