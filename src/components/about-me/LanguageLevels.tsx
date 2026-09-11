import SegmentedBar from "@/components/ui/SegmentedBar";

//key para cada idioma. Sirve para tipar el record.
type LangKey = "es" | "en" | "jp";

interface LangData {
  name: string;
  label: string;
  filled: number; // segmentos CEFR completos (A1, A2, B1, B2, C1, C2 -> 6). NATIVO se refleja solo en el label.
  partial: boolean; //si el sgte segmento esta a medias (en proceso).
  flag: React.ReactNode;
}

//banderas inline como SVG para no depender de assets externos.
const SpainFlag = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 3 2"
    className="h-full w-full"
  >
    <rect width="3" height="2" fill="#c60b1e" />
    <rect width="3" height="1" y=".5" fill="#ffc400" />
  </svg>
);

const EnglandFlag = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 60 36"
    className="h-full w-full"
  >
    <rect width="60" height="36" fill="#fff" />
    <rect x="25" width="10" height="36" fill="#CE1124" />
    <rect y="13" width="60" height="10" fill="#CE1124" />
  </svg>
);

const JapanFlag = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 900 600"
    className="h-full w-full"
  >
    <rect width="900" height="600" fill="#fff" />
    <circle cx="450" cy="300" r="180" fill="#BC002D" />
  </svg>
);

// Escala CEFR: A1 · A2 · B1 · B2 · C1 · C2. NATIVO va en el label, no en la barra.
// Mapeo JLPT -> CEFR aprox: N5≈A1, N4≈A2, N3≈B1, N2≈B2, N1≈C1
const CEFR_LABELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const CEFR_MAX = CEFR_LABELS.length;

//record con los datos de cada idioma. Aca se edita a mano cuando cambia el nivel.
const LANGUAGES: Record<LangKey, LangData> = {
  es: {
    name: "Español",
    label: "NATIVO",
    filled: 6,
    partial: false,
    flag: <SpainFlag />,
  },
  en: {
    name: "English",
    label: "B2/C1",
    filled: 4, // hasta B2 solido
    partial: true, // C1 en proceso
    flag: <EnglandFlag />,
  },
  jp: {
    name: "日本語",
    label: "N4",
    filled: 2, // N4 ≈ A2 solido
    partial: true, // N3 ≈ B1 en proceso
    flag: <JapanFlag />,
  },
};

//pasa el record a array de tuplas [key, data] para poder mapear con orden garantizado.
const entries = Object.entries(LANGUAGES) as [LangKey, LangData][];

export default function LanguageLevels() {
  return (
    <div className="rounded-xl border border-fuchsia-500/50 bg-zinc-950/60 p-5">
      {/* header: titulo + leyenda de la escala CEFR */}
      <div className="mb-4 flex items-baseline justify-between font-mono text-xs">
        <span className="uppercase tracking-[0.3em] text-fuchsia-400">
          &gt; idiomas
        </span>
        <span className="text-[10px] text-zinc-500">
          A1 · A2 · B1 · B2 · C1 · C2
        </span>
      </div>
      <ul className="flex flex-col gap-4">
        {entries.map(([key, lang]) => (
          //fila por idioma: bandera, nombre, barra y label a la derecha
          <li key={key} className="flex items-center gap-4">
            {/* bandera decorativa, sin interaccion. Rectangular para respetar la proporcion original de las banderas y alinearse con los cuadrados de la barra CEFR. */}
            <div className="h-6 w-9 shrink-0 overflow-hidden rounded-sm border border-zinc-700">
              {lang.flag}
            </div>
            <span className="w-24 font-mono text-sm text-zinc-300">
              {lang.name}
            </span>
            {/* barra de nivel con tooltip por segmento */}
            <div className="flex-1">
              <SegmentedBar
                filled={lang.filled}
                partial={lang.partial}
                max={CEFR_MAX}
                labels={CEFR_LABELS}
              />
            </div>
            {/* label a la derecha: aca aparece NATIVO / B2/C1 / N4 */}
            <span className="w-16 text-right font-mono text-xs font-bold uppercase tracking-wider text-fuchsia-400 drop-shadow-[0_0_6px_rgba(217,70,239,0.6)]">
              {lang.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
