"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { OrnementPyramides } from "@/components/ui/Ornament";
import { EMAIL_RE, findBooking } from "@/lib/booking";
import { Alerte } from "./Alerte";
import { openSession } from "./session";

const REF_RE = /^PYR-\d{4}-\d{5}$/i;
const MAX_ATTEMPTS = 5;

const CAN_DO = [
  "Consulter le détail et le statut de votre séjour",
  "Modifier vos dates, voyageurs ou chambre (sur demande)",
  "Télécharger votre confirmation",
  "Annuler votre réservation selon les conditions",
];

/**
 * 08.1 / 08.1a — accès à « Gérer ma réservation » (référence + e-mail).
 * MAQUETTE : la recherche se fait dans le navigateur (exemple PYR-2026-00418 /
 * karim.benali@exemple.com, ou réservations faites dans ce navigateur).
 */
export function AccessForm() {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ reference?: string; email?: string }>({});
  const [notFound, setNotFound] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const alertRef = useRef<HTMLDivElement>(null);
  const blocked = attempts >= MAX_ATTEMPTS;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (blocked) return;
    const next: typeof errors = {};
    if (!reference.trim()) next.reference = "Indiquez la référence de votre réservation.";
    else if (!REF_RE.test(reference.trim())) next.reference = "Format attendu : PYR-AAAA-NNNNN (ex. PYR-2026-00418).";
    if (!email.trim()) next.email = "Indiquez l’adresse e-mail utilisée lors de la réservation.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Adresse e-mail invalide (ex. nom@domaine.com).";
    setErrors(next);
    setNotFound(false);
    if (Object.keys(next).length) return;

    const booking = findBooking(reference, email);
    if (!booking) {
      setNotFound(true);
      setAttempts((n) => n + 1);
      requestAnimationFrame(() => alertRef.current?.focus());
      return;
    }
    openSession(booking.reference);
    router.push("/ma-reservation/detail");
  }

  return (
    <section className="bg-sable-100 px-5 pt-12 pb-20 md:px-10 lg:pt-24 lg:pb-28">
      <div className="mx-auto flex max-w-[1052px] flex-col gap-8 lg:flex-row lg:items-start">
        <form noValidate onSubmit={onSubmit} className="flex flex-1 flex-col gap-6 bg-blanc p-6 md:p-12">
          <h2 className="t-h3 text-encre">Retrouver ma réservation</h2>
          <p className="t-corps text-doux">
            Saisissez la référence indiquée dans votre e-mail de confirmation et l’adresse e-mail utilisée lors de la réservation.
          </p>

          {notFound && (
            <Alerte ref={alertRef} title={blocked ? "Accès suspendu" : "Réservation introuvable"}>
              {blocked
                ? "Trop d’essais : l’accès est suspendu 15 minutes [à confirmer]. Vous pouvez aussi contacter la réception."
                : "Aucune réservation ne correspond à cette référence et à cette adresse e-mail. Vérifiez la référence (format PYR-AAAA-NNNNN) et l’e-mail utilisé. Après 5 essais, l’accès est suspendu 15 minutes [à confirmer]."}
            </Alerte>
          )}

          <TextField
            id="acces-reference"
            label="Référence de réservation *"
            placeholder="PYR-2026-00418"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            error={errors.reference}
            inputClassName={notFound && !errors.reference && !errors.email ? "border-[1.5px]! border-erreur!" : undefined}
          />
          <TextField
            id="acces-email"
            label="E-mail *"
            type="email"
            placeholder="karim.benali@exemple.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            inputClassName={notFound && !errors.reference && !errors.email ? "border-[1.5px]! border-erreur!" : undefined}
          />
          <Button type="submit" className="w-full" disabled={blocked}>
            Accéder à ma réservation
          </Button>

          <div className="flex items-start gap-3 bg-sable-50 px-4 py-3.5">
            <Image src="/icons/mail.svg" alt="" aria-hidden="true" width={20} height={20} unoptimized className="mt-0.5 shrink-0" />
            <p className="t-petit text-doux">
              Le bouton « Gérer ma réservation » de votre e-mail vous connecte directement, sans saisir ces informations.
            </p>
          </div>
          <Link href="/contact" className="t-petit lien w-fit text-or-700">
            Référence perdue ? Contactez la réception
          </Link>
        </form>

        <aside aria-labelledby="titre-possibilites" className="flex flex-col gap-4 bg-noir-900 p-8 lg:w-[380px] lg:shrink-0">
          <OrnementPyramides />
          <h2 id="titre-possibilites" className="t-h3 text-clair">
            Ce que vous pouvez faire
          </h2>
          <ul className="flex flex-col gap-4">
            {CAN_DO.map((t) => (
              <li key={t} className="t-petit border-t border-or-500 pt-3 text-clair">
                {t}
              </li>
            ))}
          </ul>
          <Link href="/reserver" className="t-petit lien w-fit text-or-300">
            Pas encore de réservation ? Réserver
          </Link>
        </aside>
      </div>
    </section>
  );
}
