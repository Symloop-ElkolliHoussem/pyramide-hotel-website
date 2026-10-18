"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { EXTRAS } from "@/data/hotel";
import { extraBedsNeeded, personsPerRoom } from "@/lib/availability";
import { cx, formatDZD } from "@/lib/format";
import { buttonClasses, Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Field";
import { FramedPhoto } from "@/components/ui/FramedPhoto";
import { guestsLabel, pricedDraft } from "./derived";
import { Counter, LoadingBlock, Panel, StepNotice } from "./parts";
import { StaySummary } from "./StaySummary";
import { updateDraft, useDraft } from "./store";

export const ARRIVAL_TIMES = [
  "Entre 14 h et 16 h",
  "Entre 16 h et 18 h",
  "Entre 18 h et 20 h",
  "Après 20 h (arrivée tardive)",
  "Je ne sais pas encore",
];

/** Étape 3 — Chambre et options (05.4). */
export function OptionsStep() {
  const router = useRouter();
  const { ready, draft } = useDraft();
  if (!ready) return <LoadingBlock />;
  const p = pricedDraft(draft);
  if (!p)
    return (
      <StepNotice
        title="Choisissez d’abord une chambre"
        text="Sélectionnez vos dates puis une chambre disponible pour accéder aux options."
      />
    );

  const { room } = p;
  const persons = personsPerRoom(draft.adults, draft.children, draft.rooms);
  const needed = extraBedsNeeded(room, persons) * draft.rooms;
  const maxExtra = room.extraBedAllowed ? draft.rooms : 0;
  const description = [
    room.beds.startsWith("[") ? null : room.beds,
    `${guestsLabel(draft.adults, draft.children)}${draft.extraBeds > 0 ? " avec matelas supplémentaire" : ""}`,
    room.view === "mer" ? "côté mer" : "côté montagne",
    `${formatDZD(room.price)} / nuit`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section aria-labelledby="titre-options" className="bg-sable-100">
      <div className="conteneur flex flex-col gap-8 py-12 lg:flex-row lg:items-start lg:py-16">
        <Panel className="min-w-0 flex-1 gap-7 border-0">
          <h2 id="titre-options" className="sr-only">
            Votre chambre et vos options
          </h2>
          <div className="flex flex-col gap-6 border-b border-sable-200 pb-7 sm:flex-row">
            <FramedPhoto photo={room.cardPhoto} alt="" className="h-[160px] sm:h-[140px] sm:w-[200px] sm:shrink-0" sizes="200px" />
            <div className="flex flex-col gap-1.5">
              <p className="t-surtitre text-or-700">{room.viewLabel}</p>
              <h3 className="t-carte text-encre">{room.name}</h3>
              <p className="t-petit text-doux">{description}</p>
              <Link href="/reserver/chambres" className="t-petit lien mt-1 w-fit text-or-700">
                Changer de chambre
              </Link>
            </div>
          </div>

          <fieldset className="flex min-w-0 flex-col gap-3.5">
            <legend className="t-h4 mb-3.5 font-normal text-encre">Formule</legend>
            <ChoiceCard
              type="radio"
              name="formule"
              checked={draft.formula === "chambre-seule"}
              onChange={() => updateDraft({ formula: "chambre-seule" })}
              title="Chambre seule"
              aside="Inclus"
            />
            <ChoiceCard
              type="radio"
              name="formule"
              checked={draft.formula === "petit-dejeuner"}
              onChange={() => updateDraft({ formula: "petit-dejeuner" })}
              title="Chambre et petit-déjeuner"
              text="Servi à la cafétéria « Nefertiti » [lieu et horaires à confirmer]"
              aside="+ [à confirmer] DZD / pers. / nuit"
            />
          </fieldset>

          <fieldset className="flex min-w-0 flex-col gap-3.5">
            <legend className="t-h4 mb-1.5 font-normal text-encre">Options de séjour</legend>
            <p className="t-petit mb-2 text-doux">Sous réserve de disponibilité, confirmées par la réception.</p>
            <ChoiceCard
              type="checkbox"
              checked={draft.extraBeds > 0}
              disabled={maxExtra === 0 || needed > 0}
              onChange={(v) => updateDraft({ extraBeds: v ? Math.max(1, needed) : needed })}
              title={EXTRAS.extraBed.label}
              text={
                maxExtra === 0
                  ? "Non proposé pour cette chambre."
                  : needed > 0
                    ? `${formatDZD(EXTRAS.extraBed.price)} par personne · pour le ${room.capacity + 1}ᵉ adulte de la chambre (obligatoire pour ${persons} personnes).`
                    : `${formatDZD(EXTRAS.extraBed.price)} par personne.`
              }
              aside={draft.extraBeds > 0 ? formatDZD(draft.extraBeds * EXTRAS.extraBed.price) : formatDZD(EXTRAS.extraBed.price)}
            >
              {draft.extraBeds > 0 && (
                <Counter
                  id="quantite-matelas"
                  size="sm"
                  label="Nombre de personnes"
                  value={draft.extraBeds}
                  min={Math.max(1, needed)}
                  max={Math.max(1, maxExtra)}
                  onChange={(n) => updateDraft({ extraBeds: n })}
                />
              )}
            </ChoiceCard>
            <ChoiceCard
              type="checkbox"
              checked={draft.lateHours > 0}
              onChange={(v) => updateDraft({ lateHours: v ? 2 : 0 })}
              title="Départ tardif"
              text="Heures supplémentaires après le check-out : 1 000 DZD par heure (heure de check-out à confirmer), selon disponibilité."
              aside={draft.lateHours > 0 ? formatDZD(draft.lateHours * EXTRAS.lateCheckout.price) : `${formatDZD(EXTRAS.lateCheckout.price)} / h`}
            >
              {draft.lateHours > 0 && (
                <Counter
                  id="quantite-heures"
                  size="sm"
                  label="Nombre d’heures"
                  value={draft.lateHours}
                  min={1}
                  max={EXTRAS.lateCheckout.maxHours}
                  onChange={(n) => updateDraft({ lateHours: n })}
                />
              )}
            </ChoiceCard>
            <ChoiceCard
              type="checkbox"
              checked={draft.babyCot}
              onChange={(v) => updateDraft({ babyCot: v })}
              title="Lit bébé"
              text="[conditions à confirmer]"
              aside="Sur demande"
            />
            <ChoiceCard
              type="checkbox"
              checked={draft.decoration}
              onChange={(v) => updateDraft({ decoration: v })}
              title="Décoration de la chambre (occasion spéciale)"
              text="Anniversaire, demande en mariage… [à confirmer]"
              aside="Sur demande"
            />
          </fieldset>

          <div className="flex flex-col gap-3.5">
            <h3 className="t-h4 font-normal text-encre">Votre arrivée</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <SelectField
                id="heure-arrivee"
                label="Heure d’arrivée prévue"
                value={draft.arrivalTime}
                onChange={(e) => updateDraft({ arrivalTime: e.target.value })}
              >
                {ARRIVAL_TIMES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </SelectField>
              <p className="t-petit text-doux md:pt-[26px]">
                Horaires d’arrivée et de départ : à renseigner par l’hôtel. Une arrivée tardive ? Indiquez-le à l’étape suivante.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 border border-or-500 p-5">
            <p className="t-label text-or-700">Conditions de ce tarif — à confirmer par l’hôtel</p>
            <ul className="t-petit flex flex-col gap-2 text-encre">
              <li>· Annulation : [délai d’annulation sans frais à confirmer — ex. jusqu’à 48 h avant l’arrivée].</li>
              <li>· Non-présentation : [pénalité à confirmer].</li>
            </ul>
            <Link href="/cgv" className="t-petit lien w-fit text-or-700">
              Lire les conditions d’annulation
            </Link>
          </div>

          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
            <Link href="/reserver/chambres" className={buttonClasses("contour-sombre")}>
              Retour aux chambres
            </Link>
            <Button onClick={() => router.push("/reserver/coordonnees")}>Continuer</Button>
          </div>
        </Panel>

        <StaySummary draft={draft} />
      </div>
    </section>
  );
}

function ChoiceCard({
  type,
  name,
  checked,
  disabled,
  onChange,
  title,
  text,
  aside,
  children,
}: {
  type: "radio" | "checkbox";
  name?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  title: string;
  text?: string;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const id = `choix-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div
      className={cx(
        "flex items-start gap-4 border px-5 py-[18px] transition-colors md:items-center",
        checked ? "border-or-500 bg-sable-50" : "border-sable-200 bg-blanc",
      )}
    >
      <input
        id={id}
        type={type}
        name={name}
        checked={checked}
        disabled={disabled}
        aria-describedby={text ? `${id}-texte` : undefined}
        onChange={(e) => onChange(e.target.checked)}
        className={cx(
          "mt-0.5 size-5 shrink-0 cursor-pointer appearance-none border bg-blanc md:mt-0 bg-center bg-no-repeat disabled:cursor-not-allowed",
          type === "radio"
            ? "rounded-full border-encre checked:border-or-500 checked:bg-[radial-gradient(circle,var(--color-or-500)_0_5px,transparent_5.5px)]"
            : "border-sable-400 checked:border-or-500 checked:bg-or-500 checked:bg-[url('/icons/check.svg')] checked:bg-[length:13px_13px]",
          disabled && !checked && "opacity-50",
        )}
      />
      {/* Sous 768 px : une seule colonne, le prix passe sous le texte ; au-delà il revient à droite. */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor={id} className="t-corps cursor-pointer text-encre">
            {title}
          </label>
          {text && (
            <p id={`${id}-texte`} className="t-petit text-doux">
              {text}
            </p>
          )}
          {children}
        </div>
        {aside && (
          <p className={cx("t-corps md:max-w-[45%] md:shrink-0 md:text-right", checked ? "text-or-700" : "text-doux")}>{aside}</p>
        )}
      </div>
    </div>
  );
}

export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2.5 bg-sable-50 px-4 py-3.5">
      <Image src="/icons/info.svg" alt="" width={18} height={18} unoptimized className="mt-0.5 size-[18px] shrink-0" />
      <p className="t-petit text-doux">{children}</p>
    </div>
  );
}
