import Image from "next/image";
import { PHOTOS, type PhotoKey } from "@/data/hotel";
import { cx } from "@/lib/format";

type Props = {
  photo: PhotoKey;
  /** Remplace le texte alternatif par défaut ; "" pour une image décorative. */
  alt?: string;
  className?: string;
  /** Attribut sizes de next/image. */
  sizes: string;
  priority?: boolean;
  /** Filet doré intérieur (inset 12 px) comme dans la maquette. */
  filet?: boolean;
  focus?: string;
  /** Retrait du filet : 12 px (cartes) ou 14 px (photos éditoriales de 01). */
  inset?: 12 | 14;
};

/** Photo plein cadre avec le « Filet doré » intérieur de la maquette. */
export function FramedPhoto({ photo, alt, className, sizes, priority, filet = true, focus, inset = 12 }: Props) {
  const p = PHOTOS[photo];
  return (
    <div className={cx("relative overflow-hidden bg-noir-700", className)}>
      <Image
        src={p.src}
        alt={alt ?? p.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        style={focus ? { objectPosition: focus } : undefined}
      />
      {filet && <div aria-hidden="true" className={cx("pointer-events-none absolute border border-or-300", inset === 14 ? "inset-3.5" : "inset-3")} />}
    </div>
  );
}
