import { NextResponse, type NextRequest } from "next/server";
import { ROOMS } from "@/data/hotel";

/**
 * Les 7 fiches chambres sont pré-rendues. Un slug inconnu doit renvoyer un vrai
 * statut HTTP 404 : avec Cache Components, la page dynamique commencerait à
 * être diffusée (statut 200) avant que notFound() ne s’exécute. On l’intercepte
 * donc ici, avant le rendu.
 *
 * Le site n’accepte plus de règlement en ligne : les anciennes adresses de
 * l’étape de règlement et de l’envoi de justificatif sont redirigées.
 */
const ROOM_SLUGS = new Set<string>(ROOMS.map((r) => r.slug));

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/reserver/paiement" || pathname.startsWith("/reserver/paiement/")) {
    return NextResponse.redirect(new URL("/reserver/recapitulatif", request.url), 307);
  }
  if (pathname === "/ma-reservation/justificatif" || pathname.startsWith("/ma-reservation/justificatif/")) {
    return NextResponse.redirect(new URL("/ma-reservation/detail", request.url), 307);
  }
  const slug = pathname.replace(/^\/chambres\//, "").replace(/\/$/, "");
  if (!ROOM_SLUGS.has(slug)) {
    return NextResponse.rewrite(new URL("/introuvable", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/chambres/:slug", "/reserver/paiement/:path*", "/ma-reservation/justificatif/:path*"],
};
