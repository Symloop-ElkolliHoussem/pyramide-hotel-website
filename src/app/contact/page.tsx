import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactPage, ContactPageWithParams } from "@/components/contact/ContactPage";
import { HOTEL } from "@/data/hotel";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contactez la réception de l’${HOTEL.name} à Baïnem, Alger : question, demande particulière, devis pour la salle des fêtes ou réservation.`,
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return (
    <Suspense fallback={<ContactPage />}>
      <ContactPageWithParams />
    </Suspense>
  );
}
