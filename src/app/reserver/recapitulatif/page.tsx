import type { Metadata } from "next";
import { RecapStep } from "@/components/booking/RecapStep";
import { Steps } from "@/components/booking/Steps";
import { PageBanner } from "@/components/ui/PageBanner";

export const metadata: Metadata = {
  title: "Récapitulatif de votre demande",
  description: "Vérifiez votre demande de réservation avant de l’envoyer à la réception.",
};

export default function Page() {
  return (
    <>
      <PageBanner photo="ch-mont-2" size={300} eyebrow="Réservation en ligne" title="Récapitulatif de votre demande" />
      <Steps current={5} />
      <RecapStep />
    </>
  );
}
