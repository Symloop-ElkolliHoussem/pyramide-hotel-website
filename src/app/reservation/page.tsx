import type { Metadata } from "next";
import { Suspense } from "react";
import { HelpBox, LoadingBlock } from "@/components/booking/parts";
import { RequestForm } from "@/components/booking/RequestForm";
import { OrnementPyramides } from "@/components/ui/Ornament";
import { PageBanner } from "@/components/ui/PageBanner";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EXTRAS, HOTEL, ROOMS } from "@/data/hotel";
import { formatDZD } from "@/lib/format";

export const metadata: Metadata = {
  title: "Demande de réservation",
  description: `Envoyez votre demande de réservation à l’${HOTEL.name}, Baïnem (Alger) : dates, type de chambre et coordonnées. La réception vous recontacte pour confirmer la disponibilité et le tarif.`,
  alternates: { canonical: "/reservation" },
};

const STEPS = [
  { n: "01", title: "Vous envoyez votre demande", text: "Dates, type de chambre, nombre de voyageurs et coordonnées." },
  { n: "02", title: "L’hôtel vérifie la disponibilité", text: "La réception étudie votre demande et vous recontacte." },
  { n: "03", title: "Votre séjour est confirmé", text: "Modalités de confirmation : à renseigner par l’hôtel." },
];

export default function Page() {
  return (
    <>
      <PageBanner
        photo="resto-sunset"
        size={420}
        eyebrow="Réservation"
        title="Demande de réservation"
        intro="Indiquez vos dates et vos coordonnées : l’hôtel vous recontacte pour confirmer la disponibilité et le tarif."
      />

      <section aria-label="Formulaire de demande de réservation" className="section-y bg-sable-100">
        <div className="conteneur flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-6">
          <div className="min-w-0 flex-1 border border-sable-200 bg-blanc p-6 md:p-10">
            <Suspense fallback={<LoadingBlock label="Chargement du formulaire…" />}>
              <RequestForm />
            </Suspense>
          </div>

          <aside className="flex flex-col gap-6 lg:w-[380px] lg:shrink-0">
            <section aria-labelledby="titre-rappel-tarifs" className="flex flex-col gap-4 bg-noir-900 p-6 text-clair md:p-8">
              <OrnementPyramides />
              <h2 id="titre-rappel-tarifs" className="t-h3 text-clair">
                Rappel des tarifs
              </h2>
              <dl className="flex flex-col gap-4">
                {ROOMS.map((r) => (
                  <div key={r.slug} className="t-petit flex items-start justify-between gap-4 border-t border-or-500 pt-3.5">
                    <dt className="text-clair">{r.fullName}</dt>
                    <dd className="text-right whitespace-nowrap text-or-300">{formatDZD(r.price)}</dd>
                  </div>
                ))}
                {[EXTRAS.extraBed, EXTRAS.lateCheckout].map((x) => (
                  <div key={x.label} className="t-petit flex items-start justify-between gap-4 border-t border-or-500 pt-3.5">
                    <dt className="text-clair">{x.label}</dt>
                    <dd className="text-right text-or-300">
                      {formatDZD(x.price)} {x.unit}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="t-petit text-clair-doux">
                Tarifs par chambre et par nuit, en dinars algériens (DZD). Conditions d’annulation : à renseigner par
                l’hôtel.
              </p>
            </section>
            <HelpBox className="border border-sable-200" />
          </aside>
        </div>
      </section>

      <section aria-labelledby="titre-etapes-demande" className="section-y bg-sable-50">
        <div className="conteneur flex flex-col gap-12 lg:gap-16">
          <SectionHeading id="titre-etapes-demande" eyebrow="Comment ça marche" title="Votre demande en trois étapes" />
          <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
            {STEPS.map((s) => (
              <li key={s.n} className="flex flex-col gap-3 border-t border-or-500 pt-6">
                <span aria-hidden="true" className="t-h1 text-or-700">
                  {s.n}
                </span>
                <h3 className="t-h4 text-encre">{s.title}</h3>
                <p className="t-corps text-doux">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
