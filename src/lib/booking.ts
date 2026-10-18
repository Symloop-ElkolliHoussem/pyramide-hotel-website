/**
 * Modèle de réservation partagé (parcours /reserver et espace /ma-reservation).
 *
 * MAQUETTE / MOCK : aucune donnée n’est envoyée à un serveur. Les réservations
 * créées dans le parcours sont gardées dans le stockage local du navigateur
 * (localStorage) pour pouvoir être retrouvées dans « Gérer ma réservation ».
 */

import { EXTRAS, getRoom, type RoomSlug } from "@/data/hotel";
import { diffDays, type IsoDate } from "@/lib/dates";

export type BookingStatus = "en-attente" | "confirmee" | "annulee";
export type Formula = "chambre-seule" | "petit-dejeuner";

export const STATUS_LABELS: Record<BookingStatus, string> = {
  "en-attente": "En attente de confirmation par l’hôtel",
  confirmee: "Confirmée par l’hôtel",
  annulee: "Annulée",
};

export type Guest = {
  civility: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  language: string;
  requests: string;
  occupant?: string;
  newsletter?: boolean;
};

export type Booking = {
  reference: string;
  status: BookingStatus;
  arrival: IsoDate;
  departure: IsoDate;
  adults: number;
  children: number;
  rooms: number;
  roomSlug: RoomSlug;
  formula: Formula;
  /** Nombre de matelas supplémentaires (adultes au-delà de la capacité). */
  extraBeds: number;
  /** Heures de départ tardif. */
  lateHours: number;
  babyCot: boolean;
  decoration: boolean;
  arrivalTime: string;
  guest: Guest;
  createdAt: IsoDate;
  cancelledAt?: IsoDate;
};

export type PriceLine = { label: string; amount: number | null; note?: string };

export type PriceBreakdown = {
  nights: number;
  roomTotal: number;
  extraBedTotal: number;
  lateTotal: number;
  total: number;
  lines: PriceLine[];
};

/**
 * Calcul du séjour, identique à la maquette :
 * 12 800 × 3 nuits + 1 matelas (2 500, une fois par séjour) + 2 h × 1 000 = 42 900 DZD.
 * Taxe de séjour : [à confirmer] (non incluse).
 */
export function priceBreakdown(input: {
  roomSlug: RoomSlug;
  arrival: IsoDate;
  departure: IsoDate;
  extraBeds: number;
  lateHours: number;
  rooms?: number;
}): PriceBreakdown {
  const room = getRoom(input.roomSlug);
  const nights = Math.max(0, diffDays(input.arrival, input.departure));
  const roomCount = Math.max(1, input.rooms ?? 1);
  const price = room?.price ?? 0;
  const roomTotal = price * nights * roomCount;
  const extraBedTotal = input.extraBeds * EXTRAS.extraBed.price;
  const lateTotal = input.lateHours * EXTRAS.lateCheckout.price;
  const lines: PriceLine[] = [
    { label: `${formatPriceLabel(price)} × ${nights} nuit${nights > 1 ? "s" : ""}${roomCount > 1 ? ` × ${roomCount} chambres` : ""}`, amount: roomTotal },
  ];
  if (input.extraBeds > 0) lines.push({ label: `${EXTRAS.extraBed.shortLabel} × ${input.extraBeds}`, amount: extraBedTotal });
  if (input.lateHours > 0)
    lines.push({ label: `Départ tardif : ${input.lateHours} h × ${formatPriceLabel(EXTRAS.lateCheckout.price)}`, amount: lateTotal });
  lines.push({ label: "Taxe de séjour", amount: null, note: "[à confirmer]" });
  return { nights, roomTotal, extraBedTotal, lateTotal, total: roomTotal + extraBedTotal + lateTotal, lines };
}

function formatPriceLabel(n: number) {
  return `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} DZD`;
}

