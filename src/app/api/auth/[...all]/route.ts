//`[...all]`:** es una ruta *catch-all*.Todas las rutas de Better Auth pasan por este único archivo:
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
//tonextjs convierte el objeto auth en handlers GET y POST
