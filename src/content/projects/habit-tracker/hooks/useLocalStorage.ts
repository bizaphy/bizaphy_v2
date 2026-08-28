import { useEffect, useState } from "react";

/**
 * Hook genérico que sincroniza un estado de React con localStorage.
 *
 * @param key   La clave bajo la cual se guarda el valor en localStorage.
 * @param initialValue El valor por defecto si no hay nada guardado todavía.
 *
 * Uso:
 *   const [habits, setHabits] = useLocalStorage<Habit[]>("habits", []);
 *
 * Se comporta igual que useState pero:
 *   - Al montar el componente lee de localStorage (si existe una entrada bajo `key`).
 *   - Cada vez que el valor cambia, lo escribe a localStorage.
 *   - Persiste entre recargas de la página.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Lazy initializer: la función solo se ejecuta en el primer render.
  // Evita leer localStorage en cada re-render (sería lento y no cambia).
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (stored === null) return initialValue;

    // JSON.parse con reviver: cada valor pasa por esta función.
    // Si detectamos un string con formato de fecha ISO, lo convertimos a Date.
    // Sin esto, `completions` volvería como strings, no como objetos Date.
    return JSON.parse(stored, (_key, val) => {
      if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
        return new Date(val);
      }
      return val;
    }) as T;
  });

  // Cada vez que cambia `value`, lo persistimos.
  // JSON.stringify convierte automáticamente los Date a strings ISO.
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
