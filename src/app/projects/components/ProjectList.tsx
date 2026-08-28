import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";

export default function ProjectList() {
  return (
    <div className="space-y-4">
      {projects.map((p) => (
        <ProjectCard
          key={p.slug}
          slug={p.slug}
          title={p.title}
          description={p.description}
        />
      ))}
    </div>
  );
}
