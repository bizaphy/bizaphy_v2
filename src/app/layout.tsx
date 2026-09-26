//layout RAIZ-- persiste
import type { Metadata } from "next";
import { Oxanium } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DigitalRain from "@/components/effects/DigitalRain";
import { Toaster } from "sonner";

const oxanium = Oxanium({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-oxanium",
});

export const metadata: Metadata = {
  title: "bizaphy lab",
  description: "Usando next!",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${oxanium.className} antialiased min-h-screen flex flex-col`}
      >
        <DigitalRain />
        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
        {/* unstyled: quita el look por defecto de sonner y usa el estilo neón
            de la página (misma base que <Info />). El color del borde va solo
            en las variantes para que no compita con la clase base. */}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "flex w-(--width) items-center gap-2.5 rounded-md border bg-zinc-950/90 px-4 py-3 font-mono text-[14px] backdrop-blur-sm",
              title: "tracking-wide",
              description: "text-zinc-400",
              icon: "shrink-0",
              default:
                "border-fuchsia-500 text-fuchsia-300 shadow-[0_0_14px_rgba(217,70,239,0.45)]",
              info: "border-fuchsia-500 text-fuchsia-300 shadow-[0_0_14px_rgba(217,70,239,0.45)]",
              success:
                "border-green-400 text-green-300 shadow-[0_0_14px_rgba(74,222,128,0.4)]",
              error:
                "border-red-500 text-red-300 shadow-[0_0_14px_rgba(239,68,68,0.45)]",
              warning:
                "border-amber-400 text-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.4)]",
            },
          }}
        />
        <Footer />
      </body>
    </html>
  );
}
