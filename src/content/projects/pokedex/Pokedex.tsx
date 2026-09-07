"use client";
import { Buscador } from "./components/Buscador";

export default function Pokedex() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold tracking-tight">Pokedex</h1>
      <Buscador />
    </div>
  );
}
