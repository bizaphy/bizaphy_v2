"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import Interruptor from "@/components/ui/Interruptor";
import { quitarFurigana } from "@/lib/furigana";
import type { Cancion } from "@/shared/types/karaoke";
import {
  ComodinesDelTexto,
  ComodinesFila,
} from "../../_compartido/ComodinesUI";
import { useComodines } from "../../_compartido/comodines";
import TextoJapones from "../../_compartido/TextoJapones";
import {
  armarExportacion,
  armarFilas,
  cortarEnPuntos,
  estiloBotonChico,
  estiloBotonPrincipal,
  estiloCampo,
} from "../../_compartido/frases";
import {
  filaActiva,
  finDeFila,
  formatearTiempo,
  realinear,
} from "../_lib/tiempos";
import PasoTiempos from "./PasoTiempos";
import Reproductor from "./Reproductor";

// ─── Karaoke: reading con video ───
// Mismo flujo que reading (letra -> filas -> traducir -> exportar ->
// comparar), mas un video local y el tiempo de salida de cada fila.
// Sin base de datos todavia: las canciones viven en localStorage. El video
// no se guarda: es una URL temporal del archivo que eliges en el PC.

type Paso =
  | "canciones"
  | "letra"
  | "tiempos"
  | "frases"
  | "karaoke"
  | "exportar"
  | "real";

const PASOS: { id: Paso; label: string }[] = [
  { id: "canciones", label: "Canciones" },
  { id: "letra", label: "1 · Letra" },
  { id: "tiempos", label: "2 · Tiempos" },
  { id: "frases", label: "3 · Frases" },
  { id: "karaoke", label: "4 · Karaoke" },
  { id: "exportar", label: "5 · Exportar" },
  { id: "real", label: "6 · Traducción real" },
];

// Pasos donde se ve el video
const CON_VIDEO: Paso[] = ["tiempos", "frases", "karaoke"];

const CLAVE_CANCIONES = "karaoke-canciones";

function cancionNueva(): Cancion {
  return {
    id: crypto.randomUUID(),
    titulo: "",
    fuente: "",
    texto: "",
    traducciones: {},
    real: {},
    tiempos: [],
    video: "",
  };
}

// Lineas no vacias de un texto pegado o subido
function lineasDe(texto: string): string[] {
  return texto
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);
}

function descargarArchivo(contenido: string, nombre: string, tipo: string) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

