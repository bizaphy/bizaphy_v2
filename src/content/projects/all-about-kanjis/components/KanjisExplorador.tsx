"use client";

// Cliente wrapper que enlaza KanjiLevelsPanel, KanjiCardList y los paneles
// de detalle (KanjiDisplay + KanjiDisplayImgs). Mantiene el nivel seleccionado
// y el kanji actualmente enfocado, ambos entre los precargados del servidor.

import { useEffect, useMemo, useState, useTransition } from "react";
import KanjiCardList from "./KanjiCardList";
import KanjiDisplay from "./KanjiDisplay";
import KanjiDisplayImgs from "./KanjiDisplayImgs";
import KanjiExtras from "./KanjiExtras";
import KanjiHelpReferences from "./KanjiHelpReferences";
import KanjiLevelsPanel from "./KanjiLevelsPanel";
import KanjiSearch from "./KanjiSearch";
import { alternarDestacado } from "../db/actions";
import type { KanjiEnListado } from "../db/queries";

export type NivelDisponible = "N5" | "N4";

type Props = {
  kanjisPorNivel: Record<NivelDisponible, KanjiEnListado[]>;
};

export default function KanjisExplorador({ kanjisPorNivel }: Props) {
  const [nivel, setNivel] = useState<NivelDisponible>("N5");
  const [busqueda, setBusqueda] = useState("");

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

  // Filtrado por significado, case-insensitive y tolerante a espacios.
  // Si la busqueda esta vacia se devuelve la lista completa sin recorrerla.
  const kanjisFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return kanjis;
    return kanjis.filter((k) =>
      (k.significado ?? "").toLowerCase().includes(q),
    );
  }, [kanjis, busqueda]);

  // Kanji actualmente destacado en los paneles de detalle. Arranca en el
  // primero del nivel; al cambiar de nivel se reinicia al primero del nuevo.
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(
    kanjis[0]?.id ?? null,
  );

  useEffect(() => {
    setSeleccionadoId(kanjisPorNivel[nivel][0]?.id ?? null);
  }, [nivel, kanjisPorNivel]);

  const seleccionado = useMemo(
    () => kanjis.find((k) => k.id === seleccionadoId) ?? null,
    [kanjis, seleccionadoId],
  );

  const manejarToggleDestacado = () => {
    if (!seleccionado) return;
    const id = seleccionado.id;
    iniciarToggle(async () => {
      const nuevoValor = await alternarDestacado(id);
      setDestacadoOverrides((prev) => ({ ...prev, [id]: nuevoValor }));
    });
  };

  return (
    <>
      <KanjiLevelsPanel selected={nivel} onSelect={setNivel} />
      <KanjiSearch value={busqueda} onChange={setBusqueda} />
      <KanjiCardList
        kanjis={kanjisFiltrados}
        selectedId={seleccionadoId}
        onSelect={(k) => setSeleccionadoId(k.id)}
      />
      {seleccionado && (
        <div className="flex flex-col gap-2">
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
          <div className="flex flex-wrap items-start gap-2">
            <KanjiDisplayImgs urlOrdenTrazos={seleccionado.urlOrdenTrazos} />
            <KanjiHelpReferences
              urlImagenMnemotecnica={seleccionado.urlImagenMnemotecnica}
              fraseMnemotecnica={seleccionado.fraseMnemotecnica}
            />
          </div>
          <KanjiExtras />
        </div>
      )}
    </>
  );
}
