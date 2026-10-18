"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { DateRangePicker } from "@/components/ui/DatePicker";
import { SelectField } from "@/components/ui/Field";
import { EXTRAS, HOTEL, type Room } from "@/data/hotel";
import { isIsoDate, todayIso } from "@/lib/dates";
import { formatDZD } from "@/lib/format";

/**
 * « Carte de réservation » des fiches 02.x : prix par nuit, dates, voyageurs,
 * « Vérifier la disponibilité » → parcours /reserver (paramètres GET).
 */
export function RoomBookingBox({ room }: { room: Room }) {
  const router = useRouter();
  const maxGuests = room.capacity + (room.extraBedAllowed ? 1 : 0);
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [adults, setAdults] = useState(String(Math.min(2, room.capacity)));
  const [errors, setErrors] = useState<{ arrival?: string; departure?: string }>({});

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: typeof errors = {};
    const now = todayIso();
    if (arrival || departure) {
      if (!isIsoDate(arrival)) next.arrival = "Indiquez votre date d’arrivée.";
      else if (arrival < now) next.arrival = "La date d’arrivée est déjà passée.";
      if (!isIsoDate(departure)) next.departure = "Indiquez votre date de départ.";
      else if (isIsoDate(arrival) && departure <= arrival)
        next.departure = "La date de départ doit être postérieure à la date d’arrivée (minimum 1 nuit).";
    }
    setErrors(next);
    if (next.arrival || next.departure) {
      document.getElementById(next.arrival ? `${room.slug}-arrivee` : `${room.slug}-depart`)?.focus();
      return;
    }
    const params = new URLSearchParams();
    if (arrival && departure) {
      params.set("arrivee", arrival);
      params.set("depart", departure);
    }
    params.set("adultes", adults);
    params.set("chambre", room.slug);
    router.push(`/reserver?${params.toString()}`);
  }

  return (
    <aside
      aria-labelledby={`${room.slug}-reserver`}
      className="flex flex-col gap-4 border border-or-500 bg-blanc p-6 sm:p-8 lg:sticky lg:top-6"
    >
      <h2 id={`${room.slug}-reserver`} className="t-label text-doux">
        Prix par nuit
      </h2>
      <p className="t-prix text-or-700">{formatDZD(room.price)}</p>
      <p className="t-petit text-doux">
        {EXTRAS.extraBed.label} : {formatDZD(EXTRAS.extraBed.price)} {EXTRAS.extraBed.unit}. {EXTRAS.lateCheckout.label} :{" "}
        {formatDZD(EXTRAS.lateCheckout.price)} {EXTRAS.lateCheckout.unit}.
      </p>
      <div className="h-px w-full bg-sable-200" />
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4" aria-label={`Vérifier la disponibilité — ${room.fullName}`}>
        <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
          <DateRangePicker
            id={room.slug}
            markFull
            arrival={arrival}
            departure={departure}
            names={{ arrival: "arrivee", departure: "depart" }}
            errors={errors}
            onChange={(a, d) => {
              setArrival(a);
              setDeparture(d);
              setErrors({});
            }}
          />
        </div>
        <SelectField id={`${room.slug}-voyageurs`} name="adultes" label="Voyageurs" value={adults} onChange={(e) => setAdults(e.target.value)}>
          {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} adulte{n > 1 ? "s" : ""}
              {n > room.capacity ? " (avec matelas supplémentaire)" : ""}
            </option>
          ))}
        </SelectField>
        <button type="submit" className={buttonClasses("primaire", "w-full")}>
          Vérifier la disponibilité
        </button>
      </form>
      <p className="t-petit flex flex-wrap gap-x-2 text-doux">
        Ou appelez la réception :
        {HOTEL.phoneHref ? (
          <a href={HOTEL.phoneHref} className="text-or-700 underline">
            {HOTEL.phone}
          </a>
        ) : (
          <span className="text-or-700">{HOTEL.phone}</span>
        )}
      </p>
    </aside>
  );
}
