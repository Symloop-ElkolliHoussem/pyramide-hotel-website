"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { HOTEL } from "@/data/hotel";
import { EMAIL_RE, isValidPhone, type Guest } from "@/lib/booking";
import { buttonClasses, Button } from "@/components/ui/Button";
import { CheckboxField, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { pricedDraft } from "./derived";
import { InfoNote } from "./OptionsStep";
import { AlertBox, LoadingBlock, Panel, StepNotice } from "./parts";
import { StaySummary } from "./StaySummary";
import { EMPTY_GUEST, updateDraft, useDraft } from "./store";

type Field = "firstName" | "lastName" | "email" | "phone" | "occupant" | "cgv" | "privacy";
type Errors = Partial<Record<Field, string>>;

const COUNTRIES = ["Algérie", "France", "Tunisie", "Maroc", "Canada", "Belgique", "Suisse", "Espagne", "Autre pays"];
const LANGUAGES = ["Français", "العربية (arabe)", "English"];

/** Étape 4 — Vos coordonnées (05.5) et erreurs (05.5a). */
export function GuestStep() {
  const { ready, draft } = useDraft();
  if (!ready) return <LoadingBlock />;
  if (!pricedDraft(draft))
    return (
      <StepNotice
        title="Choisissez d’abord une chambre"
        text="Sélectionnez vos dates puis une chambre disponible avant de saisir vos coordonnées."
      />
    );
  return <GuestForm key="formulaire" initial={draft.guest ?? EMPTY_GUEST} accepted={Boolean(draft.guest)} />;
}

function GuestForm({ initial, accepted }: { initial: Guest; accepted: boolean }) {
  const router = useRouter();
  const { draft } = useDraft();
  const [g, setG] = useState<Guest>(initial);
  const [other, setOther] = useState(Boolean(initial.occupant));
  const [cgv, setCgv] = useState(accepted);
  const [privacy, setPrivacy] = useState(accepted);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(0);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitted) alertRef.current?.querySelector<HTMLElement>("[role=alert]")?.focus();
  }, [submitted]);

  const set = <K extends keyof Guest>(k: K, v: Guest[K]) => setG((prev) => ({ ...prev, [k]: v }));

  function validate(): Errors {
    const e: Errors = {};
    if (!g.firstName.trim()) e.firstName = "Indiquez votre prénom.";
    if (!g.lastName.trim()) e.lastName = "Indiquez votre nom.";
    if (!g.email.trim()) e.email = "Indiquez votre adresse e-mail.";
    else if (!EMAIL_RE.test(g.email.trim())) e.email = "Adresse e-mail invalide (ex. nom@domaine.com).";
    if (!g.phone.trim()) e.phone = "Indiquez votre numéro de téléphone.";
    else if (!isValidPhone(g.phone)) e.phone = "Numéro incomplet : 10 chiffres attendus.";
    if (other && !g.occupant?.trim()) e.occupant = "Indiquez le nom et le prénom de l’occupant.";
    if (!cgv) e.cgv = "Vous devez accepter les conditions générales de vente pour réserver.";
    if (!privacy) e.privacy = "Vous devez accepter l’utilisation de vos données pour réserver.";
    return e;
  }

  function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setSubmitted((n) => n + 1);
      return;
    }
    updateDraft({
      guest: {
        ...g,
        firstName: g.firstName.trim(),
        lastName: g.lastName.trim(),
        email: g.email.trim(),
        phone: g.phone.trim(),
        occupant: other ? g.occupant?.trim() : "",
      },
    });
    router.push("/reserver/recapitulatif");
  }

  const count = Object.keys(errors).length;

  return (
    <section aria-labelledby="titre-coordonnees" className="bg-sable-100">
      <div className="conteneur flex flex-col gap-8 py-12 lg:flex-row lg:items-start lg:py-16">
        <Panel className="min-w-0 flex-1 gap-6 border-0">
          <div className="flex flex-col gap-2">
            <h2 id="titre-coordonnees" className="t-h3 text-encre">
              Vos coordonnées
            </h2>
            <p className="t-petit text-doux">Les champs marqués d’un astérisque (*) sont obligatoires.</p>
          </div>

          <div ref={alertRef}>
            {count > 0 && (
              <AlertBox title={`${count} information${count > 1 ? "s" : ""} à corriger`}>
                Corrigez les champs signalés en rouge pour continuer. Vos autres informations sont conservées.
              </AlertBox>
            )}
          </div>

          <form noValidate onSubmit={submit} className="flex flex-col gap-6">
            <div className="grid gap-5 sm:grid-cols-[112px_1fr_1fr]">
              <SelectField id="civilite" label="Civilité" value={g.civility} onChange={(e) => set("civility", e.target.value)}>
                <option>M.</option>
                <option>Mme</option>
              </SelectField>
              <TextField
                id="prenom"
                label="Prénom *"
                autoComplete="given-name"
                value={g.firstName}
                error={errors.firstName}
                onChange={(e) => set("firstName", e.target.value)}
              />
              <TextField
                id="nom"
                label="Nom *"
                autoComplete="family-name"
                value={g.lastName}
                error={errors.lastName}
                onChange={(e) => set("lastName", e.target.value)}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="email"
                label="E-mail *"
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.com"
                value={g.email}
                error={errors.email}
                onChange={(e) => set("email", e.target.value)}
              />
              <TextField
                id="telephone"
                label="Téléphone *"
                type="tel"
                autoComplete="tel"
                placeholder="+213 …"
                value={g.phone}
                error={errors.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField id="pays" label="Pays de résidence" value={g.country} onChange={(e) => set("country", e.target.value)}>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </SelectField>
              <SelectField id="langue" label="Langue de correspondance" value={g.language} onChange={(e) => set("language", e.target.value)}>
                {LANGUAGES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </SelectField>
            </div>
            <CheckboxField
              id="autre-personne"
              label="Je réserve pour une autre personne (nom de l’occupant demandé ensuite)"
              checked={other}
              onChange={(e) => setOther(e.target.checked)}
            />
            {other && (
              <TextField
                id="occupant"
                label="Nom et prénom de l’occupant *"
                value={g.occupant ?? ""}
                error={errors.occupant}
                onChange={(e) => set("occupant", e.target.value)}
              />
            )}
            <TextAreaField
              id="demandes"
              label="Demandes particulières (facultatif)"
              placeholder="Arrivée tardive, étage élevé, occasion spéciale…"
              value={g.requests}
              onChange={(e) => set("requests", e.target.value)}
            />
            <InfoNote>
              À votre arrivée, la réception vous demandera une pièce d’identité (carte nationale ou passeport) pour chaque adulte.
            </InfoNote>
            <div className="h-px bg-sable-200" />
            <div className="flex flex-col gap-4">
              <CheckboxField
                id="cgv"
                label="J’accepte les conditions générales de vente et la politique d’annulation de l’hôtel. *"
                checked={cgv}
                error={errors.cgv}
                onChange={(e) => setCgv(e.target.checked)}
              />
              <CheckboxField
                id="confidentialite"
                label="J’accepte que mes données soient utilisées pour gérer ma réservation (politique de confidentialité). *"
                checked={privacy}
                error={errors.privacy}
                onChange={(e) => setPrivacy(e.target.checked)}
              />
              <CheckboxField
                id="offres"
                label={`Je souhaite recevoir les offres et actualités de l’${HOTEL.name} (facultatif).`}
                checked={Boolean(g.newsletter)}
                onChange={(e) => set("newsletter", e.target.checked)}
              />
            </div>
            <p className="t-petit flex flex-wrap gap-x-5 gap-y-2 text-or-700">
              <Link href="/cgv" className="lien" target="_blank">
                Conditions générales de vente<span className="sr-only"> (nouvel onglet)</span>
              </Link>
              <Link href="/confidentialite" className="lien" target="_blank">
                Politique de confidentialité<span className="sr-only"> (nouvel onglet)</span>
              </Link>
            </p>
            <div className="flex flex-col-reverse gap-4 pt-2 sm:flex-row sm:justify-between">
              <Link href="/reserver/options" className={buttonClasses("contour-sombre")}>
                Retour
              </Link>
              <Button type="submit">Continuer vers le récapitulatif</Button>
            </div>
          </form>
        </Panel>

        <StaySummary draft={draft} />
      </div>
    </section>
  );
}
