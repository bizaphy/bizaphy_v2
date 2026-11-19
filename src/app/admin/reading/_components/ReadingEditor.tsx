"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import Interruptor from "@/components/ui/Interruptor";
import { quitarFurigana } from "@/lib/furigana";
import TextoJapones from "../../_compartido/TextoJapones";
import {
  armarExportacion,
  armarFilas,
  cortarEnPuntos,
  estiloBotonChico,
  estiloBotonPrincipal,
  estiloCampo,
  separarComodines,
} from "../../_compartido/frases";
import { ALMACEN, type TextoAlmacen } from "../_data/almacen";

// ─── Plantilla del editor de reading ───
// Todavia sin base de datos: el borrador vive en localStorage del navegador.
// Cuando la plantilla convenza, `Reading` pasa a una tabla y esto a una
// server action (mismo camino que el blog).

type Paso = "almacen" | "texto" | "filas" | "exportar" | "real";

const PASOS: { id: Paso; label: string }[] = [
  { id: "almacen", label: "Almacén" },
  { id: "texto", label: "1 · Texto" },
  { id: "filas", label: "2 · Filas" },
  { id: "exportar", label: "3 · Exportar" },
  { id: "real", label: "4 · Traducción real" },
];

const CLAVE_BORRADOR = "reading-borrador";

