"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Interruptor from "@/components/ui/Interruptor";
import { barajar } from "@/lib/barajar";

type NivelVerbo = "n5" | "n4" | "n3";

type Verbo = {
  verbo: string;
  kana: string;
  romaji: string;
  significado: string;
  nivel: NivelVerbo;
};

// config: elegir niveles y cantidad -> repaso: memorizar con todo a la
// vista -> test: escribir el romaji de cada verbo y corregir.
type Fase = "config" | "repaso" | "test";

const NIVELES: NivelVerbo[] = ["n5", "n4", "n3"];
const MINIMO = 10;
const ATAJOS_CANTIDAD = [10, 20, 30];
const CLAVE_ERRORES = "verbtrainer-errores";
// Parte del test que se reserva para verbos de Mis errores
const CUOTA_ERRORES = 0.3;

const COLOR_NIVEL: Record<NivelVerbo, string> = {
  n5: "border-emerald-400/50 text-emerald-300",
  n4: "border-sky-400/50 text-sky-300",
  n3: "border-amber-400/50 text-amber-300",
};

// Normaliza el romaji para comparar sin castigar variantes validas:
// mayusculas, espacios, macrones (ō -> ou), Kunrei (si, tu, hu...) y la
// m antes de b/p (gambaru = ganbaru). Se aplica a la respuesta y al
// romaji guardado, asi las dos quedan en la misma forma.
function normalizarRomaji(texto: string): string {
  return texto
    .normalize("NFKC")
    .toLowerCase()
    .replace(/ā/g, "aa")
    .replace(/ī/g, "ii")
    .replace(/ū/g, "uu")
    .replace(/ē/g, "ee")
    .replace(/ō/g, "ou")
    .replace(/[^a-z]/g, "")
    .replace(/sy/g, "sh")
    .replace(/[tc]y/g, "ch")
    .replace(/[zj]y/g, "j")
    .replace(/si/g, "shi")
    .replace(/ti/g, "chi")
    .replace(/tu/g, "tsu")
    .replace(/(?<![sc])hu/g, "fu")
    .replace(/[zd]i/g, "ji")
    .replace(/du/g, "zu")
    .replace(/m(?=[bp])/g, "n");
}

const esCorrecta = (verbo: Verbo, respuesta: string) =>
  normalizarRomaji(respuesta) !== "" &&
  normalizarRomaji(respuesta) === normalizarRomaji(verbo.romaji);

