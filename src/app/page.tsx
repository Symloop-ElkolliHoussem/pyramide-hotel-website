import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookingBar } from "@/components/home/BookingBar";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { RoomCard } from "@/components/rooms/RoomCard";
import { ButtonLink } from "@/components/ui/Button";
import { FramedPhoto } from "@/components/ui/FramedPhoto";
import { ListePuces, OrnementPyramides } from "@/components/ui/Ornament";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HERO_SLIDES, HOME_ROOMS, HOTEL, PHOTOS, ROOMS, SPACES, getRoom } from "@/data/hotel";
import { formatDZD } from "@/lib/format";

export const metadata: Metadata = {
  title: { absolute: `${HOTEL.name} — Hôtel en bord de mer à Baïnem, Alger` },
  description:
    "Entre mer et montagne, l’art de recevoir : chambres vue sur mer ou vue sur montagne dès 8 600 DZD la nuit, Pyramid Restaurant panoramique au 6ᵉ étage, rooftop et salon de thé au 7ᵉ, à Baïnem (Alger).",
  alternates: { canonical: "/" },
};

const noces = getRoom("nuit-de-noces")!;

const prices = ROOMS.map((r) => r.price);
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  name: HOTEL.name,
  description:
    "Hôtel en bord de mer à Baïnem, Alger : chambres vue sur mer ou vue sur montagne, restaurant panoramique au 6ᵉ étage et rooftop au 7ᵉ.",
  url: HOTEL.siteUrl,
  image: `${HOTEL.siteUrl}${PHOTOS["roof-sunset-wide"].src}`,
  address: { "@type": "PostalAddress", addressLocality: "Baïnem, Alger", addressCountry: "DZ" },
  priceRange: `${formatDZD(Math.min(...prices))} – ${formatDZD(Math.max(...prices))}`,
  currenciesAccepted: "DZD",
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* 01 · Hero (carrousel en fond, contenu et bandeau de réservation fixes) */}
      <section aria-labelledby="titre-accueil">
        <HeroCarousel slides={HERO_SLIDES} bar={<BookingBar />}>
          <div className="flex w-full max-w-[960px] flex-col items-center gap-6 text-center lg:gap-7 lg:[@media(max-height:820px)]:gap-4">
            <OrnementPyramides className="lg:[@media(max-height:820px)]:hidden" />
            <p className="t-surtitre text-or-300">Baïnem · Alger — en bord de mer</p>
            <h1 id="titre-accueil" className="t-display text-clair">
              Entre mer et montagne, <br className="hidden sm:inline" />
              l’art de recevoir
            </h1>
            <p className="t-corps-l max-w-[720px] text-clair">
              Chambres vue sur mer ou vue sur montagne, restaurant panoramique au 6ᵉ étage et rooftop au 7ᵉ : bienvenue à
              l’{HOTEL.name}.
            </p>
            <div className="flex flex-col gap-4 pt-3 sm:flex-row sm:gap-5">
              <ButtonLink href="/reserver">Réserver</ButtonLink>
              <ButtonLink href="/chambres" variant="contour-clair">
                Découvrir les chambres
              </ButtonLink>
            </div>
          </div>
        </HeroCarousel>
      </section>

      {/* Présentation */}
      <section aria-labelledby="titre-bienvenue" className="sur-clair bg-sable-50 section-y">
        <div className="conteneur flex flex-col items-center gap-14 xl:flex-row xl:gap-20">
          <div className="flex flex-1 flex-col items-start gap-9">
            <SectionHeading
              align="left"
              id="titre-bienvenue"
              eyebrow="Bienvenue"
              title="Un hôtel de bord de mer, tourné vers la mer et la montagne"
              intro={`À Baïnem, Alger, l’${HOTEL.name} vous accueille dans une quarantaine de chambres, côté mer ou côté montagne. Sur place : la cafétéria « Nefertiti » au niveau de la réception, le Pyramid Restaurant et sa vue panoramique au 6ᵉ étage, puis le rooftop et son salon de thé au 7ᵉ.`}
            />
            <dl className="grid w-full grid-cols-3 gap-3 sm:gap-10">
              {[
                [HOTEL.roomCount, "chambres"],
                ["6ᵉ", "restaurant panoramique"],
                ["7ᵉ", "rooftop, salon de thé"],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col-reverse gap-1 border-l border-or-500 pl-3 sm:pl-5">
                  <dt className="t-petit text-doux">{label}</dt>
                  <dd className="t-h2 whitespace-nowrap text-or-700">{value}</dd>
                </div>
              ))}
            </dl>
            <ButtonLink href="/galerie" variant="contour-sombre">
              Découvrir l’hôtel en images
            </ButtonLink>
          </div>
          <div className="flex w-full max-w-[584px] shrink-0 items-start gap-4 sm:gap-6 lg:w-auto">
            <FramedPhoto
              photo="resto-table"
              inset={14}
              className="aspect-[300/440] w-[52%] lg:w-[300px]"
              sizes="(min-width: 1024px) 300px, 52vw"
            />
            <div className="w-[44%] pt-16 lg:w-[260px] lg:pt-[88px]">
              <FramedPhoto
                photo="roof-montagne"
                inset={14}
                className="aspect-[260/400] w-full"
                sizes="(min-width: 1024px) 260px, 44vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Aperçu des chambres */}
      <section aria-labelledby="titre-chambres" className="sur-clair bg-sable-100 section-y">
        <div className="conteneur flex flex-col items-center gap-12 lg:gap-16">
          <SectionHeading
            id="titre-chambres"
            eyebrow="Chambres & tarifs"
            title="Nos chambres"
            intro="Vue sur mer ou vue sur montagne, lits jumeaux, grand lit ou triple : choisissez la chambre qui vous ressemble."
          />
          <ul className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3">
            {HOME_ROOMS.map((slug) => {
              const room = getRoom(slug)!;
              return (
                <li key={slug}>
                  <RoomCard room={room} />
                </li>
              );
            })}
          </ul>
          <ButtonLink href="/chambres" variant="contour-sombre">
            Voir toutes les chambres et tarifs
          </ButtonLink>
        </div>
      </section>

      {/* Nos espaces */}
      <section aria-labelledby="titre-espaces" className="bg-noir-900 section-y">
        <div className="conteneur flex flex-col items-center gap-12 lg:gap-16">
          <SectionHeading
            tone="sombre"
            id="titre-espaces"
            eyebrow="Restauration & détente"
            title="Trois adresses sous un même toit"
            intro="Du premier café au coucher du soleil, chaque étage a son ambiance."
            className="max-w-[820px]"
          />
          <ul className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SPACES.map((s) => (
              <li key={s.id}>
                <Link
                  href={s.href}
                  className="group relative isolate flex h-[420px] flex-col overflow-hidden p-3.5 lg:h-[560px]"
                >
                  <Image
                    src={PHOTOS[s.photo].src}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="-z-20 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-black/5 to-black/90" />
                  <div className="flex flex-1 flex-col justify-end gap-2.5 border border-or-300 p-6 lg:p-7">
                    <p className="t-surtitre text-or-300">{s.floor}</p>
                    <h3 className="t-h3 text-clair">{s.name}</h3>
                    <p className="t-corps text-clair">{s.text}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex w-full flex-col gap-6 border border-or-500 px-6 py-7 md:flex-row md:items-center md:gap-8 md:px-9">
            <div className="flex flex-1 flex-col gap-1.5">
              <p className="t-surtitre text-or-500">1ᵉʳ étage</p>
              <p className="t-h4 text-clair">Une salle des fêtes pour vos réceptions et événements</p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
              <ButtonLink href="/contact?objet=devis" variant="contour-clair">
                Nous contacter
              </ButtonLink>
              <ButtonLink href="/restauration">Découvrir la restauration</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Offre Nuit de noces */}
      <section aria-labelledby="titre-noces" className="sur-clair bg-sable-50 section-y">
        <div className="conteneur flex flex-col gap-14 lg:flex-row lg:items-center lg:gap-[88px]">
          <div className="flex items-end gap-4 sm:gap-5">
            <FramedPhoto
              photo="noces-1"
              inset={14}
              className="aspect-[380/520] w-[64%] lg:w-[380px]"
              sizes="(min-width: 1024px) 380px, 64vw"
            />
            <FramedPhoto
              photo="noces-2"
              inset={14}
              className="aspect-[200/280] w-[34%] lg:w-[200px]"
              sizes="(min-width: 1024px) 200px, 34vw"
            />
          </div>
          <div className="flex flex-1 flex-col items-start gap-7">
            <SectionHeading
              align="left"
              id="titre-noces"
              eyebrow={noces.viewLabel}
              title="Nuit de noces, face à la mer"
              intro="Une chambre vue sur mer avec balcon, décorée pour l’occasion, pour commencer votre vie à deux les yeux sur l’horizon."
            />
            <ListePuces items={noces.features} itemClassName="text-encre" />
            <div className="flex flex-wrap items-end gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <p className="t-label text-doux">La nuit</p>
                <p className="t-h2 whitespace-nowrap text-or-700">{formatDZD(noces.price)}</p>
              </div>
              <ButtonLink href={`/chambres/${noces.slug}`}>Réserver cette chambre</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Aperçu galerie */}
      <section aria-labelledby="titre-galerie" className="bg-noir-800 section-y">
        <div className="conteneur flex flex-col gap-10 lg:gap-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex max-w-[640px] flex-col gap-5">
              <p className="t-surtitre text-or-500">Galerie</p>
              <h2 id="titre-galerie" className="t-h2 text-clair">
                L’hôtel en images
              </h2>
            </div>
            <ButtonLink href="/galerie" variant="contour-clair" className="self-start md:self-auto">
              Voir toute la galerie
            </ButtonLink>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:flex">
            {(
              [
                ["resto-sunset", "col-span-2 lg:flex-1"],
                ["ch-mont-1", "lg:w-[280px] lg:shrink-0"],
                ["roof-fauteuil", "lg:w-[360px] lg:shrink-0"],
              ] as const
            ).map(([photo, cls]) => (
              <Link
                key={photo}
                href="/galerie"
                className={`relative block h-[240px] overflow-hidden md:h-[320px] lg:h-[400px] ${cls}`}
                aria-label={`${PHOTOS[photo].alt} — voir la galerie`}
              >
                <Image
                  src={PHOTOS[photo].src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 40vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Localisation et contact */}
      <section aria-labelledby="titre-localisation" className="sur-clair bg-sable-100 section-y">
        <div className="conteneur flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
          <div className="flex flex-1 flex-col items-start gap-8">
            <SectionHeading
              align="left"
              id="titre-localisation"
              eyebrow="Nous trouver"
              title="Baïnem, Alger"
              intro="L’hôtel se situe en bord de mer, à Baïnem. Une question, une demande particulière ? Écrivez-nous ou appelez la réception."
            />
            <dl className="flex w-full flex-col gap-4">
              {[
                ["Adresse", `${HOTEL.address} — Baïnem, Alger, Algérie`],
                ["Téléphone", HOTEL.phone],
                ["E-mail", HOTEL.email],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1 sm:flex-row sm:gap-6">
                  <dt className="t-label w-[120px] shrink-0 pt-1 text-or-700">{label}</dt>
                  <dd className="t-corps text-encre">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
              <ButtonLink href="/contact" variant="noir">
                Contactez-nous
              </ButtonLink>
              <ButtonLink href="/faq" variant="contour-sombre">
                Questions fréquentes
              </ButtonLink>
            </div>
          </div>
          <div
            role="img"
            aria-label="Carte interactive : emplacement réservé, position exacte de l’hôtel à renseigner"
            className="flex h-[300px] w-full flex-col items-center justify-center gap-4 border border-sable-400 bg-sable-200 px-6 text-center lg:h-[420px] lg:w-[540px] lg:shrink-0"
          >
            <OrnementPyramides />
            <p className="t-h4 text-encre">Carte interactive</p>
            <p className="t-petit text-doux">
              Emplacement réservé — Baïnem, Alger
              <br />
              (position exacte à renseigner)
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
