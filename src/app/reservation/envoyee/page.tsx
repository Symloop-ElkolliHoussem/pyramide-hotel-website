import type { Metadata } from "next";
import { RequestSent } from "@/components/booking/RequestSent";

export const metadata: Metadata = {
  title: "Demande de réservation envoyée",
  description: "Votre demande de réservation a bien été envoyée : la réception vous recontacte.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <RequestSent />;
}
