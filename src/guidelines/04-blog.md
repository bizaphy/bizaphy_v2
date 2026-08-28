# Fase 4 — Sección Blog: Registry sin component map

En esta fase se construye la sección **Blog**. Es la más simple del proyecto, pero se documenta como fase propia porque introduce una **variante importante** del patrón Registry: cuando el contenido es homogéneo (sólo texto), no hace falta component map. Sirve para entender que el patrón se **adapta** al tipo de contenido, no es un dogma. Cierra la ruta `/blog` que quedaba en 404 desde la [Fase 1](./01-cimientos-sistema-visual.md).

---

## Objetivo de la fase

Al terminar:

- Existe la ruta `/blog` con una lista de cards de posts.
- Existe la ruta dinámica `/blog/[slug]` que renderiza el título y el contenido del post directamente desde la metadata.
- El código es casi la mitad que el de Projects: no hay `blogMap`, no hay `keyof typeof`, no hay `[slug]/template.tsx` propio.

Lo que **no** vamos a tener todavía:

- El contenido del post es un string plano. En una app real, sería Markdown o MDX; queda como mejora fuera del alcance.
- No hay tags ni categorías.
- No hay paginación: se listan todos los posts en la misma página.

---

## Estructura de carpetas al final de la fase

```
src/
├── app/
│   └── blog/                     ← nuevo
│       ├── components/
│       │   ├── BlogList.tsx
│       │   └── BlogCard.tsx
│       ├── [slug]/
│       │   └── page.tsx          ← sin template.tsx propio
│       ├── layout.tsx
│       └── page.tsx
├── lib/
│   ├── labs.ts                   ← sin cambios
│   ├── projects/                 ← sin cambios
│   └── posts.ts                  ← nuevo
└── ... (sin cambios)
```

Nótese: **no existe** una carpeta `content/blog/`. No hay componentes React por post. Esa carpeta sólo existiría si cada post tuviera UI propia (como los proyectos).

---

## Por qué el blog no necesita component map

En Projects, cada proyecto es un componente React distinto: un juego, un dashboard, un formulario. El component map es necesario para saber cuál renderizar en cada URL.

En Blog, cada post es sólo un `title` y un `content` — dos strings. Todos los posts se renderizan igual: `<h1>{post.title}</h1>` + `<p>{post.content}</p>`. No hay lógica específica por post.

**Regla:** el component map se justifica cuando cada elemento tiene UI propia. Si el contenido es homogéneo, la metadata es toda la información necesaria.

---

## Metadata

`src/lib/posts.ts`:

```ts
export type Post = {
  slug: string;
  title: string;
  content: string;
};

export const posts: Post[] = [
  { slug: "hola-neonlab", title: "Hola NeonLab", content: "Este es el primer post." },
  { slug: "react-basico", title: "React Básico", content: "Introducción a React paso a paso." },
];
```

En una app de producción, `content` sería Markdown parseado desde archivos `.mdx` o desde un CMS. Para el propósito educativo del proyecto, un string es suficiente.

---

## `BlogCard` y `BlogList`

Idénticos a `ProjectCard` y `ProjectList` sustituyendo los nombres. `BlogCard`:

```tsx
import Link from "next/link";
import TextScramble from "@/app/components/effects/TextScramble";

type BlogCardProps = {
  slug: string;
  title: string;
};

export default function BlogCard({ slug, title }: BlogCardProps) {
  return (
    <article className="neon-card">
      <h2 className="neon-card-title text-lg font-semibold">
        <TextScramble text={title} />
      </h2>
      <Link href={`/blog/${slug}`} className="neon-link">Leer</Link>
    </article>
  );
}
```

`BlogList`:

```tsx
import { posts } from "@/lib/posts";
import BlogCard from "./BlogCard";

export default function BlogList() {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <BlogCard key={post.slug} slug={post.slug} title={post.title} />
      ))}
    </div>
  );
}
```

---

## Página dinámica: la diferencia importante

`src/app/blog/[slug]/page.tsx`:

```tsx
import { posts } from "@/lib/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage(props: PageProps) {
  const params = await props.params;
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) {
    return (
      <div>
        <h1>Post no encontrado</h1>
        <p>No existe un post con el slug &quot;{params.slug}&quot;.</p>
      </div>
    );
  }

  return (
    <article>
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="mt-4 text-zinc-300">{post.content}</p>
    </article>
  );
}
```

Comparar con la página dinámica de Projects:

- **Aquí no hay `projectsMap[slug]`** ni `<ProjectComponent />`.
- **El contenido se renderiza directamente** desde `post.title` y `post.content`.
- **No hace falta `as ProjectSlug`**: no accedemos a ninguna clave de objeto tipada.
- **No hace falta comprobar `!ProjectComponent`**: sólo verificamos `!post`.

La metadata **es** el contenido.

---

## Cómo probar la fase

```bash
npm run dev
```

Verificaciones:

1. Ir a `/blog`. Aparecen las cards de los posts con el mismo estilo neon.
2. Click en un post. Se muestra el título y el contenido en la misma página.
3. Ir a `/blog/no-existe`. Aparece el fallback "Post no encontrado".
4. La transición al navegar a `/blog/*` es la `page-scan` global (no `page-glitch`): las páginas de post no tienen `template.tsx` propio.
5. El nav superior sigue funcionando: se puede saltar entre `/`, `/blog` y `/projects`.

Si todos los pasos funcionan, la fase está terminada.

---

## Checklist para replicar esta fase

- [ ] `src/lib/posts.ts` con el tipo `Post` y el array `posts`.
- [ ] `src/app/blog/layout.tsx`, `page.tsx`, `[slug]/page.tsx`.
- [ ] `src/app/blog/components/BlogCard.tsx` (Presentational) y `BlogList.tsx` (Container).
- [ ] **No existe** `src/app/blog/[slug]/template.tsx` (opcional, se hereda del template raíz).
- [ ] **No existe** carpeta `content/blog/` ni component map.
- [ ] La página dinámica renderiza `post.title` y `post.content` directamente, sin lookup en ningún map.
- [ ] Navegar a un slug inexistente muestra el fallback.

---

## Limitaciones y qué viene después

| No funciona | Motivo |
|---|---|
| Contenido con formato (headings, listas, bold) | `content` es un string plano. Necesitaría un parser de Markdown/MDX. |
| Home con widgets | El grid del home sigue sin construir. |
| Estadísticas de posts leídos | Requeriría estado persistente en el navegador y salta el alcance del tutorial. |

- **[Fase 5 — Home Dashboard con Widgets](./05-home-dashboard.md)** — última fase: se completa el home con el grid de widgets.
