/**
 * Dates « calendaires » (sans heure) au format ISO AAAA-MM-JJ.
 * Tous les calculs se font en UTC pour éviter les décalages de fuseau.
 */

export type IsoDate = string; // "2026-10-22"

const DAYS_SHORT = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const DAYS_LONG = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MONTHS_SHORT = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const MONTHS_LONG = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

/** En-têtes du calendrier (semaine commençant le lundi). */
export const WEEKDAYS_CAL = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];
export const WEEKDAYS_CAL_LONG = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

export function isIsoDate(s: unknown): s is IsoDate {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = toUtc(s);
  return !Number.isNaN(d.getTime()) && fromUtc(d) === s;
}

export function toUtc(iso: IsoDate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function fromUtc(d: Date): IsoDate {
  return d.toISOString().slice(0, 10);
}

export function makeIso(year: number, monthIndex: number, day: number): IsoDate {
  return fromUtc(new Date(Date.UTC(year, monthIndex, day)));
}

export function addDays(iso: IsoDate, n: number): IsoDate {
  const d = toUtc(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return fromUtc(d);
}

export function diffDays(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / 86_400_000);
}

/** Aujourd’hui (date locale du navigateur / serveur). */
export function todayIso(): IsoDate {
  const now = new Date();
  return makeIso(now.getFullYear(), now.getMonth(), now.getDate());
}

/** « jeu. 22 oct. 2026 » */
export function formatShort(iso: IsoDate, withYear = true): string {
  const d = toUtc(iso);
  const base = `${DAYS_SHORT[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`;
  return withYear ? `${base} ${d.getUTCFullYear()}` : base;
}

/** « jeudi 22 octobre 2026 » */
export function formatLong(iso: IsoDate): string {
  const d = toUtc(iso);
  return `${DAYS_LONG[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** « jeu. 22 octobre 2026 » (e-mails 05.8) */
export function formatMixed(iso: IsoDate): string {
  const d = toUtc(iso);
  return `${DAYS_SHORT[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** « 22 octobre » / « 1ᵉʳ novembre » */
export function formatDayMonth(iso: IsoDate): string {
  const d = toUtc(iso);
  const day = d.getUTCDate() === 1 ? "1ᵉʳ" : String(d.getUTCDate());
  return `${day} ${MONTHS_LONG[d.getUTCMonth()]}`;
}

/** « 22 / 10 / 2026 » */
export function formatNumeric(iso: IsoDate): string {
  const [y, m, d] = iso.split("-");
  return `${d} / ${m} / ${y}`;
}

/** « Octobre 2026 » */
export function formatMonthTitle(year: number, monthIndex: number): string {
  const m = MONTHS_LONG[monthIndex];
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${year}`;
}

/** « du jeu. 22 oct. au dim. 25 oct. 2026 » */
export function formatRange(arrival: IsoDate, departure: IsoDate): string {
  return `du ${formatShort(arrival, false)} au ${formatShort(departure)}`;
}

/** « jeu. 22 oct. → dim. 25 oct. 2026 » */
export function formatArrowRange(arrival: IsoDate, departure: IsoDate): string {
  return `${formatShort(arrival, false)} → ${formatShort(departure)}`;
}

/** « Séjour du 22 au 25 octobre 2026 » (même mois) ou « du 30 octobre au 1ᵉʳ novembre 2026 ». */
export function formatStayTitle(arrival: IsoDate, departure: IsoDate): string {
  const a = toUtc(arrival);
  const d = toUtc(departure);
  const year = d.getUTCFullYear();
  if (a.getUTCMonth() === d.getUTCMonth() && a.getUTCFullYear() === d.getUTCFullYear()) {
    return `du ${a.getUTCDate()} au ${d.getUTCDate()} ${MONTHS_LONG[d.getUTCMonth()]} ${year}`;
  }
  return `du ${formatDayMonth(arrival)} au ${formatDayMonth(departure)} ${year}`;
}

/**
 * Grille d’un mois : tableau de semaines (lundi → dimanche), cases vides = null.
 */
export function monthGrid(year: number, monthIndex: number): (IsoDate | null)[][] {
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7; // lundi = 0
  const cells: (IsoDate | null)[] = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(makeIso(year, monthIndex, day));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (IsoDate | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
