/**
 * Données de l’hôtel — source unique pour les chambres, les tarifs, les
 * suppléments, les coordonnées et les photos.
 *
 * Tarifs officiels (DZD par chambre et par nuit) fournis par l’hôtel.
 * Les valeurs entre crochets « [à confirmer] » / « à renseigner » sont des
 * emplacements prévus dans la maquette Figma : l’hôtel doit les fournir.
 */

export const HOTEL = {
  /** Nom tel qu’il figure dans la maquette et sur le logo de l’hôtel. */
  name: "Hôtel Pyramides",
  location: "Baïnem · Alger",
  locationLong: "Baïnem, Alger — Algérie",
  address: "Adresse à renseigner",
  /** Téléphone de la réception — à renseigner (pas de lien tel: tant qu’il est fictif). */
  phone: "+213 XX XX XX XX",
  phoneHref: null as string | null,
  /** E-mail de contact — à renseigner (pas de lien mailto: tant qu’il est fictif). */
  email: "contact@… (à renseigner)",
  emailHref: null as string | null,
  receptionHours: "Horaires de la réception : à renseigner par l’hôtel",
  social: "Liens à renseigner",
  agency: "SYMLOOP, Sétif — Algérie",
  roomCount: "≈ 40",
  /** Adresse publique du site — à remplacer par le domaine définitif. */
  siteUrl: "https://www.hotel-pyramides.example",
} as const;

export type PhotoKey =
  | "logo"
  | "roof-sunset-wide"
  | "roof-fauteuil"
  | "roof-jour"
  | "roof-montagne"
  | "resto-table"
  | "resto-sunset"
  | "resto-salle"
  | "cafe-comptoir"
  | "cafe-brunch"
  | "ch-twin"
  | "ch-double"
  | "ch-mont-1"
  | "ch-mont-2"
  | "ch-triple-1"
  | "ch-triple-2"
  | "noces-1"
  | "noces-2"
  | "noces-3"
  | "noces-4";

export type Photo = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

