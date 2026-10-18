import Link from "next/link";
import type { Room } from "@/data/hotel";
import { buttonClasses } from "@/components/ui/Button";
import { FramedPhoto } from "@/components/ui/FramedPhoto";
import { formatDZD } from "@/lib/format";

type Props = {
  room: Room;
  /** Texte de la carte (par défaut room.cardText). */
  text?: string;
  /** Libellé et lien de l’action (« Réserver » → /reserver, « Voir » → fiche). */
  action?: { label: string; href: string };
  headingLevel?: "h3" | "h4";
};

/**
 * Composant « Carte chambre » : photo avec filet doré, surtitre vue, titre,
 * texte, filet, prix « La nuit » et bouton. Le bloc prix reste aligné en bas.
 */
export function RoomCard({ room, text, action, headingLevel: H = "h3" }: Props) {
  const href = `/chambres/${room.slug}`;
  const act = action ?? { label: "Réserver", href: `/reserver?chambre=${room.slug}` };
  return (
    <article className="flex h-full flex-col border border-sable-200 bg-blanc">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
        <FramedPhoto
          photo={room.cardPhoto}
          alt=""
          className="h-[240px] md:h-[280px]"
          sizes="(min-width: 1280px) 384px, (min-width: 768px) 33vw, 100vw"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3.5 p-6 md:p-7">
        <p className="t-surtitre text-or-700">{room.viewLabel}</p>
        <H className="t-carte text-encre">
          <Link href={href} className="hover:text-or-700 focus-visible:text-or-700">
            {room.name}
            <span className="sr-only"> — {room.viewLabel.toLowerCase()}</span>
          </Link>
        </H>
        <p className="t-corps flex-1 text-doux">{text ?? room.cardText}</p>
        <div className="h-px w-full bg-sable-200" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="t-label text-doux">La nuit</p>
            <p className="t-h4 whitespace-nowrap text-encre">{formatDZD(room.price)}</p>
          </div>
          <Link href={act.href} className={buttonClasses("primaire", "px-[22px]")}>
            {act.label}
            <span className="sr-only"> — {room.fullName}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
