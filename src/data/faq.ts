import { EXTRAS, ROOMS } from "@/data/hotel";
import { formatDZD } from "@/lib/format";

/** Réponse par défaut du composant « Élément FAQ » (question repliée dans la maquette). */
export const DEFAULT_ANSWER = "Réponse à renseigner par l’hôtel.";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  /** Lien affiché après la réponse. */
  link?: { href: string; label: string };
  /** Ouvert au chargement (comme dans la maquette 07). */
  open: boolean;
  /** Repris dans les données structurées FAQPage (réponses réellement renseignées). */
  structured: boolean;
};

export type FaqGroup = { id: string; title: string; items: FaqItem[] };

/** « Double vue sur mer 12 800 DZD · Single VIP vue sur mer 12 800 DZD · … » */
const tarifs = ROOMS.map((r) => `${r.fullName.replace(/^Chambre /, "").replace(" — ", " ")} ${formatDZD(r.price)}`).join(" · ");

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "arrivee-sejour",
    title: "Arrivée & séjour",
    items: [
      {
        id: "horaires",
        question: "Quels sont les horaires d’arrivée et de départ ?",
        answer: "Horaires d’arrivée (check-in) et de départ (check-out) : à renseigner par l’hôtel.",
        open: true,
        structured: false,
      },
      {
        id: "arrivee-anticipee",
        question: "Est-il possible d’arriver plus tôt ou de partir plus tard ?",
        answer: `Départ tardif possible selon disponibilité : heures supplémentaires après le check-out facturées ${formatDZD(
          EXTRAS.lateCheckout.price,
        )} par heure. Heure de check-out et arrivée anticipée : à renseigner par l’hôtel.`,
        open: true,
        structured: true,
      },
      {
        id: "types-chambres",
        question: "Quels types de chambres proposez-vous ?",
        answer:
          "Côté mer : chambres Double, Single VIP et Twin, ainsi que la chambre Nuit de noces avec balcon. Côté montagne : chambres Double, Single et Triple.",
        link: { href: "/chambres", label: "Voir les chambres et les tarifs" },
        open: true,
        structured: true,
      },
    ],
  },
  {
    id: "reservation",
    title: "Réservation",
    items: [
      {
        id: "comment-reserver",
        question: "Comment réserver une chambre ?",
        answer:
          "Réservez en ligne en quelques étapes (bouton « Réserver ») ou envoyez une demande depuis la page Réservation : l’hôtel vous recontacte pour confirmer la disponibilité. Modalités de confirmation : à compléter par l’hôtel.",
        link: { href: "/reserver", label: "Réserver en ligne" },
        open: true,
        structured: true,
      },
      {
        id: "tarifs",
        question: "Quels sont les tarifs ?",
        answer: `Par nuit : ${tarifs}.`,
        open: true,
        structured: true,
      },
      {
        id: "annulation",
        question: "Quelles sont les conditions d’annulation ?",
        answer: "Conditions d’annulation : à confirmer par l’hôtel — voir les conditions générales de vente.",
        link: { href: "/cgv#modification-annulation", label: "Lire les conditions d’annulation" },
        open: false,
        structured: false,
      },
    ],
  },
  {
    id: "services",
    title: "Services",
    items: [
      {
        id: "petit-dejeuner",
        question: "Le petit-déjeuner est-il inclus ?",
        answer: "Petit-déjeuner (inclus ou en supplément, horaires) : à renseigner par l’hôtel.",
        open: true,
        structured: false,
      },
      { id: "parking", question: "L’hôtel dispose-t-il d’un parking ?", answer: DEFAULT_ANSWER, open: false, structured: false },
      { id: "wifi", question: "Le Wi-Fi est-il disponible ?", answer: DEFAULT_ANSWER, open: false, structured: false },
      {
        id: "lit-enfants",
        question: "Peut-on ajouter un lit ou venir avec des enfants ?",
        answer: `${EXTRAS.extraBed.label} : ${formatDZD(EXTRAS.extraBed.price)} ${EXTRAS.extraBed.unit}. Lit bébé et conditions pour les enfants : à renseigner par l’hôtel.`,
        open: true,
        structured: true,
      },
    ],
  },
  {
    id: "restauration-evenements",
    title: "Restauration & événements",
    items: [
      {
        id: "restauration",
        question: "Où peut-on se restaurer à l’hôtel ?",
        answer:
          "La cafétéria « Nefertiti » (Coffee & Brunch) se trouve au niveau de la réception, le Pyramid Restaurant au 6ᵉ étage avec vue panoramique sur la mer, et le rooftop, salon de thé, au 7ᵉ étage. Horaires : à renseigner par l’hôtel.",
        link: { href: "/restauration", label: "Découvrir la restauration" },
        open: true,
        structured: true,
      },
      {
        id: "evenement",
        question: "Peut-on organiser un événement à l’hôtel ?",
        answer: "L’hôtel dispose d’une salle des fêtes au 1ᵉʳ étage. Capacité, prestations et tarifs : à renseigner par l’hôtel.",
        link: { href: "/contact?objet=devis", label: "Demander un devis" },
        open: false,
        structured: true,
      },
    ],
  },
];
