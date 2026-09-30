"use client";

import { useActionState } from "react";
import type { EstadoFormPost } from "@/db/post-utils";

// ─── Props ───
// accion: crearPost o editarPost (ya con el id)
// post: solo al editar, para rellenar el formulario
type Props = {
  accion: (
    estado: EstadoFormPost,
    formData: FormData,
  ) => Promise<EstadoFormPost>;
  post?: {
    titulo: string;
    slug: string;
    resumen: string | null;
    contenido: string;
    publicado: boolean;
  };
};

// ─── Estilos compartidos ───
const estiloLabel = "flex flex-col gap-1.5 text-sm text-zinc-300";
const estiloCampo =
  "rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 outline-none transition focus:border-fuchsia-500";

// ─── Formulario de post (crear y editar) ───
export default function PostForm({ accion, post }: Props) {
  // Estado de la acción: error, valores escritos y si está guardando
  const [estado, formAction, pendiente] = useActionState(accion, {
    error: null,
  });

  // Si hubo un error, se muestra lo que escribiste; si no, los datos del post
  const v = estado.valores ?? post;

  return (
    <form
      action={formAction}
      className="flex w-full flex-col gap-5 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
    >
      {/* Campos */}
      <label className={estiloLabel}>
        Título
        <input
          className={estiloCampo}
          name="titulo"
          required
          maxLength={160}
          defaultValue={v?.titulo}
        />
      </label>

      <label className={estiloLabel}>
        Slug (vacío = se genera desde el título)
        <input
          className={estiloCampo}
          name="slug"
          maxLength={160}
          defaultValue={v?.slug}
        />
      </label>

      <label className={estiloLabel}>
        Resumen
        <textarea
          className={estiloCampo}
          name="resumen"
          rows={2}
          defaultValue={v?.resumen ?? ""}
        />
      </label>

      <label className={estiloLabel}>
        Contenido
        <textarea
          className={estiloCampo}
          name="contenido"
          required
          rows={16}
          defaultValue={v?.contenido}
        />
      </label>

      {/* Publicado: marcado manda "on", desmarcado no manda nada */}
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          name="publicado"
          defaultChecked={v?.publicado}
          className="size-4 accent-fuchsia-500"
        />
        Publicado
      </label>

      {/* Error de validación */}
      {estado.error && (
        <p
          role="alert"
          className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          {estado.error}
        </p>
      )}

      {/* Guardar (deshabilitado mientras se envía) */}
      <button
        type="submit"
        disabled={pendiente}
        className="mt-2 self-end rounded-md bg-fuchsia-600 px-5 py-2 font-medium text-white transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pendiente ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
