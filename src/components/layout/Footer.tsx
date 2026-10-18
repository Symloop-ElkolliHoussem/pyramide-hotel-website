import Image from "next/image";
import Link from "next/link";
import { FOOTER_NAV, FOOTER_SPACES, HOTEL, PHOTOS } from "@/data/hotel";
import { OrnementFrise } from "@/components/ui/Ornament";

/** Composant « Pied de page ». */
export function Footer() {
  return (
    <footer className="bg-noir-900 text-clair">
      <OrnementFrise />
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 pt-16 pb-12 md:grid-cols-2 md:gap-12 md:px-10 lg:grid-cols-[300px_1fr_1fr_1fr] lg:gap-16 lg:pt-20 lg:pb-16 xl:px-[120px]">
        <div className="flex flex-col gap-5">
          <Link href="/" aria-label={`${HOTEL.name} — retour à l’accueil`} className="w-fit">
            <Image src={PHOTOS.logo.src} alt="" width={148} height={148} className="size-[120px] lg:size-[148px]" />
          </Link>
          <p className="t-petit max-w-[300px] text-clair-doux">
            Un hôtel en bord de mer à Baïnem, Alger : chambres vue sur mer ou vue sur montagne, restaurant panoramique et
            rooftop.
          </p>
        </div>

        <nav aria-labelledby="pied-navigation" className="flex flex-col gap-3.5">
          <h2 id="pied-navigation" className="t-surtitre text-or-500">
            Navigation
          </h2>
          <ul className="t-petit flex flex-col pt-1.5 lg:gap-2.5">
            {FOOTER_NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block py-[11px] hover:text-or-300 hover:underline lg:py-0">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="pied-espaces" className="flex flex-col gap-3.5">
          <h2 id="pied-espaces" className="t-surtitre text-or-500">
            Nos espaces
          </h2>
          <ul className="t-petit flex flex-col pt-1.5 lg:gap-2.5">
            {FOOTER_SPACES.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block py-[11px] hover:text-or-300 hover:underline lg:py-0">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3.5">
          <h2 className="t-surtitre text-or-500">Contact</h2>
          <address className="t-petit flex flex-col gap-2.5 pt-1.5 not-italic">
            <span>{HOTEL.name}</span>
            <span>{HOTEL.locationLong}</span>
            <span>{HOTEL.address}</span>
            <span>Tél. : {HOTEL.phone}</span>
            <span>{HOTEL.email}</span>
          </address>
        </div>
      </div>

      <div className="border-t border-or-500">
        <div className="t-petit mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-6 text-clair-doux md:px-10 lg:flex-row lg:items-center lg:justify-between xl:px-[120px]">
          <p>© 2026 {HOTEL.name} — Tous droits réservés</p>
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/mentions-legales" className="inline-block min-w-11 py-[11px] text-center hover:text-or-300 hover:underline lg:py-0">
                Mentions légales
              </Link>
            </li>
            <li aria-hidden="true">·</li>
            <li>
              <Link href="/cgv" className="inline-block min-w-11 py-[11px] text-center hover:text-or-300 hover:underline lg:py-0">
                CGV
              </Link>
            </li>
            <li aria-hidden="true">·</li>
            <li>
              <Link href="/confidentialite" className="inline-block min-w-11 py-[11px] text-center hover:text-or-300 hover:underline lg:py-0">
                Confidentialité
              </Link>
            </li>
            <li aria-hidden="true">·</li>
            <li>Réseaux sociaux (liens à renseigner)</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
