import type { Metadata } from "next";
import { RoomsStep } from "@/components/booking/RoomsStep";
import { Steps } from "@/components/booking/Steps";
import { PageBanner } from "@/components/ui/PageBanner";

export const metadata: Metadata = {
  title: "Chambres disponibles",
  description: "Chambres disponibles pour vos dates, tarifs par nuit et total du séjour en dinars algériens.",
};

export default function Page() {
  return (
    <>
      <PageBanner photo="roof-sunset-wide" size={300} eyebrow="Réservation en ligne" title="Chambres disponibles" />
      <Steps current={2} />
      <RoomsStep />
    </>
  );
}
