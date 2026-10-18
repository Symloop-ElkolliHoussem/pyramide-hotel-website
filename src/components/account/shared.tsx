"use client";

import { useMemo, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { OrnementPyramides } from "@/components/ui/Ornament";
import { getBookingByReference, type Booking, type Formula } from "@/lib/booking";
import { useSessionReference } from "./session";

/** Réservation ouverte dans l’espace client (MAQUETTE : lue dans le stockage du navigateur). */
export function useAccountBooking() {
  const reference = useSessionReference();
  const [version, setVersion] = useState(0);
  const booking = useMemo(
    () => (reference ? getBookingByReference(reference) : null),
    // `version` force une relecture après une mise à jour locale (annulation…).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reference, version],
  );
  return { ready: reference !== null, booking, reload: () => setVersion((v) => v + 1) };
}

export const FORMULA_LABELS: Record<Formula, string> = {
  "chambre-seule": "chambre seule",
  "petit-dejeuner": "chambre et petit-déjeuner",
};

/** « 3 adultes · 1 enfant » */
export function travellers(b: Pick<Booking, "adults" | "children">): string {
  const a = `${b.adults} adulte${b.adults > 1 ? "s" : ""}`;
  return b.children > 0 ? `${a} · ${b.children} enfant${b.children > 1 ? "s" : ""}` : a;
}

/** Écran affiché quand aucune réservation n’est ouverte dans l’espace client. */
export function NoSession() {
  return (
    <section className="bg-sable-100 px-5 py-20 md:px-10 lg:py-28">
      <div className="mx-auto flex max-w-[640px] flex-col items-center gap-5 border border-sable-200 bg-blanc px-6 py-12 text-center md:px-12">
        <OrnementPyramides />
        <h2 className="t-h3 text-encre">Aucune réservation ouverte</h2>
        <p className="t-corps text-doux">
          Pour consulter, modifier ou annuler votre séjour, retrouvez d’abord votre réservation avec sa référence et votre
          adresse e-mail.
        </p>
        <ButtonLink href="/ma-reservation">Retrouver ma réservation</ButtonLink>
      </div>
    </section>
  );
}

/** Espace réservé pendant la lecture de la session (pré-rendu). */
export function AccountLoading() {
  return (
    <section aria-busy="true" className="bg-sable-100 px-5 py-28 text-center md:px-10">
      <p className="t-corps text-doux">Chargement de votre réservation…</p>
    </section>
  );
}

/** Colonne latérale noire avec lignes « libellé / valeur » (08.3, 08.5). */
export function DarkPanel({
  title,
  rows,
  layout = "inline",
  children,
}: {
  title: string;
  rows: { label: string; value: string }[];
  layout?: "inline" | "stacked";
  children?: React.ReactNode;
}) {
  return (
    <aside aria-label={title} className="flex flex-col gap-3.5 bg-noir-900 p-8 lg:w-[380px] lg:shrink-0 lg:self-start">
      <OrnementPyramides />
      <h2 className="t-h3 text-clair">{title}</h2>
      <dl className="flex flex-col gap-3.5">
        {rows.map((r) =>
          layout === "inline" ? (
            <div key={r.label} className="t-petit flex items-start justify-between gap-4 border-t border-or-500 pt-3">
              <dt className="text-clair-doux">{r.label}</dt>
              <dd className="text-right text-clair">{r.value}</dd>
            </div>
          ) : (
            <div key={r.label} className="flex flex-col gap-1 border-t border-or-500 pt-3">
              <dt className="t-label text-clair-doux">{r.label}</dt>
              <dd className="t-petit text-clair">{r.value}</dd>
            </div>
          ),
        )}
      </dl>
      {children}
    </aside>
  );
}
