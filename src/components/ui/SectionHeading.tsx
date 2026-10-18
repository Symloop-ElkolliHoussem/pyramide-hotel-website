import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { OrnementLosange } from "./Ornament";

type Props = {
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  /** Fond sombre (noir) : surtitre or/500, titre clair, texte clair-doux. */
  tone?: "clair" | "sombre";
  align?: "center" | "left";
  /** Niveau du titre (h2 par défaut). */
  as?: "h1" | "h2" | "h3";
  ornament?: boolean;
  className?: string;
  titleClassName?: string;
  id?: string;
};

/** « En-tête de section » : ornement losange, surtitre, titre H2 et chapô. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = "clair",
  align = "center",
  as: Tag = "h2",
  ornament = true,
  className,
  titleClassName,
  id,
}: Props) {
  const dark = tone === "sombre";
  return (
    <div
      className={cx(
        "flex flex-col gap-5",
        align === "center" ? "mx-auto max-w-[760px] items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {ornament && <OrnementLosange />}
      {eyebrow && <p className={cx("t-surtitre", dark ? "text-or-500" : "text-or-700")}>{eyebrow}</p>}
      <Tag id={id} className={cx("t-h2", dark ? "text-clair" : "text-encre", titleClassName)}>
        {title}
      </Tag>
      {intro && <p className={cx("t-corps-l", dark ? "text-clair-doux" : "text-doux")}>{intro}</p>}
    </div>
  );
}
