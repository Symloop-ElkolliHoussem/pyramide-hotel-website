import type { MetadataRoute } from "next";
import { HOTEL } from "@/data/hotel";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Version de test : tout est interdit aux robots. Pour la mise en ligne :
        // allow: "/", disallow: ["/ma-reservation", "/reserver/"],
        disallow: "/",
      },
    ],
    sitemap: `${HOTEL.siteUrl}/sitemap.xml`,
  };
}
