import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { CtaBand } from "@/components/rooms/CtaBand";
import { PhotoPair } from "@/components/rooms/PhotoPair";
import { ButtonLink } from "@/components/ui/Button";
import { ListePuces } from "@/components/ui/Ornament";
import { PageBanner } from "@/components/ui/PageBanner";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PHOTOS, type PhotoKey } from "@/data/hotel";
import { cx } from "@/lib/format";

export const metadata: Metadata = {
  title: "Restauration & détente",
  description:
    "Cafétéria « Nefertiti » (Coffee & Brunch) au niveau de la réception, Pyramid Restaurant avec vue panoramique sur la mer au 6ᵉ étage, rooftop et salon de thé au 7ᵉ, salle des fêtes au 1ᵉʳ étage.",
  alternates: { canonical: "/restauration" },
};

type Venue = {
  id: string;
  tone: "clair" | "sombre";
  bg: string;
  eyebrow: string;
  title: string;
  intro: string;
  points: string[];
  todo: string;
  photos: { large: PhotoKey; small: PhotoKey; smallFirst?: boolean };
  /** Photos à gauche du texte (desktop). */
  photosLeft: boolean;
};

const VENUES: Venue[] = [
  {
    id: "cafeteria",
    tone: "clair",
    bg: "bg-sable-50",
    eyebrow: "Niveau réception",
    title: "Cafétéria « Nefertiti »",
    intro:
      "Coffee & Brunch. Au niveau de la réception, le comptoir de la Nefertiti vous accueille pour un café, une pause gourmande ou un brunch.",
    points: ["Coffee & Brunch", "Au niveau de la réception"],
    todo: "Horaires d’ouverture, carte et formules : à renseigner.",
    photos: { large: "cafe-comptoir", small: "cafe-brunch" },
    photosLeft: true,
  },
  {
    id: "restaurant",
    tone: "sombre",
    bg: "bg-noir-900",
    eyebrow: "6ᵉ étage",
    title: "Pyramid Restaurant",
    intro:
      "Au 6ᵉ étage, le restaurant de l’hôtel s’ouvre sur la mer par de grandes baies vitrées : une vue panoramique, du déjeuner jusqu’au coucher du soleil.",
    points: ["Restaurant de l’hôtel", "Vue panoramique sur la mer", "6ᵉ étage"],
    todo: "Type de cuisine, horaires de service, carte et réservation de table : à renseigner.",
    photos: { large: "resto-table", small: "resto-sunset", smallFirst: true },
    photosLeft: false,
  },
  {
    id: "rooftop",
    tone: "clair",
    bg: "bg-sable-100",
    eyebrow: "7ᵉ étage",
    title: "Rooftop, salon de thé",
    intro:
      "Tout en haut de l’hôtel, le rooftop offre une vue sur la mer d’un côté, sur la montagne de l’autre. On s’y installe à table ou dans le lounge sous la pergola.",
    points: ["Salon de thé", "Vues sur la mer et sur la montagne", "Lounge sous pergola"],
    todo: "Horaires d’ouverture, carte et conditions d’accès : à renseigner.",
    photos: { large: "roof-jour", small: "roof-fauteuil" },
    photosLeft: true,
  },
];

function VenueSection({ v }: { v: Venue }): ReactNode {
  const dark = v.tone === "sombre";
  return (
    <section id={v.id} aria-labelledby={`${v.id}-titre`} className={cx("section-y scroll-mt-4", v.bg)}>
      <div
        className={cx(
          "conteneur flex flex-col items-center gap-12 lg:gap-[88px]",
          v.photosLeft ? "lg:flex-row" : "lg:flex-row-reverse",
        )}
      >
        <PhotoPair {...v.photos} className="lg:w-[600px] lg:shrink-0" />
        <div className="flex w-full flex-1 flex-col gap-7">
          <SectionHeading
            id={`${v.id}-titre`}
            tone={v.tone}
            align="left"
            eyebrow={v.eyebrow}
            title={v.title}
            intro={v.intro}
          />
          <ListePuces items={v.points} className={cx("gap-3", dark ? "text-clair" : "text-encre")} />
          <div className={cx("flex flex-col gap-1.5 border px-[22px] py-[18px]", dark ? "border-or-500" : "border-sable-400")}>
            <p className={cx("t-label", dark ? "text-or-500" : "text-or-700")}>À compléter par l’hôtel</p>
            <p className={cx("t-petit", dark ? "text-clair-doux" : "text-doux")}>{v.todo}</p>
          </div>
          <ButtonLink href="/contact" variant={dark ? "contour-clair" : "contour-sombre"} className="self-start">
            Nous contacter
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

export default function RestaurationPage() {
  const band = PHOTOS["roof-sunset-wide"];
  return (
    <>
      <PageBanner
        photo="resto-salle"
        size={460}
        eyebrow="Restauration & détente"
        title="Du café du matin au coucher du soleil"
        intro="Cafétéria « Nefertiti », Pyramid Restaurant et rooftop : trois adresses, trois ambiances."
      />

      {VENUES.map((v) => (
        <VenueSection key={v.id} v={v} />
      ))}

      <figure className="relative isolate flex min-h-[320px] items-end overflow-hidden bg-noir-900 lg:min-h-[520px]">
        <Image src={band.src} alt={band.alt} fill sizes="100vw" className="-z-20 object-cover" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 to-black/75" />
        <figcaption className="conteneur t-citation pb-10 text-clair lg:pb-16">Le rooftop au coucher du soleil</figcaption>
      </figure>

      <CtaBand
        id="salle-des-fetes"
        background="noir-800"
        eyebrow="1ᵉʳ étage"
        title="Une salle des fêtes pour vos événements"
        intro="L’hôtel dispose d’une salle des fêtes au 1ᵉʳ étage. Capacité, prestations et tarifs : à renseigner par l’hôtel."
        primary={{ label: "Demander un devis", href: "/contact?objet=devis" }}
        secondary={{ label: "Questions fréquentes", href: "/faq" }}
      />
    </>
  );
}
