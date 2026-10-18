"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DateRangePicker } from "@/components/ui/DatePicker";
import { ErrorSummary, SelectField, TextAreaField } from "@/components/ui/Field";
import { PageBanner } from "@/components/ui/PageBanner";
import { getRoom, ROOMS, type RoomSlug } from "@/data/hotel";
import { priceBreakdown, STATUS_LABELS, type Booking } from "@/lib/booking";
import { diffDays, formatMixed, formatShort, formatStayTitle, isIsoDate, type IsoDate } from "@/lib/dates";
import { cx, formatDZD } from "@/lib/format";
import { useToday } from "@/lib/useToday";
import { AccountLoading, DarkPanel, NoSession, travellers, useAccountBooking } from "./shared";
import { StatusCard } from "./StatusCard";

/** MAQUETTE : nuits complètes de l’exemple 05.3a (l’hôtel affiche complet du 30 octobre au 1ᵉʳ novembre 2026). */
const FULL_NIGHTS: IsoDate[] = ["2026-10-30", "2026-10-31"];
const MAX_NIGHTS = 30;

/** 08.3 « Modifier mon séjour » → 08.3a « Demande de modification envoyée ». */
export function ModifyPage() {
  const { ready, booking } = useAccountBooking();
  if (!ready) return <AccountLoading />;
  if (!booking || booking.status === "annulee")
    return (
      <>
        <PageBanner photo="resto-salle" size={300} eyebrow="Espace client" title="Modifier mon séjour" />
        <NoSession />
      </>
    );
  return <ModifyForm booking={booking} />;
}

type Sent = { arrival: IsoDate; departure: IsoDate; adults: number; roomSlug: RoomSlug; total: number; diff: number };

function maxGuests(slug: RoomSlug) {
  const r = getRoom(slug);
  return r ? r.capacity + (r.extraBedAllowed ? 1 : 0) : 1;
}