export default function KaraokeEditor() {
  // Va primero: al cargar migra el comodin viejo de cada cancion
  const { comodines, agregar, quitar } = useComodines();
  const [paso, setPaso] = useState<Paso>("canciones");
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [idActual, setIdActual] = useState("");
  const [cargado, setCargado] = useState(false);

  // Video temporal: URL del archivo elegido, solo mientras la pagina este
  // abierta. `ahora` va en decimas para no re-renderizar en cada frame.
  const [urlVideo, setUrlVideo] = useState("");
  const [ahora, setAhora] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Al escuchar una sola fila, el video se pausa al llegar a este tiempo
  const pararEn = useRef<number | null>(null);

  const [furigana, setFurigana] = useState(true);
  const [verMia, setVerMia] = useState(true);
  const [verReal, setVerReal] = useState(false);
  const [conInstrucciones, setConInstrucciones] = useState(true);
  const [conLectura, setConLectura] = useState(false);
  const [textoReal, setTextoReal] = useState("");
  const listaKaraokeRef = useRef<HTMLOListElement>(null);

  // Canciones: se leen al montar (no en el render, para no romper la
  // hidratacion) y se guardan en cada cambio. Siempre hay una abierta.
  useEffect(() => {
    let guardadas: Cancion[] = [];
    let abierta = "";
    try {
      const guardado = localStorage.getItem(CLAVE_CANCIONES);
      if (guardado) {
        const datos = JSON.parse(guardado);
        guardadas = datos.canciones ?? [];
        abierta = datos.idActual ?? "";
      }
    } catch {}
    if (guardadas.length === 0) guardadas = [cancionNueva()];
    if (!guardadas.some((c) => c.id === abierta)) abierta = guardadas[0].id;
    setCanciones(guardadas);
    setIdActual(abierta);
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(
        CLAVE_CANCIONES,
        JSON.stringify({ canciones, idActual }),
      );
    } catch {}
  }, [cargado, canciones, idActual]);

  // La URL temporal se libera al cambiar de video o salir de la pagina.
  // Va en un ref y no en el cleanup de un efecto con [urlVideo]: en modo
  // estricto ese cleanup corre de mas y revocaria la URL antes de usarla.
  const urlRef = useRef("");
  const cambiarVideo = (url: string) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = url;
    setUrlVideo(url);
    setAhora(0);
  };
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  // Reloj del video: mientras suena se lee en cada frame
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !urlVideo) return;
    let frame = 0;
    const leer = () => {
      setAhora(Math.floor(video.currentTime * 10) / 10);
      if (pararEn.current !== null && video.currentTime >= pararEn.current) {
        pararEn.current = null;
        video.pause();
      }
    };
    const tick = () => {
      leer();
      if (!video.paused) frame = requestAnimationFrame(tick);
    };
    const alSonar = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };
    // Si pausas a mano, se olvida la fila que estabas escuchando
    const alPausar = () => {
      pararEn.current = null;
      leer();
    };
    video.addEventListener("play", alSonar);
    video.addEventListener("pause", alPausar);
    video.addEventListener("seeked", leer);
    return () => {
      cancelAnimationFrame(frame);
      video.removeEventListener("play", alSonar);
      video.removeEventListener("pause", alPausar);
      video.removeEventListener("seeked", leer);
    };
  }, [urlVideo]);

  const actual = canciones.find((c) => c.id === idActual) ?? cancionNueva();
  const filas = armarFilas(actual.texto, actual.traducciones);
  const tiempos = filas.map((fila, indice) =>
    actual.tiempos[indice]?.ja === fila.ja ? actual.tiempos[indice].t : null,
  );
  const activa = filaActiva(tiempos, ahora);
  const traducidas = filas.filter((fila) => fila.es.trim()).length;
  // Comodines de esta cancion: los que se anotaron en alguna de sus frases
  const frasesDeLaCancion = new Set(filas.map((fila) => fila.ja));
  const comodinesDelTexto = comodines.filter((c) =>
    frasesDeLaCancion.has(c.frase),
  );
  const delaFila = (ja: string) =>
    comodinesDelTexto
      .filter((c) => c.frase === ja)
      .map((c) => c.palabra);
  const hayReal = filas.some((fila) => actual.real[fila.ja]);
  const exportacion = armarExportacion(
    {
      titulo: actual.titulo,
      fuente: actual.fuente,
      comodines: comodinesDelTexto.map((c) => c.palabra),
      filas,
    },
    {
      instrucciones: conInstrucciones,
      lectura: conLectura,
      que: "esta canción japonesa",
    },
  );

  const actualizar = useCallback(
    (cambio: (cancion: Cancion) => Partial<Cancion>) =>
      setCanciones((anteriores) =>
        anteriores.map((c) => (c.id === idActual ? { ...c, ...cambio(c) } : c)),
      ),
    [idActual],
  );

  // Al editar la letra, los tiempos marcados siguen a su fila
  const cambiarTexto = (texto: string) =>
    actualizar((c) => ({
      texto,
      tiempos: realinear(
        c.tiempos,
        armarFilas(texto, {}).map((fila) => fila.ja),
      ),
    }));

  // Tiempos completos (uno por fila), para escribir sobre ellos
  const conTiempos = useCallback(
    (c: Cancion, editar: (t: (number | null)[]) => (number | null)[]) => {
      const filasC = armarFilas(c.texto, {});
      const actuales = filasC.map((fila, indice) =>
        c.tiempos[indice]?.ja === fila.ja ? c.tiempos[indice].t : null,
      );
      const nuevos = editar(actuales);
      return {
        tiempos: filasC.map((fila, i) => ({ ja: fila.ja, t: nuevos[i] })),
      };
    },
    [],
  );

  const cambiarTiempo = useCallback(
    (indice: number, t: number | null) =>
      actualizar((c) =>
        conTiempos(c, (ts) => ts.map((viejo, i) => (i === indice ? t : viejo))),
      ),
    [actualizar, conTiempos],
  );

  const moverTodos = useCallback(
    (delta: number) =>
      actualizar((c) =>
        conTiempos(c, (ts) =>
          ts.map((t) =>
            t === null ? null : Math.max(0, Math.round((t + delta) * 10) / 10),
          ),
        ),
      ),
    [actualizar, conTiempos],
  );

  const traducir = (ja: string, es: string) =>
    actualizar((c) => ({ traducciones: { ...c.traducciones, [ja]: es } }));

  // Karaoke: la lista sigue a la fila que suena, sin mover la pagina
  useEffect(() => {
    const lista = listaKaraokeRef.current;
    if (paso !== "karaoke" || !lista || activa === -1) return;
    const item = lista.children[activa] as HTMLElement | undefined;
    if (!item) return;
    lista.scrollTo({
      top: item.offsetTop - lista.clientHeight / 2 + item.clientHeight / 2,
      behavior: "smooth",
    });
  }, [paso, activa]);

  // ─── Video ───
  const elegirVideo = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    cambiarVideo(URL.createObjectURL(archivo));
    actualizar(() => ({ video: archivo.name }));
    evento.target.value = "";
  };

  // Escucha solo una fila: salta a su tiempo y pausa al llegar a la siguiente
  const escucharFila = (indice: number) => {
    const video = videoRef.current;
    const t = tiempos[indice];
    if (!video || t === null) return;
    video.currentTime = t;
    video.play();
    pararEn.current = finDeFila(tiempos, indice);
  };

  const irA = (t: number | null) => {
    const video = videoRef.current;
    if (!video || t === null) return;
    video.currentTime = t;
    video.play();
  };

  // ─── Canciones ───
  const abrir = (id: string) => {
    if (id !== idActual) {
      cambiarVideo("");
      setTextoReal("");
    }
    setIdActual(id);
    setPaso("letra");
  };

  const crear = () => {
    const nueva = cancionNueva();
    setCanciones((anteriores) => [...anteriores, nueva]);
    abrir(nueva.id);
  };

  const borrar = (cancion: Cancion) => {
    if (
      !confirm(
        `¿Borrar "${cancion.titulo || "Sin título"}" con su letra, tiempos y traducciones? No se puede deshacer.`,
      )
    ) {
      return;
    }
    const restantes = canciones.filter((c) => c.id !== cancion.id);
    if (restantes.length === 0) restantes.push(cancionNueva());
    setCanciones(restantes);
    if (cancion.id === idActual) {
      setIdActual(restantes[0].id);
      cambiarVideo("");
    }
  };

  // .json con todo menos el video, para respaldar o pasar a otro PC
  const exportarCancion = (cancion: Cancion) =>
    descargarArchivo(
      JSON.stringify(cancion, null, 2),
      `${cancion.titulo || "cancion"}.karaoke.json`,
      "application/json",
    );

  const importarCancion = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;
    try {
      const datos = JSON.parse(await archivo.text());
      if (typeof datos.texto !== "string") throw new Error();
      // id nuevo: importar dos veces el mismo archivo no pisa nada
      const importada: Cancion = {
        ...cancionNueva(),
        ...datos,
        id: crypto.randomUUID(),
      };
      setCanciones((anteriores) => [...anteriores, importada]);
      toast.success(`"${importada.titulo || "Sin título"}" importada`);
    } catch {
      toast.error("El archivo no es una canción del karaoke");
    }
  };

  // ─── Letra ───
  const subirLetra = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    cambiarTexto(await archivo.text());
    if (!actual.titulo) {
      actualizar(() => ({ titulo: archivo.name.replace(/\.[^.]+$/, "") }));
    }
    evento.target.value = "";
  };

  // Mis traducciones de esta cancion. El resto de la cancion se mantiene.
  const resetearTraducciones = () => {
    if (
      !confirm(
        `¿Borrar las ${traducidas} traducciones escritas de esta canción? No se puede deshacer.`,
      )
    ) {
      return;
    }
    actualizar(() => ({ traducciones: {} }));
  };

  // ─── Traduccion real ───
  // Una linea por fila, en el mismo orden. Se guarda por el texto de la
  // fila (igual que en reading), asi el coro repetido toma la misma.
  const lineasReal = lineasDe(textoReal);
  const importarReal = () => {
    const real: Record<string, string> = {};
    filas.forEach((fila, indice) => {
      if (lineasReal[indice]) real[fila.ja] = lineasReal[indice];
    });
    actualizar(() => ({ real }));
    setTextoReal("");
    toast.success("Traducción real importada");
  };

  const subirReal = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    setTextoReal(await archivo.text());
    evento.target.value = "";
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(exportacion);
      toast.success("Exportación copiada al portapapeles");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  // Lo que se ve encima del video
  const filaEnVideo = filas[activa];
  const letraEnVideo =
    filaEnVideo && paso !== "frases" ? (
      <div className="flex max-w-full flex-col items-center gap-[0.5cqw] rounded-lg bg-black/65 px-[2cqw] py-[0.5cqw] text-center">
        <TextoJapones
          ja={filaEnVideo.ja}
          furigana={furigana}
          className="text-[3.6cqw] text-white"
          claseFurigana="text-[0.45em]"
          resaltar={delaFila(filaEnVideo.ja)}
        />
        {paso === "karaoke" && verMia && filaEnVideo.es.trim() && (
          <p className="text-[2cqw] text-zinc-100">{filaEnVideo.es}</p>
        )}
        {paso === "karaoke" && verReal && actual.real[filaEnVideo.ja] && (
          <p className="text-[2cqw] text-violet-200">
            {actual.real[filaEnVideo.ja]}
          </p>
        )}
      </div>
    ) : null;

  const interruptorFurigana = (
    <Interruptor
      label="Furigana"
      activo={furigana}
      onToggle={() => setFurigana((activo) => !activo)}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Datos de la cancion */}
      <div className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
          Título
          <input
            className={estiloCampo}
            value={actual.titulo}
            onChange={(e) => actualizar(() => ({ titulo: e.target.value }))}
            maxLength={160}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
          Artista o fuente
          <input
            className={estiloCampo}
            value={actual.fuente}
            onChange={(e) => actualizar(() => ({ fuente: e.target.value }))}
          />
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <label className={`${estiloBotonChico} cursor-pointer`}>
            {urlVideo ? "Cambiar video" : "Cargar video o audio del PC"}
            <input
              type="file"
              accept="video/*,audio/*"
              onChange={elegirVideo}
              className="hidden"
            />
          </label>
          <span className="text-xs text-zinc-500">
            {urlVideo
              ? `Reproduciendo ${actual.video}. No se sube a ningún lado.`
              : actual.video
                ? `Último archivo usado: ${actual.video}. Vuelve a cargarlo (el video no se guarda).`
                : "Se usa solo en este navegador mientras la página esté abierta."}
          </span>
        </div>
      </div>

      {/* Pasos */}
      <div
        role="tablist"
        aria-label="Pasos del karaoke"
        className="flex flex-wrap items-center gap-2 border-b border-zinc-800"
      >
        {PASOS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={paso === p.id}
            onClick={() => setPaso(p.id)}
            className={`-mb-px border-b-2 px-3 py-2 font-mono text-sm tracking-widest uppercase transition ${
              paso === p.id
                ? "border-fuchsia-400 text-fuchsia-200"
                : "border-transparent text-zinc-500 hover:text-violet-300"
            }`}
          >
            {p.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-zinc-500">
          {traducidas}/{filas.length} traducidas ·{" "}
          {tiempos.filter((t) => t !== null).length}/{filas.length} con tiempo
        </span>
      </div>

      {/* Un solo reproductor para todos los pasos: asi no se reinicia al
          cambiar de pestaña. En tiempos y frases queda pegado arriba. */}
      {urlVideo && (
        <div
          className={
            !CON_VIDEO.includes(paso)
              ? "hidden"
              : paso === "karaoke"
                ? ""
                : "sticky top-0 z-10 bg-zinc-950 py-2"
          }
        >
          <Reproductor
            url={urlVideo}
            videoRef={videoRef}
            letra={letraEnVideo}
            compacto={paso !== "karaoke"}
          />
        </div>
      )}

      {/* ─── Canciones guardadas ─── */}
      {paso === "canciones" && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={estiloBotonPrincipal} onClick={crear}>
              + Nueva canción
            </button>
            <label className={`${estiloBotonChico} flex cursor-pointer items-center`}>
              Importar .json
              <input
                type="file"
                accept=".json,application/json"
                onChange={importarCancion}
                className="hidden"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {canciones.map((cancion) => {
              const filasC = armarFilas(cancion.texto, cancion.traducciones);
              const hechas = filasC.filter((fila) => fila.es.trim()).length;
              const conTiempo = cancion.tiempos.filter(
                (t) => t.t !== null,
              ).length;
              const frasesC = new Set(filasC.map((fila) => fila.ja));
              const comodinesC = comodines.filter((c) =>
                frasesC.has(c.frase),
              ).length;
              const abierta = cancion.id === idActual;
              return (
                <div
                  key={cancion.id}
                  className={`flex flex-col gap-2 rounded-xl border bg-zinc-900 p-4 transition hover:border-fuchsia-500 ${
                    abierta ? "border-fuchsia-500/60" : "border-zinc-800"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => abrir(cancion.id)}
                    className="flex flex-col gap-2 text-left"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-zinc-100">
                        {cancion.titulo || "Sin título"}
                      </span>
                      <span className="font-mono text-xs text-zinc-500">
                        {hechas}/{filasC.length}
                      </span>
                    </span>
                    {cancion.fuente && (
                      <span className="text-sm text-zinc-400">{cancion.fuente}</span>
                    )}
                    <span className="line-clamp-1 font-mono text-sm text-zinc-400">
                      {quitarFurigana(filasC[0]?.ja ?? "(sin letra)")}
                    </span>
                    <span className="font-mono text-xs text-violet-300">
                      {conTiempo}/{filasC.length} con tiempo
                      {comodinesC > 0 && ` · ${comodinesC} en el comodín`}
                    </span>
                    {abierta && (
                      <span className="font-mono text-[10px] tracking-widest text-fuchsia-300 uppercase">
                        abierta en el editor
                      </span>
                    )}
                  </button>
                  <div className="flex gap-2 self-end">
                    <button
                      type="button"
                      className={estiloBotonChico}
                      onClick={() => exportarCancion(cancion)}
                    >
                      Exportar .json
                    </button>
                    <button
                      type="button"
                      className={`${estiloBotonChico} hover:border-red-500`}
                      onClick={() => borrar(cancion)}
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Paso 1: letra ─── */}
      {paso === "letra" && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <label className={`${estiloBotonChico} cursor-pointer`}>
              Subir .txt / .md
              <input
                type="file"
                accept=".txt,.md,text/plain"
                onChange={subirLetra}
                className="hidden"
              />
            </label>
            <button
              type="button"
              className={estiloBotonChico}
              onClick={() => cambiarTexto(cortarEnPuntos(actual.texto))}
            >
              Cortar en 。！？
            </button>
            <button
              type="button"
              className={estiloBotonChico}
              onClick={() => cambiarTexto(actual.texto.replace(/　+/g, "\n"))}
            >
              Cortar en espacios japoneses (　)
            </button>
          </div>

          <p className="text-sm text-zinc-400">
            Cada línea es una frase del karaoke. Furigana:{" "}
            <code className="text-violet-300">[漢字|かんじ]</code>. Las líneas
            vacías se ignoran. Si editas la letra, los tiempos ya marcados
            siguen a su frase.
          </p>

          <textarea
            className={`${estiloCampo} font-mono leading-relaxed`}
            rows={18}
            value={actual.texto}
            onChange={(e) => cambiarTexto(e.target.value)}
            placeholder="Pega o sube la letra en japonés…"
          />

          <button
            type="button"
            className={`${estiloBotonPrincipal} self-end`}
            onClick={() => setPaso("tiempos")}
            disabled={filas.length === 0}
          >
            Ir a los tiempos →
          </button>
        </section>
      )}

      {/* ─── Paso 2: tiempos ─── */}
      {paso === "tiempos" && (
        <PasoTiempos
          key={idActual}
          filas={filas}
          tiempos={tiempos}
          activa={activa}
          videoRef={videoRef}
          hayVideo={urlVideo !== ""}
          onCambiar={cambiarTiempo}
          onMoverTodos={moverTodos}
        />
      )}

      {/* ─── Paso 3: frase por frase ─── */}
      {paso === "frases" && (
        <section className="flex flex-col gap-4">
          {/* Comodin: palabras que te costaron, cada una con su frase */}
          <ComodinesDelTexto comodines={comodinesDelTexto} />

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
              {interruptorFurigana}
            </div>
          </div>

          {filas.length === 0 && (
            <p className="py-6 text-center text-sm text-zinc-400">
              No hay frases. Escribe o sube la letra en el paso 1.
            </p>
          )}

          <ol className="flex flex-col gap-3">
            {filas.map((fila, indice) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: dos filas pueden tener el mismo texto
                key={indice}
                className={`flex gap-3 rounded-lg border bg-zinc-900/60 p-4 ${
                  indice === activa && urlVideo
                    ? "border-violet-400"
                    : fila.es.trim()
                      ? "border-zinc-700"
                      : "border-fuchsia-500/40"
                }`}
              >
                <div className="flex flex-col items-center gap-2 pt-3">
                  <span className="font-mono text-xs text-zinc-500">
                    {String(indice + 1).padStart(2, "0")}
                  </span>
                  {tiempos[indice] !== null && (
                    <button
                      type="button"
                      className={estiloBotonChico}
                      disabled={!urlVideo}
                      onClick={() => escucharFila(indice)}
                      aria-label={`Escuchar la fila ${indice + 1}`}
                      title={
                        urlVideo
                          ? "Escuchar esta frase"
                          : "Carga el video primero"
                      }
                    >
                      ▶
                    </button>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <TextoJapones
                    ja={fila.ja}
                    furigana={furigana}
                    resaltar={delaFila(fila.ja)}
                  />
                  <textarea
                    className={`${estiloCampo} text-sm`}
                    rows={2}
                    value={fila.es}
                    onChange={(e) => traducir(fila.ja, e.target.value)}
                    placeholder="Lo que significa esta frase…"
                  />
                  <ComodinesFila
                    frase={fila.ja}
                    comodines={comodinesDelTexto.filter(
                      (c) => c.frase === fila.ja,
                    )}
                    onAgregar={(palabra, significado) =>
                      agregar({
                        palabra,
                        significado,
                        frase: fila.ja,
                        origen: "karaoke",
                        titulo: actual.titulo.trim() || "Sin título",
                      })
                    }
                    onQuitar={quitar}
                  />
                </div>
              </li>
            ))}
          </ol>

          {filas.length > 0 && (
            <button
              type="button"
              className={`${estiloBotonPrincipal} self-end`}
              onClick={() => setPaso("karaoke")}
            >
              Al karaoke →
            </button>
          )}
        </section>
      )}

      {/* ─── Paso 4: karaoke ─── */}
      {paso === "karaoke" && (
        <section className="flex flex-col gap-4">
          {!urlVideo && (
            <p className="py-6 text-center text-sm text-zinc-400">
              Carga el video o audio de la canción arriba.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 rounded-md border border-dashed border-zinc-700 px-3 py-2">
            {interruptorFurigana}
            <Interruptor
              label="Mi traducción"
              activo={verMia}
              onToggle={() => setVerMia((activo) => !activo)}
            />
            <Interruptor
              label="Traducción real"
              activo={verReal}
              onToggle={() => setVerReal((activo) => !activo)}
            />
          </div>

          {comodinesDelTexto.length > 0 && (
            <p className="font-mono text-sm text-violet-300">
              Comodín: {comodinesDelTexto.map((c) => c.palabra).join("、")}
            </p>
          )}

          {/* Toda la letra; clic en una frase para saltar a ella */}
          <ol
            ref={listaKaraokeRef}
            className="relative flex max-h-[45vh] flex-col gap-1 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-2"
          >
            {filas.map((fila, indice) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: dos filas pueden tener el mismo texto
                key={indice}
              >
                <button
                  type="button"
                  disabled={tiempos[indice] === null || !urlVideo}
                  onClick={() => irA(tiempos[indice])}
                  className={`flex w-full gap-3 rounded-lg px-3 py-1 text-left transition ${
                    indice === activa
                      ? "bg-violet-500/15 text-white"
                      : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300"
                  }`}
                >
                  <span className="w-12 shrink-0 pt-3 font-mono text-xs">
                    {tiempos[indice] === null
                      ? "—"
                      : formatearTiempo(tiempos[indice] ?? 0)}
                  </span>
                  <span className="flex flex-col">
                    <TextoJapones
                      ja={fila.ja}
                      furigana={furigana}
                      className="text-xl"
                      claseFurigana="text-[0.55em]"
                      resaltar={delaFila(fila.ja)}
                    />
                    {verMia && fila.es.trim() && (
                      <span className="text-sm">{fila.es}</span>
                    )}
                    {verReal && actual.real[fila.ja] && (
                      <span className="text-sm text-violet-300/80">
                        {actual.real[fila.ja]}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ─── Paso 5: exportar ─── */}
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
                onClick={() =>
                  descargarArchivo(
                    exportacion,
                    `${actual.titulo || "karaoke"}.txt`,
                    "text/plain;charset=utf-8",
                  )
                }
              >
                Descargar .txt
              </button>
            </div>
          </div>

          {traducidas < filas.length && (
            <p className="text-sm text-fuchsia-300">
              Faltan {filas.length - traducidas} frases por traducir: saldrán
              como &quot;(sin traducir)&quot;.
            </p>
          )}

          <pre className="max-h-[70vh] overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
            {exportacion}
          </pre>
        </section>
      )}

      {/* ─── Paso 6: traduccion real, importada y al lado de la tuya ─── */}
      {paso === "real" && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-lg border border-violet-500/40 bg-zinc-900/60 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs tracking-widest text-violet-300 uppercase">
                Importar traducción
              </span>
              <label className={`${estiloBotonChico} ml-auto cursor-pointer`}>
                Subir .txt
                <input
                  type="file"
                  accept=".txt,.md,text/plain"
                  onChange={subirReal}
                  className="hidden"
                />
              </label>
              {hayReal && (
                <button
                  type="button"
                  className={`${estiloBotonChico} hover:border-red-500`}
                  onClick={() => {
                    if (confirm("¿Borrar la traducción real de esta canción?")) {
                      actualizar(() => ({ real: {} }));
                    }
                  }}
                >
                  Borrar la importada
                </button>
              )}
            </div>
            <textarea
              className={`${estiloCampo} text-sm`}
              rows={6}
              value={textoReal}
              onChange={(e) => setTextoReal(e.target.value)}
              placeholder="Pega la traducción: una línea por frase, en el mismo orden que la letra. Las líneas vacías se ignoran."
            />
            {lineasReal.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`text-sm ${
                    lineasReal.length === filas.length
                      ? "text-violet-300"
                      : "text-fuchsia-300"
                  }`}
                >
                  {lineasReal.length} líneas para {filas.length} frases
                  {lineasReal.length !== filas.length &&
                    ": no cuadran, revisa que cada línea sea una frase"}
                </span>
                <button
                  type="button"
                  className={`${estiloBotonPrincipal} ml-auto`}
                  onClick={importarReal}
                >
                  Importar
                </button>
              </div>
            )}
          </div>

          {hayReal && (
            <>
              <div className="self-end rounded-md border border-dashed border-zinc-700 px-3 py-2">
                {interruptorFurigana}
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
                      <TextoJapones
                        ja={fila.ja}
                        furigana={furigana}
                        resaltar={delaFila(fila.ja)}
                      />
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
                            {actual.real[fila.ja] ??
                              "— (frase sin traducción importada)"}
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