/** Texte des options (« Matelas supplémentaire adulte × 1 : 2 500 DZD · départ tardif 2 h (2 × 1 000 DZD) : 2 000 DZD »). */
export function optionsSummary(b: Pick<Booking, "extraBeds" | "lateHours" | "babyCot" | "decoration">): string {
  const parts: string[] = [];
  if (b.extraBeds > 0)
    parts.push(`${EXTRAS.extraBed.shortLabel} × ${b.extraBeds} : ${formatPriceLabel(b.extraBeds * EXTRAS.extraBed.price)}`);
  if (b.lateHours > 0)
    parts.push(
      `départ tardif ${b.lateHours} h (${b.lateHours} × ${formatPriceLabel(EXTRAS.lateCheckout.price)}) : ${formatPriceLabel(
        b.lateHours * EXTRAS.lateCheckout.price,
      )}`,
    );
  if (b.babyCot) parts.push("lit bébé (sur demande)");
  if (b.decoration) parts.push("décoration de la chambre (sur demande)");
  return parts.length ? parts.join(" · ") : "Aucune option";
}

export function newReference(seed = Date.now()): string {
  const n = 400 + (Math.abs(Math.floor(seed / 7)) % 99_000);
  return `PYR-2026-${String(n).padStart(5, "0")}`;
}

/** Réservation d’exemple de la maquette (parcours 05 et 08). */
export const MOCK_BOOKING: Booking = {
  reference: "PYR-2026-00418",
  status: "confirmee",
  arrival: "2026-10-22",
  departure: "2026-10-25",
  adults: 3,
  children: 0,
  rooms: 1,
  roomSlug: "double-vue-sur-mer",
  formula: "chambre-seule",
  extraBeds: 1,
  lateHours: 2,
  babyCot: false,
  decoration: false,
  arrivalTime: "Entre 14 h et 16 h",
  guest: {
    civility: "M.",
    firstName: "Karim",
    lastName: "Benali",
    email: "karim.benali@exemple.com",
    phone: "+213 550 12 34 56",
    country: "Algérie",
    language: "Français",
    requests: "Arrivée vers 15 h",
  },
  createdAt: "2026-10-13",
};

/* ------------------------------------------------------------------ */
/* Stockage local (navigateur uniquement)                              */
/* ------------------------------------------------------------------ */

const STORE_KEY = "pyramides:reservations";

function readStore(): Record<string, Booking> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Booking>) : {};
  } catch {
    return {};
  }
}

export function saveBooking(b: Booking): void {
  if (typeof window === "undefined") return;
  try {
    const all = readStore();
    all[b.reference] = b;
    window.localStorage.setItem(STORE_KEY, JSON.stringify(all));
  } catch {
    /* stockage indisponible : la maquette continue sans persistance */
  }
}

/** Retrouve une réservation (exemple de la maquette ou réservation faite dans ce navigateur). */
export function findBooking(reference: string, email: string): Booking | null {
  const ref = reference.trim().toUpperCase();
  const mail = email.trim().toLowerCase();
  const stored = readStore()[ref];
  if (stored && stored.guest.email.toLowerCase() === mail) return stored;
  if (ref === MOCK_BOOKING.reference && mail === MOCK_BOOKING.guest.email) return stored ?? MOCK_BOOKING;
  return null;
}

export function getBookingByReference(reference: string): Booking | null {
  const ref = reference.trim().toUpperCase();
  const stored = readStore()[ref];
  if (stored) return stored;
  return ref === MOCK_BOOKING.reference ? MOCK_BOOKING : null;
}

/* ------------------------------------------------------------------ */
/* Validation (côté client)                                            */
/* ------------------------------------------------------------------ */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Téléphone algérien : 10 chiffres (0XXXXXXXXX) ou +213 suivi de 9 chiffres ; autres pays : 8 à 15 chiffres. */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/[\s.\-()]/g, "");
  if (/^0\d{9}$/.test(digits)) return true;
  if (/^\+213\d{9}$/.test(digits)) return true;
  return /^\+\d{8,15}$/.test(digits);
}
