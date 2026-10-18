import type { Metadata } from "next";
import { Suspense } from "react";
import { DatesStep } from "@/components/booking/DatesStep";
import { LoadingBlock } from "@/components/booking/parts";
import { Steps } from "@/components/booking/Steps";
import { PageBanner } from "@/components/ui/PageBanner";
import { HOTEL } from "@/data/hotel";

export const metadata: Metadata = {
  title: "Réserver votre séjour",
  description: `Réservation en ligne à l’${HOTEL.name}, Baïnem (Alger) : choisissez vos dates et le nombre de voyageurs pour voir les chambres disponibles et leurs tarifs.`,
  alternates: { canonical: "/reserver" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <>
      <PageBanner
        photo="roof-jour"
        size={360}
        eyebrow="Réservation en ligne"
        title="Réserver votre séjour"
        intro="Choisissez vos dates et le nombre de voyageurs : nous vous montrons les chambres disponibles et leurs tarifs."
      />
      <Steps current={1} />
      <Suspense fallback={<LoadingBlock />}>
        <DatesStep />
      </Suspense>
    </>
  );
}
