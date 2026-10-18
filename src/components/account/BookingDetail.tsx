"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { FramedPhoto } from "@/components/ui/FramedPhoto";
import { PageBanner } from "@/components/ui/PageBanner";
import { HOTEL, getRoom } from "@/data/hotel";
import { optionsSummary, priceBreakdown, saveBooking, STATUS_LABELS, type Booking } from "@/lib/booking";
import { formatLong, formatMixed, formatStayTitle, todayIso } from "@/lib/dates";
import { cx, formatDZD } from "@/lib/format";
import { CancelDialog, cancelRange } from "./CancelDialog";
import { closeSession } from "./session";
import { AccountLoading, FORMULA_LABELS, NoSession, travellers, useAccountBooking } from "./shared";
import { StatusCard } from "./StatusCard";
import { PrintableBooking } from "@/components/booking/PrintableBooking";

/** 08.2 « Ma réservation », fenêtre 08.4 et état 08.4a « Réservation annulée ». */
export function BookingDetail() {
  const { ready, booking, reload } = useAccountBooking();
  const [justCancelled, setJustCancelled] = useState(false);

  if (!ready) return <AccountLoading />;
  if (!booking)
    return (
      <>
        <PageBanner photo="resto-salle" size={300} eyebrow="Espace client" title="Ma réservation" />
        <NoSession />
      </>
    );

  if (booking.status === "annulee" || justCancelled) return <Cancelled booking={booking} />;

  return (
    <>
      <PageBanner photo="resto-salle" size={300} eyebrow="Espace client" title="Ma réservation" />
      <Detail
        booking={booking}
        onCancelled={() => {
          setJustCancelled(true);
          reload();
        }}
      />
      <PrintableBooking booking={booking} />
    </>
  );
}

