"use client";

import { formatDZD } from "@/lib/format";
import { pricedDraft, summaryRows } from "./derived";
import { HelpBox, StaySummaryCard } from "./parts";
import type { Draft } from "./store";

/** Colonne latérale « Votre séjour » + « Besoin d’aide ? » (05.4 → 05.6). */
export function StaySummary({ draft }: { draft: Draft }) {
  const p = pricedDraft(draft);
  if (!p) return null;
  return (
    <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:w-[380px] lg:shrink-0">
      <StaySummaryCard rows={summaryRows(draft, p)} total={formatDZD(p.breakdown.total)} />
      <HelpBox />
    </aside>
  );
}
