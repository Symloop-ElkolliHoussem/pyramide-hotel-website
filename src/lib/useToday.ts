"use client";

import { useSyncExternalStore } from "react";
import { todayIso, type IsoDate } from "@/lib/dates";

const noop = () => () => {};

/**
 * Date du jour lue dans le navigateur uniquement (null pendant le
 * pré-rendu statique), pour ne pas figer la date de compilation dans le HTML.
 */
export function useToday(): IsoDate | null {
  return useSyncExternalStore(noop, todayIso, () => null);
}
