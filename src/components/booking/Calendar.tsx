"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import { isHotelFullNight } from "@/lib/availability";
import {
  addDays,
  formatLong,
  formatShort,
  formatMonthTitle,
  monthGrid,
  toUtc,
  WEEKDAYS_CAL,
  WEEKDAYS_CAL_LONG,
  type IsoDate,
} from "@/lib/dates";
import { cx } from "@/lib/format";

type Props = {
  arrival: IsoDate | null;
  departure: IsoDate | null;
  today: IsoDate | null;
  onSelect: (arrival: IsoDate | null, departure: IsoDate | null) => void;
  invalid?: boolean;
};

type Month = { y: number; m: number };

function monthOf(iso: IsoDate): Month {
  const d = toUtc(iso);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
}
function shift(mo: Month, n: number): Month {
  const t = mo.y * 12 + mo.m + n;
  return { y: Math.floor(t / 12), m: ((t % 12) + 12) % 12 };
}
function key(mo: Month) {
  return mo.y * 12 + mo.m;
}

/**
 * Calendrier deux mois (05.1). Clavier : flèches (jour / semaine), Début/Fin
 * (début / fin de semaine), Page préc./suiv. (mois), Entrée/Espace (choisir).
 * Dates passées : désactivées. Nuits complètes : barrées, non sélectionnables
 * comme date d’arrivée mais possibles comme date de départ.
 */