// "Ponerse (ropa)" -> "ponerse": sin tildes, sin lo que va entre
// parentesis y sin signos.
function normalizarSignificado(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-zñ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// El significado es texto libre: se acepta si coincide con alguna de las
// opciones separadas por coma, si la contiene ("levantarse temprano" ->
// "levantarse") o si es parte de ella con al menos 4 letras ("levantar"
// dentro de "levantarse"). Lo dudoso se puede aceptar a mano al corregir.
function significadoCorrecto(verbo: Verbo, respuesta: string): boolean {
  const dada = normalizarSignificado(respuesta);
  if (!dada) return false;
  return verbo.significado
    .split(",")
    .map(normalizarSignificado)
    .filter(Boolean)
    .some(
      (opcion) =>
        dada === opcion ||
        dada.includes(opcion) ||
        (dada.length >= 4 && opcion.includes(dada)),
    );
}

type TipoTest = "romaji" | "full";

const TIPOS: { id: TipoTest; label: string }[] = [
  { id: "romaji", label: "Romaji" },
  { id: "full", label: "Full test (romaji + significado)" },
];

// ─── Estilos compartidos (mismos que KanjiTrainer) ───
const botonBase =
  "rounded-md border px-4 py-2 font-mono text-xs tracking-widest uppercase transition disabled:cursor-not-allowed disabled:opacity-40";
const botonSecundario = `${botonBase} border-violet-300/50 bg-zinc-900/80 text-violet-200 hover:border-violet-300 hover:shadow-[0_0_10px_rgba(196,181,253,0.4)]`;
const botonPrincipal = `${botonBase} border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-100 hover:shadow-[0_0_12px_rgba(217,70,239,0.7)]`;

const chipFiltro = (activo: boolean) =>
  `rounded-full border px-3 py-1 font-mono text-xs transition ${
    activo
      ? "border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-100 shadow-[0_0_10px_rgba(217,70,239,0.6)]"
      : "border-violet-300/40 bg-zinc-900 text-violet-300 hover:border-violet-300"
  }`;

// Tres columnas: verbo | romaji | significado. En movil se apilan.
const filaGrid =
  "grid grid-cols-1 items-center gap-2 rounded-md border bg-zinc-900/60 p-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-4";

function BadgeNivel({ nivel }: { nivel: NivelVerbo }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono text-[10px] tracking-widest uppercase ${COLOR_NIVEL[nivel]}`}
    >
      {nivel}
    </span>
  );
}

// Columna 1: nivel + verbo con kanji (kana encima solo en el repaso).
function CeldaVerbo({ verbo, kana }: { verbo: Verbo; kana: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <BadgeNivel nivel={verbo.nivel} />
      <span className="flex flex-col">
        <span
          className={`font-mono text-xs text-fuchsia-300 ${kana ? "" : "hidden"}`}
        >
          {verbo.kana}
        </span>
        <span className="font-mono text-2xl text-zinc-50">{verbo.verbo}</span>
      </span>
    </div>
  );
}

export default function VerbTrainer() {
  const [verbos, setVerbos] = useState<Verbo[] | null>(null);
  const [error, setError] = useState(false);

  const [fase, setFase] = useState<Fase>("config");
  const [niveles, setNiveles] = useState<NivelVerbo[]>(NIVELES);
  const [cantidad, setCantidad] = useState(MINIMO);
  const [tipo, setTipo] = useState<TipoTest>("romaji");
  const [mezclarErrores, setMezclarErrores] = useState(true);
  const [seleccion, setSeleccion] = useState<Verbo[]>([]);

  // Repaso
  const [kana, setKana] = useState(true);
  const [modoMemoria, setModoMemoria] = useState(false);
  const [reveladas, setReveladas] = useState<string[]>([]);

  // Test
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [significados, setSignificados] = useState<Record<string, string>>({});
  // Significados marcados como correctos a mano tras corregir
  const [aceptados, setAceptados] = useState<string[]>([]);
  const [corregido, setCorregido] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Mis errores: verbo -> veces que se fallo. Vive en localStorage para
  // que sobreviva entre sesiones; se lee al montar (no en el render, para
  // no romper la hidratacion).
  const [errores, setErrores] = useState<Record<string, number>>({});
  const [erroresCargados, setErroresCargados] = useState(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_ERRORES);
      if (guardado) setErrores(JSON.parse(guardado));
    } catch {}
    setErroresCargados(true);
  }, []);

  useEffect(() => {
    if (!erroresCargados) return;
    try {
      localStorage.setItem(CLAVE_ERRORES, JSON.stringify(errores));
    } catch {}
  }, [erroresCargados, errores]);

  // Chunk aparte, igual que el vocabulario del KanjiTrainer.
  useEffect(() => {
    let vivo = true;
    import("../../data/verbos.json")
      .then((modulo) => vivo && setVerbos(modulo.default.verbos as Verbo[]))
      .catch(() => vivo && setError(true));
    return () => {
      vivo = false;
    };
  }, []);

  const conteos = useMemo(() => {
    const base: Record<NivelVerbo, number> = { n5: 0, n4: 0, n3: 0 };
    for (const verbo of verbos ?? []) base[verbo.nivel]++;
    return base;
  }, [verbos]);

  if (error) {
    return (
      <p className="p-4 font-mono text-sm text-zinc-400">
        No se pudieron cargar los verbos.
      </p>
    );
  }
  if (!verbos) {
    return (
      <p className="animate-pulse p-4 font-mono text-sm tracking-widest text-fuchsia-300 uppercase">
        cargando verbos
      </p>
    );
  }

  // Los mas fallados primero
  const listaErrores = verbos
    .filter((verbo) => errores[verbo.verbo])
    .sort((a, b) => errores[b.verbo] - errores[a.verbo]);

  const quitarError = (clave: string) =>
    setErrores((actuales) => {
      const { [clave]: _quitado, ...resto } = actuales;
      return resto;
    });

  const erroresEnNiveles = verbos.filter(
    (verbo) => niveles.includes(verbo.nivel) && errores[verbo.verbo],
  ).length;

  const disponibles = niveles.reduce((total, nivel) => total + conteos[nivel], 0);
  const cantidadValida = Math.min(Math.max(cantidad, MINIMO), disponibles);

  const alternarNivel = (nivel: NivelVerbo) =>
    setNiveles((actuales) =>
      actuales.includes(nivel)
        ? actuales.filter((otro) => otro !== nivel)
        : [...actuales, nivel],
    );

  const irARepaso = (lista: Verbo[]) => {
    setSeleccion(lista);
    setReveladas([]);
    setFase("repaso");
  };

  // Con "Mezclar mis errores", hasta un 30% del test sale de Mis errores
  // (de los niveles elegidos) y el resto al azar del pool. Todo se baraja
  // al final, asi no se distingue cuales vienen de la lista.
  const armarEntrenamiento = () => {
    const pool = verbos.filter((verbo) => niveles.includes(verbo.nivel));
    const deErrores = mezclarErrores
      ? barajar(pool.filter((verbo) => errores[verbo.verbo])).slice(
          0,
          Math.ceil(cantidadValida * CUOTA_ERRORES),
        )
      : [];
    const resto = barajar(
      pool.filter((verbo) => !deErrores.includes(verbo)),
    ).slice(0, cantidadValida - deErrores.length);
    irARepaso(barajar([...deErrores, ...resto]));
  };

  const empezarTest = (lista: Verbo[]) => {
    // Otro orden que el del repaso, para no responder de memoria por posicion.
    setSeleccion(barajar(lista));
    setRespuestas({});
    setSignificados({});
    setAceptados([]);
    setCorregido(false);
    setFase("test");
  };

  // Enter pasa al siguiente campo; en el ultimo, corrige. En el full test
  // cada fila tiene dos campos: romaji (indice par) y significado (impar).
  const alPresionar = (evento: KeyboardEvent<HTMLInputElement>, indice: number) => {
    if (evento.key !== "Enter") return;
    evento.preventDefault();
    const siguiente = inputs.current[indice + 1];
    if (siguiente) siguiente.focus();
    else corregir();
  };

  const esFull = tipo === "full";
  const romajiOk = (verbo: Verbo) =>
    esCorrecta(verbo, respuestas[verbo.verbo] ?? "");
  const significadoOk = (verbo: Verbo) =>
    aceptados.includes(verbo.verbo) ||
    significadoCorrecto(verbo, significados[verbo.verbo] ?? "");
  const filaOk = (verbo: Verbo) =>
    romajiOk(verbo) && (!esFull || significadoOk(verbo));

  const aciertos = seleccion.filter(filaOk).length;
  const aciertosRomaji = seleccion.filter(romajiOk).length;
  const aciertosSignificado = seleccion.filter(significadoOk).length;
  const fallados = seleccion.filter((verbo) => !filaOk(verbo));
  const porcentaje = (valor: number) =>
    Math.round((valor / seleccion.length) * 100);

  // Al corregir, cada fallado suma un fallo en Mis errores. Los acertados
  // no salen solos: de la lista se sacan a mano.
  const corregir = () => {
    if (corregido) return;
    setCorregido(true);
    setErrores((actuales) => {
      const nuevos = { ...actuales };
      for (const verbo of seleccion) {
        if (!filaOk(verbo)) nuevos[verbo.verbo] = (nuevos[verbo.verbo] ?? 0) + 1;
      }
      return nuevos;
    });
  };

  // "Dar por buena" despues de corregir: si con eso la fila queda bien
  // (el romaji tambien estaba bien), se descuenta el fallo que este test
  // acababa de sumar. Si era su primer fallo, sale de la lista.
  const darPorBuena = (verbo: Verbo) => {
    setAceptados([...aceptados, verbo.verbo]);
    if (!romajiOk(verbo)) return;
    setErrores((actuales) => {
      const fallos = (actuales[verbo.verbo] ?? 0) - 1;
      if (fallos > 0) return { ...actuales, [verbo.verbo]: fallos };
      const { [verbo.verbo]: _quitado, ...resto } = actuales;
      return resto;
    });
  };

  // Exporta Mis errores a un .json con todo el detalle de cada verbo, para
  // guardarlo fuera del navegador y poder importarlo despues.
  const exportarErrores = () => {
    const contenido = {
      exportado: new Date().toISOString(),
      errores: listaErrores.map((verbo) => ({
        ...verbo,
        fallos: errores[verbo.verbo],
      })),
    };
    const blob = new Blob([JSON.stringify(contenido, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `verbtrainer-errores-${new Date().toISOString().slice(0, 10)}.json`;
    enlace.click();
    URL.revokeObjectURL(url);
  };

  // Importa un .json exportado antes. Se combina con la lista actual
  // quedandose con el mayor numero de fallos de cada verbo: importar el
  // mismo archivo dos veces no duplica nada.
  const importarErrores = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;
    try {
      const datos = JSON.parse(await archivo.text());
      const lista: { verbo: string; fallos: number }[] = datos.errores ?? [];
      const conocidos = new Set(verbos.map((verbo) => verbo.verbo));
      setErrores((actuales) => {
        const nuevos = { ...actuales };
        for (const { verbo, fallos } of lista) {
          if (!conocidos.has(verbo) || !(fallos > 0)) continue;
          nuevos[verbo] = Math.max(nuevos[verbo] ?? 0, fallos);
        }
        return nuevos;
      });
    } catch {
      alert("Ese archivo no es una exportación válida de Mis errores.");
    }
  };

  // ─── Fase 1: configurar el test ───
  if (fase === "config") {
    return (
      <section className="flex flex-col gap-6 p-4">
        <p className="text-sm text-zinc-400">
          Arma un test personalizado de {MINIMO} verbos o más. Primero tendrás
          un entrenamiento para memorizar y repasar; después, el test: escribir
          el romaji de cada verbo.
        </p>

        <div className="flex flex-col gap-4 rounded-md border border-fuchsia-400/50 bg-zinc-900/60 p-5 shadow-[0_0_14px_rgba(217,70,239,0.2)]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-20 font-mono text-xs tracking-widest text-zinc-500 uppercase">
              Niveles
            </span>
            {NIVELES.map((nivel) => (
              <button
                key={nivel}
                type="button"
                aria-pressed={niveles.includes(nivel)}
                onClick={() => alternarNivel(nivel)}
                className={chipFiltro(niveles.includes(nivel))}
              >
                {nivel.toUpperCase()}
                <span className="ml-1.5 text-zinc-500">{conteos[nivel]}</span>
              </button>
            ))}
            <span className="font-mono text-[10px] text-zinc-500">
              clic para activar o quitar cada nivel
            </span>
          </div>
          {niveles.length === 0 && (
            <p className="font-mono text-xs text-fuchsia-300">
              Elige al menos un nivel.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <span className="w-20 font-mono text-xs tracking-widest text-zinc-500 uppercase">
              Cantidad
            </span>
            <input
              type="number"
              min={MINIMO}
              max={disponibles}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="w-24 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-mono text-sm text-zinc-100 outline-none focus:border-fuchsia-500"
            />
            {ATAJOS_CANTIDAD.map((atajo) => (
              <button
                key={atajo}
                type="button"
                disabled={atajo > disponibles}
                onClick={() => setCantidad(atajo)}
                className={chipFiltro(cantidad === atajo)}
              >
                {atajo}
              </button>
            ))}
            <button
              type="button"
              disabled={disponibles === 0}
              onClick={() => setCantidad(disponibles)}
              className={chipFiltro(cantidad === disponibles && disponibles > 0)}
            >
              Todos ({disponibles})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="w-20 font-mono text-xs tracking-widest text-zinc-500 uppercase">
              Test
            </span>
            {TIPOS.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                aria-pressed={tipo === opcion.id}
                onClick={() => setTipo(opcion.id)}
                className={chipFiltro(tipo === opcion.id)}
              >
                {opcion.label}
              </button>
            ))}
          </div>

          {/* Solo cuentan los errores de los niveles elegidos */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-20 font-mono text-xs tracking-widest text-zinc-500 uppercase">
              Errores
            </span>
            <Interruptor
              label="Mezclar mis errores"
              activo={mezclarErrores}
              onToggle={() => setMezclarErrores((activo) => !activo)}
            />
            <span className="font-mono text-[10px] text-zinc-500">
              {erroresEnNiveles === 0
                ? "no hay errores guardados en estos niveles"
                : `hasta ${Math.min(erroresEnNiveles, Math.ceil(cantidadValida * CUOTA_ERRORES))} de ${erroresEnNiveles} saldrán en el test`}
            </span>
          </div>

          {cantidad < MINIMO && (
            <p className="font-mono text-xs text-fuchsia-300">
              El mínimo es {MINIMO}: se usarán {MINIMO}.
            </p>
          )}

          <button
            type="button"
            disabled={disponibles < MINIMO}
            onClick={armarEntrenamiento}
            className={`${botonPrincipal} self-end`}
          >
            Armar entrenamiento ({cantidadValida}) →
          </button>
        </div>

        {/* Mis errores: verbos fallados en tests anteriores */}
        <div className="flex flex-col gap-4 rounded-md border border-rose-400/40 bg-zinc-900/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs tracking-widest text-rose-300 uppercase">
              Mis errores · {listaErrores.length}
            </span>
            <span className="text-xs text-zinc-500">
              Cada verbo que fallas se guarda aquí hasta que lo quites con ✕.
            </span>
          </div>

          {/* Importar siempre visible: sirve tambien con la lista vacia,
              por ejemplo en otro navegador o tras borrar los datos. */}
          <label className={`${botonSecundario} cursor-pointer self-start`}>
            Importar .json
            <input
              type="file"
              accept=".json,application/json"
              onChange={importarErrores}
              className="hidden"
            />
          </label>

          {listaErrores.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Todavía no tienes errores guardados.
            </p>
          ) : (
            <>
              <ul className="flex flex-wrap gap-2">
                {listaErrores.map((verbo) => (
                  <li
                    key={verbo.verbo}
                    className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800/60 px-2.5 py-1"
                  >
                    <span className="font-mono text-lg text-zinc-100">
                      {verbo.verbo}
                    </span>
                    <span
                      title="Veces que lo fallaste"
                      className="font-mono text-xs text-rose-300"
                    >
                      ×{errores[verbo.verbo]}
                    </span>
                    <button
                      type="button"
                      aria-label={`Quitar ${verbo.verbo} de mis errores`}
                      onClick={() => quitarError(verbo.verbo)}
                      className="font-mono text-xs text-zinc-500 hover:text-rose-300"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={exportarErrores}
                  className={botonSecundario}
                >
                  Exportar .json
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("¿Vaciar la lista de errores?")) setErrores({});
                  }}
                  className={botonSecundario}
                >
                  Vaciar lista
                </button>
                <button
                  type="button"
                  onClick={() => irARepaso(barajar(listaErrores))}
                  className={botonPrincipal}
                >
                  Entrenar mis errores ({listaErrores.length}) →
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  // ─── Fase 2: entrenamiento previo (memorizar y repasar) ───
  if (fase === "repaso") {
    return (
      <section className="flex flex-col gap-5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs tracking-widest text-fuchsia-300 uppercase">
              Entrenamiento previo · {seleccion.length} verbos ·{" "}
              {esFull ? "full test" : "test de romaji"}
            </span>
            <span className="text-sm text-zinc-400">
              Memoriza el romaji de cada verbo. Con el modo memoria, haz clic
              en una celda para revelarla.
            </span>
          </div>
          <div className="ml-auto flex flex-col items-end gap-2 rounded-md border border-dashed border-zinc-700 px-3 py-2">
            <Interruptor
              label="Kana"
              activo={kana}
              onToggle={() => setKana((activo) => !activo)}
            />
            <Interruptor
              label="Modo memoria"
              activo={modoMemoria}
              onToggle={() => {
                setModoMemoria((activo) => !activo);
                setReveladas([]);
              }}
            />
          </div>
        </div>

        <ol className="flex flex-col gap-2">
          {seleccion.map((verbo) => {
            const oculto = modoMemoria && !reveladas.includes(verbo.verbo);
            return (
              <li key={verbo.verbo} className={`${filaGrid} border-zinc-700`}>
                <CeldaVerbo verbo={verbo} kana={kana} />
                <button
                  type="button"
                  disabled={!modoMemoria}
                  onClick={() => setReveladas([...reveladas, verbo.verbo])}
                  className={`rounded-md border px-3 py-1.5 text-left font-mono text-lg transition ${
                    oculto
                      ? "cursor-pointer border-dashed border-violet-300/40 text-transparent select-none hover:border-violet-300"
                      : "border-transparent text-violet-200"
                  }`}
                >
                  {oculto ? "·····" : verbo.romaji}
                </button>
                <span className="text-sm text-zinc-300">
                  <span className="mr-1 text-violet-500/70">›</span>
                  {verbo.significado}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => setFase("config")}
            className={botonSecundario}
          >
            ← Cambiar selección
          </button>
          <button
            type="button"
            onClick={() => irARepaso(barajar(seleccion))}
            className={botonSecundario}
          >
            Barajar
          </button>
          <button
            type="button"
            onClick={() => empezarTest(seleccion)}
            className={botonPrincipal}
          >
            Empezar test →
          </button>
        </div>
      </section>
    );
  }

  // ─── Fase 3: test ───
  // Clases del campo segun el estado: neutro, correcto o incorrecto.
  const estiloCampoTest = (ok: boolean) =>
    `w-full rounded-md border bg-zinc-800 px-3 py-1.5 outline-none transition focus:border-fuchsia-500 ${
      !corregido
        ? "border-zinc-700 text-zinc-100"
        : ok
          ? "border-emerald-400/60 text-emerald-200"
          : "border-rose-400/60 text-rose-200 line-through"
    }`;

  return (
    <section className="flex flex-col gap-5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-xs tracking-widest text-fuchsia-300 uppercase">
          {esFull ? "Full test" : "Test"} · {seleccion.length} verbos
        </span>
        {corregido && (
          <span className="flex flex-wrap gap-2 font-mono text-sm">
            <span className="rounded-md border border-violet-300/50 px-3 py-1 text-violet-100">
              {aciertos} / {seleccion.length} correctas ({porcentaje(aciertos)}%)
            </span>
            {esFull && (
              <span className="rounded-md border border-zinc-700 px-3 py-1 text-zinc-400">
                romaji {aciertosRomaji} · significado {aciertosSignificado}
              </span>
            )}
          </span>
        )}
        {corregido && fallados.length > 0 && (
          <span className="w-full text-right font-mono text-xs text-rose-300">
            {fallados.length} guardados en Mis errores
          </span>
        )}
      </div>

      <ol className="flex flex-col gap-2">
        {seleccion.map((verbo, indice) => {
          const okRomaji = romajiOk(verbo);
          const okSignificado = significadoOk(verbo);
          const borde = !corregido
            ? "border-zinc-700"
            : filaOk(verbo)
              ? "border-emerald-400/60"
              : "border-rose-400/60";
          // Indices para pasar de campo con Enter
          const indiceRomaji = esFull ? indice * 2 : indice;
          return (
            <li key={verbo.verbo} className={`${filaGrid} ${borde}`}>
              <CeldaVerbo verbo={verbo} kana={false} />
              <div className="flex flex-col gap-1">
                <input
                  ref={(elemento) => {
                    inputs.current[indiceRomaji] = elemento;
                  }}
                  value={respuestas[verbo.verbo] ?? ""}
                  disabled={corregido}
                  onChange={(e) =>
                    setRespuestas({ ...respuestas, [verbo.verbo]: e.target.value })
                  }
                  onKeyDown={(e) => alPresionar(e, indiceRomaji)}
                  placeholder="romaji…"
                  autoCapitalize="off"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={`Romaji de ${verbo.verbo}`}
                  className={`${estiloCampoTest(okRomaji)} font-mono text-lg`}
                />
                {corregido && !okRomaji && (
                  <span className="font-mono text-sm text-emerald-300">
                    {verbo.romaji}{" "}
                    <span className="text-xs text-zinc-500">({verbo.kana})</span>
                  </span>
                )}
              </div>
              {esFull ? (
                <div className="flex flex-col gap-1">
                  <input
                    ref={(elemento) => {
                      inputs.current[indiceRomaji + 1] = elemento;
                    }}
                    value={significados[verbo.verbo] ?? ""}
                    disabled={corregido}
                    onChange={(e) =>
                      setSignificados({
                        ...significados,
                        [verbo.verbo]: e.target.value,
                      })
                    }
                    onKeyDown={(e) => alPresionar(e, indiceRomaji + 1)}
                    placeholder="significado…"
                    autoComplete="off"
                    aria-label={`Significado de ${verbo.verbo}`}
                    className={`${estiloCampoTest(okSignificado)} text-sm`}
                  />
                  {corregido && !okSignificado && (
                    <span className="flex flex-wrap items-center gap-2 text-sm text-emerald-300">
                      {verbo.significado}
                      {/* El significado es libre: si tu respuesta era valida
                          pero no calzo con el texto, la das por buena. */}
                      {(significados[verbo.verbo] ?? "").trim() && (
                        <button
                          type="button"
                          onClick={() => darPorBuena(verbo)}
                          className="rounded border border-zinc-600 px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-zinc-400 uppercase hover:border-emerald-400 hover:text-emerald-300"
                        >
                          Dar por buena
                        </button>
                      )}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-zinc-300">
                  <span className="mr-1 text-violet-500/70">›</span>
                  {verbo.significado}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap justify-end gap-3">
        {!corregido ? (
          <>
            <button
              type="button"
              onClick={() => setFase("repaso")}
              className={botonSecundario}
            >
              ← Volver al repaso
            </button>
            <button
              type="button"
              onClick={corregir}
              className={botonPrincipal}
            >
              Corregir
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setFase("config")}
              className={botonSecundario}
            >
              Nuevo test
            </button>
            <button
              type="button"
              onClick={() => empezarTest(seleccion)}
              className={botonSecundario}
            >
              Repetir test
            </button>
            {fallados.length > 0 && (
              <button
                type="button"
                onClick={() => irARepaso(fallados)}
                className={botonPrincipal}
              >
                Repasar fallados ({fallados.length}) →
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
