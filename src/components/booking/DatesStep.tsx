"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getRoom, type RoomSlug } from "@/data/hotel";
import { MAX_NIGHTS, MAX_PERSONS_PER_ROOM, MAX_ROOMS, personsPerRoom } from "@/lib/availability";
import { diffDays, formatShort, isIsoDate, type IsoDate } from "@/lib/dates";
import { useToday } from "@/lib/useToday";
import { Button } from "@/components/ui/Button";
import { Calendar } from "./Calendar";
import { barGuestsLabel } from "./derived";
import { AlertBox, BookingBar, Counter } from "./parts";
import { updateDraft, useDraft } from "./store";

type Errors = { messages: string[]; departure: boolean; guests: boolean };

/** Étape 1 — Dates et voyageurs (05.1) + erreurs de saisie (05.1a). */
export function DatesStep() {
  const router = useRouter();
  const params = useSearchParams();
  const today = useToday();
  const { ready, draft } = useDraft();
  const [errors, setErrors] = useState<Errors | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const applied = useRef(false);

  // Pré-remplissage depuis l’URL (?arrivee=AAAA-MM-JJ&depart=…&adultes=…&chambre=slug), une seule fois.
  useEffect(() => {
    if (!ready || applied.current) return;
    applied.current = true;
    const arrivee = params.get("arrivee");
    const depart = params.get("depart");
    const adultes = Number(params.get("adultes"));
    const enfants = Number(params.get("enfants"));
    const chambre = params.get("chambre");
    const patch: Parameters<typeof updateDraft>[0] = {};
    if (isIsoDate(arrivee)) {
      patch.arrival = arrivee;
      patch.departure = isIsoDate(depart) && depart > arrivee ? depart : null;
    }
    if (adultes >= 1 && adultes <= 9) patch.adults = Math.round(adultes);
    if (enfants >= 0 && enfants <= 6 && params.has("enfants")) patch.children = Math.round(enfants);
    if (chambre && getRoom(chambre)) patch.roomSlug = chambre as RoomSlug;
    if (Object.keys(patch).length) updateDraft(patch);
  }, [ready, params]);

  useEffect(() => {
    if (errors) alertRef.current?.querySelector<HTMLElement>("[role=alert]")?.focus();
  }, [errors]);

  const { arrival, departure, adults, children, rooms } = draft;

  function validate(): Errors | null {
    const messages: string[] = [];
    let dep = false;
    let guests = false;
    if (!arrival || !departure) {
      messages.push(!arrival ? "Choisissez votre date d’arrivée dans le calendrier." : "Choisissez votre date de départ dans le calendrier.");
      dep = Boolean(arrival);
    } else {
      if (today && arrival < today) messages.push("La date d’arrivée est déjà passée.");
      const n = diffDays(arrival, departure);
      if (n < 1) {
        messages.push("La date de départ doit être postérieure à la date d’arrivée (minimum 1 nuit).");
        dep = true;
      } else if (n > MAX_NIGHTS) {
        messages.push(`Séjour limité à ${MAX_NIGHTS} nuits en ligne [à confirmer].`);
        dep = true;
      }
    }
    if (personsPerRoom(adults, children, rooms) > MAX_PERSONS_PER_ROOM) {
      messages.push(`${MAX_PERSONS_PER_ROOM} personnes maximum par chambre : ajoutez une chambre.`);
      guests = true;
    }
    return messages.length ? { messages, departure: dep, guests } : null;
  }

  function submit() {
    const e = validate();
    setErrors(e);
    if (e) return;
    updateDraft({ roomSlug: draft.roomSlug, extraBeds: 0, confirmed: null });
    router.push("/reserver/chambres");
  }

  function select(a: IsoDate | null, d: IsoDate | null) {
    updateDraft({ arrival: a, departure: d });
    if (errors) setErrors(null);
  }

  const setGuests = (patch: Partial<{ adults: number; children: number; rooms: number }>) => {
    updateDraft(patch);
    if (errors?.guests) setErrors(null);
  };

  const checkButton = (
    <Button onClick={submit} className="w-full lg:w-auto">
      Vérifier la disponibilité
    </Button>
  );

  return (
    <section aria-labelledby="titre-choix-dates" className="bg-sable-100">
      <h2 id="titre-choix-dates" className="sr-only">
        Choix des dates et des voyageurs
      </h2>
      <div className="conteneur flex flex-col gap-6 pt-10 pb-16 lg:pt-14 lg:pb-[112px]">
        <div ref={alertRef} aria-live="assertive">
          {errors && (
            <AlertBox title="Vérifiez vos dates avant de continuer">
              <ul className="flex flex-col gap-1">
                {errors.messages.map((m) => (
                  <li key={m}>· {m}</li>
                ))}
              </ul>
            </AlertBox>
          )}
        </div>

        <BookingBar
          cells={[
            { label: "Arrivée", value: arrival ? formatShort(arrival) : "jj / mm / aaaa", active: !arrival || Boolean(departure) },
            {
              label: errors?.departure ? "Départ — date invalide" : "Départ",
              value: departure ? formatShort(departure) : errors?.departure && arrival ? formatShort(arrival) : "jj / mm / aaaa",
              active: Boolean(arrival && !departure) && !errors?.departure,
              error: errors?.departure,
            },
            { label: "Voyageurs", value: barGuestsLabel(adults, children, rooms), error: errors?.guests },
          ]}
          action={checkButton}
        />

        <div className="flex flex-col gap-6 min-[1440px]:flex-row min-[1440px]:items-start">
          <div className="min-w-0 flex-1 border border-x-0 border-sable-200 bg-blanc px-0 py-5 min-[375px]:border-x min-[375px]:px-5 md:p-8">
            <Calendar arrival={arrival} departure={departure} today={today} onSelect={select} invalid={errors?.departure} />
          </div>

          <div className="flex flex-col gap-5 border border-sable-200 bg-blanc p-6 md:p-8 min-[1440px]:w-[380px] min-[1440px]:shrink-0">
            <h3 className="t-h4 text-encre">Voyageurs et chambres</h3>
            <div className="border-t border-sable-200 pt-4">
              <Counter
                id="compteur-adultes"
                label="Adultes"
                hint="13 ans et plus [âge à confirmer]"
                value={adults}
                min={1}
                max={9}
                onChange={(n) => setGuests({ adults: n })}
              />
            </div>
            <div className="border-t border-sable-200 pt-4">
              <Counter
                id="compteur-enfants"
                label="Enfants"
                hint="Moins de 13 ans [à confirmer]"
                value={children}
                min={0}
                max={6}
                onChange={(n) => setGuests({ children: n })}
              />
            </div>
            <div className="border-t border-sable-200 pt-4">
              <Counter
                id="compteur-chambres"
                label="Chambres"
                hint="Jusqu’à 3 chambres en ligne [à confirmer]"
                value={rooms}
                min={1}
                max={MAX_ROOMS}
                onChange={(n) => setGuests({ rooms: n })}
              />
            </div>
            <div className="flex gap-2.5 bg-sable-50 px-4 py-3.5">
              <Image src="/icons/info.svg" alt="" width={18} height={18} unoptimized className="mt-0.5 size-[18px] shrink-0" />
              <p className="t-petit text-doux">
                Pour un groupe, un séminaire ou plus de 3 chambres, contactez directement la réception.
              </p>
            </div>
            <Button onClick={submit} className="w-full">
              Vérifier la disponibilité
            </Button>
            <div className="t-petit flex flex-col gap-2.5 text-or-700">
              <Link href="/contact" className="lien w-fit">
                Groupes et événements : nous contacter
              </Link>
              <Link href="/ma-reservation" className="lien w-fit">
                Déjà réservé ? Gérer ma réservation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
