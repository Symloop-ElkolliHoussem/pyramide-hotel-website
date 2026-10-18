import type { Metadata } from "next";

/** Parcours de réservation en ligne (05.1 → 05.7) : pages d’étapes non indexées. */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function ReserverLayout({ children }: LayoutProps<"/reserver">) {
  return children;
}
