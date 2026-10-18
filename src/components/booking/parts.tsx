import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { HOTEL, PHOTOS, type PhotoKey } from "@/data/hotel";
import { buttonClasses } from "@/components/ui/Button";
import { OrnementPyramides } from "@/components/ui/Ornament";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cx } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Bandeau de réservation (actif / rempli / erreur)                    */
/* ------------------------------------------------------------------ */

export function BookingBar({
  cells,
  action,
}: {
  cells: { label: string; value: ReactNode; active?: boolean; error?: boolean }[];
  action: ReactNode;
}) {
  return (
    <div className="flex flex-col border border-or-500 bg-noir-900 lg:flex-row lg:items-center">
      {cells.map((c, i) => (
        <div key={c.label} className="contents">
          {i > 0 && <div aria-hidden="true" className="mx-6 h-px bg-or-500/60 lg:mx-0 lg:h-14 lg:w-px lg:bg-or-500" />}
          <div
            className={cx(
              "flex min-w-0 flex-1 flex-col gap-1.5 px-6 py-4 lg:px-7 lg:py-[22px]",
              c.active && "bg-noir-600",
              c.error && "bg-erreur/25",
            )}
          >
            <p className={cx("t-label", c.error ? "text-[#f0a7a3]" : "text-or-500")}>{c.label}</p>
            <p className="t-corps truncate text-clair">{c.value}</p>
          </div>
        </div>
      ))}
      <div aria-hidden="true" className="hidden h-14 w-px bg-or-500 lg:block" />
      <div className="px-5 pt-1 pb-5 lg:px-5 lg:py-0">{action}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Compteur − n +                                                      */
/* ------------------------------------------------------------------ */

export function Counter({
  label,
  hint,
  value,
  min,
  max,
  onChange,
  size = "md",
  id,
}: {
  label: string;
  hint?: ReactNode;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  size?: "md" | "sm";
  id: string;
}) {
  // Cibles tactiles de 44 px sous 1024 px ; tailles de la maquette desktop au-delà.
  const btn = size === "md" ? "size-11 lg:size-[34px]" : "size-11 lg:size-7";
  const icon = size === "md" ? 16 : 14;
  return (
    <div role="group" aria-labelledby={`${id}-libelle`} className={cx("flex items-center", size === "sm" ? "flex-wrap gap-x-2.5 gap-y-2 lg:gap-3" : "gap-3")}>
      {size === "md" ? (
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p id={`${id}-libelle`} className="t-corps text-encre">
            {label}
          </p>
          {hint && <p className="t-petit text-doux">{hint}</p>}
        </div>
      ) : (
        <p id={`${id}-libelle`} className="t-label w-full text-doux md:w-auto md:pr-0.5">
          {label}
        </p>
      )}
      <button
        type="button"
        className={cx(
          "flex shrink-0 items-center justify-center rounded-full border transition-colors",
          btn,
          value <= min ? "cursor-not-allowed border-sable-200" : "border-sable-400 hover:border-encre",
        )}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Retirer : ${label}`}
      >
        <Image src={value <= min ? "/icons/moins-inactif.svg" : "/icons/moins.svg"} alt="" width={icon} height={icon} unoptimized />
      </button>
      <output aria-live="polite" className={cx("w-7 text-center text-encre", size === "md" ? "t-corps-l" : "t-corps")}>
        {value}
      </output>
      <button
        type="button"
        className={cx(
          "flex shrink-0 items-center justify-center rounded-full border transition-colors",
          btn,
          value >= max ? "cursor-not-allowed border-sable-200 opacity-40" : "border-sable-400 hover:border-encre",
        )}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Ajouter : ${label}`}
      >
        <Image src="/icons/plus.svg" alt="" width={icon} height={icon} unoptimized />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Alerte d’erreur (05.1a, 05.5a, formulaire 05)                       */
/* ------------------------------------------------------------------ */

export function AlertBox({
  title,
  children,
  id = "alerte-erreurs",
}: {
  title: ReactNode;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      role="alert"
      tabIndex={-1}
      className="flex gap-3 border-l-[3px] border-erreur bg-erreur-fond px-5 py-4 outline-none focus-visible:outline-2 focus-visible:outline-erreur"
    >
      <Image src="/icons/alerte.svg" alt="" width={22} height={22} unoptimized className="mt-0.5 size-[22px] shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="t-h4 font-normal text-erreur">{title}</p>
        {children && <div className="t-petit text-encre">{children}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Récapitulatif « Votre séjour » (colonne noire)                      */
/* ------------------------------------------------------------------ */

export function SummaryLine({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="t-petit flex items-start gap-4 border-t border-or-500 pt-3.5">
      <dt className="min-w-0 flex-1 text-clair-doux">{label}</dt>
      <dd className="text-right text-clair">{value}</dd>
    </div>
  );
}

export function StaySummaryCard({
  rows,
  total,
  editHref = "/reserver",
}: {
  rows: { label: ReactNode; value: ReactNode }[];
  total: ReactNode;
  editHref?: string;
}) {
  return (
    <section aria-label="Votre séjour" className="flex flex-col gap-4 bg-noir-900 p-6 text-clair md:p-8">
      <OrnementPyramides />
      <h2 className="t-h3 text-clair">
        Votre séjour
      </h2>
      <dl className="flex flex-col gap-4">
        {rows.map((r, i) => (
          <SummaryLine key={i} label={r.label} value={r.value} />
        ))}
        <div className="flex items-center gap-4 border-t border-or-500 pt-3.5">
          <dt className="t-label flex-1 text-or-500">Total</dt>
          <dd className="t-prix text-right whitespace-nowrap text-or-300">{total}</dd>
        </div>
      </dl>
      <p className="t-petit text-clair-doux">Tarifs en dinars algériens (DZD). Le total définitif est confirmé par la réception.</p>
      <Link href={editHref} className="t-petit lien w-fit text-or-300">
        Modifier les dates
      </Link>
    </section>
  );
}

export function HelpBox({
  text = "La réception vous répond par téléphone ou par e-mail.",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <section aria-label="Besoin d’aide ?" className={cx("flex flex-col gap-3 bg-blanc p-6 md:p-8", className)}>
      <h2 className="t-h4 text-encre">
        Besoin d’aide ?
      </h2>
      <p className="t-petit text-doux">{text}</p>
      <p className="t-carte text-or-700">{HOTEL.phone}</p>
      <p className="t-petit text-doux">{HOTEL.email}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Étape inaccessible (brouillon incomplet)                            */
/* ------------------------------------------------------------------ */

export function StepNotice({
  title = "Votre recherche a expiré",
  text = "Les informations de votre séjour ne sont plus disponibles dans cet onglet. Recommencez votre recherche pour continuer.",
  href = "/reserver",
  label = "Choisir mes dates",
  headingLevel: H = "h2",
}: {
  title?: string;
  text?: string;
  href?: string;
  label?: string;
  /** h1 quand la notice est le seul contenu de la page (pas de bandeau). */
  headingLevel?: "h1" | "h2";
}) {
  return (
    <div className="bg-sable-100">
      <div className="conteneur py-16 lg:py-24">
        <div className="mx-auto flex max-w-[640px] flex-col items-center gap-5 border border-sable-200 bg-blanc px-6 py-12 text-center md:px-12">
          <OrnementPyramides />
          <H className="t-h3 text-encre">{title}</H>
          <p className="t-corps text-doux">{text}</p>
          <Link href={href} className={buttonClasses("primaire")}>
            {label}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function LoadingBlock({ label = "Chargement…", heading }: { label?: string; heading?: string }) {
  return (
    <div className="bg-sable-100">
      {heading && <h1 className="sr-only">{heading}</h1>}
      <div className="conteneur flex min-h-[320px] items-center justify-center py-16" role="status" aria-live="polite">
        <span className="t-petit text-doux">{label}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Confirmation (05.7, 05.9)                                           */
/* ------------------------------------------------------------------ */

export function ConfirmationHero({
  eyebrow,
  title,
  reference,
  children,
  headingId,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  reference: string;
  children: ReactNode;
  headingId?: string;
}) {
  return (
    <section className="bg-noir-900 text-clair">
      <div className="conteneur flex flex-col items-center gap-6 py-14 text-center lg:py-16">
        <Image src="/icons/ok-or.svg" alt="" width={64} height={64} unoptimized className="size-14 lg:size-16" />
        <p className="t-surtitre text-or-500">{eyebrow}</p>
        <h1 id={headingId} tabIndex={-1} className="t-h1 max-w-[1000px] text-clair outline-none">
          {title}
        </h1>
        <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border border-or-500 px-6 py-3">
          <span className="t-label text-clair-doux">Référence</span>
          <span className="t-h3 text-or-300">{reference}</span>
        </p>
        <p className="t-corps-l max-w-[800px] text-clair">{children}</p>
      </div>
    </section>
  );
}

export function DetailRows({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="flex flex-col">
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex flex-col gap-1 border-b border-sable-200 py-3.5 sm:flex-row sm:items-baseline sm:gap-6"
        >
          <dt className="t-label w-[140px] shrink-0 text-doux">{r.label}</dt>
          <dd className="t-corps min-w-0 flex-1 text-encre">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StatusPill({ children }: { children: ReactNode }) {
  return <span className="t-label inline-block bg-sable-100 px-2.5 py-1 text-or-700">{children}</span>;
}

export function NextSteps({ steps }: { steps: { title: string; text: string; done?: boolean }[] }) {
  return (
    <section aria-label="Et maintenant ?" className="flex flex-col gap-5 bg-noir-900 p-6 text-clair md:p-8">
      <OrnementPyramides />
      <h2 className="t-h3 text-clair">
        Et maintenant ?
      </h2>
      <ol className="flex flex-col gap-5">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-3">
            <span
              aria-hidden="true"
              className={cx(
                "flex size-6 shrink-0 items-center justify-center rounded-full",
                s.done ? "bg-or-500" : "border border-or-500",
              )}
            >
              {s.done ? (
                <Image src="/icons/check.svg" alt="" width={13} height={13} unoptimized />
              ) : (
                <span className="t-label text-[0.625rem] text-or-300">{i + 1}</span>
              )}
            </span>
            <div className="flex flex-col gap-1">
              <p className="t-corps text-clair">
                {s.title}
                {s.done && <span className="sr-only"> (fait)</span>}
              </p>
              <p className="t-petit text-clair-doux">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

const STAY_SPACES: { photo: PhotoKey; floor: string; name: string; text: string; href: string }[] = [
  {
    photo: "cafe-comptoir",
    floor: "Niveau réception",
    name: "Cafétéria « Nefertiti »",
    text: "Coffee & Brunch, au niveau de la réception.",
    href: "/restauration#cafeteria",
  },
  {
    photo: "resto-table",
    floor: "6ᵉ étage",
    name: "Pyramid Restaurant",
    text: "Le restaurant de l’hôtel, avec vue panoramique sur la mer.",
    href: "/restauration#restaurant",
  },
  {
    photo: "roof-jour",
    floor: "7ᵉ étage",
    name: "Rooftop, salon de thé",
    text: "Salon de thé, lounge sous pergola, vues mer et montagne.",
    href: "/restauration#rooftop",
  },
];

/** « Pendant votre séjour — Profitez de l’hôtel » (05.7, 05.9). */
export function EnjoySection() {
  return (
    <section className="section-y bg-sable-50">
      <div className="conteneur flex flex-col gap-12 lg:gap-16">
        <SectionHeading eyebrow="Pendant votre séjour" title="Profitez de l’hôtel" />
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {STAY_SPACES.map((s) => (
            <li key={s.name} className="flex flex-col border border-sable-200 bg-blanc">
              <div className="relative h-[220px] lg:h-[260px]">
                <Image
                  src={PHOTOS[s.photo].src}
                  alt={PHOTOS[s.photo].alt}
                  fill
                  sizes="(min-width: 1280px) 384px, (min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-6">
                <p className="t-surtitre text-or-700">{s.floor}</p>
                <h3 className="t-carte text-encre">{s.name}</h3>
                <p className="t-petit flex-1 text-doux">{s.text}</p>
                <Link href={s.href} className="t-petit lien w-fit text-or-700">
                  Découvrir<span className="sr-only"> : {s.name}</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Carte blanche de contenu (colonne principale des étapes). */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("flex flex-col border border-sable-200 bg-blanc p-6 md:p-10 lg:p-12", className)}>{children}</div>;
}
