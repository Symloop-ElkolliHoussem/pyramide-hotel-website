"use client";

import { useSearchParams } from "next/navigation";
import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Alerte } from "@/components/account/Alerte";
import { StatusCard } from "@/components/account/StatusCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { OrnementPuce, OrnementPyramides } from "@/components/ui/Ornament";
import { PageBanner } from "@/components/ui/PageBanner";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HOTEL } from "@/data/hotel";
import { EMAIL_RE, isValidPhone } from "@/lib/booking";
import { CtaBand } from "./CtaBand";

export const CONTACT_SUBJECTS = [
  { value: "reservation", label: "Réservation" },
  { value: "devis", label: "Demande de devis — salle des fêtes" },
  { value: "restauration", label: "Restauration" },
  { value: "informations", label: "Informations sur l’hôtel" },
  { value: "autre", label: "Autre" },
] as const;

type Values = { name: string; phone: string; email: string; subject: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Indiquez votre nom et prénom.";
  if (v.phone.trim() && !isValidPhone(v.phone)) e.phone = "Numéro de téléphone invalide (ex. 0550 12 34 56 ou +213 550 12 34 56).";
  if (!v.email.trim()) e.email = "Indiquez votre adresse e-mail.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Adresse e-mail invalide.";
  if (v.message.trim().length < 10) e.message = "Écrivez votre message (10 caractères minimum).";
  return e;
}

const INFOS = [
  { title: "Accès", text: "Itinéraire et repères pour rejoindre l’hôtel : à renseigner." },
  { title: "Stationnement", text: "Possibilités de stationnement : à renseigner par l’hôtel." },
  { title: "Arrivée et départ", text: "Horaires d’arrivée et de départ : à renseigner par l’hôtel." },
  { title: "Événements", text: "Salle des fêtes au 1ᵉʳ étage. Capacité et tarifs : à renseigner." },
];

/** Lit « ?objet=devis » (dans un <Suspense>) et préremplit l’objet. */
export function ContactPageWithParams() {
  const params = useSearchParams();
  const objet = params.get("objet") ?? "";
  const initial = CONTACT_SUBJECTS.some((s) => s.value === objet) ? objet : "";
  return <ContactPage key={initial} initialSubject={initial} />;
}

