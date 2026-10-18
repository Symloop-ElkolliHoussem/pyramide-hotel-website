import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomBookingBox } from "@/components/rooms/RoomBookingBox";
import { RoomCard } from "@/components/rooms/RoomCard";
import { RoomGallery } from "@/components/rooms/RoomGallery";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ListePuces } from "@/components/ui/Ornament";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EXTRAS, PHOTOS, ROOM_AMENITIES_TO_CONFIRM, ROOMS, getRoom, type Room } from "@/data/hotel";
import { formatDZD } from "@/lib/format";

// Les 7 fiches sont pré-rendues (generateStaticParams) ; un slug inconnu renvoie la 404.
// La page lit params hors <Suspense> : navigation autorisée à attendre la page pré-rendue.
export const instant = false;

export function generateStaticParams() {
  return ROOMS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/chambres/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const room = getRoom(slug);
  if (!room) return {};
  return {
    title: room.fullName,
    description: `${room.fullName} à l’Hôtel Pyramides, Baïnem (Alger) : ${room.intro} ${formatDZD(room.price)} la nuit.`,
    alternates: { canonical: `/chambres/${room.slug}` },
    openGraph: {
      title: room.fullName,
      images: [{ url: PHOTOS[room.photos[0]].src, alt: PHOTOS[room.photos[0]].alt }],
    },
  };
}

/** Libellé du fil d’Ariane (maquette : « Chambre Double — vue sur mer », « Chambre Twin »…). */
function crumbLabel(room: Room) {
  return room.slug.startsWith("double-") ? room.fullName : room.name;
}

export default async function RoomPage({ params }: PageProps<"/chambres/[slug]">) {
  const { slug } = await params;
  const room = getRoom(slug);
  if (!room) notFound();
  const related = room.related.map((s) => getRoom(s)).filter((r): r is Room => Boolean(r));
  const facts = [
    { label: "Capacité", value: room.capacityLabel },
    { label: "Lits", value: room.beds },
    { label: "Superficie", value: "[à confirmer] m²" },
    { label: "Étage", value: "[à confirmer]" },
  ];

  return (
    <>
      <div className="bg-sable-50">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Chambres & tarifs", href: "/chambres" },
            { label: crumbLabel(room) },
          ]}
        />
      </div>

      <RoomGallery room={room} />

      <section aria-labelledby="chambre-titre" className="bg-sable-50 pt-4 pb-16 lg:pb-28">
        <div className="conteneur grid items-start gap-12 lg:grid-cols-[1fr_400px] lg:gap-12">
          <div className="flex min-w-0 flex-col gap-7">
            <p className="t-surtitre text-or-700">{room.viewLabel}</p>
            <h1 id="chambre-titre" className="t-h1 text-encre">
              {room.name}
            </h1>
            <p className="t-corps-l text-doux">{room.intro}</p>
            <ListePuces items={room.features} className="text-encre" />
            <div className="h-px w-full bg-sable-200" />

            <h2 className="t-h4 text-encre">En bref</h2>
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="flex flex-col gap-1 border border-sable-200 bg-blanc px-[18px] py-4">
                  <dt className="t-label text-doux">{f.label}</dt>
                  <dd className="t-corps text-encre">{f.value}</dd>
                </div>
              ))}
            </dl>

            <h2 className="t-h4 text-encre">Équipements — liste à confirmer par l’hôtel</h2>
            <ul className="flex flex-wrap gap-2.5">
              {ROOM_AMENITIES_TO_CONFIRM.map((a) => (
                <li key={a} className="t-petit border border-sable-400 px-3.5 py-2 text-doux">
                  {a}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2 bg-sable-100 px-6 py-5">
              <h2 className="t-label text-or-700">Bon à savoir</h2>
              <ul className="t-petit flex flex-col gap-2 text-encre">
                <li>· Arrivée à partir de [heure à confirmer], départ avant [heure à confirmer].</li>
                <li>
                  · {EXTRAS.lateCheckout.label} : {formatDZD(EXTRAS.lateCheckout.price)} {EXTRAS.lateCheckout.unit}.
                </li>
                <li>
                  · {EXTRAS.extraBed.label} : {formatDZD(EXTRAS.extraBed.price)} {EXTRAS.extraBed.unit}.
                </li>
                <li>· Petit-déjeuner : formule et tarif à renseigner par l’hôtel.</li>
              </ul>
            </div>
          </div>

          <RoomBookingBox room={room} />
        </div>
      </section>

      <section aria-labelledby="autres-titre" className="section-y bg-sable-100">
        <div className="conteneur flex flex-col gap-12 lg:gap-16">
          <SectionHeading id="autres-titre" eyebrow="Nos chambres" title="Découvrez aussi" />
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <RoomCard room={r} text={r.relatedText} action={{ label: "Voir", href: `/chambres/${r.slug}` }} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
