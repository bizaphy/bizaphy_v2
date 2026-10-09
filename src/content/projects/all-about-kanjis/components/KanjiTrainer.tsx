"use client";

import { useEffect, useMemo, useState } from "react";

type NivelPalabra = "n5" | "n4" | "n3";

type KanjiDePalabra = {
  caracter: string;
  nivel: string | null;
  enSitio: boolean;
};

type Palabra = {
  palabra: string;
  furigana: string;
  romaji: string;
  significadoEn: string;
  nivel: NivelPalabra;
  kanjis: KanjiDePalabra[];
  soloKanjisN5aN3: boolean;
};

type InfoKanji = {
  nivel: string | null;
  enSitio: boolean;
  significado: string | null;
  significadoEn: string | null;
};

type Vocabulario = {
  palabras: Palabra[];
  kanjis: Record<string, InfoKanji>;
};

type Filtro = "todos" | NivelPalabra;

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "n5", label: "N5" },
  { id: "n4", label: "N4" },
  { id: "n3", label: "N3" },
];

type FiltroKanjis = "todas" | "uno" | "varios";

const FILTROS_KANJIS: { id: FiltroKanjis; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "uno", label: "1 kanji" },
  { id: "varios", label: "2+ kanjis" },
];

type Vista = { significado: boolean; romaji: boolean; resuelto: boolean };
const OCULTO: Vista = { significado: false, romaji: false, resuelto: false };

// Se cuentan los kanjis escritos en la palabra, no los unicos de `kanjis`:
// asi 時々 o 日曜日 cuentan como palabras de varios kanjis.
const contarKanjis = (p: Palabra) =>
  p.palabra.match(/\p{Script=Han}/gu)?.length ?? 0;

const cumpleKanjis = (p: Palabra, k: FiltroKanjis) =>
  k === "todas" || (k === "uno" ? contarKanjis(p) === 1 : contarKanjis(p) > 1);

// Solo palabras cuyos kanjis son todos de N5-N3: el trainer es para esos.
const filtrar = (v: Vocabulario, f: Filtro, k: FiltroKanjis) =>
  v.palabras.filter(
    (p) =>
      p.soloKanjisN5aN3 &&
      (f === "todos" || p.nivel === f) &&
      cumpleKanjis(p, k),
  );

// Fisher-Yates sobre una copia: la cola se recorre en orden y no repite
// palabras hasta agotarla.
function barajar<T>(xs: T[]): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Color por nivel JLPT del kanji, para el modo "Colores JLPT".
const COLOR_NIVEL: Record<string, string> = {
  n5: "text-emerald-300",
  n4: "text-sky-300",
  n3: "text-amber-300",
  n2: "text-orange-400",
  n1: "text-rose-400",
};

const LEYENDA_NIVELES = ["n5", "n4", "n3"] as const;

const esKanji = (c: string) => /\p{Script=Han}/u.test(c);

const botonBase =
  "rounded-md border px-4 py-2 font-mono text-xs tracking-widest uppercase transition disabled:cursor-not-allowed disabled:opacity-40";
const botonSecundario = `${botonBase} border-violet-300/50 bg-zinc-900/80 text-violet-200 hover:border-violet-300 hover:shadow-[0_0_10px_rgba(196,181,253,0.4)]`;
const botonActivo = `${botonBase} border-violet-300 bg-violet-500/20 text-violet-100 shadow-[0_0_10px_rgba(196,181,253,0.4)]`;

const chipFiltro = (activo: boolean) =>
  `rounded-full border px-3 py-1 font-mono text-xs transition ${
    activo
      ? "border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-100 shadow-[0_0_10px_rgba(217,70,239,0.6)]"
      : "border-violet-300/40 bg-zinc-900 text-violet-300 hover:border-violet-300"
  }`;

