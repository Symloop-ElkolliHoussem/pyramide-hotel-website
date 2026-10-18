"use client";

/**
 * Brouillon du parcours de réservation en ligne (/reserver).
 *
 * MAQUETTE : tout reste dans le navigateur. Le brouillon est conservé dans
 * sessionStorage (onglet courant) ; la réservation finale est enregistrée via
 * saveBooking() (localStorage) pour « Gérer ma réservation ».
 *
 * Petit magasin externe lu avec useSyncExternalStore : rendu serveur / pré-rendu
 * avec un brouillon vide (ready = false), puis lecture du stockage côté client.
 */

import { useSyncExternalStore } from "react";
import type { RoomSlug } from "@/data/hotel";
import type { Booking, Formula, Guest } from "@/lib/booking";
import type { IsoDate } from "@/lib/dates";

export type Draft = {
  arrival: IsoDate | null;
  departure: IsoDate | null;
  adults: number;
  children: number;
  rooms: number;
  roomSlug: RoomSlug | null;
  formula: Formula;
  extraBeds: number;
  lateHours: number;
  babyCot: boolean;
  decoration: boolean;
  arrivalTime: string;
  guest: Guest | null;
  /** Réservation finalisée (écran de confirmation). */
  confirmed: Booking | null;
};

export const EMPTY_GUEST: Guest = {
  civility: "M.",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "Algérie",
  language: "Français",
  requests: "",
  occupant: "",
  newsletter: false,
};

export const DEFAULT_DRAFT: Draft = {
  arrival: null,
  departure: null,
  adults: 2,
  children: 0,
  rooms: 1,
  roomSlug: null,
  formula: "chambre-seule",
  extraBeds: 0,
  lateHours: 0,
  babyCot: false,
  decoration: false,
  arrivalTime: "Entre 14 h et 16 h",
  guest: null,
  confirmed: null,
};

export type DraftState = { ready: boolean; draft: Draft };

const KEY = "pyramides:brouillon";
const SERVER_STATE: DraftState = { ready: false, draft: DEFAULT_DRAFT };
let state: DraftState | null = null;
const listeners = new Set<() => void>();

function load(): DraftState {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (raw) return { ready: true, draft: { ...DEFAULT_DRAFT, ...(JSON.parse(raw) as Partial<Draft>) } };
  } catch {
    /* stockage indisponible */
  }
  return { ready: true, draft: DEFAULT_DRAFT };
}

function getSnapshot(): DraftState {
  if (state === null) state = load();
  return state;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function updateDraft(patch: Partial<Draft>) {
  const current = getSnapshot();
  state = { ready: true, draft: { ...current.draft, ...patch } };
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state.draft));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useDraft(): DraftState {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_STATE);
}

/* ------------------------------------------------------------------ */
/* Demande de réservation (/reservation → /reservation/envoyee)        */
/* ------------------------------------------------------------------ */

export type RequestRecord = {
  reference: string;
  fullName: string;
  phone: string;
  email: string;
  arrival: IsoDate;
  departure: IsoDate;
  roomSlug: RoomSlug;
  adults: number;
  children: number;
  message: string;
};

const REQ_KEY = "pyramides:demande";
let request: { ready: boolean; value: RequestRecord | null } | null = null;
const SERVER_REQ = { ready: false, value: null };
const reqListeners = new Set<() => void>();

function getRequestSnapshot() {
  if (request === null) {
    let value: RequestRecord | null = null;
    try {
      const raw = window.sessionStorage.getItem(REQ_KEY);
      value = raw ? (JSON.parse(raw) as RequestRecord) : null;
    } catch {
      value = null;
    }
    request = { ready: true, value };
  }
  return request;
}

export function saveRequest(r: RequestRecord) {
  request = { ready: true, value: r };
  try {
    window.sessionStorage.setItem(REQ_KEY, JSON.stringify(r));
  } catch {
    /* ignore */
  }
  reqListeners.forEach((l) => l());
}

export function useRequest() {
  return useSyncExternalStore(
    (cb) => {
      reqListeners.add(cb);
      return () => reqListeners.delete(cb);
    },
    getRequestSnapshot,
    () => SERVER_REQ,
  );
}
