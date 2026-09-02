import { projectsRegistry } from "@/content/projects";
import ProjectCard from "./ProjectCard";

export default function ProjectList() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projectsRegistry.map((p) => (
        <ProjectCard
          key={p.slug}
          slug={p.slug}
          title={p.title}
          description={p.description}
          image={p.image}
        />
      ))}
    </div>
  );
}
