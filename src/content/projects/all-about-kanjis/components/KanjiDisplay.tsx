import type { ReactNode } from "react";

type Props = {
  caracter: string;
  significado: string;
  onyomi: string | null;
  kunyomi: string | null;
  numeroTrazos: number;
  anioEscolarJapon: number | null;
  destacado: boolean;
  onToggleDestacado: () => void;
  toggleDeshabilitado?: boolean;
};

export default function KanjiDisplay({
  caracter,
  significado,
  onyomi,
  kunyomi,
  numeroTrazos,
  anioEscolarJapon,
  destacado,
  onToggleDestacado,
  toggleDeshabilitado,
}: Props) {
  return (
    // flex-wrap solo en movil: los datos bajan a una fila debajo del kanji
    // y las lecturas. Desde md van los tres en una fila.
    <section className="flex flex-wrap items-stretch gap-6 p-4 md:flex-nowrap">
      {/* Contenedor izquierdo: ancho fijo (w-40) con dos zonas apiladas.*/}
      <div className="relative flex w-40 shrink-0 flex-col overflow-hidden rounded-md border border-fuchsia-500/40 bg-zinc-900/60 shadow-[0_0_10px_rgba(217,70,239,0.25)] lg:w-52">
        {/* Estrella toggle: marca el kanji como "destacado" (dificil).
            Se posiciona absoluta arriba a la derecha del carrilito del kanji. */}
        <button
          type="button"
          onClick={onToggleDestacado}
          disabled={toggleDeshabilitado}
          aria-pressed={destacado}
          aria-label={
            destacado ? "Quitar de destacados" : "Marcar como destacado"
          }
          title={destacado ? "Quitar de destacados" : "Marcar como destacado"}
          className={`absolute top-1 left-1 z-10 flex h-7 w-7 items-center justify-center rounded-full text-lg leading-none transition disabled:cursor-not-allowed disabled:opacity-50 ${
            destacado
              ? "text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.75)] hover:text-amber-200"
              : "text-zinc-500 hover:text-amber-300"
          }`}
        >
          {destacado ? "★" : "☆"}
        </button>

        <div className="flex aspect-square items-center justify-center">
          <span className="font-mono text-[5.5rem] font-light leading-none text-fuchsia-100">
            {caracter}
          </span>
        </div>
        <div className="flex min-h-14 items-center justify-center border-t border-zinc-700 px-2 py-2 text-center text-base leading-tight text-zinc-300">
          <span className="line-clamp-2">{significado}</span>
        </div>
      </div>

      {/* Lecturas: fuera del cuadrado -> sin borde. Etiquetas en japones + romaji.
          Con muchas lecturas (上 tiene 15 kunyomi) las pastillas hacen wrap;
          min-w-40 evita que en movil queden de una letra por linea. */}
      <div className="flex min-w-40 flex-1 flex-col justify-center gap-5">
        <Lecturas
          titulo="音読み"
          romaji="onyomi"
          lecturas={onyomi}
          pastilla="border-violet-300/40 bg-violet-500/10 text-violet-100"
        />
        <Lecturas
          titulo="訓読み"
          romaji="kunyomi"
          lecturas={kunyomi}
          pastilla="border-zinc-600 bg-zinc-800/60 text-zinc-100"
        />
      </div>

      {/* Datos numericos como mini-tarjetas*/}
      <div className="flex w-full gap-3 md:w-32 md:shrink-0 md:flex-col lg:w-36">
        <Dato valor={numeroTrazos} etiqueta="TRAZOS" />
        <Dato
          valor={anioEscolarJapon !== null ? `${anioEscolarJapon}°` : null}
          etiqueta="AÑO ESCOLAR"
          detalle={<BanderaJapon />}
        />
      </div>
    </section>
  );
}

// Una fila de lecturas (onyomi o kunyomi) como pastillas. El JSON las trae
// separadas por "、": "いち、いつ" -> [いち] [いつ].
function Lecturas({
  titulo,
  romaji,
  lecturas,
  pastilla,
}: {
  titulo: string;
  romaji: string;
  lecturas: string | null;
  pastilla: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="font-mono text-[15px] tracking-wide text-zinc-500">
        {titulo} <span className="text-zinc-600">({romaji})</span>
      </div>
      {lecturas ? (
        <div className="flex flex-wrap gap-2">
          {lecturas.split("、").map((l, i) => (
            <span
              key={`${i}-${l}`}
              className={`rounded-md border px-2.5 py-0.5 whitespace-nowrap font-mono text-xl lg:text-2xl ${pastilla}`}
            >
              <Lectura texto={l} />
            </span>
          ))}
        </div>
      ) : (
        <span className="font-mono text-2xl text-zinc-600">—</span>
      )}
    </div>
  );
}

// Notacion de KANJIDIC: "-" marca prefijo/sufijo y lo que va despues del "."
// es okurigana (た.べる). Ambos van tenues para que se lea primero la raiz.
function Lectura({ texto }: { texto: string }) {
  const [raiz, okurigana] = texto.split(".");
  const tenue = (t: string) =>
    t.split(/(-)/).map((parte, i) =>
      parte === "-" ? (
        <span key={i} className="text-zinc-500">
          -
        </span>
      ) : (
        parte
      ),
    );
  return (
    <>
      {tenue(raiz)}
      {okurigana && <span className="text-zinc-500">{okurigana}</span>}
    </>
  );
}

function Dato({
  valor,
  etiqueta,
  detalle,
}: {
  valor: string | number | null;
  etiqueta: string;
  detalle?: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-md border border-zinc-700 bg-zinc-900/60 px-2 py-3">
      <span className="font-mono text-3xl text-violet-200 lg:text-4xl">
        {valor ?? <span className="text-zinc-600">—</span>}
      </span>
      <span className="text-center font-mono text-[10px] leading-tight tracking-widest text-zinc-500">
        {etiqueta}
        {detalle && (
          <span className="mt-1.5 flex justify-center">{detalle}</span>
        )}
      </span>
    </div>
  );
}

// Bandera de Japon en SVG
function BanderaJapon() {
  return (
    <svg
      role="img"
      aria-label="Japón"
      width="21"
      height="14"
      viewBox="0 0 3 2"
      className="rounded-xs"
    >
      <rect width="3" height="2" fill="#f4f4f5" />
      <circle cx="1.5" cy="1" r="0.6" fill="#bc002d" />
    </svg>
  );
}
