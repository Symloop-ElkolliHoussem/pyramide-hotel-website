import type { Metadata } from "next";
import { AccessForm } from "@/components/account/AccessForm";
import { PageBanner } from "@/components/ui/PageBanner";

export const metadata: Metadata = {
  title: "Gérer ma réservation",
  description: "Retrouvez votre réservation avec sa référence et votre e-mail : consultez, modifiez ou annulez votre séjour.",
  alternates: { canonical: "/ma-reservation" },
  robots: { index: false, follow: true },
};

/** 08.1 — Gérer ma réservation · accès (état 08.1a « introuvable » dans le formulaire). */
export default function Page() {
  return (
    <>
      <PageBanner
        photo="resto-salle"
        size={360}
        eyebrow="Espace client"
        title="Gérer ma réservation"
        intro="Consultez, modifiez ou annulez votre séjour."
      />
      <AccessForm />
    </>
  );
}
