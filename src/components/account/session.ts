"use client";

import { useSyncExternalStore } from "react";

/**
 * Espace client (MAQUETTE) : la référence consultée est gardée dans le
 * sessionStorage du navigateur, à la place d’une vraie session serveur.
 */
const KEY = "pyramides:espace-client";
const EVENT = "pyramides:espace-client";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

function read(): string {
  try {
    return window.sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

/**
 * Référence de la réservation ouverte :
 * - `null` pendant le pré-rendu (inconnue),
 * - `""` si aucune réservation n’est ouverte,
 * - sinon la référence (ex. « PYR-2026-00418 »).
 */
export function useSessionReference(): string | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function openSession(reference: string) {
  try {
    window.sessionStorage.setItem(KEY, reference);
  } catch {
    /* stockage indisponible */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function closeSession() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* stockage indisponible */
  }
  window.dispatchEvent(new Event(EVENT));
}
