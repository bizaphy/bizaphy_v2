"use client";

// Cliente wrapper que enlaza KanjiLevelsPanel, KanjiCardList y los paneles
// de detalle (KanjiDisplay + KanjiDisplayImgs). Mantiene el nivel seleccionado
// y el kanji actualmente enfocado, ambos entre los precargados del servidor.

import { useEffect, useMemo, useState } from "react";
import KanjiCardList from "./KanjiCardList";
import KanjiDisplay from "./KanjiDisplay";
import KanjiDisplayImgs from "./KanjiDisplayImgs";
import KanjiExtras from "./KanjiExtras";
import KanjiHelpReferences from "./KanjiHelpReferences";
import KanjiLevelsPanel from "./KanjiLevelsPanel";
import KanjiSearch from "./KanjiSearch";
import type { KanjiEnListado } from "../db/queries";

export type NivelDisponible = "N5" | "N4";

type Props = {
  kanjisPorNivel: Record<NivelDisponible, KanjiEnListado[]>;
};

export default function KanjisExplorador({ kanjisPorNivel }: Props) {
  const [nivel, setNivel] = useState<NivelDisponible>("N5");
  const [busqueda, setBusqueda] = useState("");
  const kanjis = kanjisPorNivel[nivel];

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
  const [seleccionado, setSeleccionado] = useState<KanjiEnListado | null>(
    kanjis[0] ?? null,
  );

  useEffect(() => {
    setSeleccionado(kanjis[0] ?? null);
  }, [kanjis]);

  return (
    <>
      <KanjiLevelsPanel selected={nivel} onSelect={setNivel} />
      <KanjiSearch value={busqueda} onChange={setBusqueda} />
      <KanjiCardList
        kanjis={kanjisFiltrados}
        selectedId={seleccionado?.id ?? null}
        onSelect={setSeleccionado}
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
