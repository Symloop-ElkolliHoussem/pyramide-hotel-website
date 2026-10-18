import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { CtaBand } from "@/components/rooms/CtaBand";
import { PageBanner } from "@/components/ui/PageBanner";

export const metadata: Metadata = {
  title: "Galerie photos",
  description:
    "L’Hôtel Pyramides en images : chambres vue sur mer et vue sur montagne, Pyramid Restaurant, cafétéria « Nefertiti », rooftop et chambre Nuit de noces.",
  alternates: { canonical: "/galerie" },
};

export default function GaleriePage() {
  return (
    <>
      <PageBanner
        photo="roof-fauteuil"
        size={420}
        eyebrow="Galerie"
        title="L’hôtel en images"
        intro="Chambres, restaurant panoramique, cafétéria et rooftop : un aperçu de l’Hôtel Pyramides."
      />
      <section aria-label="Photos de l’hôtel" className="section-y bg-sable-50">
        <div className="conteneur">
          <GalleryGrid />
        </div>
      </section>
      <CtaBand
        id="cta-galerie"
        eyebrow="Réservation"
        title="Venez le voir de vos propres yeux"
        intro="Envoyez votre demande de réservation, l’hôtel vous recontacte."
        primary={{ label: "Réserver", href: "/reserver" }}
        secondary={{ label: "Voir les chambres", href: "/chambres" }}
      />
    </>
  );
}