/** Photos réelles de l’hôtel (dossier hotel-pictures, identiques à la maquette). */
export const PHOTOS: Record<PhotoKey, Photo> = {
  logo: { src: "/images/logo.png", width: 512, height: 512, alt: "Logo de l’Hôtel Pyramides" },
  "roof-sunset-wide": {
    src: "/images/roof-sunset-wide.jpg",
    width: 1280,
    height: 1280,
    alt: "Le rooftop du 7ᵉ étage au coucher du soleil, sa pergola et la vue sur la mer",
  },
  "roof-fauteuil": {
    src: "/images/roof-fauteuil.jpg",
    width: 1280,
    height: 960,
    alt: "Fauteuil en rotin face au soleil couchant sur le rooftop",
  },
  "roof-jour": {
    src: "/images/roof-jour.jpg",
    width: 960,
    height: 1280,
    alt: "Le rooftop en journée : tables, pelouse et vue sur la mer",
  },
  "roof-montagne": {
    src: "/images/roof-montagne.jpg",
    width: 960,
    height: 1280,
    alt: "Le rooftop côté montagne, avec ses palmiers en pot",
  },
  "resto-table": {
    src: "/images/resto-table.jpg",
    width: 960,
    height: 1280,
    alt: "Table du Pyramid Restaurant face aux baies vitrées et à la mer",
  },
  "resto-sunset": {
    src: "/images/resto-sunset.jpg",
    width: 1280,
    height: 960,
    alt: "Coucher de soleil sur la mer depuis le Pyramid Restaurant",
  },
  "resto-salle": {
    src: "/images/resto-salle.jpg",
    width: 1280,
    height: 960,
    alt: "La salle du Pyramid Restaurant et ses grandes baies vitrées",
  },
  "cafe-comptoir": {
    src: "/images/cafe-comptoir.jpg",
    width: 960,
    height: 1280,
    alt: "Le comptoir de la cafétéria « Nefertiti », Coffee & Brunch",
  },
  "cafe-brunch": {
    src: "/images/cafe-brunch.jpg",
    width: 1080,
    height: 1080,
    alt: "Le buffet brunch de la cafétéria « Nefertiti »",
  },
  "ch-twin": {
    src: "/images/ch-twin.jpg",
    width: 1280,
    height: 1280,
    alt: "Chambre Twin vue sur mer : deux lits simples et coin salon devant la baie vitrée",
  },
  "ch-double": {
    src: "/images/ch-double.jpg",
    width: 960,
    height: 1280,
    alt: "Chambre vue sur mer avec grand lit et porte-fenêtre ouverte sur la mer",
  },
  "ch-mont-1": {
    src: "/images/ch-mont-1.jpg",
    width: 960,
    height: 1280,
    alt: "Chambre Double vue sur montagne avec grand lit et tête de lit en bois",
  },
  "ch-mont-2": {
    src: "/images/ch-mont-2.jpg",
    width: 960,
    height: 1280,
    alt: "Chambre Single vue sur montagne",
  },
  "ch-triple-1": {
    src: "/images/ch-triple-1.jpg",
    width: 960,
    height: 1280,
    alt: "Chambre Triple vue sur montagne : trois lits simples",
  },
  "ch-triple-2": {
    src: "/images/ch-triple-2.jpg",
    width: 960,
    height: 1280,
    alt: "Chambre Triple vue sur montagne, vue depuis l’entrée",
  },
  "noces-1": {
    src: "/images/noces-1.jpg",
    width: 960,
    height: 1280,
    alt: "Chambre Nuit de noces décorée de ballons rouges, vue sur mer et balcon",
  },
  "noces-2": {
    src: "/images/noces-2.jpg",
    width: 960,
    height: 1280,
    alt: "Chambre Nuit de noces : lit décoré et baie vitrée face à la mer",
  },
  "noces-3": {
    src: "/images/noces-3.jpg",
    width: 960,
    height: 1280,
    alt: "Chambre Nuit de noces : lit décoré de deux cygnes en serviettes formant un cœur, pétales de rose et bougie",
  },
  "noces-4": {
    src: "/images/noces-4.jpg",
    width: 960,
    height: 1280,
    alt: "Salle de bain de la chambre Nuit de noces : peignoir et chaussons brodés au logo de l’hôtel, produits d’accueil et pétales de rose",
  },
};

/* ------------------------------------------------------------------ */
/* Chambres                                                            */
/* ------------------------------------------------------------------ */

export type RoomSlug =
  | "double-vue-sur-mer"
  | "single-vip-vue-sur-mer"
  | "twin-vue-sur-mer"
  | "double-vue-sur-montagne"
  | "single-vue-sur-montagne"
  | "triple-vue-sur-montagne"
  | "nuit-de-noces";

export type Room = {
  slug: RoomSlug;
  /** Ex. « Chambre Double » (titre des cartes et fiches). */
  name: string;
  /** Ex. « Chambre Double — vue sur mer » (listes, récapitulatifs, CGV). */
  fullName: string;
  /** Ex. « Double — vue sur mer » (récapitulatif de réservation). */
  shortName: string;
  /** Surtitre : « Vue sur mer », « Vue sur montagne », « Vue sur mer avec balcon ». */
  viewLabel: string;
  view: "mer" | "montagne";
  /** Tarif officiel par nuit en DZD. */
  price: number;
  /** Nombre de personnes sans matelas supplémentaire. */
  capacity: number;
  /** Matelas supplémentaire possible (3ᵉ adulte) — selon la maquette 05.3. */
  extraBedAllowed: boolean;
  capacityLabel: string;
  beds: string;
  /** Phrase courte (cartes « Nos chambres », « Découvrez aussi »). */
  cardText: string;
  /** Texte court des cartes « Découvrez aussi » (fiches 02.x). */
  relatedText: string;
  /** Texte de la liste 02 et des résultats 05.3. */
  listText: string;
  /** Chapô de la fiche 02.x. */
  intro: string;
  /** Trois puces (liste 02 et fiche). */
  features: string[];
  /** Photos : principale + deux secondaires de la fiche. */
  photos: [PhotoKey, PhotoKey, PhotoKey];
  /** Photo des cartes (peut différer de la photo principale). */
  cardPhoto: PhotoKey;
  /** Cartes « Découvrez aussi » (ordre de la maquette). */
  related: [RoomSlug, RoomSlug, RoomSlug];
};

