//track = una cosa que estoy aprendiendo, con exactamente 5 pasos como tupla fija.
type Track = {
  name: string;
  steps: [string, string, string, string, string];
  stepsCompleted: number; // 0-5, cuántos pasos completos hasta ahora
};

//lista de tracks activos. Editar a mano para agregar/actualizar progreso.
const TRACKS: Track[] = [
  {
    name: "Django REST Framework",
    steps: [
      "Setup y models",
      "Serializers y ViewSets",
      "Auth (JWT / Session)",
      "Permissions y throttling",
      "Testing y deployment",
    ],
    stepsCompleted: 2,
  },
  {
    name: "Drizzle",
    steps: [
      "Schema y setup",
      "Queries básicas",
      "Relations y joins",
      "Migrations",
      "Patrones avanzados",
    ],
    stepsCompleted: 1,
  },
];

//helper para dibujar la barra con nodos + labels que aparecen en hover del padre
function Roadmap({ steps, stepsCompleted }: Omit<Track, "name">) {
  const total = steps.length;
  //porcentaje de la linea fucsia. -1 porque queremos que la linea llegue al ultimo nodo COMPLETO, no al siguiente
  const fillPercent = Math.max(0, (stepsCompleted - 1) / (total - 1)) * 100;

  return (
    <div>
      {/* Barra con nodos */}
      <div className="relative flex items-center justify-between">
        {/* Linea base punteada zinc — de centro de primer nodo a centro del ultimo */}
        <div className="absolute top-1/2 left-1.5 right-1.5 -translate-y-1/2 border-t border-dashed border-zinc-700" />
        {/* Linea de progreso solida fucsia. El calc resta 12px (ancho de los dos nodos extremos) */}
        <div
          className="absolute top-1/2 left-1.5 h-px -translate-y-1/2 bg-fuchsia-500 shadow-[0_0_6px_rgba(217,70,239,0.7)] transition-[width] duration-500"
          style={{ width: `calc((100% - 12px) * ${fillPercent / 100})` }}
        />
        {/* Nodos: completed (relleno), current (LED parpadeante) o future (outline zinc) */}
        {steps.map((_, i) => {
          const state =
            i < stepsCompleted
              ? "completed"
              : i === stepsCompleted
                ? "current"
                : "future";
          return (
            <span
              key={i}
              className={`relative z-10 block h-3 w-3 rounded-full border transition ${
                state === "completed"
                  ? "border-fuchsia-500 bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.9)]"
                  : state === "current"
                    ? "neon-led border-fuchsia-500 bg-black"
                    : "border-zinc-700 bg-black"
              }`}
            />
          );
        })}
      </div>

      {/* Labels: aparecen en hover del <li> padre (group). Reservan espacio siempre para no saltar el layout */}
      <div className="mt-3 grid grid-cols-5 gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {steps.map((step, i) => {
          const state =
            i < stepsCompleted
              ? "completed"
              : i === stepsCompleted
                ? "current"
                : "future";
          return (
            <span
              key={i}
              className={`text-center font-mono text-[10px] leading-tight ${
                state === "completed"
                  ? "text-fuchsia-300"
                  : state === "current"
                    ? "text-fuchsia-400"
                    : "text-zinc-600"
              }`}
            >
              {step}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function NowLearning() {
  return (
    <div className="rounded-xl border border-fuchsia-500/50 bg-zinc-950/60 p-5">
      {/* titulo con LED parpadeante para reforzar el "en curso" */}
      <h2 className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-fuchsia-400">
        <span className="neon-led inline-block h-2 w-2 rounded-full bg-fuchsia-400" />
        &gt; aprendiendo ahora
      </h2>
      <ul className="flex flex-col gap-6">
        {TRACKS.map((track) => (
          //group para que el hover del li dispare los labels del Roadmap
          <li key={track.name} className="group flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-sm text-zinc-300">
                {track.name}
              </span>
              {/* contador N/5 a la derecha */}
              <span className="font-mono text-xs text-fuchsia-400">
                {track.stepsCompleted}/{track.steps.length}
              </span>
            </div>
            <Roadmap steps={track.steps} stepsCompleted={track.stepsCompleted} />
          </li>
        ))}
      </ul>
    </div>
  );
}
