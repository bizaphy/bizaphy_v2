import { useHabits } from "../context/HabitProvider";
import { Button } from "./Button";
import { useState } from "react";

export function HabitForm() {
  const [name, setName] = useState("");
  const { addHabit } = useHabits();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (name.trim() === "") return;
    addHabit(name);
    setName("");
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        placeholder="Habito nuevo"
      />
      <Button
        disabled={name.trim() === ""}
        className=" rounded-lg px-4 py-2 font-medium"
      >
        Agregar habito
      </Button>
    </form>
  );
}
