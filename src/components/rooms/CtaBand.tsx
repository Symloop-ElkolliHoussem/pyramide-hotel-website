import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cx } from "@/lib/format";

/** Section « Appel à l’action » : fond noir, en-tête centré et deux boutons. */
export function CtaBand({
  eyebrow,
  title,
  intro,
  primary,
  secondary,
  background = "noir",
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** noir (#000) ou noir-800 (salle des fêtes 03). */
  background?: "noir" | "noir-800";
  id?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-titre` : undefined}
      className={cx("section-y", background === "noir" ? "bg-noir-900" : "bg-noir-800")}
    >
      <div className="conteneur flex flex-col items-center gap-9">
        <SectionHeading
          tone="sombre"
          eyebrow={eyebrow}
          title={title}
          intro={intro}
          id={id ? `${id}-titre` : undefined}
          className="max-w-[820px]"
        />
        <div className="flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-start sm:gap-5">
          <ButtonLink href={primary.href} variant="primaire">
            {primary.label}
          </ButtonLink>
          {secondary && (
            <ButtonLink href={secondary.href} variant="contour-clair">
              {secondary.label}
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}
