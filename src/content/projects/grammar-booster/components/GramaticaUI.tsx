import { FILTROS, chipFiltro, type Estructura, type Filtro } from "./gramatica";

// Chips Todos / N5 / N4 / N3 con la cantidad de preguntas de cada uno.
export function FiltroNivel({
  activo,
  conteos,
  onCambiar,
}: {
  activo: Filtro;
  conteos: Record<Filtro, number>;
  onCambiar: (f: Filtro) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="w-16 font-mono text-xs tracking-widest text-zinc-500 uppercase">
        Nivel
      </span>
      {FILTROS.map((f) => (
        <button
          key={f.id}
          type="button"
          aria-pressed={activo === f.id}
          onClick={() => onCambiar(f.id)}
          className={chipFiltro(activo === f.id)}
        >
          {f.label}
          <span className="ml-1.5 text-zinc-500">{conteos[f.id]}</span>
        </button>
      ))}
    </div>
  );
}

// Tarjeta de explicacion de una estructura: patron, significado, estructura
// base y, si se pide, sus ejemplos.
export function TarjetaEstructura({
  estructura,
  correcta,
  nota,
  conEjemplos = false,
}: {
  estructura: Estructura;
  correcta: boolean;
  nota?: string;
  conEjemplos?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-md border bg-zinc-900/60 p-4 ${
        correcta ? "border-emerald-400/60" : "border-zinc-700"
      }`}
    >
      <div className="flex flex-wrap items-baseline gap-3">
        <span
          className={`text-xl ${correcta ? "text-emerald-300" : "text-zinc-100"}`}
        >
          {estructura.patron}
        </span>
        <span className="font-mono text-xs text-zinc-500">
          {estructura.romaji}
        </span>
        <span
          className={`font-mono text-[10px] tracking-widest uppercase ${
            correcta ? "text-emerald-400" : "text-zinc-500"
          }`}
        >
          {estructura.nivel} · {correcta ? "Correcta" : "Incorrecta"}
        </span>
      </div>
      <p className="text-sm text-zinc-400">{estructura.significado}</p>
      {nota && <p className="text-sm text-zinc-200">{nota}</p>}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
          Estructura base
        </span>
        <ul className="flex flex-col gap-0.5 font-mono text-xs text-violet-200">
          {estructura.conexion.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
      {conEjemplos && (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
            Ejemplos
          </span>
          {estructura.ejemplos.map((ej) => (
            <div key={ej.ja} className="flex flex-col">
              <span className="font-mono text-xs text-fuchsia-300/80">
                {ej.lectura}
              </span>
              <span className="text-base text-zinc-100">{ej.ja}</span>
              <span className="text-sm text-zinc-400">{ej.es}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Explicacion de una opcion que no corresponde a ninguna estructura del
// catalogo (por ejemplo, una conjugacion mal hecha o un adverbio suelto).
export function TarjetaTexto({
  texto,
  nota,
  correcta = false,
}: {
  texto: string;
  nota?: string;
  correcta?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-md border bg-zinc-900/60 p-4 ${
        correcta ? "border-emerald-400/60" : "border-zinc-700"
      }`}
    >
      <div className="flex items-baseline gap-3">
        <span
          className={`text-xl ${correcta ? "text-emerald-300" : "text-zinc-100"}`}
        >
          {texto}
        </span>
        <span
          className={`font-mono text-[10px] tracking-widest uppercase ${
            correcta ? "text-emerald-400" : "text-zinc-500"
          }`}
        >
          {correcta ? "Correcta" : "Incorrecta"}
        </span>
      </div>
      {nota && <p className="text-sm text-zinc-200">{nota}</p>}
    </div>
  );
}