export const ROOMS: Room[] = [
  {
    slug: "double-vue-sur-mer",
    name: "Chambre Double",
    fullName: "Chambre Double — vue sur mer",
    shortName: "Double — vue sur mer",
    viewLabel: "Vue sur mer",
    view: "mer",
    price: 12800,
    capacity: 2,
    extraBedAllowed: true,
    capacityLabel: "2 personnes",
    beds: "Un grand lit",
    cardText: "Un grand lit, côté mer.",
    relatedText: "Un grand lit, côté mer.",
    listText: "Un grand lit, côté mer.",
    intro: "Un grand lit et une vue dégagée sur la mer.",
    features: ["Un grand lit", "Vue sur mer", "2 personnes"],
    photos: ["ch-double", "roof-jour", "roof-fauteuil"],
    cardPhoto: "ch-double",
    related: ["single-vip-vue-sur-mer", "twin-vue-sur-mer", "nuit-de-noces"],
  },
  {
    slug: "single-vip-vue-sur-mer",
    name: "Chambre Single VIP",
    fullName: "Chambre Single VIP — vue sur mer",
    shortName: "Single VIP — vue sur mer",
    viewLabel: "Vue sur mer",
    view: "mer",
    price: 12800,
    capacity: 1,
    extraBedAllowed: false,
    capacityLabel: "1 personne",
    beds: "[à confirmer]",
    cardText: "Single VIP, côté mer.",
    relatedText: "Single VIP, côté mer.",
    listText: "Une chambre Single VIP côté mer. Description détaillée : à fournir par l’hôtel.",
    intro: "Une chambre Single VIP côté mer. Description détaillée : à fournir par l’hôtel.",
    features: ["Vue sur mer", "1 personne", "Prestations VIP : à renseigner par l’hôtel"],
    photos: ["ch-double", "roof-sunset-wide", "roof-fauteuil"],
    cardPhoto: "ch-double",
    related: ["double-vue-sur-mer", "twin-vue-sur-mer", "single-vue-sur-montagne"],
  },
  {
    slug: "twin-vue-sur-mer",
    name: "Chambre Twin",
    fullName: "Chambre Twin — vue sur mer",
    shortName: "Twin — vue sur mer",
    viewLabel: "Vue sur mer",
    view: "mer",
    price: 11600,
    capacity: 2,
    extraBedAllowed: true,
    capacityLabel: "2 personnes",
    beds: "Deux lits simples",
    cardText: "Deux lits simples et un coin salon face à la mer.",
    relatedText: "Deux lits simples, face à la mer.",
    listText: "Deux lits simples et un coin salon installé devant la baie vitrée, face à la mer.",
    intro: "Deux lits simples et un coin salon installé devant la baie vitrée, face à la mer.",
    features: ["Deux lits simples", "Vue sur mer", "Coin salon"],
    photos: ["ch-twin", "roof-sunset-wide", "roof-fauteuil"],
    cardPhoto: "ch-twin",
    related: ["double-vue-sur-mer", "single-vip-vue-sur-mer", "triple-vue-sur-montagne"],
  },
  {
    slug: "double-vue-sur-montagne",
    name: "Chambre Double",
    fullName: "Chambre Double — vue sur montagne",
    shortName: "Double — vue sur montagne",
    viewLabel: "Vue sur montagne",
    view: "montagne",
    price: 9600,
    capacity: 2,
    extraBedAllowed: true,
    capacityLabel: "2 personnes",
    beds: "Un grand lit",
    cardText: "Un grand lit, côté montagne.",
    relatedText: "Un grand lit, côté montagne.",
    listText: "Un grand lit, côté montagne.",
    intro: "Un grand lit, côté montagne.",
    features: ["Un grand lit", "Vue sur montagne", "2 personnes"],
    photos: ["ch-mont-1", "ch-mont-2", "roof-montagne"],
    cardPhoto: "ch-mont-1",
    related: ["single-vue-sur-montagne", "triple-vue-sur-montagne", "double-vue-sur-mer"],
  },
  {
    slug: "single-vue-sur-montagne",
    name: "Chambre Single",
    fullName: "Chambre Single — vue sur montagne",
    shortName: "Single — vue sur montagne",
    viewLabel: "Vue sur montagne",
    view: "montagne",
    price: 8600,
    capacity: 1,
    extraBedAllowed: false,
    capacityLabel: "1 personne",
    beds: "[à confirmer]",
    cardText: "Single, côté montagne.",
    relatedText: "Single, côté montagne.",
    listText: "Une chambre Single côté montagne. Description détaillée : à fournir par l’hôtel.",
    intro: "Une chambre Single côté montagne. Description détaillée : à fournir par l’hôtel.",
    features: ["Vue sur montagne", "1 personne", "Literie : à renseigner par l’hôtel"],
    photos: ["ch-mont-2", "ch-mont-1", "roof-montagne"],
    cardPhoto: "ch-mont-2",
    related: ["double-vue-sur-montagne", "triple-vue-sur-montagne", "single-vip-vue-sur-mer"],
  },
  {
    slug: "triple-vue-sur-montagne",
    name: "Chambre Triple",
    fullName: "Chambre Triple — vue sur montagne",
    shortName: "Triple — vue sur montagne",
    viewLabel: "Vue sur montagne",
    view: "montagne",
    price: 10600,
    capacity: 3,
    extraBedAllowed: false,
    capacityLabel: "3 personnes",
    beds: "Trois lits simples",
    cardText: "Trois lits simples, côté montagne.",
    relatedText: "Trois lits simples, côté montagne.",
    listText: "Trois lits simples côté montagne, pour les familles ou les séjours entre amis.",
    intro: "Trois lits simples côté montagne, pour les familles ou les séjours entre amis.",
    features: ["Trois lits simples", "Vue sur montagne", "Jusqu’à trois personnes"],
    photos: ["ch-triple-1", "ch-triple-2", "roof-montagne"],
    cardPhoto: "ch-triple-1",
    related: ["double-vue-sur-montagne", "single-vue-sur-montagne", "twin-vue-sur-mer"],
  },
  {
    slug: "nuit-de-noces",
    name: "Chambre Nuit de noces",
    fullName: "Chambre Nuit de noces — vue sur mer avec balcon",
    shortName: "Nuit de noces — vue sur mer avec balcon",
    viewLabel: "Vue sur mer avec balcon",
    view: "mer",
    price: 17800,
    capacity: 2,
    extraBedAllowed: false,
    capacityLabel: "2 personnes",
    beds: "Un grand lit",
    cardText: "Décorée pour l’occasion, avec balcon.",
    relatedText: "Décorée pour l’occasion, avec balcon.",
    listText: "Une chambre vue sur mer avec balcon, décorée pour l’occasion.",
    intro:
      "Une chambre vue sur mer avec balcon, décorée pour l’occasion, pour commencer votre vie à deux face à l’horizon.",
    features: [
      "Chambre vue sur mer avec balcon",
      "Décoration de la chambre incluse",
      "Détail de la prestation : à renseigner par l’hôtel",
    ],
    photos: ["noces-1", "noces-3", "noces-4"],
    cardPhoto: "noces-1",
    related: ["double-vue-sur-mer", "twin-vue-sur-mer", "single-vip-vue-sur-mer"],
  },
];

