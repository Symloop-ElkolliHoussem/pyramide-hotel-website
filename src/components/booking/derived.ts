import { getRoom, type Room } from "@/data/hotel";
import { priceBreakdown, type Booking, type PriceBreakdown } from "@/lib/booking";
import { diffDays, formatShort, isIsoDate } from "@/lib/dates";
import { formatDZD } from "@/lib/format";
import type { Draft } from "./store";

export function adultsLabel(n: number) {
  return `${n} adulte${n > 1 ? "s" : ""}`;
}

export function childrenLabel(n: number) {
  return `${n} enfant${n > 1 ? "s" : ""}`;
}

/** « 3 adultes » ou « 2 adultes · 1 enfant ». */
export function guestsLabel(adults: number, children: number) {
  return children > 0 ? `${adultsLabel(adults)} · ${childrenLabel(children)}` : adultsLabel(adults);
}

/** « 3 adultes · 0 enfant · 1 chambre » (bandeau de réservation). */
export function barGuestsLabel(adults: number, children: number, rooms: number) {
  return `${adultsLabel(adults)} · ${childrenLabel(children)} · ${rooms} chambre${rooms > 1 ? "s" : ""}`;
}

export function nightsLabel(n: number) {
  return `${n} nuit${n > 1 ? "s" : ""}`;
}

export const FORMULA_LABELS = {
  "chambre-seule": "Chambre seule",
  "petit-dejeuner": "Chambre et petit-déjeuner",
} as const;

export function hasDates(d: Pick<Draft, "arrival" | "departure">): d is { arrival: string; departure: string } {
  return isIsoDate(d.arrival) && isIsoDate(d.departure) && diffDays(d.arrival!, d.departure!) > 0;
}

export type Priced = { room: Room; nights: number; breakdown: PriceBreakdown };

export function pricedDraft(d: Draft): Priced | null {
  if (!hasDates(d) || !d.roomSlug) return null;
  const room = getRoom(d.roomSlug);
  if (!room) return null;
  const breakdown = priceBreakdown({
    roomSlug: room.slug,
    arrival: d.arrival!,
    departure: d.departure!,
    extraBeds: d.extraBeds,
    lateHours: d.lateHours,
    rooms: d.rooms,
  });
  return { room, nights: breakdown.nights, breakdown };
}

/** Lignes du récapitulatif « Votre séjour ». */
export function summaryRows(d: Draft, p: Priced) {
  return [
    { label: "Arrivée", value: formatShort(d.arrival!) },
    { label: "Départ", value: formatShort(d.departure!) },
    { label: "Durée", value: nightsLabel(p.nights) },
    { label: "Voyageurs", value: guestsLabel(d.adults, d.children) },
    { label: "Chambre", value: d.rooms > 1 ? `${p.room.shortName} × ${d.rooms}` : p.room.shortName },
    { label: "Formule", value: FORMULA_LABELS[d.formula] },
    ...p.breakdown.lines.map((l) => ({ label: l.label, value: l.amount === null ? (l.note ?? "") : formatDZD(l.amount) })),
  ];
}

/** Ligne « Chambre Double — vue sur mer · jeu. 22 oct. → … · Total 42 900 DZD » (05.6a, 05.6b). */
export function recapLine(b: Pick<Booking, "arrival" | "departure" | "adults" | "children">, p: Priced) {
  return `${formatShort(b.arrival, false)} → ${formatShort(b.departure)} · ${nightsLabel(p.nights)} · ${guestsLabel(
    b.adults,
    b.children,
  )} · Total ${formatDZD(p.breakdown.total)}`;
}
