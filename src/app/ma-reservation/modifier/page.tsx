import type { Metadata } from "next";
import { ModifyPage } from "@/components/account/ModifyForm";

export const metadata: Metadata = {
  title: "Modifier mon séjour",
  description: "Demandez une modification de dates, de voyageurs ou de chambre.",
  alternates: { canonical: "/ma-reservation/modifier" },
  robots: { index: false, follow: false },
};

/** 08.3 — Modifier mon séjour → 08.3a. */
export default function Page() {
  return <ModifyPage />;
}