function Detail({ booking, onCancelled }: { booking: Booking; onCancelled: () => void }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const cancelBtn = useRef<HTMLButtonElement>(null);
  const room = getRoom(booking.roomSlug);
  const price = priceBreakdown(booking);
  const statusTone = booking.status === "confirmee" ? "bg-succes" : "bg-or-700";

  const summary = [
    travellers(booking),
    FORMULA_LABELS[booking.formula],
    booking.extraBeds > 0 ? "matelas supplémentaire" : null,
    booking.lateHours > 0 ? `départ tardif ${booking.lateHours} h` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const rows: [string, string][] = [
    ["Arrivée", `${formatLong(booking.arrival)} · à partir de [heure à confirmer]`],
    [
      "Départ",
      `${formatLong(booking.departure)}${
        booking.lateHours > 0 ? ` · départ tardif : ${booking.lateHours} h après l’heure de check-out [à confirmer]` : " · avant [heure à confirmer]"
      }`,
    ],
    ["Durée", `${price.nights} nuit${price.nights > 1 ? "s" : ""}`],
    ["Voyageurs", travellers(booking)],
    ["Options", optionsSummary(booking)],
    ["Client", `${booking.guest.civility} ${booking.guest.firstName} ${booking.guest.lastName} · ${booking.guest.email} · ${booking.guest.phone}`],
    ["Demandes", booking.guest.requests.trim() || "—"],
    ["Annulation", "Sans frais jusqu’au [date à confirmer] · ensuite frais d’annulation [à confirmer]"],
  ];

  function confirmCancel() {
    saveBooking({ ...booking, status: "annulee", cancelledAt: todayIso() });
    setDialogOpen(false);
    onCancelled();
  }

  const actionClass =
    "flex w-full items-center gap-3.5 border-b border-sable-200 py-[18px] text-left transition-colors hover:bg-sable-50 focus-visible:bg-sable-50";

  return (
    <section className="bg-sable-100 px-5 pt-10 pb-20 md:px-10 lg:pt-16 lg:pb-28 xl:px-[120px]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
        <div className="flex flex-col gap-4 bg-noir-900 px-6 py-6 md:flex-row md:items-center md:gap-6 md:px-8">
          <div className="flex flex-1 flex-col gap-1">
            <p className="t-label text-clair-doux">
              Bonjour {booking.guest.firstName} · Référence {booking.reference}
            </p>
            <h2 className="t-h3 text-clair">Séjour {formatStayTitle(booking.arrival, booking.departure)}</h2>
          </div>
          <p className={cx("t-label inline-flex w-fit items-center gap-2 px-3.5 py-2 text-clair", statusTone)}>
            {booking.status === "confirmee" && (
              <Image src="/icons/ok-petit.svg" alt="" aria-hidden="true" width={16} height={16} unoptimized />
            )}
            {STATUS_LABELS[booking.status]}
          </p>
          <button
            type="button"
            onClick={() => {
              closeSession();
              router.push("/ma-reservation");
            }}
            className="t-petit lien w-fit text-or-300"
          >
            Se déconnecter
          </button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="flex flex-col bg-blanc sm:flex-row">
              {room && (
                <FramedPhoto
                  photo={room.cardPhoto}
                  alt=""
                  filet={false}
                  className="h-[200px] sm:w-[240px] sm:shrink-0"
                  sizes="(min-width: 640px) 240px, 100vw"
                />
              )}
              <div className="flex flex-col gap-2 p-6 md:p-7">
                <p className="t-surtitre text-or-700">{room?.viewLabel}</p>
                <h3 className="t-carte text-encre">{room?.name}</h3>
                <p className="t-petit text-doux">{summary}</p>
                {room && (
                  <Link href={`/chambres/${room.slug}`} className="t-petit lien w-fit text-or-700">
                    Voir la chambre
                  </Link>
                )}
              </div>
            </div>

            <div className="bg-blanc p-6 md:p-8">
              <h3 className="t-h4 text-encre">Détail du séjour</h3>
              <dl>
                {rows.map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-1 border-b border-sable-200 py-3 sm:flex-row sm:items-center sm:gap-4">
                    <dt className="t-label text-doux sm:w-[190px] sm:shrink-0">{k}</dt>
                    <dd className="t-corps text-encre">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex flex-col gap-1 bg-blanc p-6 sm:flex-row sm:items-center sm:gap-4 md:p-8">
              <p className="t-label text-doux sm:w-[190px] sm:shrink-0">Total estimé du séjour</p>
              <p className="t-prix text-[1.5rem] text-or-700 md:text-[1.875rem]">{formatDZD(price.total)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:w-[380px] lg:shrink-0">
            <div className="bg-blanc p-6 md:p-7">
              <h3 className="t-h4 text-encre">Que souhaitez-vous faire ?</h3>
              <ul>
                <li>
                  <Link href="/ma-reservation/modifier" className={actionClass}>
                    <ActionContent icon="modifier" title="Modifier mon séjour" text="Dates, voyageurs ou chambre — sur demande" />
                  </Link>
                </li>
                <li>
                  <button type="button" className={actionClass} onClick={() => window.print()}>
                    <ActionContent icon="telecharger" title="Télécharger la confirmation" text="PDF à présenter à l’arrivée" />
                  </button>
                </li>
                <li>
                  <button
                    ref={cancelBtn}
                    type="button"
                    className={actionClass}
                    aria-haspopup="dialog"
                    onClick={() => setDialogOpen(true)}
                  >
                    <ActionContent icon="annuler" title="Annuler la réservation" text="Selon les conditions d’annulation" danger />
                  </button>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2.5 bg-noir-900 p-7">
              <h3 className="t-h4 text-clair">Une question ?</h3>
              <p className="t-petit text-clair-doux">La réception reste joignable pour toute demande particulière.</p>
              <p className="t-carte text-or-300">{HOTEL.phone}</p>
              <Link href="/contact" className="t-petit lien w-fit text-or-300">
                Écrire à la réception
              </Link>
            </div>
          </div>
        </div>
      </div>

      <CancelDialog
        booking={booking}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          cancelBtn.current?.focus();
        }}
        onConfirm={confirmCancel}
      />
    </section>
  );
}

function ActionContent({ icon, title, text, danger }: { icon: string; title: string; text: string; danger?: boolean }) {
  return (
    <>
      <Image src={`/icons/${icon}.svg`} alt="" aria-hidden="true" width={22} height={22} unoptimized className="shrink-0" />
      <span className="flex flex-1 flex-col gap-0.5">
        <span className={cx("t-corps", danger ? "text-erreur" : "text-encre")}>{title}</span>
        <span className="t-petit text-doux">{text}</span>
      </span>
      <Image src="/icons/action-droite.svg" alt="" aria-hidden="true" width={16} height={16} unoptimized className="shrink-0" />
    </>
  );
}

function Cancelled({ booking }: { booking: Booking }) {
  return (
    <StatusCard
      eyebrow={booking.reference}
      title="Votre réservation est annulée"
      text="Un e-mail de confirmation d’annulation vient de vous être envoyé. Nous espérons vous accueillir prochainement à Baïnem."
      rows={[
        { label: "Séjour annulé", value: cancelRange(booking) },
        { label: "Frais d’annulation", value: "0 DZD [exemple — selon conditions]" },
        { label: "Annulée le", value: booking.cancelledAt ? formatMixed(booking.cancelledAt) : "—" },
      ]}
      actions={
        <>
          <ButtonLink href="/reserver">Faire une nouvelle réservation</ButtonLink>
          <ButtonLink href="/" variant="contour-sombre">
            Retour à l’accueil
          </ButtonLink>
        </>
      }
    />
  );
}
