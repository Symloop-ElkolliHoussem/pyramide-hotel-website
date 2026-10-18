import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { getLegalDoc } from "@/data/legal";

const doc = getLegalDoc("cgv");

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description,
  alternates: { canonical: doc.href },
};

export default function Page() {
  return <LegalDocument doc={doc} />;
}