export function getRoom(slug: string): Room | undefined {
  return ROOMS.find((r) => r.slug === slug);
}

/** Ordre d’affichage de la liste 02 (fiches alternées) — sans la Nuit de noces, présentée à part. */
export const ROOM_LIST_ORDER: RoomSlug[] = [
  "double-vue-sur-mer",
  "single-vip-vue-sur-mer",
  "twin-vue-sur-mer",
  "double-vue-sur-montagne",
  "single-vue-sur-montagne",
  "triple-vue-sur-montagne",
];

/** Cartes « Nos chambres » de l’accueil (01). */
export const HOME_ROOMS: RoomSlug[] = ["double-vue-sur-mer", "twin-vue-sur-mer", "double-vue-sur-montagne"];

/** Équipements à confirmer par l’hôtel (fiches 02.x). */
export const ROOM_AMENITIES_TO_CONFIRM = [
  "Climatisation ?",
  "Wi-Fi ?",
  "Télévision ?",
  "Salle de bain privative ?",
  "Sèche-cheveux ?",
  "Produits d’accueil ?",
  "Coffre-fort ?",
  "Service en chambre ?",
];

/* ------------------------------------------------------------------ */
/* Suppléments                                                         */
/* ------------------------------------------------------------------ */

export const EXTRAS = {
  /** 2 500 DZD par personne (appliqué une fois par séjour, comme dans la maquette 05.3–05.7). */
  extraBed: {
    label: "Matelas supplémentaire pour adulte",
    shortLabel: "Matelas supplémentaire adulte",
    price: 2500,
    unit: "par personne",
  },
  /** 1 000 DZD par heure après l’heure de check-out. */
  lateCheckout: {
    label: "Heures supplémentaires après le check-out",
    shortLabel: "Départ tardif",
    price: 1000,
    unit: "par heure",
    maxHours: 6,
  },
} as const;

