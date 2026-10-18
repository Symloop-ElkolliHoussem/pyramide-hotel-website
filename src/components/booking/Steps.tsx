import Image from "next/image";
import { Fragment } from "react";
import { cx } from "@/lib/format";

export const BOOKING_STEPS = ["Dates", "Chambre", "Options", "Coordonnées", "Récapitulatif"] as const;

/**
 * Composant « Étapes de réservation » (barre d’étapes 1 → 5).
 * current = 6 : demande envoyée (écran de confirmation), toutes les étapes sont terminées.
 */
export function Steps({ current }: { current: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const total = BOOKING_STEPS.length;
  const finished = current > total;
  return (
    <nav aria-label="Étapes de la réservation" className="border-b border-sable-200 bg-blanc">
      <div className="conteneur flex flex-col items-center gap-2 py-7">
        <p aria-hidden="true" className="t-label text-doux lg:hidden">
          {finished ? `Demande envoyée · ${total} étapes terminées` : `Étape ${current} sur ${total} · ${BOOKING_STEPS[current - 1]}`}
        </p>
        <ol className="flex items-center gap-1 min-[375px]:gap-1.5 md:gap-3 lg:gap-4">
          {BOOKING_STEPS.map((label, i) => {
            const n = i + 1;
            const done = n < current;
            const active = n === current;
            return (
              <Fragment key={label}>
                <li aria-current={active ? "step" : undefined} className="flex items-center gap-1 min-[375px]:gap-1.5 md:gap-4">
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className={cx("h-px w-2 min-[375px]:w-3.5 sm:w-6 xl:w-10", n <= current ? "bg-or-500" : "bg-sable-200")}
                    />
                  )}
                  <span className="flex items-center gap-2.5">
                  <span
                    className={cx(
                      "flex size-8 shrink-0 items-center justify-center rounded-full",
                      done && "bg-or-500",
                      active && "bg-noir-900",
                      !done && !active && "border border-sable-400",
                    )}
                  >
                    {done ? (
                      <Image src="/icons/check.svg" alt="" aria-hidden="true" width={16} height={16} unoptimized />
                    ) : (
                      <span aria-hidden="true" className={cx("t-label", active ? "text-or-300" : "text-doux")}>
                        {n}
                      </span>
                    )}
                  </span>
                  <span className={cx("t-label sr-only lg:not-sr-only", active ? "text-encre" : "text-doux")}>
                    <span className="sr-only">
                      Étape {n} : {done ? "terminée, " : active ? "en cours, " : ""}
                    </span>
                    {label}
                  </span>
                  </span>
                </li>
              </Fragment>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
