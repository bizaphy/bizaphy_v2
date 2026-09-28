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

export default async function PlanesPage() {
  await requireAdminPage();

  const planes = await obtenerPlanes();

  return (
    <main className="space-y-8 p-6">
      <h1>Planes futuros</h1>

      {/* Formulario para agregar un plan */}
      <form action={crearPlan} className="flex max-w-lg flex-col gap-2">
        <input
          name="titulo"
          required
          maxLength={120}
          placeholder="¿Qué quieres hacer?"
        />
        <textarea name="detalle" rows={3} placeholder="Notas (opcional)" />
        <select name="prioridad" defaultValue="2">
          <option value="1">Prioridad baja</option>
          <option value="2">Prioridad media</option>
          <option value="3">Prioridad alta</option>
        </select>
        <button type="submit">Agregar plan</button>
      </form>

      {/* Una sección por estado, en el orden del enum */}
      <div className="grid gap-6 md:grid-cols-4">
        {estadoPlan.enumValues.map((estado) => (
          <section key={estado}>
            <h2>{etiquetas[estado]}</h2>
            <ul className="space-y-3">
              {planes
                .filter((p) => p.estado === estado)
                .map((p) => (
                  <li key={p.id}>
                    <strong>{p.titulo}</strong>
                    {p.detalle && <p>{p.detalle}</p>}

                    <div className="flex flex-wrap gap-2">
                      {estadoPlan.enumValues
                        .filter((otro) => otro !== estado)
                        .map((otro) => (
                          <form
                            key={otro}
                            action={cambiarEstadoPlan.bind(null, p.id, otro)}
                          >
                            <button type="submit">→ {etiquetas[otro]}</button>
                          </form>
                        ))}
                      <form action={eliminarPlan.bind(null, p.id)}>
                        <button type="submit">Eliminar</button>
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
