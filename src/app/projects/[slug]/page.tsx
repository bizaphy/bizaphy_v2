import { projectsRegistry } from "@/content/projects";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectSlugPage(props: PageProps) {
  const { slug } = await props.params;
  const entry = projectsRegistry.find((p) => p.slug === slug);

  if (!entry) {
    return (
      <div>
        <h1>Proyecto no encontrado</h1>
        <p>No existe un proyecto con el slug &quot;{slug}&quot;.</p>
      </div>
    );
  }

  const { title, description, Component } = entry;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-zinc-600">{description}</p>
      </div>
      <Component />
    </div>
  );
}
