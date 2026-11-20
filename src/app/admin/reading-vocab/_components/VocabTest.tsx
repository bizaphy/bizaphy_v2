"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { barajar } from "@/lib/barajar";
import type { Comodin, OrigenComodin } from "@/shared/types/comodin";
import { IndicadorGuardado } from "../../_compartido/autoguardado";
import { mismoComodin, useComodines } from "../../_compartido/comodines";
import { useSubidaDelNavegador } from "../../_compartido/subidaDelNavegador";
import {
  estiloBotonChico,
  estiloBotonPrincipal,
  estiloCampo,
} from "../../_compartido/frases";
import TextoJapones from "../../_compartido/TextoJapones";

// ─── Reading-vocab test ───
// Repasa solo las palabras comodin que anotaste en reading y karaoke. Cada
// tarjeta muestra la palabra dentro de su frase (el contexto donde te
// costo); intentas leerla y entenderla, das vuelta la tarjeta y dices si
// la sabias. Los aciertos y fallos quedan guardados en cada comodin.

type Vista = "test" | "lista";
type Fase = "config" | "pregunta" | "fin";
type FiltroOrigen = "todos" | OrigenComodin;

const CANTIDADES = [10, 20, 0]; // 0 = todas

function descargarJson(contenido: unknown, nombre: string) {
  const blob = new Blob([JSON.stringify(contenido, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

function Origen({ comodin }: { comodin: Comodin }) {
  return (
    <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
      {comodin.origen} · {comodin.titulo}
    </span>
  );
}

export default function VocabTest({
  comodinesIniciales,
}: {
  comodinesIniciales: Comodin[];
}) {
  useSubidaDelNavegador();
  const { comodines, setComodines, quitar, editar, estado } =
    useComodines(comodinesIniciales);
  const [vista, setVista] = useState<Vista>("test");

  // Configuracion del test
  const [origen, setOrigen] = useState<FiltroOrigen>("todos");
  const [titulo, setTitulo] = useState("");
  const [cantidad, setCantidad] = useState(10);
  const [soloFalladas, setSoloFalladas] = useState(false);

  // Ronda en curso: ids en orden, posicion y si la sabias o no
  const [fase, setFase] = useState<Fase>("config");
  const [ronda, setRonda] = useState<string[]>([]);
  const [posicion, setPosicion] = useState(0);
  const [revelada, setRevelada] = useState(false);
  const [resultados, setResultados] = useState<Record<string, boolean>>({});

  const [busqueda, setBusqueda] = useState("");

  const titulos = [...new Set(comodines.map((c) => c.titulo))].sort();
  const elegibles = comodines.filter(
    (c) =>
      (origen === "todos" || c.origen === origen) &&
      (titulo === "" || c.titulo === titulo) &&
      (!soloFalladas || c.fallos > 0),
  );
  const actual = comodines.find((c) => c.id === ronda[posicion]);

  const empezar = (ids: string[]) => {
    setRonda(ids);
    setPosicion(0);
    setRevelada(false);
    setResultados({});
    setFase("pregunta");
  };

  const empezarNuevo = () => {
    const mezcladas = barajar(elegibles).map((c) => c.id);
    empezar(cantidad === 0 ? mezcladas : mezcladas.slice(0, cantidad));
  };

  const responder = (sabia: boolean) => {
    if (!actual) return;
    editar(
      actual.id,
      sabia
        ? { aciertos: actual.aciertos + 1 }
        : { fallos: actual.fallos + 1 },
    );
    setResultados((anteriores) => ({ ...anteriores, [actual.id]: sabia }));
    setRevelada(false);
    if (posicion + 1 >= ronda.length) setFase("fin");
    else setPosicion(posicion + 1);
  };

  // Teclado: Espacio/Enter da vuelta la tarjeta; despues → la sabia,
  // ← no la sabia. Se ignora mientras escribes el significado.
  useEffect(() => {
    if (vista !== "test" || fase !== "pregunta") return;
    const alTeclear = (evento: KeyboardEvent) => {
      if ((evento.target as HTMLElement).closest("input, textarea")) return;
      if (!revelada && (evento.key === " " || evento.key === "Enter")) {
        evento.preventDefault();
        setRevelada(true);
      } else if (revelada && evento.key === "ArrowRight") {
        responder(true);
      } else if (revelada && evento.key === "ArrowLeft") {
        responder(false);
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  });

  // ─── Lista: respaldo ───
  const importar = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;
    try {
      const datos = JSON.parse(await archivo.text());
      if (!Array.isArray(datos)) throw new Error();
      const validos = (datos as Comodin[]).filter(
        (c) => typeof c.palabra === "string" && typeof c.frase === "string",
      );
      // Los que ya estan (misma palabra y frase) se saltan
      const nuevos = validos.filter(
        (c) => !comodines.some((otro) => mismoComodin(otro, c)),
      );
      // Se completan los campos que falten: la base rechaza un comodin a
      // medias y eso trabaria el autoguardado
      setComodines((anteriores) => [
        ...anteriores,
        ...nuevos.map(
          (c): Comodin => ({
            id: crypto.randomUUID(),
            palabra: c.palabra,
            lectura: typeof c.lectura === "string" ? c.lectura : "",
            significado:
              typeof c.significado === "string" ? c.significado : "",
            frase: c.frase,
            origen: c.origen === "karaoke" ? "karaoke" : "reading",
            titulo: typeof c.titulo === "string" ? c.titulo : "",
            creado: new Date(c.creado ?? Date.now()).toISOString(),
            aciertos: Number.isInteger(c.aciertos) ? c.aciertos : 0,
            fallos: Number.isInteger(c.fallos) ? c.fallos : 0,
          }),
        ),
      ]);
      toast.success(
        `${nuevos.length} comodines importados${
          validos.length > nuevos.length
            ? ` (${validos.length - nuevos.length} ya estaban)`
            : ""
        }`,
      );
    } catch {
      toast.error("El archivo no es una lista de comodines");
    }
  };

  const reiniciarEstadisticas = () => {
    if (!confirm("¿Poner en cero los aciertos y fallos de todos los comodines?"))
      return;
    setComodines((anteriores) =>
      anteriores.map((c) => ({ ...c, aciertos: 0, fallos: 0 })),
    );
  };

  const texto = busqueda.trim().toLowerCase();
  const filtrados = comodines
    .filter(
      (c) =>
        !texto ||
        [c.palabra, c.lectura, c.significado, c.titulo].some((campo) =>
          campo.toLowerCase().includes(texto),
        ),
    )
    .toReversed();

  const falladas = ronda.filter((id) => resultados[id] === false);

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Secciones del reading-vocab test"
        className="flex flex-wrap items-center gap-2 border-b border-zinc-800"
      >
        {(
          [
            { id: "test", label: "Test" },
            { id: "lista", label: "Mis comodines" },
          ] as const
        ).map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={vista === v.id}
            onClick={() => setVista(v.id)}
            className={`-mb-px border-b-2 px-4 py-2 font-mono text-sm tracking-widest uppercase transition ${
              vista === v.id
                ? "border-fuchsia-400 text-fuchsia-200"
                : "border-transparent text-zinc-500 hover:text-violet-300"
            }`}
          >
            {v.label}
          </button>
        ))}
        <span className="ml-auto flex flex-col items-end gap-0.5 font-mono text-xs text-zinc-500">
          {comodines.length} comodines
          <IndicadorGuardado estado={estado} />
        </span>
      </div>

      {/* ─── Test: configuracion ─── */}
      {vista === "test" && fase === "config" && (
        <section className="flex flex-col gap-4">
          {comodines.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-400">
              Todavía no hay comodines. Agrégalos con{" "}
              <span className="text-violet-300">+ comodín</span> en las frases
              de reading o karaoke.
            </p>
          ) : (
            <div className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                Origen
                <select
                  className={estiloCampo}
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value as FiltroOrigen)}
                >
                  <option value="todos">Reading y karaoke</option>
                  <option value="reading">Solo reading</option>
                  <option value="karaoke">Solo karaoke</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
                Texto o canción
                <select
                  className={estiloCampo}
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                >
                  <option value="">Todos</option>
                  {titulos.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-col gap-1.5 text-sm text-zinc-300">
                Cantidad
                <div className="flex gap-2">
                  {CANTIDADES.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCantidad(n)}
                      className={`${estiloBotonChico} ${
                        cantidad === n ? "border-fuchsia-500 text-white" : ""
                      }`}
                    >
                      {n === 0 ? "Todas" : n}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 self-end text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={soloFalladas}
                  onChange={(e) => setSoloFalladas(e.target.checked)}
                  className="accent-fuchsia-500"
                />
                Solo las que he fallado alguna vez
              </label>
              <div className="flex items-center gap-3 sm:col-span-2">
                <span className="text-sm text-zinc-400">
                  {elegibles.length} comodines cumplen el filtro
                </span>
                <button
                  type="button"
                  className={`${estiloBotonPrincipal} ml-auto disabled:opacity-40`}
                  disabled={elegibles.length === 0}
                  onClick={empezarNuevo}
                >
                  Empezar test
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ─── Test: tarjeta ─── */}
      {vista === "test" && fase === "pregunta" && actual && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
            <span>
              {posicion + 1}/{ronda.length}
            </span>
            <button
              type="button"
              className={estiloBotonChico}
              onClick={() => setFase("config")}
            >
              Salir del test
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <Origen comodin={actual} />
            <p className="font-mono text-5xl text-fuchsia-100">
              {actual.palabra}
            </p>
            {actual.frase && (
              <TextoJapones
                ja={actual.frase}
                furigana={revelada}
                resaltar={[actual.palabra]}
                className="text-2xl text-zinc-200"
              />
            )}

            {!revelada ? (
              <>
                <p className="text-sm text-zinc-400">
                  ¿Cómo se lee y qué significa en esta frase?
                </p>
                <button
                  type="button"
                  className={estiloBotonPrincipal}
                  onClick={() => setRevelada(true)}
                >
                  Mostrar (Espacio)
                </button>
              </>
            ) : (
              <>
                <div className="flex w-full max-w-md flex-col gap-3 rounded-lg border border-violet-500/40 bg-violet-500/5 p-4">
                  <p className="font-mono text-2xl text-violet-100">
                    {actual.lectura || "(sin lectura)"}
                  </p>
                  {/* Si no tiene significado, se puede escribir aqui mismo */}
                  <input
                    className={`${estiloCampo} text-center text-sm`}
                    value={actual.significado}
                    onChange={(e) =>
                      editar(actual.id, { significado: e.target.value })
                    }
                    placeholder="Significado (escríbelo para la próxima vez)"
                    aria-label="Significado"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className={`${estiloBotonChico} px-4 py-2 text-sm hover:border-red-500`}
                    onClick={() => responder(false)}
                  >
                    ← No la sabía
                  </button>
                  <button
                    type="button"
                    className={`${estiloBotonChico} px-4 py-2 text-sm hover:border-violet-400`}
                    onClick={() => responder(true)}
                  >
                    La sabía →
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ─── Test: resultado ─── */}
      {vista === "test" && fase === "fin" && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="font-mono text-4xl text-fuchsia-100">
              {ronda.length - falladas.length}/{ronda.length}
            </p>
            <p className="text-sm text-zinc-400">palabras que sabías</p>
            <div className="mt-2 flex gap-2">
              {falladas.length > 0 && (
                <button
                  type="button"
                  className={estiloBotonPrincipal}
                  onClick={() => empezar(barajar(falladas))}
                >
                  Repetir las {falladas.length} falladas
                </button>
              )}
              <button
                type="button"
                className={estiloBotonChico}
                onClick={() => setFase("config")}
              >
                Nuevo test
              </button>
            </div>
          </div>

          {falladas.length > 0 && (
            <ol className="flex flex-col gap-3">
              {falladas.map((id) => {
                const comodin = comodines.find((c) => c.id === id);
                if (!comodin) return null;
                return (
                  <li
                    key={id}
                    className="flex flex-col gap-1 rounded-lg border border-fuchsia-500/40 bg-zinc-900/60 p-4"
                  >
                    <span className="flex flex-wrap items-baseline gap-3">
                      <span className="font-mono text-xl text-fuchsia-100">
                        {comodin.palabra}
                      </span>
                      <span className="font-mono text-violet-300">
                        {comodin.lectura}
                      </span>
                      <span className="text-sm text-zinc-300">
                        {comodin.significado}
                      </span>
                    </span>
                    {comodin.frase && (
                      <TextoJapones
                        ja={comodin.frase}
                        furigana
                        resaltar={[comodin.palabra]}
                        className="text-lg text-zinc-300"
                        claseFurigana="text-[0.55em]"
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}

      {/* ─── Mis comodines ─── */}
      {vista === "lista" && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              className={`${estiloCampo} min-w-48 flex-1 py-1.5 text-sm`}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por palabra, lectura, significado o título…"
            />
            <button
              type="button"
              className={estiloBotonChico}
              disabled={comodines.length === 0}
              onClick={() => descargarJson(comodines, "reading-vocab.json")}
            >
              Exportar .json
            </button>
            <label className={`${estiloBotonChico} cursor-pointer`}>
              Importar .json
              <input
                type="file"
                accept=".json,application/json"
                onChange={importar}
                className="hidden"
              />
            </label>
            <button
              type="button"
              className={`${estiloBotonChico} hover:border-red-500`}
              disabled={comodines.length === 0}
              onClick={reiniciarEstadisticas}
            >
              Reiniciar estadísticas
            </button>
          </div>

          {filtrados.length === 0 && (
            <p className="py-6 text-center text-sm text-zinc-400">
              {comodines.length === 0
                ? "Todavía no hay comodines."
                : "Ningún comodín coincide con la búsqueda."}
            </p>
          )}

          <ol className="flex flex-col gap-3">
            {filtrados.map((comodin) => (
              <li
                key={comodin.id}
                className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-2xl text-fuchsia-100">
                    {comodin.palabra}
                  </span>
                  <input
                    className={`${estiloCampo} w-36 px-2 py-1 font-mono text-sm`}
                    value={comodin.lectura}
                    onChange={(e) =>
                      editar(comodin.id, { lectura: e.target.value })
                    }
                    placeholder="Lectura"
                    aria-label={`Lectura de ${comodin.palabra}`}
                  />
                  <input
                    className={`${estiloCampo} min-w-40 flex-1 px-2 py-1 text-sm`}
                    value={comodin.significado}
                    onChange={(e) =>
                      editar(comodin.id, { significado: e.target.value })
                    }
                    placeholder="Significado"
                    aria-label={`Significado de ${comodin.palabra}`}
                  />
                  <span className="font-mono text-xs text-zinc-400">
                    ✓{comodin.aciertos} ✗{comodin.fallos}
                  </span>
                  <button
                    type="button"
                    className={`${estiloBotonChico} hover:border-red-500`}
                    onClick={() => {
                      if (confirm(`¿Quitar 「${comodin.palabra}」 del comodín?`))
                        quitar(comodin.id);
                    }}
                    aria-label={`Quitar ${comodin.palabra}`}
                  >
                    ✕
                  </button>
                </div>
                {comodin.frase ? (
                  <TextoJapones
                    ja={comodin.frase}
                    furigana
                    resaltar={[comodin.palabra]}
                    className="text-lg text-zinc-300"
                    claseFurigana="text-[0.55em]"
                  />
                ) : (
                  <p className="text-sm text-zinc-500 italic">
                    (sin frase: venía del comodín viejo y no se encontró en el
                    texto)
                  </p>
                )}
                <Origen comodin={comodin} />
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
