import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/contact/CtaBand";
import { ScrollSpyNav } from "@/components/legal/ScrollSpyNav";
import { ButtonLink } from "@/components/ui/Button";
import { PageBanner } from "@/components/ui/PageBanner";
import { FAQ_GROUPS } from "@/data/faq";
import { HOTEL } from "@/data/hotel";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: `Horaires, tarifs, réservation, petit-déjeuner, restauration et événements : les réponses aux questions les plus courantes sur votre séjour à l’${HOTEL.name}.`,
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_GROUPS.flatMap((g) => g.items)
      .filter((i) => i.structured)
      .map((i) => ({
        "@type": "Question",
        name: i.question,
        acceptedAnswer: { "@type": "Answer", text: i.answer },
      })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageBanner
        photo="roof-jour"
        eyebrow="FAQ"
        title="Questions fréquentes"
        intro={`Les réponses aux questions les plus courantes sur votre séjour à l’${HOTEL.name}.`}
      />

      <section aria-label="Questions et réponses" className="section-y bg-sable-50">
        <div className="conteneur flex flex-col gap-12 lg:flex-row lg:gap-20">
          <aside className="flex flex-col lg:sticky lg:top-8 lg:w-[300px] lg:shrink-0 lg:self-start">
            <p className="t-surtitre mb-4 text-or-700">Rubriques</p>
            <ScrollSpyNav
              variant="rubriques"
              label="Rubriques des questions fréquentes"
              items={FAQ_GROUPS.map((g) => ({ id: g.id, label: g.title }))}
            />
            <div className="mt-8 flex flex-col items-start gap-3 bg-noir-900 p-7">
              <p className="t-h4 text-clair">Une autre question ?</p>
              <p className="t-petit text-clair-doux">La réception vous répond.</p>
              <ButtonLink href="/contact">Contactez-nous</ButtonLink>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-16">
            {FAQ_GROUPS.map((g) => (
              <div key={g.id} className="flex scroll-mt-8 flex-col gap-2" id={g.id}>
                <h2 className="t-h3 text-encre">{g.title}</h2>
                <div aria-hidden="true" className="h-px w-full bg-or-500" />
                {g.items.map((item) => (
                  <details key={item.id} id={item.id} open={item.open} className="group border-b border-sable-400 py-7">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center gap-6 lg:min-h-0 [&::-webkit-details-marker]:hidden">
                      <h3 className="t-h4 flex-1 text-encre">{item.question}</h3>
                      <Image
                        src="/icons/faq-plus.svg"
                        alt=""
                        aria-hidden="true"
                        width={20}
                        height={20}
                        unoptimized
                        className="shrink-0 group-open:hidden"
                      />
                      <Image
                        src="/icons/faq-moins.svg"
                        alt=""
                        aria-hidden="true"
                        width={20}
                        height={20}
                        unoptimized
                        className="hidden shrink-0 group-open:block"
                      />
                    </summary>
                    <div className="t-corps flex flex-col gap-2 pt-4 pr-0 text-doux md:pr-11">
                      <p>{item.answer}</p>
                      {item.link && (
                        <p>
                          <Link href={item.link.href} className="lien text-or-700">
                            {item.link.label}
                          </Link>
                        </p>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Contact"
        title="Vous ne trouvez pas votre réponse ?"
        intro="Écrivez-nous ou appelez la réception : nous vous répondrons avec plaisir."
        primary={{ label: "Contactez-nous", href: "/contact" }}
        secondary={{ label: "Réserver", href: "/reserver" }}
      />
    </>
  );
}
