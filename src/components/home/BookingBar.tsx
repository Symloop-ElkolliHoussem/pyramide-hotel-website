"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { DateRangePicker } from "@/components/ui/DatePicker";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { diffDays, isIsoDate, todayIso } from "@/lib/dates";
import { useToday } from "@/lib/useToday";

/**
 * « Bandeau de réservation » du hero : Arrivée, Départ, Voyageurs et
 * « Vérifier la disponibilité » → parcours /reserver (dates pré-remplies).
 */
export function BookingBar() {
  const router = useRouter();
  const uid = useId();
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [adults, setAdults] = useState("2");
  const [error, setError] = useState<string | null>(null);
  const barRef = useRef<HTMLFormElement>(null);

  const today = useToday();

  function submit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ adultes: adults });
    if (arrival || departure) {
      if (!isIsoDate(arrival) || !isIsoDate(departure)) {
        setError("Indiquez une date d’arrivée et une date de départ, ou laissez les deux vides pour les choisir à l’étape suivante.");
        return;
      }
      if (diffDays(today ?? todayIso(), arrival) < 0) {
        setError("La date d’arrivée est déjà passée.");
        return;
      }
      if (diffDays(arrival, departure) < 1) {
        setError("La date de départ doit être postérieure à la date d’arrivée (minimum 1 nuit).");
        return;
      }
      params.set("arrivee", arrival);
      params.set("depart", departure);
    }
    setError(null);
    router.push(`/reserver?${params.toString()}`);
  }

  const fieldCls = "flex flex-1 flex-col gap-1.5 px-6 py-4 lg:px-7 lg:py-[22px]";

  return (
    <form
      ref={barRef}
      onSubmit={submit}
      noValidate
      aria-label="Vérifier la disponibilité"
      className="border border-or-500 bg-noir-900"
    >
      <div className="flex flex-col lg:flex-row lg:items-center">
        <DateRangePicker
          id={uid}
          tone="dark"
          variant="hero"
          barRef={barRef}
          markFull
          arrival={arrival}
          departure={departure}
          onChange={(a, d) => {
            setArrival(a);
            setDeparture(d);
            setError(null);
          }}
          fieldClassName="px-6 py-4 lg:px-7 lg:py-[22px]"
          separator={<div aria-hidden="true" className="mx-6 h-px bg-or-500 lg:mx-0 lg:h-14 lg:w-px" />}
        />
        <div aria-hidden="true" className="mx-6 h-px bg-or-500 lg:mx-0 lg:h-14 lg:w-px" />
        <div className={fieldCls}>
          <span id={`${uid}-voyageurs-label`} className="t-label text-or-500">
            Voyageurs
          </span>
          <SelectMenu
            id={`${uid}-voyageurs`}
            labelId={`${uid}-voyageurs-label`}
            value={adults}
            onChange={setAdults}
            options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n} adulte${n > 1 ? "s" : ""}` }))}
          />
        </div>
        <div aria-hidden="true" className="hidden h-14 w-px bg-or-500 lg:block" />
        <div className="px-5 pt-2 pb-5 lg:p-0 lg:px-5">
          <button type="submit" className={buttonClasses("primaire", "w-full whitespace-nowrap lg:w-auto")}>
            Vérifier la disponibilité
          </button>
        </div>
      </div>
      {error && (
        <p id={`${uid}-erreur`} role="alert" className="t-petit border-t border-or-500/50 px-6 py-3 text-or-300 lg:px-7">
          {error}
        </p>
      )}
    </form>
  );
}
