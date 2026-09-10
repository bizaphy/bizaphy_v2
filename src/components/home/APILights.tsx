"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Status = "loading" | "ok" | "down";

type APIEntry = {
  name: string;
  url: string;
};

const APIS: APIEntry[] = [
  {
    name: "Open-Meteo",
    url: "https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&current=temperature_2m",
  },
  {
    name: "PokéAPI",
    url: "https://pokeapi.co/api/v2/pokemon/1",
  },
];
//El type record (K,V) tiene su key en K y su valor en V. En este caso la key es el Status.
const statusStyles: Record<Status, string> = {
  loading: "bg-yellow-400 neon-led-neutral",
  ok: "bg-green-400 neon-led-neutral",
  down: "bg-red-500 neon-led-neutral",
};

const statusLabel: Record<Status, string> = {
  loading: "verificando",
  ok: "operativa",
  down: "caída",
};

export default function APILights() {
  //la string corresponde a la API (open meteo, pokeapi, etc)
  const [statuses, setStatuses] = useState<Record<string, Status>>(
    Object.fromEntries(APIS.map((api) => [api.name, "loading"])),
  );

  useEffect(() => {
    // forEach en vez de Promise.all: cada API actualiza su estado al resolverse, sin esperar a las demás
    APIS.forEach(async (api) => {
      try {
        // timeout de 5s para no quedarse colgado si la API tarda o no responde
        const res = await fetch(api.url, { signal: AbortSignal.timeout(5000) });
        // forma funcional para no pisar el estado de las otras APIs que ya resolvieron
        setStatuses((prev) => ({
          ...prev,
          [api.name]: res.ok ? "ok" : "down",
        }));
      } catch {
        setStatuses((prev) => ({ ...prev, [api.name]: "down" }));
      }
    });
  }, []);
  //devuelve status ok o down como array para luego contarlos y determinar cara de mr.increible.
  const values = Object.values(statuses);
  const downCount = values.filter((s) => s === "down").length;
  // imagen según cuántas APIs están caídas: ninguna → sereno, algunas → preocupado, todas → devastado
  const mood =
    downCount === 0
      ? "/images/misc/mr-incredible-1.webp"
      : downCount < APIS.length
        ? "/images/misc/mr-incredible-2.webp"
        : "/images/misc/mr-incredible-3.webp";

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-4 flex items-center gap-5">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-zinc-600">
        <Image
          src={mood}
          alt="Estado de APIs"
          fill
          sizes="64px"
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          APIs
        </h2>
        <ul className="flex flex-col gap-2">
          {APIS.map((api) => {
            const status = statuses[api.name];
            return (
              <li key={api.name} className="flex items-center gap-3 text-sm">
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${statusStyles[status]}`}
                />
                <span className="text-zinc-300">{api.name}</span>
                <span className="ml-auto font-mono text-xs text-zinc-500">
                  {statusLabel[status]}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
