import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { OrnementPyramides } from "@/components/ui/Ornament";

export const metadata: Metadata = {
  title: "Page introuvable",
  description: "La page demandée n’existe pas ou a été déplacée.",
};

const LIENS = [
  { href: "/chambres", label: "Chambres & tarifs" },
  { href: "/restauration", label: "Restauration" },
  { href: "/galerie", label: "Galerie" },
  { href: "/contact", label: "Contact" },
];

/** 09.4 — Page introuvable (404). */
export default function NotFound() {
  return (
    <section className="flex flex-col items-center gap-[22px] bg-noir-900 px-5 pt-24 pb-28 text-center md:px-10 lg:pt-[140px] lg:pb-[160px]">
      <OrnementPyramides />
      <p className="t-display text-or-500" aria-hidden="true">
        404
      </p>
      <h1 className="t-h2 max-w-[900px] text-clair">
        <span className="sr-only">Erreur 404 — </span>Cette page s’est perdue entre mer et montagne
      </h1>
      <p className="t-corps-l max-w-[720px] text-clair-doux">
        La page demandée n’existe pas ou a été déplacée. Reprenez votre visite depuis l’accueil ou réservez directement votre
        séjour.
      </p>
      <div className="flex w-full flex-col justify-center gap-4 pt-3 sm:w-auto sm:flex-row sm:gap-5">
        <ButtonLink href="/">Retour à l’accueil</ButtonLink>
        <ButtonLink href="/reserver" variant="contour-clair">
          Réserver un séjour
        </ButtonLink>
      </div>
      <nav aria-label="Pages principales" className="pt-3">
        <ul className="flex flex-wrap justify-center gap-x-7 gap-y-2">
          {LIENS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="t-petit lien text-or-300">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
