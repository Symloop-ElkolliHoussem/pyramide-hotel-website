import Link from "next/link";
import type { Room } from "@/data/hotel";
import { ButtonLink } from "@/components/ui/Button";
import { FramedPhoto } from "@/components/ui/FramedPhoto";
import { ListePuces } from "@/components/ui/Ornament";
import { cx, formatDZD } from "@/lib/format";

/**
 * Composant « Fiche chambre » (liste 02) : photo 540 px à gauche ou à droite,
 * contenu (vue, nom, texte, puces, filet, prix « La nuit », Réserver).
 */
export function RoomFiche({ room, photoRight = false, priority }: { room: Room; photoRight?: boolean; priority?: boolean }) {
  const href = `/chambres/${room.slug}`;
  const headingId = `fiche-${room.slug}`;
  return (
    <article
      aria-labelledby={headingId}
      className={cx("flex flex-col border border-sable-200 bg-blanc lg:flex-row", photoRight && "lg:flex-row-reverse")}
    >
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block shrink-0 lg:w-[45%] xl:w-[540px]">
        <FramedPhoto
          photo={room.photos[0]}
          alt=""
          priority={priority}
          className="h-[240px] md:h-[340px] lg:h-full lg:min-h-[420px]"
          inset={14}
          sizes="(min-width: 1280px) 540px, (min-width: 1024px) 45vw, 100vw"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-5 px-6 py-7 md:p-10 xl:p-14">
        <p className="t-surtitre text-or-700">{room.viewLabel}</p>
        <h3 id={headingId} className="t-h2 text-encre">
          <Link href={href} className="hover:text-or-700">
            {room.name}
            <span className="sr-only"> — {room.viewLabel.toLowerCase()}</span>
          </Link>
        </h3>
        <p className="t-corps text-doux">{room.listText}</p>
        <ListePuces items={room.features} className="text-encre" />
        <div className="h-px w-full bg-sable-200" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="t-label text-doux">La nuit</p>
            <p className="t-prix whitespace-nowrap text-or-700">{formatDZD(room.price)}</p>
          </div>
          <ButtonLink href={`/reserver?chambre=${room.slug}`}>
            Réserver<span className="sr-only"> — {room.fullName}</span>
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
