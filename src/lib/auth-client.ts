import { createAuthClient } from "better-auth/react"; //crea un cliente con hooks de React, como `useSession()`.
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth"; //solo trae los **tipos** de `auth.ts`, no el código.

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
