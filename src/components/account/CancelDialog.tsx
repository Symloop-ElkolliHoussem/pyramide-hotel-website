"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Field";
import { getRoom } from "@/data/hotel";
import type { Booking } from "@/lib/booking";
import { diffDays, formatMixed, formatShort } from "@/lib/dates";

const MOTIFS = ["Changement de dates", "Voyage annulé", "Autre hébergement choisi", "Raison personnelle", "Autre motif"];

/** « du jeu. 22 au dim. 25 octobre 2026 » */
export function cancelRange(b: Booking): string {
  const start = formatShort(b.arrival, false).split(" ").slice(0, 2).join(" ");
  return `du ${start} au ${formatMixed(b.departure)}`;
}

type Props = {
  booking: Booking;
  open: boolean;
  onClose: () => void;
  onConfirm: (motif: string) => void;
};

/** 08.4 — « Fenêtre / Annuler la réservation » (dialogue modal natif : focus piégé, Échap). */
export function CancelDialog({ booking, open, onClose, onConfirm }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [motif, setMotif] = useState("");
  const nights = diffDays(booking.arrival, booking.departure);
  const room = getRoom(booking.roomSlug);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Route masquée par <Activity> : on referme la fenêtre.
  useLayoutEffect(() => {
    const d = ref.current;
    return () => {
      if (d?.open) d.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="annulation-titre"
      aria-describedby="annulation-resume"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[calc(100%-2.5rem)] max-w-[700px] bg-blanc p-0 text-encre shadow-[0_16px_48px_rgba(0,0,0,0.25)] backdrop:bg-black/60"
    >
      <div className="flex flex-col gap-5 px-6 py-8 md:px-12 md:py-10">
        <div className="flex items-start justify-between gap-4">
          <h2 id="annulation-titre" className="t-h3">
            Annuler votre réservation ?
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-11 shrink-0 items-center justify-center hover:bg-sable-100"
            aria-label="Fermer la fenêtre"
          >
            <Image src="/icons/fermer.svg" alt="" aria-hidden="true" width={22} height={22} unoptimized />
          </button>
        </div>
        <p id="annulation-resume" className="t-corps text-doux">
          Réservation {booking.reference} · {room?.fullName} · {cancelRange(booking)} ({nights} nuit{nights > 1 ? "s" : ""}).
        </p>
        <div className="flex flex-col gap-2 border border-or-500 bg-sable-50 px-5 py-4">
          <p className="t-label text-or-700">Conditions applicables — à confirmer par l’hôtel</p>
          <dl className="t-petit flex flex-col gap-2">
            {[
              ["Annulation sans frais", "jusqu’au [date à confirmer]"],
              ["Frais d’annulation aujourd’hui", "0 DZD [exemple]"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-doux sm:w-[220px] sm:shrink-0">{k}</dt>
                <dd className="text-encre">{v}</dd>
              </div>
            ))}
          </dl>
          <Link href="/cgv#modification-annulation" className="t-petit lien mt-1 w-fit text-or-700">
            Lire la politique d’annulation complète
          </Link>
        </div>
        <SelectField id="annulation-motif" label="Motif de l’annulation (facultatif)" value={motif} onChange={(e) => setMotif(e.target.value)}>
          <option value="">Choisir un motif</option>
          {MOTIFS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </SelectField>
        <p className="t-petit text-erreur">L’annulation est définitive : la chambre sera remise en vente.</p>
        <div className="flex flex-col gap-4 md:flex-row">
          <Button variant="contour-sombre" className="flex-1" onClick={onClose} autoFocus>
            Garder ma réservation
          </Button>
          <Button variant="noir" className="flex-1" onClick={() => onConfirm(motif)}>
            Confirmer l’annulation
          </Button>
        </div>
      </div>
    </dialog>
  );
}
