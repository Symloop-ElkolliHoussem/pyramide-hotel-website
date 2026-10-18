import Image from "next/image";
import type { ReactNode } from "react";
import { PHOTOS, type PhotoKey } from "@/data/hotel";
import { cx } from "@/lib/format";
import { OrnementPyramides } from "./Ornament";

type Props = {
  photo: PhotoKey;
  eyebrow: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  /** Hauteur desktop de la maquette : 460 (02, 03), 420 (04–07), 360 (05.1, 08.1), 300 (étapes 05.x, 08.x, 09.x). */
  size?: 460 | 420 | 360 | 300;
  /** Position de cadrage de la photo (object-position). */
  focus?: string;
};

const HEIGHTS: Record<NonNullable<Props["size"]>, string> = {
  460: "min-h-[340px] lg:min-h-[460px]",
  420: "min-h-[320px] lg:min-h-[420px]",
  360: "min-h-[300px] lg:min-h-[360px]",
  300: "min-h-[240px] lg:min-h-[300px]",
};

/** « Bandeau de page » : photo assombrie, ornement pyramides, surtitre, H1 et chapô. */
export function PageBanner({ photo, eyebrow, title, intro, size = 420, focus = "center" }: Props) {
  const p = PHOTOS[photo];
  return (
    <section
      className={cx(
        "relative isolate flex flex-col items-center justify-center gap-[22px] overflow-hidden bg-noir-900 px-5 py-14 text-center md:px-10 xl:px-[120px]",
        HEIGHTS[size],
      )}
    >
      <Image
        src={p.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
        style={{ objectPosition: focus }}
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 to-black/80" />
      <OrnementPyramides />
      <p className="t-surtitre text-or-300">{eyebrow}</p>
      <h1 className="t-h1 max-w-[1000px] text-clair">{title}</h1>
      {intro && <p className="t-corps-l max-w-[760px] text-clair">{intro}</p>}
    </section>
  );
}
