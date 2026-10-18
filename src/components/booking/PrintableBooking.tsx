import Image from "next/image";
import { HOTEL, PHOTOS, getRoom } from "@/data/hotel";
import { optionsSummary, priceBreakdown, STATUS_LABELS, type Booking } from "@/lib/booking";
import { formatLong } from "@/lib/dates";
import { formatDZD } from "@/lib/format";
import { FORMULA_LABELS, guestsLabel } from "./derived";

/**
 * Récapitulatif imprimable d’une réservation (« Imprimer / PDF »).
 * Invisible à l’écran ; à l’impression, il remplace toute la page (voir « .document-impression » dans globals.css).
 */
export function PrintableBooking({ booking: b }: { booking: Booking }) {
  const room = getRoom(b.roomSlug);
  const price = priceBreakdown(b);
  const printedOn = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const title = b.status === "confirmee" ? "Réservation confirmée" : b.status === "annulee" ? "Réservation annulée" : "Réservation enregistrée";

  const stay: [string, string][] = [
    ["Arrivée", `${formatLong(b.arrival)} · à partir de [heure à confirmer]`],
    ["Départ", formatLong(b.departure)],
    ["Durée", `${price.nights} nuit${price.nights > 1 ? "s" : ""}`],
    ["Chambre", `${room?.fullName ?? ""}${b.rooms > 1 ? ` × ${b.rooms}` : ""}`],
    ["Voyageurs", guestsLabel(b.adults, b.children)],
    ["Formule", FORMULA_LABELS[b.formula]],
  ];
  const options = optionsSummary(b);
  if (options !== "Aucune option") stay.push(["Options", options]);
  if (b.arrivalTime) stay.push(["Heure d’arrivée prévue", b.arrivalTime]);
  if (b.guest.requests) stay.push(["Demandes particulières", b.guest.requests]);

  return (
    <div className="document-impression" aria-hidden="true">
      <div className="doc-entete">
        <Image src={PHOTOS.logo.src} alt="" width={64} height={64} unoptimized priority className="doc-logo" />
        <div className="doc-hotel">
          <p className="doc-nom">{HOTEL.name}</p>
          <p>{HOTEL.locationLong}</p>
          <p>
            Tél. : {HOTEL.phone} · {HOTEL.email}
          </p>
        </div>
        <p className="doc-date">Imprimé le {printedOn}</p>
      </div>

      <div className="doc-titre">
        <h1>{title}</h1>
        <p className="doc-ref">
          Référence <strong>{b.reference}</strong>
        </p>
        <p className="doc-statut">{STATUS_LABELS[b.status]}</p>
      </div>

      <h2>Client</h2>
      <table className="doc-table">
        <tbody>
          <tr>
            <th>Nom</th>
            <td>
              {b.guest.civility} {b.guest.firstName} {b.guest.lastName}
            </td>
          </tr>
          <tr>
            <th>E-mail</th>
            <td>{b.guest.email}</td>
          </tr>
          <tr>
            <th>Téléphone</th>
            <td>{b.guest.phone}</td>
          </tr>
        </tbody>
      </table>

      <h2>Séjour</h2>
      <table className="doc-table">
        <tbody>
          {stay.map(([k, v]) => (
            <tr key={k}>
              <th>{k}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Montant estimé</h2>
      <table className="doc-table doc-prix">
        <tbody>
          {price.lines.map((l) => (
            <tr key={l.label}>
              <th>{l.label}</th>
              <td>{l.amount === null ? l.note ?? "" : formatDZD(l.amount)}</td>
            </tr>
          ))}
          <tr className="doc-total">
            <th>Total estimé du séjour</th>
            <td>{formatDZD(price.total)}</td>
          </tr>
        </tbody>
      </table>

      {b.status === "en-attente" && (
        <>
          <h2>Et maintenant ?</h2>
          <ol className="doc-etapes">
            <li>La réception vérifie la disponibilité et vous envoie la confirmation par e-mail sous 24 h [délai à confirmer].</li>
            <li>Rien n’est à régler en ligne : la réception vous indique les modalités de règlement avec sa confirmation.</li>
            <li>À votre arrivée, présentez ce document et une pièce d’identité à la réception.</li>
          </ol>
        </>
      )}

      <p className="doc-pied">
        Document récapitulatif — la réservation devient ferme après confirmation par la réception. {HOTEL.name}, {HOTEL.locationLong}.
      </p>
    </div>
  );
}