/** Page 06 — Contact, avec les états 06.2 (erreurs) et 06.1 (message envoyé). Aucun envoi réel. */
export function ContactPage({ initialSubject = "" }: { initialSubject?: string }) {
  const [values, setValues] = useState<Values>({ name: "", phone: "", email: "", subject: initialSubject, message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState<Values | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  // Page masquée par <Activity> : on repart d’un formulaire vierge au retour.
  useLayoutEffect(() => () => setSent(null), []);

  const set = (k: keyof Values) => (ev: { target: { value: string } }) => {
    const next = { ...values, [k]: ev.target.value };
    setValues(next);
    if (submitted) setErrors(validate(next));
  };

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setSubmitted(true);
    const e = validate(values);
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => alertRef.current?.focus());
      return;
    }
    setSent(values);
    setValues({ name: "", phone: "", email: "", subject: initialSubject, message: "" });
    setSubmitted(false);
  }

  if (sent) {
    const subject = CONTACT_SUBJECTS.find((s) => s.value === sent.subject)?.label ?? "Message général";
    return (
      <StatusCard
        eyebrow="Contact"
        title="Merci, votre message est envoyé"
        text={`La réception de l’${HOTEL.name} vous répond par e-mail ou par téléphone dans les meilleurs délais [délai à confirmer]. Une copie de votre message vous a été envoyée.`}
        rows={[
          { label: "Objet", value: subject },
          { label: "Envoyé par", value: `${sent.name.trim()} · ${sent.email.trim()}` },
        ]}
        actions={
          <>
            <ButtonLink href="/">Retour à l’accueil</ButtonLink>
            <ButtonLink href="/faq" variant="contour-sombre">
              Questions fréquentes
            </ButtonLink>
          </>
        }
      />
    );
  }

  const count = Object.keys(errors).length;

  return (
    <>
      <PageBanner
        photo="cafe-comptoir"
        eyebrow="Contact"
        title="Contactez-nous"
        intro={`Une question, une demande particulière, un événement à organiser ? La réception de l’${HOTEL.name} vous répond.`}
      />

      <section aria-labelledby="titre-formulaire" className="section-y bg-sable-100">
        <div className="conteneur flex flex-col gap-8 lg:flex-row lg:items-stretch">
          <form
            noValidate
            onSubmit={onSubmit}
            className="flex flex-1 flex-col gap-7 border border-sable-200 bg-blanc p-6 md:p-12"
          >
            <div className="flex flex-col gap-2.5">
              <h2 id="titre-formulaire" className="t-h3 text-encre">
                Écrivez-nous
              </h2>
              <p className="t-petit text-doux">Les champs marqués d’un astérisque (*) sont obligatoires.</p>
            </div>

            {count > 0 && (
              <Alerte ref={alertRef}>
                {count} champ{count > 1 ? "s" : ""} à corriger avant l’envoi de votre message.
              </Alerte>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <TextField
                id="contact-nom"
                label="Nom et prénom *"
                placeholder="Votre nom complet"
                autoComplete="name"
                required
                value={values.name}
                onChange={set("name")}
                error={errors.name}
              />
              <TextField
                id="contact-telephone"
                label="Téléphone"
                type="tel"
                placeholder="+213 …"
                autoComplete="tel"
                value={values.phone}
                onChange={set("phone")}
                error={errors.phone}
              />
              <TextField
                id="contact-email"
                label="E-mail *"
                type="email"
                placeholder="vous@exemple.com"
                autoComplete="email"
                required
                value={values.email}
                onChange={set("email")}
                error={errors.email}
              />
              <SelectField id="contact-objet" label="Objet" value={values.subject} onChange={set("subject")}>
                <option value="">Choisir un objet</option>
                {CONTACT_SUBJECTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </SelectField>
            </div>

            <TextAreaField
              id="contact-message"
              label="Message *"
              placeholder="Votre message…"
              required
              minLength={10}
              value={values.message}
              onChange={set("message")}
              error={errors.message}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Button type="submit">Envoyer le message</Button>
              <p className="t-petit flex-1 text-doux">Mention relative aux données personnelles : à renseigner.</p>
            </div>
          </form>

          <aside
            aria-labelledby="titre-coordonnees-hotel"
            className="flex flex-col gap-[22px] bg-noir-900 p-8 md:p-10 lg:w-[420px] lg:shrink-0"
          >
            <OrnementPyramides />
            <h2 id="titre-coordonnees-hotel" className="t-h3 text-clair">
              {HOTEL.name}
            </h2>
            <dl className="flex flex-col gap-[22px]">
              {[
                {
                  label: "Adresse",
                  value: (
                    <>
                      {HOTEL.address}
                      <br />
                      {HOTEL.locationLong}
                    </>
                  ),
                },
                { label: "Téléphone", value: HOTEL.phone },
                { label: "E-mail", value: HOTEL.email },
                { label: "Réception", value: HOTEL.receptionHours },
                { label: "Réseaux sociaux", value: HOTEL.social },
              ].map((r) => (
                <div key={r.label} className="flex flex-col gap-1.5 border-t border-or-500 pt-[18px]">
                  <dt className="t-label text-or-500">{r.label}</dt>
                  <dd className="t-corps text-clair">{r.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <section aria-labelledby="titre-nous-trouver" className="section-y bg-sable-50">
        <div className="conteneur flex flex-col gap-12 lg:gap-16">
          <SectionHeading id="titre-nous-trouver" eyebrow="Nous trouver" title="Baïnem, Alger" intro="L’hôtel se situe en bord de mer, à Baïnem." />
          <div
            role="img"
            aria-label="Emplacement réservé pour la carte interactive — position exacte de l’hôtel à renseigner"
            className="flex h-[280px] flex-col items-center justify-center gap-4 border border-sable-400 bg-sable-200 px-6 text-center md:h-[440px]"
          >
            <OrnementPyramides />
            <p className="t-h4 text-encre">Carte interactive</p>
            <p className="t-petit text-doux">Emplacement réservé — position exacte de l’hôtel à renseigner</p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INFOS.map((i) => (
              <li key={i.title} className="flex flex-col gap-3.5 border border-sable-200 bg-blanc p-7">
                <OrnementPuce />
                <h3 className="t-h4 text-encre">{i.title}</h3>
                <p className="t-corps text-doux">{i.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        eyebrow="Réservation"
        title="Prêt à réserver votre séjour ?"
        intro="Envoyez votre demande en quelques instants."
        primary={{ label: "Réserver", href: "/reserver" }}
        secondary={{ label: "Questions fréquentes", href: "/faq" }}
      />
    </>
  );
}

