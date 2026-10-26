import StatsCard from "@/components/home/StatsCard";
import ActivityHeatmap from "@/components/home/ActivityHeatmap";
import APILights from "@/components/home/APILights";
import ProjectTV from "@/components/home/ProjectTV";
import SystemPanel from "@/components/home/SystemPanel";
import FraseDelDia from "@/components/home/FraseDelDia";
import Hero from "@/components/home/Hero";
import AboutThisPage from "@/components/home/AboutThisPage";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 flex flex-col gap-8">
      {/* sin titulo visible: el Hero abre la pagina. El h1 queda para lectores
          de pantalla y buscadores */}
      <h1 className="sr-only">bizaphy</h1>
      <Hero />
      <div aria-hidden className="h-6" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1 flex">
          <StatsCard className="flex-1" />
        </div>
        <div className="sm:col-span-2 flex">
          <APILights className="flex-1" />
        </div>
        <div className="sm:col-span-3">
          <FraseDelDia />
        </div>
        <div className="sm:col-span-1">
          <ProjectTV />
        </div>
        <div className="sm:col-span-2">
          <SystemPanel />
        </div>
        <div className="sm:col-span-3">
          <AboutThisPage />
        </div>
        <div className="sm:col-span-3">
          <ActivityHeatmap />
        </div>
      </div>
    </div>
  );
}
