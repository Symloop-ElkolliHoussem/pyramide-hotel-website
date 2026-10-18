"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { HOTEL, type Room } from "@/data/hotel";
import {
  personsPerRoom,
  searchRooms,
  suggestDates,
  type SearchResult,
} from "@/lib/availability";
import { EMAIL_RE } from "@/lib/booking";
import { addDays, formatArrowRange, formatDayMonth, formatShort, formatStayTitle, toUtc } from "@/lib/dates";
import { cx, formatDZD } from "@/lib/format";
import { useToday } from "@/lib/useToday";
import { buttonClasses, Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { FramedPhoto } from "@/components/ui/FramedPhoto";
import { OrnementPuce, OrnementPyramides } from "@/components/ui/Ornament";
import { barGuestsLabel, guestsLabel, hasDates, nightsLabel } from "./derived";
import { Dialog } from "./Dialog";
import { BookingBar, LoadingBlock, StepNotice } from "./parts";
import { updateDraft, useDraft } from "./store";

type Sort = "prix-asc" | "prix-desc" | "mer";
type Filters = {
  mer: boolean;
  montagne: boolean;
  capacity: number;
  low: boolean;
  high: boolean;
  breakfast: boolean;
  hideFull: boolean;
};

/** Étape 2 — recherche (05.2), chambres disponibles (05.3), aucune disponibilité (05.3a). */
export function RoomsStep() {
  const router = useRouter();
  const today = useToday();
  const { ready, draft } = useDraft();
  const { arrival, departure, adults, children, rooms } = draft;
  const persons = personsPerRoom(adults, children, rooms);
  const searchKey = `${arrival}|${departure}|${adults}|${children}|${rooms}`;

  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== searchKey;
  const headingRef = useRef<HTMLHeadingElement>(null);

  // 05.2 — courte recherche simulée (immédiate si « réduire les animations »).
  useEffect(() => {
    if (!ready) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setLoadedKey(searchKey), reduce ? 0 : 800);
    return () => window.clearTimeout(t);
  }, [ready, searchKey]);

  const defaultFilters = (): Filters => ({
    mer: true,
    montagne: true,
    capacity: Math.min(3, persons),
    low: true,
    high: true,
    breakfast: false,
    hideFull: false,
  });
  const [filters, setFilters] = useState<Filters | null>(null);
  const f = filters ?? defaultFilters();
  const [sort, setSort] = useState<Sort>("prix-asc");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const outcome = useMemo(
    () => (hasDates(draft) ? searchRooms({ arrival: arrival!, departure: departure!, adults, children, rooms }) : null),
    [draft, arrival, departure, adults, children, rooms],
  );

  if (!ready) return <LoadingBlock />;
  if (!hasDates(draft) || !outcome) return <StepNotice />;

  const hotelFull = outcome.fullNights.length > 0;
  const visible = outcome.results
    .filter((r) => (r.room.view === "mer" ? f.mer : f.montagne))
    .filter((r) => r.room.capacity + (r.room.extraBedAllowed ? 1 : 0) >= f.capacity)
    .filter((r) => (r.room.price < 10000 ? f.low : f.high))
    .filter(() => !f.breakfast)
    .filter((r) => !(f.hideFull && !r.available))
    .sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      if (sort === "mer" && a.room.view !== b.room.view) return a.room.view === "mer" ? -1 : 1;
      return sort === "prix-desc" ? b.total - a.total : a.total - b.total;
    });
  const cheapest = visible.filter((r) => r.available).reduce<SearchResult | null>((m, r) => (!m || r.total < m.total ? r : m), null);

  const summary = `${formatArrowRange(arrival!, departure!)} · ${nightsLabel(outcome.results[0]?.nights ?? 0)} · ${guestsLabel(
    adults,
    children,
  )} · ${rooms} chambre${rooms > 1 ? "s" : ""}`;

  function select(r: SearchResult) {
    updateDraft({ roomSlug: r.room.slug, extraBeds: r.extraBeds });
    router.push("/reserver/options");
  }

  function chooseDates(a: string, d: string) {
    updateDraft({ arrival: a, departure: d });
    headingRef.current?.scrollIntoView({ block: "start" });
    headingRef.current?.focus();
  }

  const title = loading
    ? "Recherche en cours…"
    : hotelFull
      ? "Aucune chambre disponible pour vos dates"
      : visible.length === 0
        ? "Aucune chambre ne correspond à vos filtres"
        : `${visible.length} type${visible.length > 1 ? "s" : ""} de chambres pour vos dates`;

  return (
    <>
      <section aria-label="Votre recherche" className="bg-sable-100">
        <div className="conteneur py-8">
          <BookingBar
            cells={[
              { label: "Arrivée", value: formatShort(arrival!) },
              { label: "Départ", value: formatShort(departure!) },
              { label: "Voyageurs", value: barGuestsLabel(adults, children, rooms) },
            ]}
            action={
              <Link href="/reserver" className={buttonClasses("primaire", "w-full lg:w-auto")}>
                Modifier la recherche
              </Link>
            }
          />
        </div>
      </section>

      <section aria-labelledby="titre-resultats" className="bg-sable-50">
        <div className="conteneur flex flex-col gap-8 pt-12 pb-16 lg:pt-14 lg:pb-[112px]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-1.5">
              <h2 id="titre-resultats" ref={headingRef} tabIndex={-1} className="t-h3 scroll-mt-6 text-encre outline-none">
                {title}
              </h2>
              <p className="t-corps text-doux">{summary}</p>
            </div>
            {!hotelFull && (
              <div className="flex flex-col gap-2 md:w-[300px] md:shrink-0">
                <label htmlFor="tri" className="t-label text-doux">
                  Trier par
                </label>
                <div className="relative">
                  <select
                    id="tri"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as Sort)}
                    className="t-corps h-[54px] w-full appearance-none border border-sable-400 bg-blanc px-4 pr-11 text-encre"
                  >
                    <option value="prix-asc">Prix croissant (total du séjour)</option>
                    <option value="prix-desc">Prix décroissant (total du séjour)</option>
                    <option value="mer">Vue sur mer d’abord</option>
                  </select>
                  <Image
                    src="/icons/chevron.svg"
                    alt=""
                    width={16}
                    height={16}
                    unoptimized
                    className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <aside className="lg:w-[288px] lg:shrink-0">
              <button
                type="button"
                className={buttonClasses("contour-sombre", "w-full lg:hidden")}
                aria-expanded={filtersOpen}
                aria-controls="filtres"
                onClick={() => setFiltersOpen((o) => !o)}
              >
                {filtersOpen ? "Masquer les filtres" : "Affiner la recherche"}
              </button>
              <div id="filtres" className={cx("mt-4 lg:mt-0 lg:block", filtersOpen ? "block" : "hidden")}>
                <FiltersPanel
                  filters={f}
                  persons={persons}
                  disabled={hotelFull || loading}
                  onChange={(p) => setFilters({ ...f, ...p })}
                  onReset={() => setFilters(null)}
                />
              </div>
            </aside>

            <div className="min-w-0 flex-1" aria-busy={loading}>
              <p role="status" aria-live="polite" className="sr-only">
                {loading ? "Recherche des disponibilités en cours" : title}
              </p>
              {loading ? (
                <LoadingResults />
              ) : hotelFull ? (
                <NoAvailability
                  arrival={arrival!}
                  departure={departure!}
                  fullNights={outcome.fullNights}
                  adults={adults}
                  kids={children}
                  rooms={rooms}
                  today={today}
                  onChoose={chooseDates}
                />
              ) : (
                <div className="flex flex-col gap-6">
                  {visible.length === 0 && (
                    <div className="flex flex-col items-start gap-4 border border-sable-200 bg-blanc p-8">
                      <p className="t-corps text-doux">
                        {f.breakfast
                          ? "La formule « petit-déjeuner inclus » n’est pas encore confirmée par l’hôtel [à confirmer] : aucune chambre ne peut être proposée avec ce filtre."
                          : "Modifiez ou réinitialisez les filtres pour voir les chambres disponibles."}
                      </p>
                      <Button variant="contour-sombre" onClick={() => setFilters(null)}>
                        Réinitialiser les filtres
                      </Button>
                    </div>
                  )}
                  <ul className="flex flex-col gap-6">
                    {visible.map((r) => (
                      <li key={r.room.slug}>
                        <ResultCard
                          r={r}
                          persons={persons}
                          rooms={rooms}
                          best={cheapest === r && visible.filter((v) => v.available).length > 1}
                          stay={formatStayTitle(arrival!, departure!)}
                          onSelect={() => select(r)}
                        />
                      </li>
                    ))}
                  </ul>
                  <PriceNote persons={persons} excluded={outcome.excluded} extra={outcome.results.some((r) => r.extraBeds > 0)} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */

function FiltersPanel({
  filters: f,
  persons,
  disabled,
  onChange,
  onReset,
}: {
  filters: Filters;
  persons: number;
  disabled: boolean;
  onChange: (p: Partial<Filters>) => void;
  onReset: () => void;
}) {
  return (
    <div className={cx("flex flex-col gap-6 border border-sable-200 bg-blanc p-7", disabled && "opacity-60")}>
      <div className="flex items-center justify-between">
        <h3 className="t-h4 text-encre">Affiner</h3>
        <button type="button" onClick={onReset} disabled={disabled} className="t-petit lien text-or-700 disabled:cursor-not-allowed">
          Réinitialiser
        </button>
      </div>
      <fieldset disabled={disabled} className="flex min-w-0 flex-col gap-6">
        <FilterGroup legend="Vue">
          <Check label="Vue sur mer" checked={f.mer} onChange={(v) => onChange({ mer: v })} />
          <Check label="Vue sur montagne" checked={f.montagne} onChange={(v) => onChange({ montagne: v })} />
        </FilterGroup>
        <FilterGroup legend="Capacité">
          {[1, 2, 3].map((n) => (
            <label
              key={n}
              className={cx("t-petit flex cursor-pointer items-center gap-3 text-encre", n < Math.min(3, persons) && "cursor-not-allowed text-doux")}
            >
              <input
                type="radio"
                name="capacite"
                checked={f.capacity === n}
                disabled={n < Math.min(3, persons)}
                onChange={() => onChange({ capacity: n })}
                className="size-[18px] shrink-0 cursor-pointer appearance-none rounded-full border border-encre bg-blanc bg-center bg-no-repeat checked:border-or-500 checked:bg-[radial-gradient(circle,var(--color-or-500)_0_4px,transparent_4.5px)] disabled:cursor-not-allowed disabled:border-sable-200"
              />
              {n} personne{n > 1 ? "s" : ""}
            </label>
          ))}
        </FilterGroup>
        <FilterGroup legend="Prix par nuit">
          <Check label="Moins de 10 000 DZD" checked={f.low} onChange={(v) => onChange({ low: v })} />
          <Check label="10 000 à 20 000 DZD" checked={f.high} onChange={(v) => onChange({ high: v })} />
        </FilterGroup>
        <FilterGroup legend="Formule">
          <Check label="Petit-déjeuner inclus [à confirmer]" checked={f.breakfast} onChange={(v) => onChange({ breakfast: v })} />
        </FilterGroup>
        <FilterGroup legend="Disponibilité">
          <Check label="Masquer les chambres complètes" checked={f.hideFull} onChange={(v) => onChange({ hideFull: v })} />
        </FilterGroup>
      </fieldset>
      <div className="h-px bg-sable-200" />
      <div className="flex flex-col gap-2">
        <h3 className="t-h4 text-encre">Besoin d’aide ?</h3>
        <p className="t-petit text-doux">La réception vous conseille par téléphone.</p>
        <p className="t-petit flex items-center gap-2 text-or-700">
          <Image src="/icons/telephone.svg" alt="" width={16} height={16} unoptimized />
          {HOTEL.phone}
        </p>
      </div>
    </div>
  );
}

function FilterGroup({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="t-label mb-3 text-doux">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="t-petit flex cursor-pointer items-start gap-3 text-encre">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-[18px] shrink-0 cursor-pointer appearance-none border border-sable-400 bg-blanc bg-center bg-no-repeat checked:border-or-500 checked:bg-or-500 checked:bg-[url('/icons/check.svg')] checked:bg-[length:12px_12px]"
      />
      <span>{label}</span>
    </label>
  );
}

/* ------------------------------------------------------------------ */

function bulletsFor(room: Room, extra: number) {
  const beds = room.beds.startsWith("[") ? room.features[0] : room.beds;
  const cap =
    extra > 0
      ? `${room.capacityLabel} + matelas supplémentaire`
      : room.slug === "triple-vue-sur-montagne"
        ? "Jusqu’à trois personnes"
        : room.capacityLabel;
  return [beds, cap, room.viewLabel];
}

function ResultCard({
  r,
  persons,
  rooms,
  best,
  stay,
  onSelect,
}: {
  r: SearchResult;
  persons: number;
  rooms: number;
  best: boolean;
  stay: string;
  onSelect: () => void;
}) {
  const { room } = r;
  const ideal = r.available && persons >= 3 && room.capacity === persons;
  const headingId = `resultat-${room.slug}`;
  return (
    // Mise en page selon la largeur de la liste (requêtes de conteneur) : empilée, puis photo + colonne,
    // puis trois colonnes (maquette desktop) dès 768 px de liste.
    <div className="@container">
      <article
        aria-labelledby={headingId}
        className="flex flex-col border border-sable-200 bg-blanc @xl:grid @xl:grid-cols-[220px_minmax(0,1fr)] @3xl:flex @3xl:flex-row"
      >
        <FramedPhoto
          photo={room.cardPhoto}
          alt=""
          className={cx("h-[220px] @xl:row-span-2 @xl:h-auto @xl:min-h-[300px] @3xl:w-[260px] @3xl:shrink-0", !r.available && "opacity-60")}
          sizes="(min-width: 1024px) 260px, (min-width: 768px) 220px, 100vw"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-6 lg:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <p className="t-surtitre text-or-700">{room.viewLabel}</p>
            {!r.available && <span className="t-label bg-erreur-fond px-2.5 py-1 text-erreur">Complet</span>}
            {best && <span className="t-label bg-sable-100 px-2.5 py-1 text-or-700">Meilleur prix</span>}
            {ideal && !best && <span className="t-label bg-sable-100 px-2.5 py-1 text-or-700">Idéale à {persons}</span>}
          </div>
          <h3 id={headingId} className="t-carte text-encre">
            {room.name}
            <span className="sr-only"> — {room.viewLabel.toLowerCase()}</span>
          </h3>
          <p className="t-corps text-doux">{room.intro}</p>
          <ul className="flex flex-col gap-1.5 pt-1">
            {bulletsFor(room, r.extraBeds).map((b) => (
              <li key={b} className="t-petit flex items-center gap-2.5 text-encre">
                <OrnementPuce />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-1.5 border-t border-sable-200 p-6 lg:p-7 @3xl:w-[280px] @3xl:shrink-0 @3xl:border-t-0 @3xl:border-l">
          {r.available ? (
            <>
              <p className="t-label text-doux">Prix par nuit</p>
              <p className="t-prix text-or-700">{formatDZD(room.price)}</p>
              <p className="t-petit text-doux">
                {nightsLabel(r.nights)}
                {rooms > 1 ? ` × ${rooms} chambres` : ""} : {formatDZD(r.roomTotal)}
              </p>
              {r.extraBeds > 0 ? (
                <p className="t-petit text-doux">
                  {rooms > 1
                    ? `Matelas supplémentaire × ${r.extraBeds} : ${formatDZD(r.extraBeds * 2500)}`
                    : `Matelas supplémentaire (${room.capacity + 1}ᵉ adulte) : ${formatDZD(2500)}`}
                </p>
              ) : (
                persons > 1 && (
                  <p className="t-petit text-doux">
                    Sans supplément pour {persons} {persons > 1 ? "personnes" : "personne"}
                  </p>
                )
              )}
              <p className="t-corps text-encre">Total : {formatDZD(r.total)}</p>
              <p className="t-petit text-doux">Taxe de séjour : [à confirmer]</p>
              <div className="min-h-4 flex-1" />
              <Button onClick={onSelect} className="w-full">
                Sélectionner<span className="sr-only"> : {room.fullName}</span>
              </Button>
            </>
          ) : (
            <>
              <p className="t-label text-doux">Prix par nuit · {formatDZD(room.price)}</p>
              <p className="t-carte text-erreur">Complet</p>
              <p className="t-petit text-doux">Plus de chambre de ce type {stay.replace(/ \d{4}$/, "")}.</p>
              <div className="min-h-4 flex-1" />
              <Link href="/reserver" className={buttonClasses("contour-sombre", "w-full")}>
                Autres dates
              </Link>
            </>
          )}
          <Link href={`/chambres/${room.slug}`} className="t-petit lien mt-1.5 w-fit text-or-700">
            Voir la chambre<span className="sr-only"> : {room.fullName}</span>
          </Link>
        </div>
      </article>
    </div>
  );
}

function PriceNote({ persons, excluded, extra }: { persons: number; excluded: Room[]; extra: boolean }) {
  const who = `${persons} ${persons > 1 ? "personnes" : "personne"}`;
  return (
    <div className="flex gap-3 bg-sable-100 px-6 py-5">
      <Image src="/icons/info.svg" alt="" width={20} height={20} unoptimized className="mt-0.5 size-5 shrink-0" />
      <p className="t-petit text-doux">
        Tarifs en dinars algériens (DZD), par chambre et par nuit.
        {extra && " Au-delà de 2 personnes dans une chambre Double ou Twin, un matelas supplémentaire est ajouté (2 500 DZD par personne)."}
        {excluded.length > 0 &&
          ` Non affichées pour ${who} : ${excluded.map((r) => `${r.fullName} (${r.capacityLabel})`).join(", ")}.`}{" "}
        Le départ tardif (1 000 DZD par heure) se choisit à l’étape « Options ».
      </p>
    </div>
  );
}

function LoadingResults() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 border border-sable-200 bg-blanc p-6">
        <span
          aria-hidden="true"
          className="size-7 shrink-0 rounded-full border-2 border-sable-200 border-t-or-500 motion-safe:animate-spin"
        />
        <p className="t-corps text-doux">Nous vérifions les disponibilités pour vos dates…</p>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} aria-hidden="true" className="flex h-[220px] border border-sable-200 bg-blanc motion-safe:animate-pulse">
          <div className="w-[260px] bg-sable-100" />
          <div className="flex flex-1 flex-col gap-3 p-7">
            <div className="h-3 w-32 bg-sable-100" />
            <div className="h-6 w-48 bg-sable-100" />
            <div className="h-3 w-64 bg-sable-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 05.3a — Aucune disponibilité                                        */
/* ------------------------------------------------------------------ */

function sameMonth(a: string, b: string) {
  return toUtc(a).getUTCMonth() === toUtc(b).getUTCMonth();
}

function NoAvailability({
  arrival,
  departure,
  fullNights,
  adults,
  kids,
  rooms,
  today,
  onChoose,
}: {
  arrival: string;
  departure: string;
  fullNights: string[];
  adults: number;
  kids: number;
  rooms: number;
  today: string | null;
  onChoose: (a: string, d: string) => void;
}) {
  const fullFrom = fullNights[0];
  const fullTo = addDays(fullNights[fullNights.length - 1], 1);
  const fullRange = `du ${formatDayMonth(fullFrom)} au ${formatDayMonth(fullTo)}`;
  const suggestions = suggestDates({ arrival, departure, adults, children: kids, rooms }, today);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [registered, setRegistered] = useState("");
  const requestHref = `/reservation?arrivee=${arrival}&depart=${departure}&adultes=${adults}&enfants=${kids}`;

  function subscribe(e: FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError(email.trim() ? "Adresse e-mail invalide (ex. nom@domaine.com)." : "Indiquez votre adresse e-mail.");
      return;
    }
    setError(null);
    setRegistered(email.trim());
    setOpen(true);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4 border border-sable-200 bg-blanc px-6 py-10 text-center md:px-12">
        <OrnementPyramides />
        <h3 className="t-h3 text-encre">L’hôtel affiche complet {fullRange}</h3>
        <p className="t-corps max-w-[620px] text-doux">
          Toutes nos chambres sont réservées à ces dates. Voici les dates proches où des chambres sont encore libres, ou
          laissez-nous votre demande : la réception vous recontacte si une chambre se libère.
        </p>
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="t-h4 text-encre">Dates proches disponibles</h3>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((s) => {
              const from = formatShort(s.arrival, false);
              const to = formatShort(s.departure, false);
              const label = `${sameMonth(s.arrival, s.departure) ? from.replace(/ \S+$/, "") : from} → ${to}`;
              return (
                <li key={s.arrival} className="flex flex-col gap-2 border border-sable-200 bg-blanc p-5">
                  <p className="t-carte text-encre">{label}</p>
                  <p className="t-petit text-doux">
                    {nightsLabel(Math.round((toUtc(s.departure).getTime() - toUtc(s.arrival).getTime()) / 86_400_000))} ·{" "}
                    {s.roomTypes} type{s.roomTypes > 1 ? "s" : ""} de chambres
                  </p>
                  <p className="t-corps text-or-700">dès {formatDZD(s.minPrice)} / nuit</p>
                  <Button variant="contour-sombre" className="mt-2 w-full px-4" onClick={() => onChoose(s.arrival, s.departure)}>
                    Choisir ces dates<span className="sr-only"> : {label}</span>
                  </Button>
                </li>
              );
            })}
          </ul>
          <p className="t-petit text-doux">Suggestions calculées automatiquement à partir des disponibilités (± 3 jours).</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col items-start gap-3 bg-noir-900 p-6 text-clair">
          <h3 className="t-h4 text-clair">Envoyer une demande à l’hôtel</h3>
          <p className="t-petit text-clair-doux">
            La réception étudie votre demande pour ces dates et vous propose une solution (autre chambre, dates proches).
          </p>
          <Link href={requestHref} className={buttonClasses("primaire", "mt-2")}>
            Faire une demande
          </Link>
        </div>
        <form noValidate onSubmit={subscribe} className="flex flex-col gap-3 border border-sable-200 bg-blanc p-6">
          <h3 className="t-h4 text-encre">Être prévenu si une chambre se libère</h3>
          <p className="t-petit text-doux">Inscription sur la liste d’attente de l’hôtel pour ces dates [à confirmer par l’hôtel].</p>
          <TextField
            id="attente-email"
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            value={email}
            error={error}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" variant="contour-sombre" className="w-fit">
            M’inscrire
          </Button>
        </form>
      </div>

      <p className="t-petit text-doux">
        Une urgence ou un séjour à ces dates absolument ?{" "}
        <span className="text-or-700">Appelez la réception : {HOTEL.phone}</span>
      </p>

      <Dialog open={open} onClose={() => setOpen(false)} labelledBy="attente-titre" describedBy="attente-texte">
        <div className="flex flex-col items-center gap-4 bg-blanc px-8 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] md:px-14">
          <Image src="/icons/ok.svg" alt="" width={44} height={44} unoptimized className="size-11" />
          <h2 id="attente-titre" className="t-h3 text-encre">
            Vous êtes sur la liste d’attente
          </h2>
          <p id="attente-texte" className="t-corps text-doux">
            Nous vous écrirons à {registered} si une chambre se libère {fullRange} {toUtc(fullTo).getUTCFullYear()}. Aucune
            réservation n’est faite à ce stade.
          </p>
          <Button variant="contour-sombre" onClick={() => setOpen(false)} autoFocus>
            Fermer
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

