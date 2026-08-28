"use client";
import { Header } from "./components/Header";
import { HabitForm } from "./components/HabitForm";
import { HabitList } from "./components/HabitList";
import { HabitProvider } from "./context/HabitProvider";

export default function HabitTracker() {
  return (
    <HabitProvider>
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
        <Header />
        <HabitForm />
        <HabitList />
      </div>
    </HabitProvider>
  );
}
