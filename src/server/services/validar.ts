import "server-only";

// Validadores chicos para los datos que llegan por server action. Una
// action es un endpoint publico: aunque el editor mande bien los datos,
// cualquiera podria llamarla con otra cosa. Lanzan error si algo no cuadra.

export function texto(valor: unknown, campo: string, maximo = 200_000): string {
  if (typeof valor !== "string" || valor.length > maximo) {
    throw new Error(`Campo inválido: ${campo}`);
  }
  return valor;
}

export function entero(valor: unknown, campo: string): number {
  if (!Number.isInteger(valor) || (valor as number) < 0) {
    throw new Error(`Campo inválido: ${campo}`);
  }
  return valor as number;
}

export function objeto(
  valor: unknown,
  campo: string,
): Record<string, unknown> {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) {
    throw new Error(`Campo inválido: ${campo}`);
  }
  return valor as Record<string, unknown>;
}

// { clave: texto } (por ejemplo, las traducciones de una cancion)
export function mapaDeTextos(valor: unknown, campo: string) {
  const resultado: Record<string, string> = {};
  for (const [clave, es] of Object.entries(objeto(valor, campo))) {
    resultado[texto(clave, campo, 5000)] = texto(es, campo, 5000);
  }
  return resultado;
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function uuid(valor: unknown): string {
  if (typeof valor !== "string" || !UUID.test(valor)) {
    throw new Error("Id inválido");
  }
  return valor;
}

// Cambios del autoguardado: { id: valor | null }. Separa lo que se guarda
// (crear o actualizar) de lo que se borra.
export function cambios<Valor>(
  valor: unknown,
  validarId: (id: string) => string,
  validarValor: (valor: unknown) => Valor,
) {
  const entradas = Object.entries(objeto(valor, "cambios"));
  if (entradas.length > 5000) throw new Error("Demasiados cambios");
  const guardar: [string, Valor][] = [];
  const borrar: string[] = [];
  for (const [id, nuevo] of entradas) {
    if (nuevo === null) borrar.push(validarId(id));
    else guardar.push([validarId(id), validarValor(nuevo)]);
  }
  return { guardar, borrar };
}
