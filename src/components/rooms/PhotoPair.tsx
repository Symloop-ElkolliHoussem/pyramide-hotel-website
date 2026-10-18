import { FramedPhoto } from "@/components/ui/FramedPhoto";
import type { PhotoKey } from "@/data/hotel";
import { cx } from "@/lib/format";

/**
 * Paire de photos de la maquette : une grande (380 × 520) et une petite
 * (200 × 280) alignées en bas, avec filet doré (inset 14 px).
 */
export function PhotoPair({
  large,
  small,
  smallFirst = false,
  className,
}: {
  large: PhotoKey;
  small: PhotoKey;
  /** Petite photo à gauche (ex. Restaurant, Nuit de noces). */
  smallFirst?: boolean;
  className?: string;
}) {
  return (
    <div className={cx("flex w-full max-w-[600px] items-end gap-4 md:gap-5", smallFirst && "flex-row-reverse", className)}>
      <FramedPhoto
        photo={large}
        className="aspect-[380/520] w-[65.5%]"
        inset={14}
        sizes="(min-width: 1024px) 380px, 62vw"
      />
      <FramedPhoto
        photo={small}
        className="aspect-[200/280] w-[34.5%]"
        inset={14}
        sizes="(min-width: 1024px) 200px, 33vw"
      />
    </div>
  );
}
