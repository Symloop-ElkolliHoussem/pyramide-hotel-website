import type { Metadata, Viewport } from "next";
import { Archivo, Bodoni_Moda, IBM_Plex_Mono } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HOTEL } from "@/data/hotel";
import "./globals.css";

// Police variable avec l’axe de taille optique (opsz) : contraste élevé des
// grands titres comme dans la maquette (font-optical-sizing: auto).
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(HOTEL.siteUrl),
  title: {
    default: `${HOTEL.name} — Hôtel en bord de mer à Baïnem, Alger`,
    template: `%s — ${HOTEL.name}, Baïnem (Alger)`,
  },
  description:
    "Hôtel en bord de mer à Baïnem, Alger : chambres vue sur mer ou vue sur montagne, Pyramid Restaurant panoramique au 6ᵉ étage, rooftop et salon de thé au 7ᵉ, cafétéria « Nefertiti ».",
  applicationName: HOTEL.name,
  openGraph: {
    type: "website",
    locale: "fr_DZ",
    siteName: HOTEL.name,
    images: [{ url: "/images/roof-sunset-wide.jpg", width: 1280, height: 1280, alt: "Le rooftop de l’hôtel au coucher du soleil" }],
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${bodoni.variable} ${archivo.variable} ${plexMono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenu"
          className="t-bouton sr-only z-[100] bg-or-500 px-6 py-3 text-noir-900 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Aller au contenu
        </a>
        <Header />
        <main id="contenu" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