/** Taxe de séjour : à confirmer par l’hôtel (non calculée). */
export const TOURIST_TAX_LABEL = "[à confirmer]";

/* ------------------------------------------------------------------ */
/* Espaces                                                             */
/* ------------------------------------------------------------------ */

export const SPACES = [
  {
    id: "cafeteria",
    floor: "Niveau réception",
    name: "Cafétéria « Nefertiti »",
    text: "Coffee & Brunch, au niveau de la réception.",
    photo: "cafe-comptoir" as PhotoKey,
    href: "/restauration#cafeteria",
  },
  {
    id: "restaurant",
    floor: "6ᵉ étage",
    name: "Pyramid Restaurant",
    text: "Le restaurant de l’hôtel, avec vue panoramique sur la mer.",
    photo: "resto-salle" as PhotoKey,
    href: "/restauration#restaurant",
  },
  {
    id: "rooftop",
    floor: "7ᵉ étage",
    name: "Rooftop",
    text: "Salon de thé, lounge sous pergola, vues mer et montagne.",
    photo: "roof-jour" as PhotoKey,
    href: "/restauration#rooftop",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Galerie (04) — ordre de la mosaïque « Tout »                        */
/* ------------------------------------------------------------------ */

export type GalleryCategory = "chambres" | "restauration" | "rooftop" | "noces";

export const GALLERY_FILTERS: { id: "tout" | GalleryCategory; label: string }[] = [
  { id: "tout", label: "Tout" },
  { id: "chambres", label: "Chambres" },
  { id: "restauration", label: "Restauration" },
  { id: "rooftop", label: "Rooftop" },
  { id: "noces", label: "Nuit de noces" },
];

export type GalleryItem = {
  photo: PhotoKey;
  caption: string;
  category: GalleryCategory;
  /** Colonne de la mosaïque desktop (maquette 04 : 6 / 6 / 5 photos, + 2 photos Nuit de noces ajoutées le 15/10/2026). */
  column: 1 | 2 | 3;
};

/** 19 photos, dans l’ordre de lecture de la mosaïque (colonne par colonne). */
export const GALLERY: GalleryItem[] = [
  { column: 1, photo: "roof-sunset-wide", caption: "Rooftop — coucher de soleil", category: "rooftop" },
  { column: 1, photo: "cafe-comptoir", caption: "Cafétéria « Nefertiti » — le comptoir", category: "restauration" },
  { column: 1, photo: "noces-1", caption: "Nuit de noces — chambre décorée", category: "noces" },
  { column: 1, photo: "roof-fauteuil", caption: "Rooftop — face au couchant", category: "rooftop" },
  { column: 1, photo: "ch-triple-1", caption: "Chambre Triple — vue sur montagne", category: "chambres" },
  { column: 1, photo: "ch-triple-2", caption: "Chambre Triple", category: "chambres" },
  { column: 2, photo: "ch-twin", caption: "Chambre Twin — vue sur mer", category: "chambres" },
  { column: 2, photo: "ch-double", caption: "Chambre Double — vue sur mer", category: "chambres" },
  { column: 2, photo: "resto-sunset", caption: "Pyramid Restaurant — coucher de soleil", category: "restauration" },
  { column: 2, photo: "roof-montagne", caption: "Rooftop — côté montagne", category: "rooftop" },
  { column: 2, photo: "cafe-brunch", caption: "Cafétéria « Nefertiti » — brunch", category: "restauration" },
  { column: 2, photo: "ch-mont-1", caption: "Chambre Double — vue sur montagne", category: "chambres" },
  { column: 2, photo: "noces-4", caption: "Nuit de noces — la salle de bain", category: "noces" },
  { column: 3, photo: "resto-table", caption: "Pyramid Restaurant — table face à la mer", category: "restauration" },
  { column: 3, photo: "resto-salle", caption: "Pyramid Restaurant — la salle", category: "restauration" },
  { column: 3, photo: "roof-jour", caption: "Rooftop — vue d’ensemble", category: "rooftop" },
  { column: 3, photo: "ch-mont-2", caption: "Chambre Single — vue sur montagne", category: "chambres" },
  { column: 3, photo: "noces-2", caption: "Nuit de noces — vue sur mer", category: "noces" },
  { column: 3, photo: "noces-3", caption: "Nuit de noces — le lit décoré", category: "noces" },
];

/* ------------------------------------------------------------------ */
/* Carrousel du hero (01) — composant « Hero / Carrousel »             */
/* ------------------------------------------------------------------ */

export const HERO_SLIDES: { photo: PhotoKey; caption: string }[] = [
  { photo: "roof-sunset-wide", caption: "Le rooftop au coucher du soleil, 7ᵉ étage" },
  { photo: "roof-jour", caption: "Le rooftop côté mer, en journée" },
  { photo: "ch-double", caption: "Chambre Double, vue sur mer" },
  { photo: "resto-table", caption: "Pyramid Restaurant, au 6ᵉ étage" },
  { photo: "cafe-comptoir", caption: "Cafétéria « Nefertiti », niveau réception" },
];

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export const MAIN_NAV = [
  { href: "/", label: "Accueil" },
  { href: "/chambres", label: "Chambres & tarifs" },
  { href: "/restauration", label: "Restauration" },
  { href: "/galerie", label: "Galerie" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
] as const;

export const FOOTER_NAV = [
  { href: "/", label: "Accueil" },
  { href: "/chambres", label: "Chambres & tarifs" },
  { href: "/restauration", label: "Restauration" },
  { href: "/galerie", label: "Galerie" },
  { href: "/reservation", label: "Réservation" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "Questions fréquentes" },
] as const;

export const FOOTER_SPACES = [
  { href: "/restauration#cafeteria", label: "Cafétéria « Nefertiti » — niveau réception" },
  { href: "/restauration#restaurant", label: "Pyramid Restaurant — 6ᵉ étage" },
  { href: "/restauration#rooftop", label: "Rooftop, salon de thé — 7ᵉ étage" },
  { href: "/restauration#salle-des-fetes", label: "Salle des fêtes — 1ᵉʳ étage" },
] as const;
