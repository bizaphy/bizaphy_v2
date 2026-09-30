import { requireAdminPage } from "@/lib/auth-guards";
import { estadoPlan } from "@/db/plan-schema";
import { obtenerPlanes } from "@/db/plan-queries";
import { crearPlan, cambiarEstadoPlan, eliminarPlan } from "@/db/plan-actions";

const etiquetas = {
  idea: "💡 Ideas",
  siguiente: "⏭️ Siguiente",
  en_progreso: "🔧 En progreso",
  hecho: "✅ Hecho",
} as const;

// ─── Estilos compartidos ───
const estiloCampo =
  "rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 outline-none transition focus:border-fuchsia-500";
const estiloBotonChico =
  "rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 transition hover:border-fuchsia-500 hover:text-white";

export default async function PlanesPage() {
  await requireAdminPage();

  const planes = await obtenerPlanes();

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10">
      <h1 className="text-center text-2xl font-semibold">Planes futuros</h1>

      {/* Formulario para agregar un plan */}
      <form
        action={crearPlan}
        className="mx-auto flex w-full max-w-lg flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <input
          className={estiloCampo}
          name="titulo"
          required
          maxLength={120}
          placeholder="¿Qué quieres hacer?"
        />
        <textarea
          className={estiloCampo}
          name="detalle"
          rows={3}
          placeholder="Notas (opcional)"
        />
        <select className={estiloCampo} name="prioridad" defaultValue="2">
          <option value="1">Prioridad baja</option>
          <option value="2">Prioridad media</option>
          <option value="3">Prioridad alta</option>
        </select>
        <button
          type="submit"
          className="mt-2 self-end rounded-md bg-fuchsia-600 px-5 py-2 font-medium text-white transition hover:bg-fuchsia-500"
        >
          Agregar plan
        </button>
      </form>

      {/* Una sección por estado, en el orden del enum */}
      <div className="grid gap-6 md:grid-cols-4">
        {estadoPlan.enumValues.map((estado) => (
          <section
            key={estado}
            className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <h2 className="font-semibold">{etiquetas[estado]}</h2>
            <ul className="space-y-3">
              {planes
                .filter((p) => p.estado === estado)
                .map((p) => (
                  <li
                    key={p.id}
                    className="space-y-2 rounded-lg border border-zinc-700 bg-zinc-800 p-3"
                  >
                    <strong className="block">{p.titulo}</strong>
                    {p.detalle && (
                      <p className="text-sm text-zinc-400">{p.detalle}</p>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      {estadoPlan.enumValues
                        .filter((otro) => otro !== estado)
                        .map((otro) => (
                          <form
                            key={otro}
                            action={cambiarEstadoPlan.bind(null, p.id, otro)}
                          >
                            <button type="submit" className={estiloBotonChico}>
                              → {etiquetas[otro]}
                            </button>
                          </form>
                        ))}
                      <form action={eliminarPlan.bind(null, p.id)}>
                        <button
                          type="submit"
                          className="rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs text-red-300 transition hover:bg-red-500/20"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
