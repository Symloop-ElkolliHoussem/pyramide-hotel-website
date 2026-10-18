import type { Metadata } from "next";
import { ConfirmationStep } from "@/components/booking/ConfirmationStep";
import { Steps } from "@/components/booking/Steps";

export const metadata: Metadata = {
  title: "Réservation enregistrée",
  description: "Votre réservation est enregistrée : la réception vous envoie sa confirmation.",
};

export default function Page() {
  return (
    <>
      <Steps current={6} />
      <ConfirmationStep />
    </>
  );
}
