export type EstadoFormPost = {
  error: string | null;
  valores?: {
    titulo: string;
    slug: string;
    resumen: string;
    contenido: string;
    publicado: boolean;
  };
};

// "¡Hola, Mañana!" → "hola-manana"
export function crearSlug(texto: string) {
  return texto
    .normalize("NFD") // separa "ñ" en "n" + "~"
    .replace(/[̀-ͯ]/g, "") // borra los acentos sueltos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // todo lo demás pasa a ser "-"
    .replace(/^-+|-+$/g, ""); // sin "-" al inicio ni al final
}
