import BannerInfo from "./components/BannerInfo";
import ProjectList from "./components/ProjectList";
import TextScramble from "@/components/effects/TextScramble";

export default function ProjectsPage() {
  return (
    <main className="relative mx-auto max-w-3xl p-6">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold">
          <TextScramble text="Projects" />
        </h1>

        <section className="mt-6">
          <BannerInfo />
        </section>

        <section className="mt-12">
          <ProjectList />
        </section>
      </div>
    </main>
  );
}
