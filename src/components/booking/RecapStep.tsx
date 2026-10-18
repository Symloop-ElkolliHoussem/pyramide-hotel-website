"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { optionsSummary } from "@/lib/booking";
import { formatArrowRange } from "@/lib/dates";
import { formatDZD } from "@/lib/format";
import { buttonClasses, Button } from "@/components/ui/Button";
import { FORMULA_LABELS, guestsLabel, nightsLabel, pricedDraft } from "./derived";
import { finalizeBooking } from "./finalize";
import { LoadingBlock, Panel, StepNotice } from "./parts";
import { StaySummary } from "./StaySummary";
import { useDraft } from "./store";

/** Étape 5 — Récapitulatif de la demande (05.6) : aucun règlement en ligne. */
export function RecapStep() {
  const router = useRouter();
  const { ready, draft } = useDraft();
  if (!ready) return <LoadingBlock />;
  const p = pricedDraft(draft);
  if (!p || !draft.guest)
    return (
      <StepNotice
        title="Il manque des informations"
        text="Choisissez vos dates, votre chambre puis saisissez vos coordonnées avant le récapitulatif."
        href={p ? "/reserver/coordonnees" : "/reserver"}
        label={p ? "Saisir mes coordonnées" : "Choisir mes dates"}
      />
    );

  const g = draft.guest;

  function send() {
    finalizeBooking(draft);
    router.push("/reserver/confirmation");
  }

  const rows: { label: string; value: ReactNode; href?: string }[] = [
    { label: "Client", value: `${g.civility} ${g.firstName} ${g.lastName} · ${g.email} · ${g.phone}`, href: "/reserver/coordonnees" },
    {
      label: "Séjour",
      value: `${formatArrowRange(draft.arrival!, draft.departure!)} · ${nightsLabel(p.nights)} · ${guestsLabel(draft.adults, draft.children)}`,
      href: "/reserver",
    },
    {
      label: "Chambre",
      value: `${p.room.fullName}${draft.rooms > 1 ? ` × ${draft.rooms}` : ""} · ${FORMULA_LABELS[draft.formula].toLowerCase()}`,
      href: "/reserver/chambres",
    },
    { label: "Options", value: optionsSummary(draft), href: "/reserver/options" },
    {
      label: "Annulation",
      value: "[Conditions à confirmer par l’hôtel — ex. sans frais jusqu’à 48 h avant l’arrivée]",
    },
  ];

  return (
    <section aria-labelledby="titre-verification" className="bg-sable-100">
      <div className="conteneur flex flex-col gap-8 py-12 lg:flex-row lg:items-start lg:py-16">
        <Panel className="min-w-0 flex-1 gap-8 border-0">
          <div className="flex flex-col gap-2">
            <h2 id="titre-verification" className="t-h3 text-encre">
              Vérifiez votre demande
            </h2>
            <dl className="flex flex-col">
              {rows.map((r) => (
                <div key={r.label} className="flex flex-col gap-1 border-b border-sable-200 py-4 sm:flex-row sm:items-start sm:gap-6">
                  <dt className="t-label w-[140px] shrink-0 pt-0.5 text-doux">{r.label}</dt>
                  <dd className="t-corps min-w-0 flex-1 text-encre">{r.value}</dd>
                  {r.href && (
                    <Link href={r.href} className="t-petit lien w-fit shrink-0 text-or-700">
                      Modifier<span className="sr-only"> : {r.label.toLowerCase()}</span>
                    </Link>
                  )}
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 bg-sable-100 p-5">
            <span className="t-label text-encre">Total estimé du séjour</span>
            <span className="t-prix text-or-700">{formatDZD(p.breakdown.total)}</span>
          </div>

          <div className="flex items-start gap-3 border border-sable-200 bg-sable-50 px-5 py-4">
            <Image src="/icons/info.svg" alt="" width={18} height={18} unoptimized className="mt-0.5 shrink-0" />
            <p className="t-petit text-encre">
              Rien n’est à régler en ligne : la réception confirme votre demande et vous indique ensuite les modalités de règlement.
            </p>
          </div>

          <p className="t-petit text-doux">
            En envoyant votre demande, vous acceptez les{" "}
            <Link href="/cgv" className="lien text-or-700">
              conditions générales de vente
            </Link>{" "}
            et la politique d’annulation.
          </p>

          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
            <Link href="/reserver/coordonnees" className={buttonClasses("contour-sombre")}>
              Retour
            </Link>
            <Button onClick={send}>Envoyer la demande</Button>
          </div>
        </Panel>

        <StaySummary draft={draft} />
      </div>
    </section>
  );
}
