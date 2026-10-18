import type { MetadataRoute } from "next";
import { HOTEL, ROOMS } from "@/data/hotel";

/** Pages publiques indexables (le parcours de réservation et l’espace client sont exclus). */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/chambres",
    ...ROOMS.map((r) => `/chambres/${r.slug}`),
    "/restauration",
    "/galerie",
    "/reservation",
    "/reserver",
    "/contact",
    "/faq",
    "/mentions-legales",
    "/cgv",
    "/confidentialite",
  ];
  return pages.map((p) => ({
    url: `${HOTEL.siteUrl}${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : p.startsWith("/chambres") ? 0.8 : 0.6,
  }));
}
