import { projects } from "@/data/projects";
import { projectsMap, ProjectSlug } from "@/content/projects";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectSlugPage(props: PageProps) {
  const { slug } = await props.params; //destructuracion retornara { slug: "nombre-del-proyecto" }.
  const urlSlug = slug as ProjectSlug;
  // 1) Buscar metadata del proyecto
  const project = projects.find((p) => p.slug === urlSlug);
  // 2) Buscar implementación del proyecto
  const ProjectComponent = projectsMap[urlSlug];
  //validacion
  if (!project || !ProjectComponent) {
    return (
      <div>
        <h1>Proyecto no encontrado</h1>
        <p>No existe un proyecto con el slug "{slug}".</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header*/}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <p className="text-zinc-600">{project.description}</p>
      </div>
      {/* Contenido*/}
      <ProjectComponent />
    </div>
  );
}
