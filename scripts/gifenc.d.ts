//gifenc no trae tipos: solo lo que usa scripts/neonna-ascii.ts
declare module "gifenc" {
  type Paleta = number[][];
  export function GIFEncoder(): {
    writeFrame(
      indices: Uint8Array,
      ancho: number,
      alto: number,
      opciones?: { palette?: Paleta; delay?: number; repeat?: number },
    ): void;
    finish(): void;
    bytes(): Uint8Array;
  };
  export function quantize(rgba: Uint8Array | Uint8ClampedArray, maxColores: number): Paleta;
  export function applyPalette(rgba: Uint8Array | Uint8ClampedArray, paleta: Paleta): Uint8Array;
}
