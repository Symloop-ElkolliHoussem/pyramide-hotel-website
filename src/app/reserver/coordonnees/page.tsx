import type { Metadata } from "next";
import { GuestStep } from "@/components/booking/GuestStep";
import { Steps } from "@/components/booking/Steps";
import { PageBanner } from "@/components/ui/PageBanner";

export const metadata: Metadata = {
  title: "Vos coordonnées",
  description: "Vos coordonnées pour la réservation en ligne.",
};

export default function Page() {
  return (
    <>
      <PageBanner photo="ch-mont-2" size={300} eyebrow="Réservation en ligne" title="Vos coordonnées" />
      <Steps current={4} />
      <GuestStep />
    </>
  );
}
