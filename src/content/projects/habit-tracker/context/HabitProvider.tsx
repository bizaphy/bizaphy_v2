import { createContext, useContext, useState, type ReactNode } from "react";
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  isSameDay,
  isSameWeek,
  startOfWeek,
} from "date-fns";
import { useLocalStorage } from "../hooks/useLocalStorage";

////////////
export type Habit = { id: string; name: string; completions: Date[] };
type Context = {
  habits: Habit[];
  addHabit: (name: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, date: Date) => void;
  renameHabit: (id: string, name: string) => void;
  // Navegación de semanas:
  visibleDates: Date[]; // los 7 días de la semana que se está mostrando
  isCurrentWeek: boolean; // true si la semana visible es la de hoy
  nextWeek: () => void;
  prevWeek: () => void;
};

type HabitProviderProps = {
  children: ReactNode;
};

export const HabitContext = createContext<null | Context>(null); // el paréntesis indica el valor por defecto

export function HabitProvider({ children }: HabitProviderProps) {
  const [habits, setHabits] = useLocalStorage<Habit[]>("habits", []);

  // weekOffset = 0 → semana actual, -1 → semana anterior, +1 → siguiente, etc.
  // No persiste en localStorage: al recargar siempre volvemos a la semana de hoy.
  const [weekOffset, setWeekOffset] = useState(0);

  // Fecha de referencia = hoy desplazado en semanas.
  // addWeeks(new Date(), -2) devuelve un Date dos semanas atrás.
  const referenceDate = addWeeks(new Date(), weekOffset);

  // Los 7 días (lunes → domingo) de la semana en la que cae `referenceDate`.
  const visibleDates = eachDayOfInterval({
    start: startOfWeek(referenceDate, { weekStartsOn: 1 }),
    end: endOfWeek(referenceDate, { weekStartsOn: 1 }),
  });

  // ¿La semana visible es la misma que la de hoy?
  // isSameWeek compara si dos fechas caen en la misma semana calendario.
  const isCurrentWeek = isSameWeek(referenceDate, new Date(), {
    weekStartsOn: 1,
  });

  // Solo permitimos avanzar si NO estamos ya en la semana actual.
  // Sin esta guarda, el usuario podría marcar días del futuro por accidente.
  function nextWeek() {
    if (isCurrentWeek) return;
    setWeekOffset((prev) => prev + 1);
  }

  // Retroceder no tiene límite: se puede ir tan atrás como se quiera.
  function prevWeek() {
    setWeekOffset((prev) => prev - 1);
  }

  function addHabit(name: string) {
    setHabits((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, completions: [] },
    ]);
  }
  //
  function deleteHabit(id: string) {
    setHabits((prev) => prev.filter((hab) => hab.id !== id));
  }

  function renameHabit(id: string, name: string) {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, name } : h)),
    );
  }

  function toggleHabit(id: string, date: Date) {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const alreadyDone = h.completions.some((c) => isSameDay(c, date));
        const completions = alreadyDone
          ? h.completions.filter((c) => !isSameDay(c, date))
          : [...h.completions, date];
        return { ...h, completions };
      }),
    );
  }
  return (
    <HabitContext
      value={{
        habits,
        addHabit,
        toggleHabit,
        deleteHabit,
        renameHabit,
        visibleDates,
        isCurrentWeek,
        nextWeek,
        prevWeek,
      }}
    >
      {children}
    </HabitContext>
  );
}

export function useHabits() {
  const habitContext = useContext(HabitContext);
  if (habitContext == null) throw new Error("Null context");
  return habitContext;
}
