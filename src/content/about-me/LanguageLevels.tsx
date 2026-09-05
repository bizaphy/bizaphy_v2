"use client";
import { useState } from "react";

type LangKey = "es" | "en" | "jp";

interface LangData {
  name: string;
  level: string;
  flag: React.ReactNode;
}

const SpainFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="h-full w-full">
    <rect width="3" height="2" fill="#c60b1e" />
    <rect width="3" height="1" y=".5" fill="#ffc400" />
  </svg>
);

const EnglandFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 36" className="h-full w-full">
    <rect width="60" height="36" fill="#fff" />
    <rect x="25" width="10" height="36" fill="#CE1124" />
    <rect y="13" width="60" height="10" fill="#CE1124" />
  </svg>
);

const JapanFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="h-full w-full">
    <rect width="900" height="600" fill="#fff" />
    <circle cx="450" cy="300" r="180" fill="#BC002D" />
  </svg>
);

const LANGUAGES: Record<LangKey, LangData> = {
  es: { name: "Español", level: "NATIVO", flag: <SpainFlag /> },
  en: { name: "English", level: "B2",     flag: <EnglandFlag /> },
  jp: { name: "日本語",   level: "N4",     flag: <JapanFlag /> },
};

const entries = Object.entries(LANGUAGES) as [LangKey, LangData][];

export default function LanguageLevels() {
  const [active, setActive] = useState<LangKey | null>(null);

  function toggle(key: LangKey) {
    setActive((prev) => (prev === key ? null : key));
  }

  return (
    <div className="rounded-xl border border-fuchsia-500 shadow-[0_0_18px_rgba(217,70,239,0.12)]">
      <div className="flex h-40 items-center justify-around px-4" onClick={() => setActive(null)}>
        {entries.map(([key, lang]) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={(e) => { e.stopPropagation(); toggle(key); }}
              className="group flex items-center justify-center"
            >
              <div
                className={`relative h-24 w-24 overflow-hidden rounded-full border-2 transition-all duration-300
                  ${isActive
                    ? "border-fuchsia-500 shadow-[0_0_16px_rgba(217,70,239,0.6)] grayscale-0"
                    : "border-zinc-700 grayscale group-hover:border-zinc-500 group-hover:grayscale-0"
                  }`}
              >
                {/* Bandera */}
                <div className="absolute inset-0">{lang.flag}</div>

                {/* Overlay activo */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center gap-0.5 transition-all duration-300
                    ${isActive ? "bg-black/65 opacity-100" : "pointer-events-none opacity-0"}`}
                >
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-300">
                    {lang.name}
                  </span>
                  <span className="font-mono text-xl font-bold text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,1)]">
                    {lang.level}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
