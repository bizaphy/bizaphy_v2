// Tipos compartidos entre servidor y cliente: PostForm (client) los importa,
// por eso viven en src/shared y no en src/server.

// Estado que devuelven crearPost/editarPost a useActionState
export type EstadoFormPost = {
  error: string | null;
  valores?: ValoresFormPost;
};

// Lo que escribió el admin en el formulario (se devuelve si hay error)
export type ValoresFormPost = {
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string;
  publicado: boolean;
};
