import Link from "next/link";
import { Fragment } from "react";

/** « Fil d’Ariane » des fiches chambres (02.x). */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d’Ariane" className="conteneur py-6">
      <ol className="t-petit flex flex-wrap items-center gap-x-2.5 gap-y-1 text-doux">
        {items.map((it, i) => (
          <Fragment key={it.label}>
            {i > 0 && (
              <li aria-hidden="true" className="text-sable-400">
                /
              </li>
            )}
            <li>
              {it.href ? (
                <Link href={it.href} className="text-or-700 underline underline-offset-2 hover:text-encre">
                  {it.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-doux">
                  {it.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
