import type { Metadata } from "next";
import { BookingDetail } from "@/components/account/BookingDetail";

export const metadata: Metadata = {
  title: "Ma réservation",
  description: "Détail et statut de votre réservation.",
  alternates: { canonical: "/ma-reservation/detail" },
  robots: { index: false, follow: false },
};

/** 08.2 — Ma réservation (détail), fenêtre 08.4 et état 08.4a. */
export default function Page() {
  return <BookingDetail />;
}
