import { EXTRAS, HOTEL, ROOMS } from "@/data/hotel";
import { formatDZD } from "@/lib/format";

/**
 * Pages légales (09.1 → 09.3). Structure proposée par SYMLOOP : le texte
 * juridique définitif est à fournir et à valider par l’hôtel (et son conseil).
 */

export type LegalBlock = string | { type: "table"; caption: string; head: [string, string]; rows: [string, string][] };

export type LegalSection = { id: string; title: string; blocks: LegalBlock[] };

export type LegalDoc = {
  slug: "mentions-legales" | "cgv" | "confidentialite";
  href: string;
  eyebrow: string;
  title: string;
  /** Libellé court pour « Voir aussi ». */
  linkLabel: string;
  description: string;
  sections: LegalSection[];
};

const tarifs = ROOMS.map((r) => `${r.fullName} ${formatDZD(r.price)}`).join(" · ");

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "mentions-legales",
    href: "/mentions-legales",
    eyebrow: "Informations légales",
    title: "Mentions légales",
    linkLabel: "Mentions légales",
    description: `Mentions légales du site de l’${HOTEL.name} (Baïnem, Alger) : éditeur, hébergement, conception, propriété intellectuelle et crédits.`,
    sections: [
      {
        id: "editeur",
        title: "1. Éditeur du site",
        blocks: [
          `${HOTEL.name} — [raison sociale et forme juridique à renseigner], au capital de [à renseigner] DZD.`,
          "Registre du commerce : [n° RC] · NIF : [à renseigner] · NIS : [à renseigner] · Article d’imposition : [à renseigner].",
          `Siège : [adresse à renseigner], Baïnem, Alger — Algérie · Tél. : ${HOTEL.phone} · E-mail : ${HOTEL.email}.`,
          "Directeur de la publication : [nom à renseigner].",
        ],
      },
      {
        id: "hebergement",
        title: "2. Hébergement",
        blocks: ["Le site est hébergé par [nom de l’hébergeur, adresse et téléphone à renseigner]."],
      },
      {
        id: "conception",
        title: "3. Conception et réalisation",
        blocks: [`Site conçu et réalisé par ${HOTEL.agency}.`],
      },
      {
        id: "propriete",
        title: "4. Propriété intellectuelle",
        blocks: [
          `L’ensemble des contenus du site (textes, photographies, logo, éléments graphiques) est la propriété de l’${HOTEL.name}, sauf mention contraire. Toute reproduction sans autorisation écrite est interdite.`,
        ],
      },
      {
        id: "credits",
        title: "5. Crédits photographiques",
        blocks: [`Photographies : ${HOTEL.name} [crédits à confirmer].`],
      },
    ],
  },
  {
    slug: "cgv",
    href: "/cgv",
    eyebrow: "Conditions de réservation",
    title: "Conditions générales de vente",
    linkLabel: "Conditions générales de vente",
    description: `Conditions générales de vente et d’annulation de l’${HOTEL.name} : réservation, tarifs, confirmation et règlement, modification, annulation, arrivée et départ.`,
    sections: [
      {
        id: "objet",
        title: "1. Objet",
        blocks: [
          `Les présentes conditions s’appliquent aux réservations de chambres effectuées sur le site de l’${HOTEL.name}, par demande ou en ligne.`,
        ],
      },
      {
        id: "reservation",
        title: "2. Réservation",
        blocks: [
          "La réservation est enregistrée à la validation du parcours en ligne ou de la demande. Elle devient ferme après confirmation par la réception, envoyée par e-mail [délai à confirmer].",
        ],
      },
      {
        id: "tarifs",
        title: "3. Tarifs",
        blocks: [
          `Les tarifs sont indiqués en dinars algériens (DZD), par chambre et par nuit : ${tarifs}. Taxe de séjour : [à confirmer].`,
          `Suppléments : ${EXTRAS.extraBed.label.toLowerCase()}, ${formatDZD(EXTRAS.extraBed.price)} ${EXTRAS.extraBed.unit} ; ${EXTRAS.lateCheckout.label.toLowerCase()}, ${formatDZD(
            EXTRAS.lateCheckout.price,
          )} ${EXTRAS.lateCheckout.unit} (selon disponibilité).`,
        ],
      },
      {
        id: "confirmation-reglement",
        title: "4. Confirmation et règlement",
        blocks: ["La réservation est confirmée par la réception. Le séjour se règle à l’hôtel [modalités à confirmer]."],
      },
      {
        id: "modification-annulation",
        title: "5. Modification et annulation",
        blocks: [
          "Toute modification est soumise à disponibilité et à l’accord de la réception. Les frais d’annulation dépendent du délai avant l’arrivée :",
          {
            type: "table",
            caption: "Frais d’annulation selon le délai avant l’arrivée (à confirmer par l’hôtel)",
            head: ["Délai avant l’arrivée", "Frais d’annulation"],
            rows: [
              ["Plus de [x] jours", "Sans frais [à confirmer]"],
              ["Entre [x] et [y] jours", "[à confirmer]"],
              ["Moins de [y] jours", "[à confirmer]"],
            ],
          },
        ],
      },
      {
        id: "non-presentation",
        title: "6. Non-présentation",
        blocks: ["En cas de non-présentation sans annulation préalable, [frais de non-présentation à confirmer]."],
      },
      {
        id: "arrivee-depart",
        title: "7. Arrivée et départ",
        blocks: [
          `Arrivée à partir de [heure à confirmer], départ avant [heure à confirmer]. Au-delà, chaque heure supplémentaire après le check-out est facturée ${formatDZD(
            EXTRAS.lateCheckout.price,
          )}. Une pièce d’identité est demandée pour chaque adulte.`,
        ],
      },
      {
        id: "litiges",
        title: "8. Litiges",
        blocks: ["Les présentes conditions sont régies par le droit algérien. [Juridiction compétente à confirmer]."],
      },
    ],
  },
  {
    slug: "confidentialite",
    href: "/confidentialite",
    eyebrow: "Données personnelles",
    title: "Politique de confidentialité",
    linkLabel: "Politique de confidentialité",
    description: `Politique de confidentialité de l’${HOTEL.name} : données collectées, finalités, cadre légal (loi n° 18-07), durée de conservation, droits et cookies.`,
    sections: [
      {
        id: "responsable",
        title: "1. Responsable du traitement",
        blocks: [`${HOTEL.name} — [raison sociale et adresse à renseigner]. Contact : ${HOTEL.email}.`],
      },
      {
        id: "donnees",
        title: "2. Données collectées",
        blocks: [
          "Lors d’une réservation ou d’un message : civilité, nom, prénom, e-mail, téléphone, pays de résidence, dates de séjour, demandes particulières.",
        ],
      },
      {
        id: "finalites",
        title: "3. Finalités",
        blocks: [
          "Gérer votre réservation et votre séjour, répondre à vos demandes, respecter les obligations légales (fiche de police à l’arrivée) et, avec votre accord, vous envoyer les offres de l’hôtel.",
        ],
      },
      {
        id: "cadre-legal",
        title: "4. Cadre légal",
        blocks: [
          "Traitement conforme à la loi n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel [déclarations auprès de l’ANPDP à confirmer].",
        ],
      },
      {
        id: "conservation",
        title: "5. Durée de conservation",
        blocks: ["[Durées à confirmer par l’hôtel — ex. durée du séjour puis obligations comptables et légales]."],
      },
      {
        id: "droits",
        title: "6. Vos droits",
        blocks: [
          `Vous disposez d’un droit d’accès, de rectification et d’opposition. Écrivez à ${HOTEL.email} en indiquant votre référence de réservation.`,
        ],
      },
      {
        id: "cookies",
        title: "7. Cookies",
        blocks: ["Le site utilise uniquement les cookies nécessaires à son fonctionnement [liste et outil de mesure d’audience à confirmer]."],
      },
    ],
  },
];

export function getLegalDoc(slug: LegalDoc["slug"]): LegalDoc {
  return LEGAL_DOCS.find((d) => d.slug === slug)!;
}
