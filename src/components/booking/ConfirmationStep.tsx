"use client";

import Link from "next/link";
import { useEffect } from "react";
import { getRoom } from "@/data/hotel";
import { optionsSummary, priceBreakdown, STATUS_LABELS } from "@/lib/booking";
import { formatLong } from "@/lib/dates";
import { formatDZD } from "@/lib/format";
import { buttonClasses, Button } from "@/components/ui/Button";
import { FORMULA_LABELS, guestsLabel } from "./derived";
import { ConfirmationHero, DetailRows, EnjoySection, LoadingBlock, NextSteps, StatusPill, StepNotice } from "./parts";
import { PrintableBooking } from "./PrintableBooking";
import { useDraft } from "./store";

/** Demande envoyée — réservation enregistrée, en attente de confirmation (05.7). */
export function ConfirmationStep() {
  const { ready, draft } = useDraft();
  const b = draft.confirmed;

  useEffect(() => {
    if (b) document.getElementById("titre-confirmation")?.focus();
  }, [b]);

  if (!ready) return <LoadingBlock heading="Réservation enregistrée" />;
  if (!b)
    return (
      <StepNotice
        title="Aucune réservation à afficher"
        text="Cette page s’affiche à la fin d’une réservation en ligne. Vous pouvez retrouver une réservation existante dans « Gérer ma réservation »."
        href="/ma-reservation"
        label="Gérer ma réservation"
        headingLevel="h1"
      />
    );

  const room = getRoom(b.roomSlug);
  const total = priceBreakdown(b).total;

  return (
    <>
      <ConfirmationHero
        headingId="titre-confirmation"
        eyebrow={`Merci, ${b.guest.firstName}`}
        title="Votre réservation est enregistrée"
        reference={b.reference}
      >
        Un e-mail récapitulatif vient d’être envoyé à {b.guest.email}. La réception vérifie votre réservation et vous envoie sa
        confirmation sous 24 h [délai à confirmer].
      </ConfirmationHero>

      <section aria-labelledby="titre-detail" className="bg-sable-100">
        <div className="conteneur flex flex-col gap-6 py-12 lg:flex-row lg:items-start lg:gap-6 lg:py-16">
          <div className="flex min-w-0 flex-1 flex-col gap-6 bg-blanc p-6 md:p-10">
            <h2 id="titre-detail" className="t-h3 text-encre">
              Détail de votre réservation
            </h2>
            <DetailRows
              rows={[
                { label: "Statut", value: <StatusPill>{STATUS_LABELS[b.status]}</StatusPill> },
                { label: "Arrivée", value: `${formatLong(b.arrival)} · à partir de [heure à confirmer]` },
                {
                  label: "Départ",
                  value: `${formatLong(b.departure)}${
                    b.lateHours > 0 ? ` · départ tardif : ${b.lateHours} h après l’heure de check-out [à confirmer]` : ""
                  }`,
                },
                { label: "Chambre", value: `${room?.fullName ?? ""}${b.rooms > 1 ? ` × ${b.rooms}` : ""}` },
                { label: "Voyageurs", value: guestsLabel(b.adults, b.children) },
                { label: "Formule", value: FORMULA_LABELS[b.formula] },
                { label: "Options", value: optionsSummary(b) },
                { label: "Total estimé du séjour", value: <span className="t-prix text-or-700">{formatDZD(total)}</span> },
              ]}
            />
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/ma-reservation" className={buttonClasses("primaire")}>
                Gérer ma réservation
              </Link>
              <Button variant="contour-sombre" onClick={() => window.print()}>
                Imprimer / PDF
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:w-[420px] lg:shrink-0">
            <NextSteps
              steps={[
                { title: "Réservation enregistrée", text: `Référence ${b.reference} · e-mail envoyé.`, done: true },
                {
                  title: "Confirmation de l’hôtel",
                  text: "La réception vérifie la disponibilité et vous envoie la confirmation par e-mail (et par téléphone si besoin), avec les modalités de règlement.",
                },
                { title: "Votre arrivée", text: "Présentez une pièce d’identité à la réception. Adresse et accès : à renseigner." },
              ]}
            />
            <Link href="/" className="t-petit lien w-fit text-or-700">
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </section>

      <EnjoySection />
      <PrintableBooking booking={b} />
    </>
  );
}
