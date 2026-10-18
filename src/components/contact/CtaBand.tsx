import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

/** « Appel à l’action » sur fond noir (06, 07). */
export function CtaBand({ eyebrow, title, intro, primary, secondary }: Props) {
  return (
    <section className="section-y bg-noir-900 px-5 md:px-10">
      <div className="mx-auto flex max-w-[820px] flex-col items-center gap-9">
        <SectionHeading tone="sombre" eyebrow={eyebrow} title={title} intro={intro} />
        <div className="flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row sm:gap-5">
          <ButtonLink href={primary.href}>{primary.label}</ButtonLink>
          <ButtonLink href={secondary.href} variant="contour-clair">
            {secondary.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
