import Image from "next/image";
import { cx } from "@/lib/format";

/** Ornement/Losange — deux filets dorés et un losange (160 × 12). */
export function OrnementLosange({ className }: { className?: string }) {
  return (
    <Image
      src="/ornaments/losange.svg"
      alt=""
      aria-hidden="true"
      width={160}
      height={12}
      unoptimized
      className={cx("h-3 w-40", className)}
    />
  );
}

/** Ornement/Pyramides — trois pyramides au trait (72 × 30). */
export function OrnementPyramides({ className }: { className?: string }) {
  return (
    <Image
      src="/ornaments/pyramides.svg"
      alt=""
      aria-hidden="true"
      width={72}
      height={30}
      unoptimized
      className={cx("h-[30px] w-[72px]", className)}
    />
  );
}

/** Ornement/Puce — losange plein 10 × 10 (puces des listes). */
export function OrnementPuce({ className }: { className?: string }) {
  return (
    <Image
      src="/ornaments/puce.svg"
      alt=""
      aria-hidden="true"
      width={10}
      height={10}
      unoptimized
      className={cx("size-2.5 shrink-0", className)}
    />
  );
}

/** Ornement/Frise — frise en dents de scie au-dessus du pied de page (motif répété). */
export function OrnementFrise({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx("h-5 w-full bg-repeat-x", className)}
      style={{ backgroundImage: "url(/ornaments/frise.svg)", backgroundSize: "1440px 20px" }}
    />
  );
}

/** Liste à puces losange (« Un grand lit », « Vue sur mer »…). */
export function ListePuces({
  items,
  className,
  itemClassName,
}: {
  items: readonly string[];
  className?: string;
  itemClassName?: string;
}) {
  return (
    <ul className={cx("flex flex-col gap-2.5", className)}>
      {items.map((it) => (
        <li key={it} className={cx("t-corps flex items-center gap-3", itemClassName)}>
          <OrnementPuce className="size-2" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