export function Calendar({ arrival, departure, today, onSelect, invalid }: Props) {
  const fallback: Month = { y: 2026, m: 9 };
  const [view, setView] = useState<Month | null>(null);
  const [focusDate, setFocusDate] = useState<IsoDate | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const first = view ?? (arrival ? monthOf(arrival) : today ? monthOf(today) : fallback);
  const months = [first, shift(first, 1)];
  const minMonth = today ? monthOf(today) : null;
  const canPrev = !minMonth || key(first) > key(minMonth);

  // Date qui porte le tabindex=0 (navigation au clavier).
  const anchor =
    focusDate && [key(months[0]), key(months[1])].includes(key(monthOf(focusDate)))
      ? focusDate
      : arrival && [key(months[0]), key(months[1])].includes(key(monthOf(arrival)))
        ? arrival
        : today && key(monthOf(today)) === key(first)
          ? today
          : `${first.y}-${String(first.m + 1).padStart(2, "0")}-01`;

  const choosingDeparture = Boolean(arrival && !departure);

  function isPast(d: IsoDate) {
    return Boolean(today && d < today);
  }
  function isDisabled(d: IsoDate) {
    if (isPast(d)) return true;
    if (choosingDeparture && arrival && d > arrival) return false;
    return isHotelFullNight(d);
  }

  function pick(d: IsoDate) {
    if (isDisabled(d)) return;
    if (!arrival || departure || d <= arrival) onSelect(d, null);
    else onSelect(arrival, d);
    setFocusDate(d);
  }

  function moveFocus(d: IsoDate) {
    const mo = monthOf(d);
    const twoMonths = window.matchMedia("(min-width: 768px)").matches;
    const last = twoMonths ? months[1] : months[0];
    if (key(mo) < key(months[0])) {
      if (minMonth && key(mo) < key(minMonth)) return;
      setView(mo);
    } else if (key(mo) > key(last)) setView(twoMonths ? shift(mo, -1) : mo);
    setFocusDate(d);
    requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${d}"]`)?.focus();
    });
  }

  function onKey(e: KeyboardEvent<HTMLButtonElement>, d: IsoDate) {
    const dow = (toUtc(d).getUTCDay() + 6) % 7;
    const map: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -dow,
      End: 6 - dow,
    };
    if (e.key in map) {
      e.preventDefault();
      moveFocus(addDays(d, map[e.key]));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      const dt = toUtc(d);
      dt.setUTCMonth(dt.getUTCMonth() + (e.key === "PageUp" ? -1 : 1));
      moveFocus(dt.toISOString().slice(0, 10));
    }
  }

  const nights =
    arrival && departure ? Math.round((toUtc(departure).getTime() - toUtc(arrival).getTime()) / 86_400_000) : 0;

  return (
    <div ref={gridRef} className="flex flex-col gap-6">
      {/* Mobile : consigne au-dessus, puis « ‹ Octobre 2026 › » sur une ligne (un seul mois affiché). */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 md:flex-nowrap">
        <button
          type="button"
          onClick={() => setView(shift(first, -1))}
          disabled={!canPrev}
          aria-label="Mois précédent"
          className={cx(
            "flex size-11 shrink-0 items-center justify-center border lg:size-9",
            canPrev ? "border-sable-400 hover:border-encre" : "cursor-not-allowed border-sable-200",
          )}
        >
          {canPrev ? (
            <Image src="/icons/chevron-droite.svg" alt="" width={16} height={16} unoptimized className="rotate-180" />
          ) : (
            <Image src="/icons/chevron-gauche.svg" alt="" width={16} height={16} unoptimized />
          )}
        </button>
        <p id="calendrier-consigne" className="t-label order-first w-full text-center text-doux md:order-none md:w-auto">
          {choosingDeparture ? "Choisissez maintenant votre date de départ" : "Choisissez vos dates d’arrivée et de départ"}
        </p>
        <p aria-hidden="true" className="t-h4 text-encre md:hidden">
          {formatMonthTitle(months[0].y, months[0].m)}
        </p>
        <button
          type="button"
          onClick={() => setView(shift(first, 1))}
          aria-label="Mois suivant"
          className="flex size-11 shrink-0 items-center justify-center border lg:size-9 border-sable-400 hover:border-encre"
        >
          <Image src="/icons/chevron-droite.svg" alt="" width={16} height={16} unoptimized />
        </button>
      </div>

      <div className="flex flex-col gap-10 md:flex-row md:justify-center md:gap-12" aria-describedby="calendrier-consigne">
        {months.map((mo, idx) => {
          const title = formatMonthTitle(mo.y, mo.m);
          const weeks = monthGrid(mo.y, mo.m);
          return (
            <div key={key(mo)} className={cx("flex flex-col items-center gap-3", idx === 1 && "hidden md:flex")}>
              <h3 id={`mois-${key(mo)}`} className="t-h4 text-encre max-md:sr-only" aria-live="polite">
                {title}
              </h3>
              <table role="grid" aria-labelledby={`mois-${key(mo)}`} className="border-separate border-spacing-y-1">
                <thead>
                  <tr>
                    {WEEKDAYS_CAL.map((w, i) => (
                      <th key={w} scope="col" abbr={WEEKDAYS_CAL_LONG[i]} className="t-label h-7 w-10 font-normal text-doux min-[1440px]:w-12">
                        {w}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, wi) => (
                    <tr key={wi}>
                      {week.map((d, di) => {
                        if (!d) return <td key={di} className="h-11 w-10 min-[1440px]:w-12" />;
                        const disabled = isDisabled(d);
                        const full = isHotelFullNight(d);
                        const past = isPast(d);
                        const isEdge = d === arrival || d === departure;
                        const inRange = Boolean(arrival && departure && d > arrival && d < departure);
                        const isToday = d === today;
                        const status = [
                          d === arrival ? "date d’arrivée" : null,
                          d === departure ? "date de départ" : null,
                          inRange ? "nuit sélectionnée" : null,
                          isToday ? "aujourd’hui" : null,
                          full ? "complet" : null,
                          past ? "date passée" : null,
                        ]
                          .filter(Boolean)
                          .join(", ");
                        return (
                          <td key={d} role="gridcell" aria-selected={isEdge || inRange} className="p-0">
                            <button
                              type="button"
                              data-date={d}
                              tabIndex={d === anchor ? 0 : -1}
                              aria-disabled={disabled || undefined}
                              aria-label={`${formatLong(d)}${status ? ` (${status})` : ""}`}
                              onClick={() => pick(d)}
                              onKeyDown={(e) => {
                                if ((e.key === "Enter" || e.key === " ") && disabled) e.preventDefault();
                                else onKey(e, d);
                              }}
                              className={cx(
                                "t-corps flex h-11 w-10 items-center justify-center min-[1440px]:w-12",
                                isEdge && "bg-noir-900 text-or-300",
                                inRange && "bg-sable-100 text-encre",
                                !isEdge && !inRange && isToday && "border border-or-500",
                                !isEdge && !inRange && (disabled || full || past) && "text-sable-400",
                                !isEdge && !inRange && !(disabled || full || past) && "text-encre hover:bg-sable-50",
                                full && !isEdge && "line-through decoration-1",
                                disabled ? "cursor-not-allowed" : "cursor-pointer",
                                invalid && d === departure && "outline-2 outline-erreur",
                              )}
                            >
                              {toUtc(d).getUTCDate()}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <ul className="t-petit flex flex-wrap items-center gap-x-6 gap-y-2 text-doux">
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-3.5 bg-noir-900" />
          Arrivée / départ
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-3.5 bg-sable-100" />
          Nuits sélectionnées
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-3.5 border border-or-500 bg-blanc" />
          Aujourd’hui
        </li>
        <li>Date barrée : complet ou passée</li>
      </ul>

      <div className="flex flex-col gap-2 border-t border-sable-200 pt-[18px] sm:flex-row sm:items-center sm:justify-between">
        <p className="t-corps text-encre" aria-live="polite">
          {arrival && departure && nights > 0
            ? `${nights} nuit${nights > 1 ? "s" : ""} · du ${formatShort(arrival, false)} au ${formatShort(departure)}`
            : arrival
              ? `Arrivée le ${formatShort(arrival)} — choisissez maintenant votre date de départ`
              : "Aucune date sélectionnée"}
        </p>
        {(arrival || departure) && (
          <button
            type="button"
            onClick={() => {
              onSelect(null, null);
              setFocusDate(null);
            }}
            className="t-petit lien w-fit text-or-700"
          >
            Effacer les dates
          </button>
        )}
      </div>
    </div>
  );
}

