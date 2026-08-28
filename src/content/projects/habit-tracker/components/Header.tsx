import { useHabits } from "../context/HabitProvider";
import { Button } from "./Button";
import { format, isToday } from "date-fns";

export function Header() {
  const { habits, visibleDates, isCurrentWeek, nextWeek, prevWeek } =
    useHabits();

  // Cuántos hábitos ya se marcaron HOY (independiente de la semana visible).
  // isToday compara contra la fecha real de hoy, no contra visibleDates.
  const doneToday = habits.filter((h) =>
    h.completions.some((c) => isToday(c)),
  ).length;

  // Rango textual de la semana visible: primer día → último día.
  // visibleDates[0] = lunes, visibleDates[6] = domingo.
  // "MMM d" formatea como "Jul 27" (mes abreviado + día).
  const firstDay = format(visibleDates[0], "MMM d");
  const lastDay = format(visibleDates[6], "MMM d");

  return (
    <header className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Habit Tracker</h1>
        <span className="text-zinc-400 text-sm">
          {doneToday} / {habits.length} done today
        </span>
      </div>
      <div className="flex flex-col gap-1 items-end">
        <span className="text-zinc-400 text-sm">
          {firstDay} - {lastDay}
        </span>
        <div className="flex items-center gap-3">
          <Button onClick={prevWeek}>Prev</Button>
          <Button onClick={nextWeek} disabled={isCurrentWeek}>
            Sig
          </Button>
        </div>
      </div>
    </header>
  );
}
