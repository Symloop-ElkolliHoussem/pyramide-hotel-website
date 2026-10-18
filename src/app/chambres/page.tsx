import type { Metadata } from "next";
import { CtaBand } from "@/components/rooms/CtaBand";
import { PhotoPair } from "@/components/rooms/PhotoPair";
import { RoomFiche } from "@/components/rooms/RoomFiche";
import { ButtonLink } from "@/components/ui/Button";
import { ListePuces, OrnementPuce } from "@/components/ui/Ornament";
import { PageBanner } from "@/components/ui/PageBanner";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EXTRAS, ROOM_LIST_ORDER, getRoom, type Room } from "@/data/hotel";
import { formatDZD } from "@/lib/format";

export const metadata: Metadata = {
  title: "Chambres & tarifs",
  description:
    "Chambres vue sur mer (Double 12 800 DZD, Single VIP 12 800 DZD, Twin 11 600 DZD), vue sur montagne (Double 9 600 DZD, Single 8 600 DZD, Triple 10 600 DZD) et chambre Nuit de noces avec balcon (17 800 DZD) à Baïnem, Alger.",
  alternates: { canonical: "/chambres" },
};

const INFOS = [
  { title: "Arrivée et départ", text: "Horaires d’arrivée et de départ : à renseigner par l’hôtel." },
  { title: "Petit-déjeuner", text: "Formule et conditions du petit-déjeuner : à renseigner par l’hôtel." },
  { title: "Équipements", text: "Équipements et services des chambres : à renseigner par l’hôtel." },
  {
    title: "Suppléments",
    text: `${EXTRAS.extraBed.label} : ${formatDZD(EXTRAS.extraBed.price)} ${EXTRAS.extraBed.unit}. ${EXTRAS.lateCheckout.label} : ${formatDZD(EXTRAS.lateCheckout.price)} ${EXTRAS.lateCheckout.unit}.`,
  },
];

export default function ChambresPage() {
  const rooms = ROOM_LIST_ORDER.map((s) => getRoom(s)).filter((r): r is Room => Boolean(r));
  const noces = getRoom("nuit-de-noces");

  return (
    <>
      <PageBanner
        photo="ch-twin"
        size={460}
        eyebrow="Chambres & tarifs"
        title="Des chambres côté mer ou côté montagne"
        intro="Une quarantaine de chambres à Baïnem, Alger : Double, Single VIP et Twin côté mer ; Double, Single et Triple côté montagne ; chambre Nuit de noces."
      />

      <section aria-labelledby="liste-titre" className="section-y bg-sable-100">
        <div className="conteneur flex flex-col gap-10 lg:gap-12">
          <SectionHeading
            id="liste-titre"
            eyebrow="Nos chambres"
            title="Choisissez votre chambre"
            intro={`Tarifs par chambre et par nuit, en dinars algériens (DZD). ${EXTRAS.extraBed.label} : ${formatDZD(EXTRAS.extraBed.price)} ${EXTRAS.extraBed.unit} · heures supplémentaires après le check-out : ${formatDZD(EXTRAS.lateCheckout.price)} ${EXTRAS.lateCheckout.unit}.`}
            className="max-w-[820px]"
          />
          <div className="flex flex-col gap-10">
            {rooms.map((room, i) => (
              <RoomFiche key={room.slug} room={room} photoRight={i % 2 === 1} priority={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {noces && (
        <section aria-labelledby="noces-titre" className="section-y bg-noir-900">
          <div className="conteneur flex flex-col items-center gap-12 lg:flex-row lg:gap-[88px]">
            <div className="flex flex-1 flex-col gap-7">
              <SectionHeading
                tone="sombre"
                align="left"
                id="noces-titre"
                eyebrow={noces.viewLabel}
                title="Nuit de noces, face à la mer"
                intro="Une chambre vue sur mer avec balcon, décorée pour l’occasion."
              />
              <ListePuces items={noces.features} className="gap-3 text-clair" />
              <div className="flex flex-wrap items-end gap-4 pt-2">
                <div className="flex flex-col gap-1">
                  <p className="t-label text-clair-doux">La nuit</p>
                  <p className="t-h2 whitespace-nowrap text-or-300">{formatDZD(noces.price)}</p>
                </div>
                <ButtonLink href={`/chambres/${noces.slug}`}>Réserver cette chambre</ButtonLink>
              </div>
            </div>
            <PhotoPair large="noces-1" small="noces-2" smallFirst className="lg:w-[600px] lg:shrink-0" />
          </div>
        </section>
      )}

      <section aria-labelledby="infos-titre" className="section-y bg-sable-50">
        <div className="conteneur flex flex-col gap-12 lg:gap-16">
          <SectionHeading id="infos-titre" eyebrow="Informations pratiques" title="Bon à savoir" />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INFOS.map((info) => (
              <li key={info.title} className="flex flex-col gap-3.5 border border-sable-200 bg-blanc p-8">
                <OrnementPuce />
                <h3 className="t-h4 text-encre">{info.title}</h3>
                <p className="t-corps text-doux">{info.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        id="cta-chambres"
        eyebrow="Réservation"
        title="Envie de poser vos valises face à la mer ?"
        intro="Envoyez votre demande : l’hôtel vous recontacte pour confirmer la disponibilité."
        primary={{ label: "Faire une demande de réservation", href: "/reservation" }}
        secondary={{ label: "Nous contacter", href: "/contact" }}
      />
    </>
  );
}
