"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  eyebrow: ReactNode;
  title: ReactNode;
  text: ReactNode;
  rows: { label: string; value: ReactNode }[];
  actions: ReactNode;
  /** Lien secondaire sous les boutons (« Retour à l’accueil »). */
  footer?: ReactNode;
};

/**
 * « Carte de statut » (06.1, 08.3a, 08.4a, 08.5a) : icône ok, surtitre, titre,
 * texte, récapitulatif et actions. Le titre (h1) reçoit le focus à l’affichage.
 */
export function StatusCard({ eyebrow, title, text, rows, actions, footer }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, []);

  return (
    <section className="bg-sable-100 px-5 pt-16 pb-20 md:px-10 lg:pt-[120px] lg:pb-[140px]">
      <div className="mx-auto flex w-full max-w-[760px] flex-col items-center gap-5 border border-sable-200 bg-blanc px-6 py-10 text-center md:px-16 md:py-14">
        <Image src="/icons/ok.svg" alt="" aria-hidden="true" width={64} height={64} unoptimized />
        <p className="t-surtitre text-or-700">{eyebrow}</p>
        <h1 ref={headingRef} tabIndex={-1} className="t-h2 text-encre outline-none">
          {title}
        </h1>
        <p className="t-corps text-doux">{text}</p>
        <dl className="w-full bg-sable-50 px-4 py-3 text-left md:px-6">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex flex-col gap-1 border-b border-sable-200 py-2.5 sm:flex-row sm:items-start sm:gap-4"
            >
              <dt className="t-label shrink-0 text-doux sm:w-[200px]">{r.label}</dt>
              <dd className="t-petit flex-1 text-encre">{r.value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">{actions}</div>
        {footer}
      </div>
    </section>
  );
}
