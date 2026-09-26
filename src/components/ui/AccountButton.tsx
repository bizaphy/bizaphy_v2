//Se crea debido a que Navbar es un server component. Se necesita este por separado.
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function AccountButton() {
  // useSession() pide la sesión a /api/auth/get-session y se actualiza sola al iniciar o cerrar sesión.
  // isPending es true mientras carga la sesión.
  const { data: session, isPending } = authClient.useSession();

  // Con sesión, el botón ya no cierra sesión directo: abre este menú.
  // Así un clic accidental no te desconecta.
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Cierra el menú al hacer clic fuera de él o al presionar Escape.
  // Solo escucha mientras el menú está abierto.
  useEffect(() => {
    if (!abierto) return;

    const alClicFuera = (e: MouseEvent) => {
      if (!contenedorRef.current?.contains(e.target as Node)) setAbierto(false);
    };
    const alPresionarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };

    document.addEventListener("mousedown", alClicFuera);
    document.addEventListener("keydown", alPresionarTecla);
    return () => {
      document.removeEventListener("mousedown", alClicFuera);
      document.removeEventListener("keydown", alPresionarTecla);
    };
  }, [abierto]);

  // signIn.social redirige a GitHub; al volver, Better Auth crea el usuario (si es nuevo) y la sesión.
  // callbackURL: adónde vuelve el navegador después del login.
  const iniciarSesion = () =>
    authClient.signIn.social({ provider: "github", callbackURL: "/" });

  const cerrarSesion = async () => {
    setAbierto(false);
    await authClient.signOut();
  };

  const conectado = !!session;
  const esAdmin = session?.user.role === "admin";

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        // Sin sesión: inicia sesión directo. Con sesión: abre/cierra el menú.
        onClick={conectado ? () => setAbierto((v) => !v) : iniciarSesion}
        disabled={isPending} // evita clics dobles mientras carga la sesión
        aria-label={conectado ? "Menú de cuenta" : "Iniciar sesión con GitHub"}
        aria-haspopup={conectado ? "menu" : undefined}
        aria-expanded={conectado ? abierto : undefined}
        title={conectado ? session.user.name : "Iniciar sesión"}
        className="relative flex items-center text-fuchsia-300 transition hover:text-fuchsia-100 hover:drop-shadow-[0_0_6px_rgba(217,70,239,0.75)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7z" />
        </svg>

        {/* Estado tipo MSN: gris = offline, verde = online */}
        <span
          aria-hidden
          className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border border-zinc-900 ${
            conectado ? "bg-green-400" : "bg-zinc-500"
          }`}
        />
      </button>

      {conectado && abierto && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 w-56 rounded-md border border-fuchsia-500 bg-zinc-950/95 font-mono text-[14px] shadow-[0_0_14px_rgba(217,70,239,0.45)] backdrop-blur-sm"
        >
          <div className="border-b border-zinc-700 px-4 py-3">
            <p className="truncate text-zinc-200">{session.user.name}</p>
            <p className="text-xs tracking-widest text-green-400">
              {esAdmin ? "ADMIN" : "EN LÍNEA"}
            </p>
          </div>

          {/* El link es solo comodidad: /admin se protege con requireAdminPage(). */}
          {esAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setAbierto(false)}
              className="block px-4 py-2.5 text-fuchsia-300 transition hover:bg-fuchsia-500/10 hover:text-fuchsia-100"
            >
              Panel admin
            </Link>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={cerrarSesion}
            className="block w-full rounded-b-md px-4 py-2.5 text-left text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
