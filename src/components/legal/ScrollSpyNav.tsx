"use client";

import { useEffect, useState } from "react";
import { OrnementPuce } from "@/components/ui/Ornament";
import { cx } from "@/lib/format";

type Props = {
  items: { id: string; label: string }[];
  /** « rubriques » : lignes séparées avec puce (FAQ) ; « sommaire » : liste simple (pages légales). */
  variant: "rubriques" | "sommaire";
  label: string;
};

/** Sommaire / rubriques avec mise en évidence de la section visible. */
export function ScrollSpyNav({ items, variant, label }: Props) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const targets = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!targets.length || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "0px 0px -65% 0px", threshold: 0 },
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, [items]);

  if (variant === "rubriques") {
    return (
      <nav aria-label={label}>
        <ul>
          {items.map((it) => {
            const on = it.id === active;
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  aria-current={on ? "location" : undefined}
                  className={cx(
                    "t-corps flex items-center gap-3 border-b border-sable-400 py-4 transition-colors hover:text-or-700",
                    on ? "text-or-700" : "text-encre",
                  )}
                >
                  {on && <OrnementPuce />}
                  <span>{it.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label={label}>
      <ul className="flex flex-col gap-3">
        {items.map((it) => {
          const on = it.id === active;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={on ? "location" : undefined}
                className={cx("t-petit hover:text-or-700 hover:underline", on ? "text-or-700" : "text-encre")}
              >
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
