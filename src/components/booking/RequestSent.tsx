"use client";

import Link from "next/link";
import { useEffect } from "react";
import { getRoom } from "@/data/hotel";
import { extraBedsNeeded } from "@/lib/availability";
import { priceBreakdown } from "@/lib/booking";
import { formatLong } from "@/lib/dates";
import { formatDZD } from "@/lib/format";
import { buttonClasses, Button } from "@/components/ui/Button";
import { guestsLabel } from "./derived";
import { ConfirmationHero, DetailRows, EnjoySection, LoadingBlock, NextSteps, StatusPill, StepNotice } from "./parts";
import { useRequest } from "./store";

/** 05.9 — Demande de réservation envoyée (envoi simulé). */
export function RequestSent() {
  const { ready, value: r } = useRequest();

  useEffect(() => {
    if (r) document.getElementById("titre-demande-envoyee")?.focus();
  }, [r]);

  if (!ready) return <LoadingBlock heading="Demande de réservation envoyée" />;
  if (!r)
    return (
      <StepNotice
        title="Aucune demande à afficher"
        text="Cette page s’affiche après l’envoi du formulaire de demande de réservation."
        href="/reservation"
        label="Faire une demande"
        headingLevel="h1"
      />
    );

  const room = getRoom(r.roomSlug);
  const persons = r.adults + r.children;
  const extra = room && room.extraBedAllowed ? Math.min(1, extraBedsNeeded(room, persons)) : 0;
  const estimate = room
    ? priceBreakdown({ roomSlug: room.slug, arrival: r.arrival, departure: r.departure, extraBeds: extra, lateHours: 0 }).total
    : 0;
  const firstName = r.fullName.split(/\s+/)[0];

  return (
    <>
      <ConfirmationHero
        headingId="titre-demande-envoyee"
        eyebrow={`Merci, ${firstName}`}
        title="Votre demande a bien été envoyée"
        reference={r.reference}
      >
        Cette demande n’est pas encore une réservation ferme : la réception vérifie la disponibilité et le tarif, puis vous
        recontacte par téléphone ou par e-mail sous 24 h [délai à confirmer].
      </ConfirmationHero>

      <section aria-labelledby="titre-votre-demande" className="bg-sable-100">
        <div className="conteneur flex flex-col gap-6 py-12 lg:flex-row lg:items-start lg:py-16">
          <div className="flex min-w-0 flex-1 flex-col gap-6 bg-blanc p-6 md:p-10">
            <h2 id="titre-votre-demande" className="t-h3 text-encre">
              Votre demande
            </h2>
            <DetailRows
              rows={[
                { label: "Statut", value: <StatusPill>Demande en cours d’étude</StatusPill> },
                { label: "Arrivée", value: formatLong(r.arrival) },
                { label: "Départ", value: formatLong(r.departure) },
                { label: "Chambre", value: room?.fullName ?? "" },
                { label: "Voyageurs", value: guestsLabel(r.adults, r.children) },
                ...(r.message ? [{ label: "Message", value: r.message }] : []),
                {
                  label: "Tarif",
                  value: room ? (
                    <span className="t-carte text-or-700">
                      {formatDZD(room.price)} / nuit · total estimé {formatDZD(estimate)}
                    </span>
                  ) : (
                    ""
                  ),
                },
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
                {
                  title: "Vous envoyez votre demande",
                  text: `Référence ${r.reference} · accusé de réception envoyé par e-mail.`,
                  done: true,
                },
                { title: "L’hôtel vérifie la disponibilité", text: "La réception étudie votre demande et vous recontacte avec le tarif." },
                { title: "Votre séjour est confirmé", text: "Modalités de confirmation : à renseigner par l’hôtel." },
              ]}
            />
            <Link href="/" className="t-petit lien w-fit text-or-700">
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </section>
      <EnjoySection />
    </>
  );
}
