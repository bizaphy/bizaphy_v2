import GrammarV1 from "./components/GrammarV1";
import GrammarV2 from "./components/GrammarV2";
import Tabs from "@/components/ui/Tabs";
import BackToTopDots from "@/components/ui/BackToTopDots";

export default function GrammarBooster() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4">
      <Tabs
        ariaLabel="Secciones de Grammar Booster"
        pestanas={[
          { id: "grammar-v1", label: "Grammar V1", contenido: <GrammarV1 /> },
          { id: "grammar-v2", label: "Grammar V2", contenido: <GrammarV2 /> },
        ]}
      />
      <BackToTopDots />
    </div>
  );
}
