import TextScramble from "@/components/effects/TextScramble";
import StatsCard from "@/content/home/StatsCard";
import Changelog from "@/content/home/Changelog";
import APILights from "@/content/home/APILights";
import FraseDelDia from "@/content/home/FraseDelDia";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-center">/bizaphy</h1>
      <p className="text-zinc-400">
        {" "}
        <TextScramble text="stats" />
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1 flex">
          <StatsCard className="flex-1" />
        </div>
        <div className="sm:col-span-2">
          <APILights />
        </div>
        <div className="sm:col-span-3">
          <FraseDelDia />
        </div>
        <div className="sm:col-span-3">
          <Changelog />
        </div>
      </div>
    </div>
  );
}