export default function ReadingEditor() {
  const [paso, setPaso] = useState<Paso>("almacen");
  const [titulo, setTitulo] = useState("");
  const [fuente, setFuente] = useState("");
  const [texto, setTexto] = useState("");
  const [traducciones, setTraducciones] = useState<Record<string, string>>(
    {},
  );
  // Comodin de cada texto, guardado por titulo: el texto tal cual lo
  // escribes ("会議, 効果的"). Se separa en palabras recien al mostrarlo.
  const [comodines, setComodines] = useState<Record<string, string>>({});
  const [furigana, setFurigana] = useState(true);
  const [conInstrucciones, setConInstrucciones] = useState(true);
  const [conLectura, setConLectura] = useState(false);
  const [cargado, setCargado] = useState(false);

  // Borrador: se lee al montar (no en el render, para no romper la
  // hidratacion) y se guarda en cada cambio. localStorage puede fallar
  // (modo privado, cuota llena): en ese caso solo se pierde el borrador.
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_BORRADOR);
      if (guardado) {
        const borrador = JSON.parse(guardado);
        setTitulo(borrador.titulo ?? "");
        setFuente(borrador.fuente ?? "");
        setTexto(borrador.texto ?? "");
        setTraducciones(borrador.traducciones ?? {});
        setComodines(borrador.comodines ?? {});
      }
    } catch {}
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(
        CLAVE_BORRADOR,
        JSON.stringify({ titulo, fuente, texto, traducciones, comodines }),
      );
    } catch {}
  }, [cargado, titulo, fuente, texto, traducciones, comodines]);

  const filas = armarFilas(texto, traducciones);
  const traducidas = filas.filter((fila) => fila.es.trim()).length;
  const claveComodin = titulo.trim() || "sin título";
  const comodinActual = comodines[claveComodin] ?? "";

  // Traduccion real: solo existe para textos del almacen. Se arma un mapa
  // fila -> traduccion (no por indice), asi sigue cuadrando aunque en el
  // paso 1 hayas cortado o borrado alguna fila.
  const delAlmacen =
    ALMACEN.find((item) => item.titulo === titulo) ??
    ALMACEN.find((item) => item.texto === texto);
  const traduccionReal: Record<string, string> = {};
  if (delAlmacen) {
    armarFilas(delAlmacen.texto, {}).forEach((fila, indice) => {
      traduccionReal[fila.ja] = delAlmacen.traduccion[indice];
    });
  }
  const exportacion = armarExportacion(
    { titulo, fuente, comodines: separarComodines(comodinActual), filas },
    { instrucciones: conInstrucciones, lectura: conLectura },
  );

  const subirArchivo = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    setTexto(await archivo.text());
    if (!titulo) setTitulo(archivo.name.replace(/\.[^.]+$/, ""));
    evento.target.value = ""; // permite volver a subir el mismo archivo
  };

  const traducir = (ja: string, es: string) =>
    setTraducciones((anteriores) => ({ ...anteriores, [ja]: es }));

  // Borra solo las traducciones de las filas del texto abierto: las de los
  // otros textos del almacen y el comodin se mantienen.
  const resetearTraducciones = () => {
    if (
      !confirm(
        `¿Borrar las ${traducidas} traducciones escritas de este texto? No se puede deshacer.`,
      )
    ) {
      return;
    }
    setTraducciones((anteriores) => {
      const nuevas = { ...anteriores };
      for (const fila of filas) delete nuevas[fila.ja];
      return nuevas;
    });
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(exportacion);
      toast.success("Exportación copiada al portapapeles");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const descargar = () => {
    const blob = new Blob([exportacion], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `${titulo || "reading"}.txt`;
    enlace.click();
    URL.revokeObjectURL(url);
  };

  const descartar = () => {
    if (!confirm("¿Borrar el borrador completo (texto y traducciones)?")) return;
    setTitulo("");
    setFuente("");
    setTexto("");
    setTraducciones({});
    setComodines({});
    setPaso("texto");
  };

  // Abre un texto del almacen en el editor. Las traducciones no se borran:
  // como se guardan por el texto de cada fila, al volver a un texto ya
  // trabajado reaparecen solas. Solo se pide confirmar si lo que hay ahora
  // es un texto propio (no del almacen), porque ese si se perderia.
  const abrirDelAlmacen = (item: TextoAlmacen) => {
    const esPropio =
      texto.trim() !== "" && !ALMACEN.some((otro) => otro.texto === texto);
    if (esPropio && !confirm("Se reemplazará el texto actual. ¿Continuar?")) {
      return;
    }
    setTitulo(item.titulo);
    setFuente(item.archivo);
    setTexto(item.texto);
    setPaso("filas");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Datos del reading */}
      <div className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
          Título
          <input
            className={estiloCampo}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={160}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
          Fuente (URL o referencia)
          <input
            className={estiloCampo}
            value={fuente}
            onChange={(e) => setFuente(e.target.value)}
          />
        </label>
      </div>

      {/* Pasos */}
      <div
        role="tablist"
        aria-label="Pasos del reading"
        className="flex flex-wrap items-center gap-2 border-b border-zinc-800"
      >
        {PASOS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={paso === p.id}
            onClick={() => setPaso(p.id)}
            className={`-mb-px border-b-2 px-4 py-2 font-mono text-sm tracking-widest uppercase transition ${
              paso === p.id
                ? "border-fuchsia-400 text-fuchsia-200"
                : "border-transparent text-zinc-500 hover:text-violet-300"
            }`}
          >
            {p.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-zinc-500">
          {traducidas}/{filas.length} filas traducidas
        </span>
      </div>

      {/* ─── Almacen: textos guardados ─── */}
      {paso === "almacen" && (
        <section className="grid gap-3 sm:grid-cols-2">
          {ALMACEN.map((item) => {
            const filasItem = armarFilas(item.texto, traducciones);
            const hechas = filasItem.filter((fila) => fila.es.trim()).length;
            const totalComodines = separarComodines(
              comodines[item.titulo] ?? "",
            ).length;
            const abierto = item.texto === texto;
            return (
              <button
                key={item.titulo}
                type="button"
                onClick={() => abrirDelAlmacen(item)}
                className={`flex flex-col gap-2 rounded-xl border bg-zinc-900 p-4 text-left transition hover:border-fuchsia-500 ${
                  abierto ? "border-fuchsia-500/60" : "border-zinc-800"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-zinc-100">
                    {item.titulo}
                  </span>
                  <span
                    className={`font-mono text-xs ${
                      hechas === filasItem.length
                        ? "text-violet-300"
                        : "text-zinc-500"
                    }`}
                  >
                    {hechas}/{filasItem.length}
                  </span>
                </span>
                <span className="line-clamp-2 font-mono text-sm text-zinc-400">
                  {quitarFurigana(filasItem[0]?.ja ?? "")}
                </span>
                {totalComodines > 0 && (
                  <span className="font-mono text-xs text-violet-300">
                    {totalComodines} en el comodín
                  </span>
                )}
                {abierto && (
                  <span className="font-mono text-[10px] tracking-widest text-fuchsia-300 uppercase">
                    abierto en el editor
                  </span>
                )}
              </button>
            );
          })}
        </section>
      )}

      {/* ─── Paso 1: texto crudo ─── */}
      {paso === "texto" && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <label className={`${estiloBotonChico} cursor-pointer`}>
              Subir .txt / .md
              <input
                type="file"
                accept=".txt,.md,text/plain"
                onChange={subirArchivo}
                className="hidden"
              />
            </label>
            <button
              type="button"
              className={estiloBotonChico}
              onClick={() => setTexto(cortarEnPuntos(texto))}
            >
              Cortar en 。！？
            </button>
            <button
              type="button"
              className={`${estiloBotonChico} ml-auto hover:border-red-500`}
              onClick={descartar}
            >
              Descartar borrador
            </button>
          </div>

          <p className="text-sm text-zinc-400">
            Cada línea es una fila. Furigana:{" "}
            <code className="text-violet-300">[漢字|かんじ]</code>. Las líneas
            vacías se ignoran.
          </p>

          <textarea
            className={`${estiloCampo} font-mono leading-relaxed`}
            rows={18}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Pega o sube el texto en japonés…"
          />

          <button
            type="button"
            className={`${estiloBotonPrincipal} self-end`}
            onClick={() => setPaso("filas")}
            disabled={filas.length === 0}
          >
            Ir a las filas →
          </button>
        </section>
      )}

      {/* ─── Paso 2: fila por fila ─── */}
      {paso === "filas" && (
        <section className="flex flex-col gap-4">
          {/* Comodin: palabras que no se, separadas por comas */}
          <div className="flex flex-col gap-3 rounded-lg border border-violet-500/40 bg-zinc-900/60 p-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-xs tracking-widest text-violet-300 uppercase">
                Comodín
              </span>
              <input
                className={estiloCampo}
                value={comodinActual}
                onChange={(e) =>
                  setComodines((anteriores) => ({
                    ...anteriores,
                    [claveComodin]: e.target.value,
                  }))
                }
                placeholder="Palabras que no sabes, separadas por comas: 会議, 効果的…"
              />
            </label>
            {separarComodines(comodinActual).length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {separarComodines(comodinActual).map((palabra, indice) => (
                  <li
                    // biome-ignore lint/suspicious/noArrayIndexKey: la misma palabra puede repetirse
                    key={indice}
                    className="rounded-md border border-violet-500/40 bg-violet-500/10 px-2.5 py-1 font-mono text-base text-violet-100"
                  >
                    {palabra}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              disabled={traducidas === 0}
              onClick={resetearTraducciones}
              className={`${estiloBotonChico} cursor-pointer hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-40`}
            >
              Reset traducciones
            </button>
            <div className="rounded-md border border-dashed border-zinc-700 px-3 py-2">
              <Interruptor
                label="Furigana"
                activo={furigana}
                onToggle={() => setFurigana((activo) => !activo)}
              />
            </div>
          </div>

          {filas.length === 0 && (
            <p className="py-6 text-center text-sm text-zinc-400">
              No hay filas. Escribe o sube un texto en el paso 1.
            </p>
          )}

          <ol className="flex flex-col gap-3">
            {filas.map((fila, indice) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: dos filas pueden tener el mismo texto
                key={indice}
                className={`flex gap-3 rounded-lg border bg-zinc-900/60 p-4 ${
                  fila.es.trim() ? "border-zinc-700" : "border-fuchsia-500/40"
                }`}
              >
                <span className="pt-3 font-mono text-xs text-zinc-500">
                  {String(indice + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-1 flex-col gap-2">
                  <TextoJapones ja={fila.ja} furigana={furigana} />
                  <textarea
                    className={`${estiloCampo} text-sm`}
                    rows={2}
                    value={fila.es}
                    onChange={(e) => traducir(fila.ja, e.target.value)}
                    placeholder="Lo que significa esta fila…"
                  />
                </div>
              </li>
            ))}
          </ol>

          {filas.length > 0 && (
            <button
              type="button"
              className={`${estiloBotonPrincipal} self-end`}
              onClick={() => setPaso("exportar")}
            >
              Exportar →
            </button>
          )}
        </section>
      )}

      {/* ─── Paso 3: exportar ─── */}
      {paso === "exportar" && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4 rounded-md border border-dashed border-zinc-700 px-3 py-2">
            <Interruptor
              label="Instrucciones IA"
              activo={conInstrucciones}
              onToggle={() => setConInstrucciones((activo) => !activo)}
            />
            <Interruptor
              label="Lectura"
              activo={conLectura}
              onToggle={() => setConLectura((activo) => !activo)}
            />
            <div className="ml-auto flex gap-2">
              <button type="button" className={estiloBotonChico} onClick={copiar}>
                Copiar
              </button>
              <button
                type="button"
                className={estiloBotonChico}
                onClick={descargar}
              >
                Descargar .txt
              </button>
            </div>
          </div>

          {traducidas < filas.length && (
            <p className="text-sm text-fuchsia-300">
              Faltan {filas.length - traducidas} filas por traducir: saldrán
              como &quot;(sin traducir)&quot;.
            </p>
          )}

          <pre className="max-h-[70vh] overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
            {exportacion}
          </pre>
        </section>
      )}

      {/* ─── Paso 4: traduccion real, al lado de la tuya ─── */}
      {paso === "real" && (
        <section className="flex flex-col gap-4">
          {!delAlmacen ? (
            <p className="py-6 text-center text-sm text-zinc-400">
              La traducción real solo existe para los textos del Almacén.
            </p>
          ) : (
            <>
              <div className="self-end rounded-md border border-dashed border-zinc-700 px-3 py-2">
                <Interruptor
                  label="Furigana"
                  activo={furigana}
                  onToggle={() => setFurigana((activo) => !activo)}
                />
              </div>

              <ol className="flex flex-col gap-3">
                {filas.map((fila, indice) => (
                  <li
                    // biome-ignore lint/suspicious/noArrayIndexKey: dos filas pueden tener el mismo texto
                    key={indice}
                    className="flex gap-3 rounded-lg border border-zinc-700 bg-zinc-900/60 p-4"
                  >
                    <span className="pt-3 font-mono text-xs text-zinc-500">
                      {String(indice + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-1 flex-col gap-3">
                      <TextoJapones ja={fila.ja} furigana={furigana} />
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex flex-col gap-1 rounded-md border border-zinc-700 p-3">
                          <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                            Tu traducción
                          </span>
                          <p
                            className={`text-sm ${fila.es.trim() ? "text-zinc-200" : "text-zinc-600 italic"}`}
                          >
                            {fila.es.trim() || "(sin traducir)"}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 rounded-md border border-violet-500/40 bg-violet-500/5 p-3">
                          <span className="font-mono text-[10px] tracking-widest text-violet-300 uppercase">
                            Traducción real
                          </span>
                          <p className="text-sm text-violet-100">
                            {traduccionReal[fila.ja] ?? "— (fila que no está en el original)"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      )}
    </div>
  );
}
