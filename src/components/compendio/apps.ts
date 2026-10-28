//Datos del compendio. Editar aqui para agregar, quitar o mover apps de grupo.

export type Licencia = "gratis" | "open source" | "freemium" | "pago";

export type App = {
  nombre: string;
  uso: string; //para que la uso, en una o dos frases
  url: string;
  licencia: Licencia;
};

export type Categoria = {
  id: string;
  titulo: string;
  apps: App[];
};

export const CATEGORIAS: Categoria[] = [
  {
    id: "desarrollo",
    titulo: "Desarrollo",
    apps: [
      {
        nombre: "Visual Studio Code",
        uso: "Editor de código principal. Extensiones, terminal integrada y Git en la misma ventana.",
        url: "https://code.visualstudio.com/",
        licencia: "gratis",
      },
      {
        nombre: "Docker Desktop",
        uso: "Levantar bases de datos y servicios en contenedores sin instalarlos directo en el sistema.",
        url: "https://www.docker.com/products/docker-desktop/",
        licencia: "freemium",
      },
    ],
  },
  {
    id: "diseno",
    titulo: "Diseño & dibujo",
    apps: [
      {
        nombre: "Affinity",
        uso: "Diseño vectorial, edición de fotos y maquetación en una sola app. Reemplazo directo de la suite de Adobe.",
        url: "https://www.affinity.studio/",
        licencia: "gratis",
      },
      {
        nombre: "Clip Studio Paint",
        uso: "Dibujo e ilustración digital (antes Manga Studio). Pinceles, viñetas y herramientas pensadas para cómic y manga.",
        url: "https://www.clipstudio.net/en/",
        licencia: "pago",
      },
    ],
  },
  {
    id: "video",
    titulo: "Video",
    apps: [
      {
        nombre: "DaVinci Resolve",
        uso: "Edición de video, corrección de color y audio. La versión gratuita alcanza para casi todo.",
        url: "https://www.blackmagicdesign.com/products/davinciresolve",
        licencia: "freemium",
      },
      {
        nombre: "HandBrake",
        uso: "Convertir y comprimir videos a otros formatos o calidades sin perder demasiado.",
        url: "https://handbrake.fr/",
        licencia: "open source",
      },
    ],
  },
  {
    id: "multimedia",
    titulo: "Multimedia",
    apps: [
      {
        nombre: "ImageGlass",
        uso: "Visor de imágenes liviano y rápido, con soporte para casi cualquier formato (WebP, AVIF, SVG, RAW...).",
        url: "https://imageglass.org/",
        licencia: "open source",
      },
      {
        nombre: "MusicBee",
        uso: "Reproductor y organizador de la biblioteca de música local, con etiquetas y skins.",
        url: "https://getmusicbee.com/",
        licencia: "gratis",
      },
      {
        nombre: "VLC",
        uso: "Reproductor de video que abre prácticamente cualquier formato sin instalar nada extra.",
        url: "https://www.videolan.org/vlc/",
        licencia: "open source",
      },
      {
        nombre: "K-Lite Codec Pack",
        uso: "Códecs para que Windows y sus reproductores puedan abrir y previsualizar todo tipo de video y audio.",
        url: "https://codecguide.com/",
        licencia: "gratis",
      },
      {
        nombre: "GonVisor",
        uso: "Lector de cómics y manga (CBZ, CBR, carpetas de imágenes) con lectura de derecha a izquierda.",
        url: "https://www.gonvisor.com/",
        licencia: "gratis",
      },
    ],
  },
  {
    id: "estudio",
    titulo: "Estudio & documentos",
    apps: [
      {
        nombre: "Anki",
        uso: "Tarjetas de memoria con repetición espaciada. Lo uso para vocabulario y kanjis.",
        url: "https://apps.ankiweb.net/",
        licencia: "open source",
      },
      {
        nombre: "PDFgear",
        uso: "Leer, editar, firmar, unir y convertir PDFs sin pagar suscripción.",
        url: "https://www.pdfgear.com/",
        licencia: "gratis",
      },
    ],
  },
  {
    id: "descargas",
    titulo: "Descargas",
    apps: [
      {
        nombre: "Turbo Downloader",
        uso: "Extensión del navegador que acelera las descargas dividiéndolas en varias conexiones.",
        url: "https://add0n.com/turbo-download-manager.html",
        licencia: "gratis",
      },
      {
        nombre: "WFDownloader",
        uso: "Descarga masiva de imágenes, videos y archivos desde galerías y sitios web.",
        url: "https://www.wfdownloader.xyz/",
        licencia: "gratis",
      },
    ],
  },
  {
    id: "utilidades",
    titulo: "Utilidades",
    apps: [
      {
        nombre: "7-Zip",
        uso: "Comprimir y descomprimir archivos (ZIP, RAR, 7z...) con muy buena tasa de compresión.",
        url: "https://www.7-zip.org/",
        licencia: "open source",
      },
      {
        nombre: "OneCommander",
        uso: "Explorador de archivos con paneles dobles y vista en columnas; reemplazo del explorador de Windows.",
        url: "https://www.onecommander.com/",
        licencia: "freemium",
      },
    ],
  },
  {
    id: "hardware",
    titulo: "Hardware & sistema",
    apps: [
      {
        nombre: "HWiNFO64",
        uso: "Monitorear temperaturas, voltajes, consumo y uso de cada componente en tiempo real.",
        url: "https://www.hwinfo.com/",
        licencia: "gratis",
      },
      {
        nombre: "CPU-Z",
        uso: "Ver los detalles de CPU, placa madre y RAM (modelo, frecuencias, timings).",
        url: "https://www.cpuid.com/softwares/cpu-z.html",
        licencia: "gratis",
      },
      {
        nombre: "CrystalDiskInfo",
        uso: "Revisar la salud y temperatura de SSDs y discos duros (datos S.M.A.R.T.).",
        url: "https://crystalmark.info/en/software/crystaldiskinfo/",
        licencia: "open source",
      },
      {
        nombre: "OCCT",
        uso: "Pruebas de estabilidad y estrés para CPU, GPU, RAM y fuente. Clave al armar un PC u overclockear.",
        url: "https://www.ocbase.com/",
        licencia: "freemium",
      },
      {
        nombre: "Alternative A2DP Driver",
        uso: "Driver Bluetooth que habilita códecs de mejor calidad (AAC, aptX, LDAC) en Windows.",
        url: "https://www.bluetoothgoodies.com/a2dp/",
        licencia: "pago",
      },
    ],
  },
];

export const TOTAL_APPS = CATEGORIAS.reduce((n, c) => n + c.apps.length, 0);