function ModifyForm({ booking }: { booking: Booking }) {
  const today = useToday();
  const [arrival, setArrival] = useState<IsoDate>(booking.arrival);
  const [departure, setDeparture] = useState<IsoDate>(booking.departure);
  const [adults, setAdults] = useState(booking.adults);
  const [children, setChildren] = useState(booking.children);
  const [roomSlug, setRoomSlug] = useState<RoomSlug>(booking.roomSlug);
  const [message, setMessage] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const current = priceBreakdown(booking);
  const room = getRoom(roomSlug);
  const datesOk = isIsoDate(arrival) && isIsoDate(departure) && diffDays(arrival, departure) >= 1;
  const nights = datesOk ? diffDays(arrival, departure) : 0;
  const capacity = room?.capacity ?? 1;
  const extraBeds = room?.extraBedAllowed ? Math.max(0, adults - capacity) : 0;
  const next = datesOk
    ? priceBreakdown({ roomSlug, arrival, departure, extraBeds, lateHours: booking.lateHours })
    : null;
  const diff = next ? next.total - current.total : 0;
  const fullNight = datesOk ? FULL_NIGHTS.find((n) => n >= arrival && n < departure) : undefined;

  const errors: { arrival?: string; departure?: string; adults?: string } = {};
  if (!isIsoDate(arrival)) errors.arrival = "Indiquez une date d’arrivée valide.";
  else if (today && arrival < today) errors.arrival = "La date d’arrivée est déjà passée.";
  if (!isIsoDate(departure)) errors.departure = "Indiquez une date de départ valide.";
  else if (isIsoDate(arrival) && diffDays(arrival, departure) < 1)
    errors.departure = "La date de départ doit être postérieure à la date d’arrivée (minimum 1 nuit).";
  else if (nights > MAX_NIGHTS) errors.departure = `Séjour limité à ${MAX_NIGHTS} nuits en ligne [à confirmer].`;
  if (adults > maxGuests(roomSlug))
    errors.adults = `${maxGuests(roomSlug)} adulte${maxGuests(roomSlug) > 1 ? "s" : ""} maximum dans cette chambre : choisissez une autre chambre.`;
  const errorCount = Object.keys(errors).length;
  const unchanged =
    arrival === booking.arrival && departure === booking.departure && adults === booking.adults && children === booking.children && roomSlug === booking.roomSlug;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowErrors(true);
    if (errorCount || fullNight || !next || unchanged) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSent({ arrival, departure, adults, roomSlug, total: next.total, diff });
  }

  if (sent) {
    const r = getRoom(sent.roomSlug);
    const n = diffDays(sent.arrival, sent.departure);
    const sign = sent.diff > 0 ? "+ " : sent.diff < 0 ? "− " : "";
    return (
      <StatusCard
        eyebrow={booking.reference}
        title="Votre demande de modification est envoyée"
        text="La réception étudie votre demande et vous répond par e-mail sous 24 h [délai à confirmer]. En attendant, votre réservation actuelle reste valable."
        rows={[
          {
            label: "Séjour demandé",
            value: `du ${formatShort(sent.arrival, false).split(" ").slice(0, 2).join(" ")} au ${formatMixed(sent.departure)} · ${n} nuit${n > 1 ? "s" : ""}`,
          },
          { label: "Chambre", value: `${r?.shortName} · ${travellers({ adults: sent.adults, children })}` },
          {
            label: "Nouveau total estimé",
            value: `${formatDZD(sent.total)}${sent.diff ? ` (${sign}${formatDZD(Math.abs(sent.diff))})` : ""}`,
          },
          { label: "Statut", value: "Modification en attente de confirmation" },
        ]}
        actions={<ButtonLink href="/ma-reservation/detail">Retour à ma réservation</ButtonLink>}
        footer={
          <Link href="/" className="t-petit lien text-or-700">
            Retour à l’accueil
          </Link>
        }
      />
    );
  }

  const visibleErrors = showErrors ? errors : {};

  return (
    <>
      <PageBanner photo="resto-salle" size={300} eyebrow={`Espace client · ${booking.reference}`} title="Modifier mon séjour" />
      <section className="bg-sable-100 px-5 pt-10 pb-20 md:px-10 lg:pt-16 lg:pb-28 xl:px-[120px]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8 lg:flex-row lg:items-start">
          <form noValidate onSubmit={onSubmit} className="flex min-w-0 flex-1 flex-col gap-6 bg-blanc p-6 md:p-12">
            <div className="flex flex-col gap-2.5">
              <h2 className="t-h3 text-encre">Votre demande de modification</h2>
              <p className="t-petit text-doux">
                Modifiez uniquement ce qui change. La réception confirme la modification ; votre réservation actuelle reste valable
                en attendant.
              </p>
            </div>

            {showErrors && (errorCount > 0 || fullNight || unchanged) && (
              <div ref={summaryRef} tabIndex={-1} className="outline-none">
                <ErrorSummary
                  id="modification-erreurs"
                  title={
                    errorCount > 0
                      ? `${errorCount} information${errorCount > 1 ? "s" : ""} à corriger`
                      : unchanged
                        ? "Aucune modification à envoyer"
                        : "Ces dates ne sont pas disponibles"
                  }
                >
                  {errorCount > 0
                    ? "Corrigez les champs signalés en rouge pour envoyer votre demande."
                    : unchanged
                      ? "Modifiez au moins une information (dates, voyageurs ou chambre)."
                      : "Choisissez d’autres dates ou écrivez à la réception."}
                </ErrorSummary>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <DateRangePicker
                id="modif"
                markFull
                labels={{ arrival: "Arrivée", departure: "Nouveau départ" }}
                arrival={arrival}
                departure={departure}
                errors={{ arrival: visibleErrors.arrival, departure: visibleErrors.departure }}
                onChange={(a, d) => {
                  setArrival(a);
                  setDeparture(d);
                }}
                departureTriggerClassName={
                  departure !== booking.departure && !visibleErrors.departure ? "border-[1.5px]! border-or-500!" : undefined
                }
              />
              <SelectField
                id="modif-adultes"
                label="Adultes"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                error={visibleErrors.adults}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </SelectField>
              <SelectField id="modif-enfants" label="Enfants" value={children} onChange={(e) => setChildren(Number(e.target.value))}>
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </SelectField>
            </div>
            <SelectField id="modif-chambre" label="Chambre" value={roomSlug} onChange={(e) => setRoomSlug(e.target.value as RoomSlug)}>
              {ROOMS.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.fullName}
                </option>
              ))}
            </SelectField>

            {next && !errorCount && (
              <p
                role="status"
                className={cx(
                  "t-petit flex items-center gap-3 px-[18px] py-3.5",
                  fullNight ? "bg-erreur-fond text-erreur" : "bg-succes-fond text-succes",
                )}
              >
                {!fullNight && <Image src="/icons/ok-moyen.svg" alt="" aria-hidden="true" width={20} height={20} unoptimized />}
                {fullNight
                  ? "Indisponible : l’hôtel affiche complet du 30 octobre au 1ᵉʳ novembre 2026 [exemple]. Choisissez d’autres dates ou contactez la réception."
                  : `Disponible : ${nights} nuit${nights > 1 ? "s" : ""} ${formatStayTitle(arrival, departure)} ${
                      roomSlug === booking.roomSlug ? "dans la même chambre" : `en ${room?.fullName}`
                    }.`}
              </p>
            )}

            {next && (
              <div className="flex flex-col gap-4 border border-sable-200 p-5 sm:flex-row sm:items-center">
                <div className="flex flex-col gap-1 text-doux">
                  <p className="t-label">Réservation actuelle</p>
                  <p className="t-corps line-through">
                    {current.nights} nuit{current.nights > 1 ? "s" : ""} · {formatDZD(current.total)}
                  </p>
                </div>
                <Image
                  src="/icons/fleche-or.svg"
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  unoptimized
                  className="rotate-90 sm:rotate-0"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <p className="t-label text-or-700">Après modification</p>
                  <p className="t-carte text-encre">
                    {next.nights} nuit{next.nights > 1 ? "s" : ""} · {formatDZD(next.total)}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="t-label text-doux">Différence</p>
                  <p className="t-corps text-or-700">
                    {diff > 0 ? `+ ${formatDZD(diff)} à l’hôtel` : diff < 0 ? `− ${formatDZD(-diff)} [selon conditions]` : unchanged ? "Aucun changement" : "Sans différence de prix"}
                  </p>
                </div>
              </div>
            )}

            <TextAreaField
              id="modif-message"
              label="Message à la réception (facultatif)"
              placeholder="Précisez votre demande…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="flex items-start gap-2.5 bg-sable-50 px-4 py-3.5">
              <Image src="/icons/info-doux.svg" alt="" aria-hidden="true" width={18} height={18} unoptimized className="mt-0.5 shrink-0" />
              <p className="t-petit text-doux">
                Conditions de modification : [à confirmer par l’hôtel — ex. gratuite jusqu’à 48 h avant l’arrivée, selon
                disponibilité]. Une réduction de séjour peut entraîner des frais selon les conditions d’annulation.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
              <ButtonLink href="/ma-reservation/detail" variant="contour-sombre">
                Annuler la modification
              </ButtonLink>
              <Button type="submit">
                Envoyer la demande
              </Button>
            </div>
          </form>

          <DarkPanel
            title="Réservation actuelle"
            rows={[
              { label: "Référence", value: booking.reference },
              { label: "Statut", value: booking.status === "confirmee" ? "Confirmée" : STATUS_LABELS[booking.status] },
              { label: "Arrivée", value: formatShort(booking.arrival) },
              { label: "Départ", value: formatShort(booking.departure) },
              { label: "Chambre", value: getRoom(booking.roomSlug)?.shortName ?? "—" },
              { label: "Voyageurs", value: travellers(booking) },
              { label: "Total", value: formatDZD(current.total) },
            ]}
          >
            <Link href="/ma-reservation/detail" className="t-petit lien w-fit text-or-300">
              Retour à ma réservation
            </Link>
          </DarkPanel>
        </div>
      </section>
    </>
  );
}
