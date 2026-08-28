import { Button } from "./Button";
import { format, isFuture, isSameDay, subDays } from "date-fns";
import { useHabits, type Habit } from "../context/HabitProvider";
import { useState } from "react";

type HabitItemProps = {
  habit: Habit;
  visibleDates: Date[];
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, date: Date) => void;
  renameHabit: (id: string, name: string) => void;
};

export function HabitList() {
  const { habits, deleteHabit, toggleHabit, renameHabit, visibleDates } =
    useHabits();

  if (habits.length === 0) {
    return <h1>Aun no hay habitos registrados. Agrega uno para empezar!</h1>;
  }

  return (
    <div className="flex flex-col gap-3">
      {habits.map((habit) => (
        <HabitItem
          deleteHabit={deleteHabit}
          key={habit.id}
          habit={habit}
          toggleHabit={toggleHabit}
          renameHabit={renameHabit}
          visibleDates={visibleDates}
        />
      ))}
    </div>
  );
}
function HabitItem({
  habit,
  visibleDates,
  deleteHabit,
  toggleHabit,
  renameHabit,
}: HabitItemProps) {
  const streak = getStreak(habit.completions);
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(habit.name);

  function startEditing() {
    setDraftName(habit.name);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = draftName.trim();
    if (trimmed === "") return;
    renameHabit(habit.id, trimmed);
    setIsEditing(false);
  }

  return (
    <div className="rounded-xl bg-zinc-800 p-4 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancelEditing();
              }}
              className="flex-1 rounded-lg bg-zinc-700 px-3 py-1 outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            />
            <Button
              type="submit"
              disabled={
                draftName.trim() === "" || draftName.trim() === habit.name
              }
              className="text-sm"
            >
              Guardar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={cancelEditing}
              className="text-sm"
            >
              Cancelar
            </Button>
          </form>
        ) : (
          <>
            <div className="flex gap-3 items-center">
              <span className="font-medium">{habit.name}</span>
              {streak !== 0 && (
                <span className="text-sm text-amber-400"> 🔥{streak}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={startEditing}
                variant="secondary"
                className="text-sm"
              >
                Editar
              </Button>
              <Button
                onClick={() => deleteHabit(habit.id)}
                variant="ghost-destructive"
                className="text-sm"
              >
                Eliminar
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="flex gap-1.5">
        {visibleDates.map((date) => (
          <Button
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg text-xs"
            key={date.toISOString()}
            disabled={isFuture(date)}
            onClick={() => toggleHabit(habit.id, date)}
            variant={
              habit.completions.some((d) => isSameDay(date, d))
                ? "primary"
                : "secondary"
            }
          >
            <span className="font-medium">{format(date, "EEE")}</span>
            <span className="font-medium">{format(date, "d")}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

function getStreak(completions: Date[]) {
  let streak = 0;
  let date = new Date();
  while (completions.some((c) => isSameDay(c, date))) {
    streak++;
    date = subDays(date, 1); //eliminamos un dia
  }
  return streak;
}
