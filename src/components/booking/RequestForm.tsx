"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { getRoom, ROOMS, type RoomSlug } from "@/data/hotel";
import { EMAIL_RE, isValidPhone, newReference } from "@/lib/booking";
import { isIsoDate } from "@/lib/dates";
import { formatDZD } from "@/lib/format";
import { useToday } from "@/lib/useToday";
import { Button } from "@/components/ui/Button";
import { DateRangePicker } from "@/components/ui/DatePicker";
import { CheckboxField, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { AlertBox } from "./parts";
import { saveRequest } from "./store";

type Values = {
  arrival: string;
  departure: string;
  roomSlug: string;
  adults: string;
  children: string;
  fullName: string;
  phone: string;
  email: string;
  message: string;
  consent: boolean;
};
type Errors = Partial<Record<keyof Values, string>>;

function initialValues(params: URLSearchParams): Values {
  const arrivee = params.get("arrivee");
  const depart = params.get("depart");
  const chambre = params.get("chambre");
  const adultes = Number(params.get("adultes"));
  const enfants = Number(params.get("enfants"));
  return {
    arrival: isIsoDate(arrivee) ? arrivee : "",
    departure: isIsoDate(depart) ? depart : "",
    roomSlug: chambre && getRoom(chambre) ? chambre : "",
    adults: adultes >= 1 && adultes <= 9 ? String(Math.round(adultes)) : "2",
    children: enfants >= 0 && enfants <= 6 && params.has("enfants") ? String(Math.round(enfants)) : "0",
    fullName: "",
    phone: "",
    email: "",
    message: "",
    consent: false,
  };
}

/** Formulaire « Demande de réservation » (05) — validation côté client, envoi simulé (05.9). */
export function RequestForm() {
  const params = useSearchParams();
  return <RequestFormInner key={params.toString()} initial={initialValues(params)} />;
}

function RequestFormInner({ initial }: { initial: Values }) {
  const router = useRouter();
  const today = useToday();
  const [v, setV] = useState<Values>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const [sending, setSending] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (attempt) alertRef.current?.querySelector<HTMLElement>("[role=alert]")?.focus();
  }, [attempt]);

  const set = <K extends keyof Values>(k: K, val: Values[K]) => setV((p) => ({ ...p, [k]: val }));

  function validate(): Errors {
    const e: Errors = {};
    if (!v.arrival) e.arrival = "Indiquez votre date d’arrivée.";
    else if (today && v.arrival < today) e.arrival = "La date d’arrivée est déjà passée.";
    if (!v.departure) e.departure = "Indiquez votre date de départ.";
    else if (v.arrival && v.departure <= v.arrival) e.departure = "La date de départ doit être postérieure à la date d’arrivée.";
    if (!v.roomSlug) e.roomSlug = "Choisissez un type de chambre.";
    if (!v.fullName.trim()) e.fullName = "Indiquez votre nom et prénom.";
    if (!v.phone.trim()) e.phone = "Indiquez votre numéro de téléphone.";
    else if (!isValidPhone(v.phone)) e.phone = "Numéro incomplet : 10 chiffres attendus (ex. 0550 12 34 56).";
    if (v.email.trim() && !EMAIL_RE.test(v.email.trim())) e.email = "Adresse e-mail invalide (ex. nom@domaine.com).";
    if (!v.consent) e.consent = "Vous devez accepter d’être recontacté(e) pour envoyer votre demande.";
    return e;
  }

  function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setAttempt((n) => n + 1);
      return;
    }
    setSending(true);
    saveRequest({
      reference: newReference(),
      fullName: v.fullName.trim(),
      phone: v.phone.trim(),
      email: v.email.trim(),
      arrival: v.arrival,
      departure: v.departure,
      roomSlug: v.roomSlug as RoomSlug,
      adults: Number(v.adults),
      children: Number(v.children),
      message: v.message.trim(),
    });
    router.push("/reservation/envoyee");
  }

  const count = Object.keys(errors).length;

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-6" aria-labelledby="titre-votre-sejour-form">
      <div className="flex flex-col gap-2">
        <h2 id="titre-votre-sejour-form" className="t-h3 text-encre">
          Votre séjour
        </h2>
        <p className="t-petit text-doux">Les champs marqués d’un astérisque (*) sont obligatoires.</p>
      </div>
      <div ref={alertRef}>
        {count > 0 && (
          <AlertBox title={`${count} champ${count > 1 ? "s" : ""} à corriger avant l’envoi de votre demande`}>
            Corrigez les champs signalés en rouge. Vos autres informations sont conservées.
          </AlertBox>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <DateRangePicker
          id="demande"
          labels={{ arrival: "Date d’arrivée *", departure: "Date de départ *" }}
          names={{ arrival: "arrivee", departure: "depart" }}
          arrival={v.arrival}
          departure={v.departure}
          errors={{ arrival: errors.arrival, departure: errors.departure }}
          onChange={(a, dep) => setV((p) => ({ ...p, arrival: a, departure: dep }))}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-[1fr_116px_116px]">
        <SelectField
          id="demande-chambre"
          label="Type de chambre *"
          value={v.roomSlug}
          error={errors.roomSlug}
          onChange={(e) => set("roomSlug", e.target.value)}
        >
          <option value="">Choisir une chambre</option>
          {ROOMS.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.fullName} — {formatDZD(r.price)} / nuit
            </option>
          ))}
        </SelectField>
        <SelectField id="demande-adultes" label="Adultes *" value={v.adults} onChange={(e) => set("adults", e.target.value)}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </SelectField>
        <SelectField id="demande-enfants" label="Enfants" value={v.children} onChange={(e) => set("children", e.target.value)}>
          {[0, 1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </SelectField>
      </div>

      <div className="h-px bg-sable-200" />
      <h2 className="t-h3 text-encre">Vos coordonnées</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="demande-nom"
          label="Nom et prénom *"
          autoComplete="name"
          placeholder="Votre nom complet"
          value={v.fullName}
          error={errors.fullName}
          onChange={(e) => set("fullName", e.target.value)}
        />
        <TextField
          id="demande-telephone"
          label="Téléphone *"
          type="tel"
          autoComplete="tel"
          placeholder="+213 …"
          value={v.phone}
          error={errors.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>
      <TextField
        id="demande-email"
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="vous@exemple.com"
        value={v.email}
        error={errors.email}
        onChange={(e) => set("email", e.target.value)}
      />
      <TextAreaField
        id="demande-message"
        label="Message (facultatif)"
        placeholder="Heure d’arrivée prévue, demande particulière, chambre Nuit de noces, matelas supplémentaire…"
        value={v.message}
        onChange={(e) => set("message", e.target.value)}
      />
      <CheckboxField
        id="demande-consentement"
        label="J’accepte d’être recontacté(e) par l’hôtel au sujet de cette demande. (Mention relative aux données personnelles : à renseigner.)"
        checked={v.consent}
        error={errors.consent}
        onChange={(e) => set("consent", e.target.checked)}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Button type="submit" disabled={sending} className="shrink-0">
          Envoyer la demande
        </Button>
        <p className="t-petit text-doux">Cette demande n’est pas une réservation ferme : elle doit être confirmée par l’hôtel.</p>
      </div>
    </form>
  );
}
