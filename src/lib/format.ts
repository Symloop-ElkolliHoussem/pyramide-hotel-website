const NBSP = " ";

/** 12800 → « 12 800 » (espaces insécables, comme la maquette). */
export function formatNumber(n: number): string {
  const s = Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return n < 0 ? `−${s}` : s;
}

/** 12800 → « 12 800 DZD ». */
export function formatDZD(n: number): string {
  return `${formatNumber(n)}${NBSP}DZD`;
}

/** Accord simple : 1 nuit / 3 nuits. */
export function plural(n: number, one: string, many: string): string {
  return `${n}${NBSP}${n > 1 ? many : one}`;
}

/** Concatène des classes CSS en ignorant les valeurs vides. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
