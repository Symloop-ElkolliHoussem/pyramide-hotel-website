import Link from "next/link";
import { PageBanner } from "@/components/ui/PageBanner";
import { LEGAL_DOCS, type LegalDoc } from "@/data/legal";
import { ScrollSpyNav } from "./ScrollSpyNav";

/** Gabarit des pages légales 09.1 → 09.3 : sommaire collant + document. */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  const others = LEGAL_DOCS.filter((d) => d.slug !== doc.slug);
  return (
    <>
      <PageBanner photo="roof-montagne" size={300} eyebrow={doc.eyebrow} title={doc.title} />

      <div className="bg-sable-100 px-5 pt-12 pb-20 md:px-10 lg:pt-20 lg:pb-28 xl:px-[120px]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 lg:flex-row lg:gap-12">
          <aside className="flex flex-col gap-3 lg:sticky lg:top-8 lg:w-[260px] lg:shrink-0 lg:self-start">
            <p className="t-label text-doux">Sommaire</p>
            <ScrollSpyNav variant="sommaire" label="Sommaire" items={doc.sections.map((s) => ({ id: s.id, label: s.title }))} />
            <div className="mt-3 flex flex-col gap-2.5 border-t border-sable-200 pt-6">
              <p className="t-label text-doux">Voir aussi</p>
              {others.map((o) => (
                <Link key={o.slug} href={o.href} className="t-petit lien w-fit text-or-700">
                  {o.linkLabel}
                </Link>
              ))}
            </div>
          </aside>

          <article className="flex min-w-0 flex-1 flex-col gap-5 bg-blanc px-6 py-10 md:px-14 md:py-12">
            <aside aria-label="Document provisoire" className="flex flex-col gap-1.5 border border-or-500 bg-sable-50 px-5 py-4">
              <p className="t-label text-or-700">Document provisoire</p>
              <p className="t-petit text-doux">
                Texte juridique définitif à fournir et à valider par l’hôtel (et son conseil). Les éléments entre crochets sont à
                compléter.
              </p>
            </aside>
            <p className="t-petit text-doux">Dernière mise à jour : [date à renseigner]</p>

            {doc.sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-titre`} className="flex scroll-mt-8 flex-col gap-5">
                <h2 id={`${s.id}-titre`} className="t-h3 text-encre">
                  {s.title}
                </h2>
                {s.blocks.map((b, i) =>
                  typeof b === "string" ? (
                    <p key={i} className="t-corps text-doux">
                      {b}
                    </p>
                  ) : (
                    <div key={i} className="overflow-x-auto">
                      <table className="w-full min-w-[420px] border border-sable-200 text-left">
                        <caption className="sr-only">{b.caption}</caption>
                        <thead className="bg-noir-900">
                          <tr>
                            {b.head.map((h) => (
                              <th key={h} scope="col" className="t-label px-4 py-3 font-normal text-or-300">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {b.rows.map(([a, c], r) => (
                            <tr key={a} className={r % 2 ? "bg-sable-50" : "bg-blanc"}>
                              <th scope="row" className="t-petit px-4 py-3 font-normal text-encre">
                                {a}
                              </th>
                              <td className="t-petit px-4 py-3 text-encre">{c}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ),
                )}
              </section>
            ))}
          </article>
        </div>
      </div>
    </>
  );
}
