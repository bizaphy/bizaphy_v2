import { projectsRegistry } from "@/content/projects";

export default function StatsCard() {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">Proyectos</span>
        <span className="text-sm font-bold text-zinc-100">{projectsRegistry.length}</span>
      </div>
    </div>
  );
}
