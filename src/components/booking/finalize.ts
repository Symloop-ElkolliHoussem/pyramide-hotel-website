"use client";

import { newReference, saveBooking, type Booking } from "@/lib/booking";
import { todayIso } from "@/lib/dates";
import { EMPTY_GUEST, updateDraft, type Draft } from "./store";

/**
 * Enregistre la demande de réservation (MAQUETTE : stockage local du navigateur)
 * et la place dans le brouillon pour l’écran de confirmation 05.7.
 * Aucun règlement en ligne : la réception confirme la demande.
 * À appeler depuis un gestionnaire d’événement (jamais pendant le rendu).
 */
export function finalizeBooking(draft: Draft): Booking {
  const booking: Booking = {
    reference: newReference(),
    status: "en-attente",
    arrival: draft.arrival!,
    departure: draft.departure!,
    adults: draft.adults,
    children: draft.children,
    rooms: draft.rooms,
    roomSlug: draft.roomSlug!,
    formula: draft.formula,
    extraBeds: draft.extraBeds,
    lateHours: draft.lateHours,
    babyCot: draft.babyCot,
    decoration: draft.decoration,
    arrivalTime: draft.arrivalTime,
    guest: draft.guest ?? EMPTY_GUEST,
    createdAt: todayIso(),
  };
  saveBooking(booking);
  updateDraft({ confirmed: booking });
  return booking;
}