export default function KanjiTrainer() {
  const [vocab, setVocab] = useState<Vocabulario | null>(null);
  const [error, setError] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [filtroKanjis, setFiltroKanjis] = useState<FiltroKanjis>("todas");
  const [cola, setCola] = useState<Palabra[]>([]);
  const [pos, setPos] = useState(0);
  const [vista, setVista] = useState<Vista>(OCULTO);
  const [colores, setColores] = useState(false);

  // El JSON (~850 KB) va en un chunk aparte: se pide al montar el trainer,
  // no al cargar la pagina.
  useEffect(() => {
    let vivo = true;
    import("../data/vocabulario.json")
      .then((m) => {
        if (!vivo) return;
        const v = m.default as Vocabulario;
        setVocab(v);
        setCola(barajar(filtrar(v, "todos", "todas")));
      })
      .catch(() => vivo && setError(true));
    return () => {
      vivo = false;
    };
  }, []);

  // Cada grupo de botones muestra cuantas palabras quedarian combinandolo
  // con el filtro activo del otro grupo.
  const conteos = useMemo(() => {
    if (!vocab) return null;
    return Object.fromEntries(
      FILTROS.map((f) => [f.id, filtrar(vocab, f.id, filtroKanjis).length]),
    ) as Record<Filtro, number>;
  }, [vocab, filtroKanjis]);

  const conteosKanjis = useMemo(() => {
    if (!vocab) return null;
    return Object.fromEntries(
      FILTROS_KANJIS.map((k) => [k.id, filtrar(vocab, filtro, k.id).length]),
    ) as Record<FiltroKanjis, number>;
  }, [vocab, filtro]);

  const aplicarFiltros = (f: Filtro, k: FiltroKanjis) => {
    if (!vocab) return;
    setFiltro(f);
    setFiltroKanjis(k);
    setCola(barajar(filtrar(vocab, f, k)));
    setPos(0);
    setVista(OCULTO);
  };

  const cambiarFiltro = (f: Filtro) => {
    if (f !== filtro) aplicarFiltros(f, filtroKanjis);
  };

  const cambiarFiltroKanjis = (k: FiltroKanjis) => {
    if (k !== filtroKanjis) aplicarFiltros(filtro, k);
  };

  const siguiente = () => {
    if (pos + 1 < cola.length) {
      setPos(pos + 1);
    } else {
      // Cola agotada: se vuelve a barajar y arranca otra vuelta.
      setCola(barajar(cola));
      setPos(0);
    }
    setVista(OCULTO);
  };

  if (error) {
    return (
      <p className="p-4 font-mono text-sm text-zinc-400">
        No se pudo cargar el vocabulario.
      </p>
    );
  }

  const actual = cola[pos];
  if (!vocab || !conteos || !conteosKanjis) {
    return (
      <p className="animate-pulse p-4 font-mono text-sm tracking-widest text-fuchsia-300 uppercase">
        cargando vocabulario
      </p>
    );
  }

  // Con el modo activo, cada kanji toma el color de su nivel; los kana y
  // los kanjis sin nivel conocido quedan en el color normal.
  const colorKanji = (c: string) =>
    colores ? (COLOR_NIVEL[vocab.kanjis[c]?.nivel ?? ""] ?? "") : "";

  const verSignificado = vista.significado || vista.resuelto;
  const verRomaji = vista.romaji || vista.resuelto;

  return (
    <section className="flex flex-col gap-6 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          {/* Filtro por nivel de la palabra (lista JLPT de donde viene) */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-16 font-mono text-xs tracking-widest text-zinc-500 uppercase">
              Nivel
            </span>
            {FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filtro === f.id}
                onClick={() => cambiarFiltro(f.id)}
                className={chipFiltro(filtro === f.id)}
              >
                {f.label}
                <span className="ml-1.5 text-zinc-500">{conteos[f.id]}</span>
              </button>
            ))}
          </div>

          {/* Filtro por cantidad de kanjis escritos en la palabra */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-16 font-mono text-xs tracking-widest text-zinc-500 uppercase">
              Kanjis
            </span>
            {FILTROS_KANJIS.map((k) => (
              <button
                key={k.id}
                type="button"
                aria-pressed={filtroKanjis === k.id}
                onClick={() => cambiarFiltroKanjis(k.id)}
                className={chipFiltro(filtroKanjis === k.id)}
              >
                {k.label}
                <span className="ml-1.5 text-zinc-500">
                  {conteosKanjis[k.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Config de vista, no filtro: pinta cada kanji con el color de su
            nivel JLPT. Va aparte, a la derecha, con forma de interruptor. */}
        <div className="ml-auto flex flex-col items-end gap-2 rounded-md border border-dashed border-zinc-700 px-3 py-2">
          <button
            type="button"
            role="switch"
            aria-checked={colores}
            onClick={() => setColores((c) => !c)}
            className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-zinc-400 uppercase hover:text-zinc-200"
          >
            Colores JLPT
            <span
              className={`relative h-4 w-7 rounded-full border transition ${
                colores
                  ? "border-violet-300 bg-violet-500/40"
                  : "border-zinc-600 bg-zinc-800"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-2.5 w-2.5 rounded-full transition ${
                  colores ? "translate-x-3 bg-violet-100" : "bg-zinc-500"
                }`}
              />
            </span>
          </button>
          {colores && (
            <span className="flex gap-3 font-mono text-[10px] uppercase">
              {LEYENDA_NIVELES.map((n) => (
                <span key={n} className={COLOR_NIVEL[n]}>
                  ● {n}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>

      {actual && (
        <>
          {/* Tarjeta de la palabra. Furigana, romaji y significado reservan
              su alto aunque esten ocultos, para que nada salte al revelar. */}
          <div className="relative flex flex-col items-center gap-3 rounded-md border border-fuchsia-400/50 bg-zinc-900/60 px-4 py-10 shadow-[0_0_14px_rgba(217,70,239,0.2)]">
            <span className="absolute top-3 left-3 rounded border border-zinc-700 px-2 py-0.5 font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
              {actual.nivel}
            </span>
            <span className="absolute top-3 right-3 font-mono text-[10px] tracking-widest text-zinc-500">
              {pos + 1} / {cola.length}
            </span>

            <span
              className={`font-mono text-lg text-fuchsia-300 ${vista.resuelto ? "" : "invisible"}`}
            >
              {actual.furigana}
            </span>
            <span className="font-mono text-5xl font-light text-zinc-50 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)] sm:text-7xl">
              {Array.from(actual.palabra).map((c, i) => (
                <span key={i} className={esKanji(c) ? colorKanji(c) : ""}>
                  {c}
                </span>
              ))}
            </span>
            <span
              className={`font-mono text-base text-violet-200 ${verRomaji ? "" : "invisible"}`}
            >
              {actual.romaji}
            </span>
            <span
              className={`text-center text-sm text-zinc-300 ${verSignificado ? "" : "invisible"}`}
            >
              <span className="mr-1 text-violet-500/70">›</span>
              {actual.significadoEn}
              <span className="ml-2 font-mono text-[10px] text-zinc-600">
                (en)
              </span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              aria-pressed={vista.significado}
              disabled={vista.resuelto}
              onClick={() =>
                setVista((v) => ({ ...v, significado: !v.significado }))
              }
              className={vista.significado ? botonActivo : botonSecundario}
            >
              Significado
            </button>
            <button
              type="button"
              aria-pressed={vista.romaji}
              disabled={vista.resuelto}
              onClick={() => setVista((v) => ({ ...v, romaji: !v.romaji }))}
              className={vista.romaji ? botonActivo : botonSecundario}
            >
              Romaji
            </button>
            <button
              type="button"
              disabled={vista.resuelto}
              onClick={() => setVista({ ...vista, resuelto: true })}
              className={`${botonBase} border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-100 hover:shadow-[0_0_12px_rgba(217,70,239,0.7)]`}
            >
              Resolver
            </button>
            <button
              type="button"
              onClick={siguiente}
              className={`${botonBase} border-zinc-500 bg-zinc-800 text-zinc-100 hover:border-zinc-300`}
            >
              Siguiente →
            </button>
          </div>

          {/* Kanjis que forman la palabra: solo al resolver */}
          {vista.resuelto && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {actual.kanjis.map((k) => {
                const info = vocab.kanjis[k.caracter];
                const significado = info?.significado ?? info?.significadoEn;
                return (
                  <div
                    key={k.caracter}
                    className="flex items-center gap-4 rounded-md border border-zinc-700 bg-zinc-900/60 p-3"
                  >
                    <span
                      className={`font-mono text-5xl font-light ${colorKanji(k.caracter) || "text-zinc-100"}`}
                    >
                      {k.caracter}
                    </span>
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="w-fit rounded border border-violet-300/40 px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-violet-300 uppercase">
                        {k.nivel ?? "sin JLPT"}
                      </span>
                      <span className="text-sm text-zinc-200">
                        {significado ?? "—"}
                        {!info?.significado && info?.significadoEn && (
                          <span className="ml-1 font-mono text-[10px] text-zinc-600">
                            (en)
                          </span>
                        )}
                      </span>
                      {!k.enSitio && (
                        <span className="font-mono text-[10px] text-zinc-500">
                          aún no está en el explorador
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
