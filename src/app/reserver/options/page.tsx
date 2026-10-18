import type { Metadata } from "next";
import { OptionsStep } from "@/components/booking/OptionsStep";
import { Steps } from "@/components/booking/Steps";
import { PageBanner } from "@/components/ui/PageBanner";

export const metadata: Metadata = {
  title: "Votre chambre et vos options",
  description: "Formule, matelas supplémentaire, départ tardif et heure d’arrivée pour votre séjour.",
};

export default function Page() {
  return (
    <>
      <PageBanner photo="ch-mont-2" size={300} eyebrow="Réservation en ligne" title="Votre chambre et vos options" />
      <Steps current={3} />
      <OptionsStep />
    </>
  );
}
