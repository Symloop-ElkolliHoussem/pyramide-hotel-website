/**
 * MAQUETTE — disponibilités simulées (aucun appel au PMS).
 *
 * Règles déterministes reprises de la maquette Figma :
 * - l’hôtel est complet les nuits des 30 et 31 octobre et du 1ᵉʳ novembre 2026
 *   (dates barrées du calendrier 05.1 ; toute recherche qui inclut l’une de ces
 *   nuits mène à l’écran « Aucune disponibilité » 05.3a) ;
 * - la Chambre Twin — vue sur mer est complète les nuits du 22 au 24 octobre 2026
 *   (séjour du 22 au 25 octobre, écran 05.3) ;
 * - toutes les autres dates sont disponibles ;
 * - une chambre n’est proposée que si sa capacité (+ 1 matelas supplémentaire
 *   lorsqu’il est autorisé) couvre le nombre de personnes par chambre.
 */

import { ROOMS, type Room, type RoomSlug } from "@/data/hotel";
import { addDays, diffDays, type IsoDate } from "@/lib/dates";

/** Nuits où tout l’hôtel affiche complet. */
export const HOTEL_FULL_NIGHTS: ReadonlySet<IsoDate> = new Set(["2026-10-30", "2026-10-31", "2026-11-01"]);

/** Nuits complètes par type de chambre. */
const ROOM_FULL_NIGHTS: Partial<Record<RoomSlug, ReadonlySet<IsoDate>>> = {
  "twin-vue-sur-mer": new Set(["2026-10-22", "2026-10-23", "2026-10-24"]),
};

/** Durée maximale d’un séjour réservé en ligne [à confirmer]. */
export const MAX_NIGHTS = 30;
/** Personnes maximum par chambre (avec matelas supplémentaire). */
export const MAX_PERSONS_PER_ROOM = 3;
export const MAX_ROOMS = 3;

export function nightsOf(arrival: IsoDate, departure: IsoDate): IsoDate[] {
  const n = diffDays(arrival, departure);
  return Array.from({ length: Math.max(0, n) }, (_, i) => addDays(arrival, i));
}

export function isHotelFullNight(date: IsoDate): boolean {
  return HOTEL_FULL_NIGHTS.has(date);
}

export function isRoomAvailable(slug: RoomSlug, arrival: IsoDate, departure: IsoDate): boolean {
  const full = ROOM_FULL_NIGHTS[slug];
  return nightsOf(arrival, departure).every((n) => !HOTEL_FULL_NIGHTS.has(n) && !full?.has(n));
}

export function personsPerRoom(adults: number, children: number, rooms: number): number {
  return Math.ceil((adults + children) / Math.max(1, rooms));
}

/** La chambre peut-elle accueillir ce nombre de personnes (matelas compris) ? */
export function roomFits(room: Room, persons: number): boolean {
  return room.capacity + (room.extraBedAllowed ? 1 : 0) >= persons;
}

/** Matelas supplémentaires nécessaires par chambre. */
export function extraBedsNeeded(room: Room, persons: number): number {
  return Math.max(0, persons - room.capacity);
}

export type SearchResult = {
  room: Room;
  available: boolean;
  /** Matelas supplémentaires (toutes chambres confondues). */
  extraBeds: number;
  nights: number;
  roomTotal: number;
  total: number;
};

export type SearchOutcome = {
  results: SearchResult[];
  /** Chambres exclues car trop petites pour le nombre de personnes. */
  excluded: Room[];
  /** Nuits du séjour où l’hôtel est complet (écran 05.3a si non vide). */
  fullNights: IsoDate[];
};

export function searchRooms(c: {
  arrival: IsoDate;
  departure: IsoDate;
  adults: number;
  children: number;
  rooms: number;
}): SearchOutcome {
  const persons = personsPerRoom(c.adults, c.children, c.rooms);
  const nights = Math.max(0, diffDays(c.arrival, c.departure));
  const fullNights = nightsOf(c.arrival, c.departure).filter(isHotelFullNight);
  const results: SearchResult[] = [];
  const excluded: Room[] = [];
  for (const room of ROOMS) {
    if (!roomFits(room, persons)) {
      excluded.push(room);
      continue;
    }
    const extra = extraBedsNeeded(room, persons) * c.rooms;
    const roomTotal = room.price * nights * c.rooms;
    results.push({
      room,
      available: isRoomAvailable(room.slug, c.arrival, c.departure),
      extraBeds: extra,
      nights,
      roomTotal,
      total: roomTotal + extra * 2500,
    });
  }
  return { results, excluded, fullNights };
}

export type DateSuggestion = {
  arrival: IsoDate;
  departure: IsoDate;
  roomTypes: number;
  minPrice: number;
};

/**
 * Dates proches disponibles (± 3 jours autour de l’arrivée, même durée),
 * dans l’ordre chronologique, 3 au maximum.
 */
export function suggestDates(
  c: { arrival: IsoDate; departure: IsoDate; adults: number; children: number; rooms: number },
  today: IsoDate | null,
): DateSuggestion[] {
  const nights = Math.max(1, diffDays(c.arrival, c.departure));
  const out: DateSuggestion[] = [];
  for (let offset = -3; offset <= 3; offset++) {
    if (offset === 0) continue;
    const arrival = addDays(c.arrival, offset);
    if (today && arrival < today) continue;
    const departure = addDays(arrival, nights);
    const { results } = searchRooms({ ...c, arrival, departure });
    const free = results.filter((r) => r.available);
    if (free.length === 0) continue;
    out.push({
      arrival,
      departure,
      roomTypes: free.length,
      minPrice: Math.min(...free.map((r) => r.room.price)),
    });
  }
  return out.slice(0, 3);
}
