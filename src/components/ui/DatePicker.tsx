"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { buttonClasses } from "@/components/ui/Button";
import { isHotelFullNight, MAX_NIGHTS } from "@/lib/availability";
import {
  addDays,
  diffDays,
  formatLong,
  formatMonthTitle,
  formatRange,
  formatShort,
  isIsoDate,
  monthGrid,
  todayIso,
  toUtc,
  WEEKDAYS_CAL,
  WEEKDAYS_CAL_LONG,
  type IsoDate,
} from "@/lib/dates";
import { cx } from "@/lib/format";
import { useToday } from "@/lib/useToday";

/* ------------------------------------------------------------------ */
/* « Sélecteur de dates » — remplace tous les champs date natifs.      */
/*                                                                      */
/* - DateRangePicker : deux champs liés (Arrivée / Départ) ouvrant le   */
/*   même calendrier ; arrivée puis départ, aperçu de la plage au       */
/*   survol, nombre de nuits, 30 nuits maximum.                         */
/* - ≥ 640 px : fenêtre flottante (position fixe, toujours dans         */
/*   l’écran ; deux mois dès 768 px). < 640 px : panneau en bas d’écran */
/*   (un mois, cases de 44 px).                                         */
/* - Variante « hero » (bandeau de l’accueil, ≥ 640 px) : fenêtre       */
/*   sombre au-dessus du bandeau, de la largeur du bandeau (deux mois   */
/*   si le bandeau fait au moins 900 px), sans jamais faire défiler la  */
/*   page ; les champs suivent la sélection en cours, « Valider »       */
/*   l’enregistre, Échap ou un clic à l’extérieur l’abandonne.          */
/* - Clavier : flèches (jour / semaine), Début / Fin (semaine), Page    */
/*   préc. / suiv. (mois), Entrée / Espace (choisir), Échap (fermer et  */
/*   rendre le focus au champ), Tab reste dans la fenêtre.              */
/* ------------------------------------------------------------------ */

type Month = { y: number; m: number };
type Phase = "start" | "end";
type Draft = { start: string; end: string; phase: Phase };

const FALLBACK_MONTH: Month = { y: 2026, m: 9 };

function monthOf(iso: IsoDate): Month {
  const d = toUtc(iso);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
}
function shift(mo: Month, n: number): Month {
  const t = mo.y * 12 + mo.m + n;
  return { y: Math.floor(t / 12), m: ((t % 12) + 12) % 12 };
}
const mkey = (mo: Month) => mo.y * 12 + mo.m;

function plural(n: number) {
  return `${n} nuit${n > 1 ? "s" : ""}`;
}

/** Icône calendrier (même tracé que /icons/calendrier.svg, couleur héritée). */
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" className={cx("shrink-0", className)}>
      <path d="M2.5 4.5H15.5V15.5H2.5V4.5Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 7.5H15.5M6 2.5V5.5M12 2.5V5.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

/** Chevron (même tracé que /icons/chevron-gauche.svg, couleur héritée). */
function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className={dir === "next" ? "rotate-180" : undefined}>
      <path d="M10 3.333 5.333 8 10 12.667" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Valeur affichée : « jeu. 22 oct. 2026 » (le jour de la semaine disparaît si le champ est étroit). */
function DateValue({ iso, placeholder, tone }: { iso: string; placeholder: string; tone: "dark" | "light" }) {
  if (!isIsoDate(iso))
    return (
      <span className={cx("truncate", tone === "dark" ? "text-clair-doux" : "text-doux")}>
        <span className="@min-[11.5rem]:hidden">{placeholder.split(" ")[0]}</span>
        <span className="hidden @min-[11.5rem]:inline">{placeholder}</span>
      </span>
    );
  const full = formatShort(iso);
  const [weekday, ...rest] = full.split(" ");
  return (
    <span className={cx("truncate", tone === "dark" ? "text-clair" : "text-encre")}>
      <span className="hidden @min-[11.5rem]:inline">{weekday} </span>
      {rest.join(" ")}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Champs déclencheurs                                                  */
/* ------------------------------------------------------------------ */

type TriggerProps = {
  id: string;
  label: ReactNode;
  value: string;
  placeholder?: string;
  tone: "dark" | "light";
  open: boolean;
  /** Champ en cours de saisie dans la fenêtre (variante « hero »). */
  active?: boolean;
  dialogId: string;
  error?: string | null;
  /** Classes du conteneur (bandeau sombre : padding du champ). */
  className?: string;
  /** Classes supplémentaires de la zone cliquable (champ clair). */
  triggerClassName?: string;
  name?: string;
  onOpen: (el: HTMLButtonElement) => void;
  triggerRef?: (el: HTMLButtonElement | null) => void;
};

function Trigger({
  id,
  label,
  value,
  placeholder = "Choisir une date",
  tone,
  open,
  active,
  dialogId,
  error,
  className,
  triggerClassName,
  name,
  onOpen,
  triggerRef,
}: TriggerProps) {
  const labelId = `${id}-libelle`;
  const valueId = `${id}-valeur`;
  const describedBy = error ? `${id}-erreur` : undefined;
  const common = {
    id,
    type: "button" as const,
    ref: triggerRef,
    "aria-haspopup": "dialog" as const,
    "aria-expanded": open,
    "aria-controls": open ? dialogId : undefined,
    "aria-labelledby": `${labelId} ${valueId}`,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => onOpen(e.currentTarget),
  };

  if (tone === "dark") {
    return (
      <div
        className={cx(
          "@container flex min-w-0 flex-1 transition-colors",
          active && "bg-noir-700 shadow-[inset_0_-2px_0_var(--color-or-500)]",
          className,
        )}
      >
        <button
          {...common}
          className="group flex min-h-11 w-full min-w-0 flex-col items-stretch gap-1.5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-or-500"
        >
          <span id={labelId} className="t-label text-or-500">
            {label}
          </span>
          <span id={valueId} className="t-corps flex items-center justify-between gap-3">
            <DateValue iso={value} placeholder={placeholder} tone="dark" />
            <CalendarIcon className="text-or-300" />
          </span>
        </button>
        {name && <input type="hidden" name={name} value={isIsoDate(value) ? value : ""} />}
      </div>
    );
  }

  return (
    <div className={cx("flex min-w-0 flex-col gap-2", className)}>
      <label id={labelId} htmlFor={id} className={cx("t-label", error ? "text-erreur" : "text-doux")}>
        {label}
      </label>
      <button
        {...common}
        className={cx(
          "@container t-corps flex h-[54px] w-full min-w-0 items-center justify-between gap-3 border bg-blanc px-4 text-left transition-colors",
          "hover:border-encre focus-visible:border-or-700 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-or-500",
          error ? "border-2 border-erreur bg-erreur-fond/40" : open ? "border-or-700" : "border-sable-400",
          triggerClassName,
        )}
      >
        <span id={valueId} className="flex min-w-0 flex-1">
          <DateValue iso={value} placeholder={placeholder} tone="light" />
        </span>
        <CalendarIcon className="text-doux" />
      </button>
      {name && <input type="hidden" name={name} value={isIsoDate(value) ? value : ""} />}
      {error && (
        <p id={`${id}-erreur`} className="t-petit flex items-start gap-1.5 text-erreur">
          <span aria-hidden="true">!</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fenêtre calendrier                                                   */
/* ------------------------------------------------------------------ */

type DialogProps = {
  id: string;
  start: string;
  end: string;
  initialPhase: Phase;
  anchor: HTMLElement | null;
  returnFocus: HTMLElement | null;
  /** Autres éléments à ignorer pour le « clic à l’extérieur » (les champs). */
  ignore: RefObject<(HTMLElement | null)[]>;
  /** Date minimale (incluse). */
  min?: IsoDate | null;
  markFull?: boolean;
  /** Fenêtre sombre au-dessus du bandeau de l’accueil (`anchor` = le bandeau). */
  hero?: boolean;
  /** Sélection en cours (variante « hero ») : les champs la reflètent avant « Valider ». */
  onDraft?: (draft: Draft) => void;
  onApply: (start: string, end: string) => void;
  onClose: () => void;
};

function useViewport() {
  const [w, setW] = useState(() => (typeof window === "undefined" ? 1440 : window.innerWidth));
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return w;
}

function PickerDialog({
  id,
  start: initialStart,
  end: initialEnd,
  initialPhase,
  anchor,
  returnFocus,
  ignore,
  min,
  markFull,
  hero: heroProp = false,
  onDraft,
  onApply,
  onClose,
}: DialogProps) {
  const vw = useViewport();
  const sheet = vw < 640;
  const hero = heroProp && !sheet && Boolean(anchor);
  // Variante « hero » : largeur du bandeau ; deux mois dès 900 px de bandeau.
  const heroWidth = hero && anchor ? anchor.getBoundingClientRect().width : 0;
  const twoMonths = hero ? heroWidth >= 900 : vw >= 768;
  const titleId = `${id}-titre`;
  const summaryId = `${id}-resume`;
  const today = useToday();

  const [start, setStart] = useState<string>(isIsoDate(initialStart) ? initialStart : "");
  const [end, setEnd] = useState<string>(isIsoDate(initialEnd) ? initialEnd : "");
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [hover, setHover] = useState<IsoDate | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const initialFocus = (): IsoDate => {
    const pref = phase === "end" && isIsoDate(initialEnd) ? initialEnd : isIsoDate(initialStart) ? initialStart : null;
    if (pref) return pref;
    const t = todayIso();
    if (min && t < min) return min;
    return t;
  };
  const [focusDate, setFocusDate] = useState<IsoDate>(initialFocus);
  const [view, setView] = useState<Month>(() => (focusDate ? monthOf(focusDate) : FALLBACK_MONTH));

  const dialogRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<IsoDate | null>(null);
  const scrolled = useRef(false);
  const [pos, setPos] = useState<{ top: number; left: number; maxH?: number } | null>(null);

  const months = twoMonths && !sheet ? [view, shift(view, 1)] : [view];
  const minMonth = min ? monthOf(min) : null;
  const canPrev = !minMonth || mkey(view) > mkey(minMonth);

  /* -------- règles de disponibilité -------- */
  const isOut = useCallback((d: IsoDate) => Boolean(min && d < min), [min]);
  const isFull = useCallback((d: IsoDate) => Boolean(markFull && isHotelFullNight(d)), [markFull]);
  const choosingEnd = phase === "end" && Boolean(start);
  function isDisabled(d: IsoDate) {
    if (isOut(d)) return true;
    // Une nuit complète ne peut pas être une date d’arrivée, mais peut être une date de départ.
    if (choosingEnd && start && d > start) return false;
    return isFull(d);
  }

  /* -------- sélection -------- */
  function pick(d: IsoDate) {
    if (isDisabled(d)) return;
    setMessage(null);
    if (!choosingEnd || !start || d <= start) {
      setStart(d);
      setEnd("");
      setPhase("end");
    } else {
      const n = diffDays(start, d);
      if (n > MAX_NIGHTS) {
        setMessage(`Séjour limité à ${MAX_NIGHTS} nuits en ligne [à confirmer].`);
        return;
      }
      setEnd(d);
      setPhase("start");
      setHover(null);
    }
    setFocusDate(d);
  }

  const complete = Boolean(start && end);
  const nights = start && end ? diffDays(start, end) : 0;

  function apply() {
    if (!complete) return;
    onApply(start, end);
  }
  function clear() {
    setStart("");
    setEnd("");
    setPhase("start");
    setHover(null);
    setMessage(null);
    onApply("", "");
  }

  /* -------- navigation clavier -------- */
  function ensureVisible(d: IsoDate) {
    const mo = monthOf(d);
    const last = months[months.length - 1];
    if (mkey(mo) < mkey(months[0])) setView(mo);
    else if (mkey(mo) > mkey(last)) setView(months.length === 2 ? shift(mo, -1) : mo);
  }
  function moveFocus(d: IsoDate) {
    const mo = monthOf(d);
    if (minMonth && mkey(mo) < mkey(minMonth)) return;
    ensureVisible(d);
    setFocusDate(d);
    if (choosingEnd) setHover(d);
    pendingFocus.current = d;
  }
  // Focus clavier appliqué juste après le rendu (fiable même si la touche reste enfoncée).
  useLayoutEffect(() => {
    const d = pendingFocus.current;
    if (!d) return;
    pendingFocus.current = null;
    dialogRef.current?.querySelector<HTMLButtonElement>(`[data-date="${d}"]`)?.focus({ preventScroll: true });
  });
  function onDayKey(e: ReactKeyboardEvent<HTMLButtonElement>, d: IsoDate) {
    const dow = (toUtc(d).getUTCDay() + 6) % 7;
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -dow, End: 6 - dow };
    if (e.key in map) {
      e.preventDefault();
      moveFocus(addDays(d, map[e.key]));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      const dt = toUtc(d);
      dt.setUTCMonth(dt.getUTCMonth() + (e.key === "PageUp" ? -1 : 1));
      moveFocus(dt.toISOString().slice(0, 10));
    } else if ((e.key === "Enter" || e.key === " ") && isDisabled(d)) {
      e.preventDefault();
    }
  }

  /* -------- focus initial, piège du focus, Échap -------- */
  const close = useCallback(
    (restore = true) => {
      onClose();
      if (restore) requestAnimationFrame(() => returnFocus?.focus({ preventScroll: true }));
    },
    [onClose, returnFocus],
  );

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      const el =
        dialogRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusDate}"]`) ??
        dialogRef.current?.querySelector<HTMLButtonElement>("[data-date]:not([aria-disabled])");
      el?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(t);
    // Uniquement à l’ouverture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close(true);
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])"),
      ).filter((el) => el.tabIndex >= 0 && el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!dialogRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  /* -------- clic à l’extérieur (fenêtre flottante) -------- */
  useEffect(() => {
    if (sheet) return;
    function onDown(e: PointerEvent) {
      const t = e.target as Node;
      if (dialogRef.current?.contains(t)) return;
      if (ignore.current?.some((el) => el?.contains(t))) return;
      close(false);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [sheet, ignore, close]);

  /* -------- défilement bloqué (panneau mobile) -------- */
  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheet]);

  /* -------- position de la fenêtre flottante (toujours dans l’écran) -------- */
  useLayoutEffect(() => {
    if (sheet || !anchor) return;
    function place() {
      const d = dialogRef.current;
      if (!d || !anchor) return;
      const a = anchor.getBoundingClientRect();
      const vwNow = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const w = d.offsetWidth;
      // Hauteur naturelle du contenu + bordures (scrollHeight n’inclut pas les bordures).
      const h = d.scrollHeight + (d.offsetHeight - d.clientHeight);
      const gap = 8;
      const margin = 8;
      const below = vh - a.bottom - gap - margin;
      const above = a.top - gap - margin;
      let left = a.left;
      let top: number;
      let maxH: number | undefined;

      if (hero) {
        // Au-dessus du bandeau, alignée sur son bord gauche ; dessous seulement s’il n’y a pas la place.
        // Jamais de défilement de la page.
        if (h <= above) top = a.top - gap - h;
        else if (h <= below) top = a.bottom + gap;
        else if (h <= vh - 2 * margin) top = Math.max(margin, Math.min(a.top - gap - h, vh - margin - h));
        else {
          top = margin;
          maxH = vh - 2 * margin;
        }
        setPos((p) => (p && p.top === top && p.left === left && p.maxH === maxH ? p : { top, left, maxH }));
        return;
      }

      if (left + w > vwNow - margin) left = Math.max(margin, Math.min(a.right - w, vwNow - margin - w));
      left = Math.max(margin, left);
      // Une seule fois par ouverture : si la fenêtre ne tient ni dessous ni dessus mais tient
      // dans la hauteur d’écran, faire défiler la page pour l’afficher entièrement sous le champ
      // (plutôt qu’un défilement interne qui cacherait « Valider »). La mesure se fait ici, une fois
      // le contenu rendu (le ResizeObserver ci-dessous relance le placement).
      if (!scrolled.current && h > below && h > above && h + a.height + gap + 2 * margin <= vh) {
        const need = a.bottom + gap + h + margin - vh;
        const room = document.documentElement.scrollHeight - vh - window.scrollY;
        if (need > 0 && room >= need) {
          scrolled.current = true;
          window.scrollBy({ top: need, behavior: "instant" });
          return; // l’événement scroll relance place()
        }
      }
      if (h <= below) top = a.bottom + gap;
      else if (h <= above) top = a.top - gap - h;
      else if (h <= vh - 2 * margin) {
        // Ni dessous ni dessus (champ dans un bloc collant, page trop courte…) mais la fenêtre tient
        // dans l’écran : on la décale pour qu’elle soit entièrement visible, quitte à recouvrir le champ.
        top = Math.min(Math.max(margin, a.bottom + gap), vh - margin - h);
      } else if (below >= above) {
        top = a.bottom + gap;
        maxH = Math.max(240, below);
      } else {
        maxH = Math.max(240, above);
        top = a.top - gap - Math.min(h, maxH);
      }
      top = Math.max(margin, top);
      setPos((p) => (p && p.top === top && p.left === left && p.maxH === maxH ? p : { top, left, maxH }));
    }
    place();
    const ro = dialogRef.current ? new ResizeObserver(() => place()) : null;
    if (ro && dialogRef.current) ro.observe(dialogRef.current);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [sheet, anchor, hero, months.length, message]);

  /* -------- textes -------- */
  let summary: string;
  if (start && end) summary = `${plural(nights)} · ${formatRange(start, end)}`;
  else if (start) summary = `Arrivée le ${formatShort(start)} — choisissez votre départ`;
  else summary = "Sélectionnez votre date d’arrivée";

  const visible = (d: IsoDate) => months.some((mo) => mkey(mo) === mkey(monthOf(d)));
  const tabDate = visible(focusDate) ? focusDate : `${months[0].y}-${String(months[0].m + 1).padStart(2, "0")}-01`;

  const previewEnd = choosingEnd && hover && start && hover > start ? hover : null;

  /* -------- sélection en cours reflétée dans les champs (variante « hero ») -------- */
  const draftEnd = end || previewEnd || "";
  const draftPhase: Phase = choosingEnd ? "end" : "start";
  useEffect(() => {
    if (hero) onDraft?.({ start, end: draftEnd, phase: draftPhase });
  }, [hero, onDraft, start, draftEnd, draftPhase]);

  /* -------- rendu d’un mois -------- */
  function navButton(dir: "prev" | "next", enabled: boolean) {
    const label = dir === "prev" ? "Mois précédent" : "Mois suivant";
    const onClick = () => setView(shift(view, dir === "prev" ? -1 : 1));
    if (hero)
      return (
        <button
          type="button"
          onClick={onClick}
          disabled={!enabled}
          aria-label={label}
          className={cx(
            "flex size-10 shrink-0 items-center justify-center border text-or-300 transition-colors",
            enabled ? "border-or-500/60 hover:border-or-300" : "cursor-not-allowed border-or-500/25 opacity-40",
          )}
        >
          <Chevron dir={dir} />
        </button>
      );
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!enabled}
        aria-label={label}
        className={cx(
          "flex size-11 shrink-0 items-center justify-center border transition-colors",
          enabled ? "border-sable-400 hover:border-encre" : "cursor-not-allowed border-sable-200 opacity-50",
        )}
      >
        <Image src={`/icons/chevron-${dir === "prev" ? "gauche" : "droite"}.svg`} alt="" width={16} height={16} unoptimized />
      </button>
    );
  }

  function renderMonth(mo: Month, idx: number, count: number) {
    const title = formatMonthTitle(mo.y, mo.m);
    const mid = `${id}-mois-${mkey(mo)}`;
    const spacer = <span aria-hidden="true" className={cx("shrink-0", hero ? "size-10" : "size-11")} />;
    const cellH = hero ? "h-9" : "h-11";
    return (
      <div key={mkey(mo)} className={cx("flex min-w-0 flex-col gap-3", hero && "flex-1")}>
        <div className="flex items-center justify-between gap-2">
          {idx === 0 ? navButton("prev", canPrev) : spacer}
          <h3 id={mid} className={cx("t-h4 text-center", hero ? "text-clair" : "text-encre")} aria-live="polite">
            {title}
          </h3>
          {idx === count - 1 ? navButton("next", true) : spacer}
        </div>
        <table
          role="grid"
          aria-labelledby={mid}
          className={cx("table-fixed border-collapse", sheet || hero ? "w-full" : "w-[308px]")}
        >
          <thead>
            <tr>
              {WEEKDAYS_CAL.map((w, i) => (
                <th
                  key={w}
                  scope="col"
                  abbr={WEEKDAYS_CAL_LONG[i]}
                  className={cx("t-label h-8 p-0 font-normal", hero ? "text-clair-doux" : "text-doux")}
                >
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody onMouseLeave={() => setHover(null)}>
            {monthGrid(mo.y, mo.m).map((week, wi) => (
              <tr key={wi}>
                {week.map((d, di) => {
                  if (!d) return <td key={di} className={cx(cellH, "p-0")} />;
                  const disabled = isDisabled(d);
                  const out = isOut(d);
                  const full = isFull(d);
                  const isStart = d === start;
                  const isEnd = d === end;
                  const isEdge = isStart || isEnd;
                  const inRange = Boolean(start && end && d > start && d < end);
                  const inPreview = Boolean(previewEnd && start && d > start && d < previewEnd);
                  const isHoverEnd = Boolean(previewEnd && d === previewEnd);
                  const isToday = d === today;
                  const plain = !isEdge && !inRange && !inPreview && !isHoverEnd;
                  const status = [
                    isStart ? "arrivée" : null,
                    isEnd ? "départ" : null,
                    inRange ? "nuit sélectionnée" : null,
                    isToday ? "aujourd’hui" : null,
                    full ? "complet" : null,
                    out ? "indisponible" : null,
                  ]
                    .filter(Boolean)
                    .join(", ");
                  const tone = hero
                    ? [
                        "focus-visible:outline-2 focus-visible:outline-clair",
                        isEdge && "bg-or-500 text-noir-900",
                        !isEdge && inRange && "bg-or-500/20 text-clair",
                        !isEdge && !inRange && inPreview && "bg-or-500/10 text-clair",
                        !isEdge && isHoverEnd && "border border-or-300 text-clair",
                        plain && isToday && "border border-or-500",
                        plain && out && "text-clair-doux/40",
                        plain && !out && full && "text-clair-doux/50",
                        plain && !out && !full && "text-clair hover:bg-noir-700",
                      ]
                    : [
                        isEdge && "bg-noir-900 text-or-300",
                        !isEdge && inRange && "bg-sable-100 text-encre",
                        !isEdge && !inRange && inPreview && "bg-sable-100/60 text-encre",
                        !isEdge && isHoverEnd && "border border-noir-900 bg-blanc text-encre",
                        plain && isToday && "border border-or-500",
                        !isEdge && !inRange && !inPreview && (disabled || full || out) && "text-sable-400",
                        plain && !(disabled || full || out) && "text-encre hover:bg-sable-50",
                      ];
                  return (
                    <td key={d} role="gridcell" aria-selected={isEdge || inRange} className={cx(cellH, "p-0")}>
                      <button
                        type="button"
                        data-date={d}
                        tabIndex={d === tabDate ? 0 : -1}
                        aria-disabled={disabled || undefined}
                        aria-label={`${formatLong(d)}${status ? ` (${status})` : ""}`}
                        onClick={() => pick(d)}
                        onMouseEnter={() => (choosingEnd ? setHover(d) : undefined)}
                        onFocus={() => setFocusDate(d)}
                        onKeyDown={(e) => onDayKey(e, d)}
                        className={cx(
                          "t-corps relative flex w-full items-center justify-center outline-offset-[-2px] transition-colors",
                          cellH,
                          ...tone,
                          full && !isEdge && "line-through decoration-1",
                          disabled ? "cursor-not-allowed" : "cursor-pointer",
                        )}
                      >
                        {toUtc(d).getUTCDate()}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const legend = (
    <ul className={cx("t-petit flex flex-wrap items-center gap-x-4 gap-y-1.5", hero ? "text-clair-doux" : "text-doux")}>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className={cx("size-3.5", hero ? "bg-or-500" : "bg-noir-900")} />
        Arrivée / départ
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className={cx("size-3.5", hero ? "bg-or-500/20" : "bg-sable-100")} />
        Nuits sélectionnées
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className={cx("size-3.5 border border-or-500", !hero && "bg-blanc")} />
        Aujourd’hui
      </li>
    </ul>
  );

  const effacer = (
    <button
      type="button"
      onClick={clear}
      className={buttonClasses(hero ? "contour-clair" : "contour-sombre", cx("min-h-11! px-5! py-2!", sheet && "w-full"))}
    >
      Effacer
    </button>
  );
  const valider = (
    <button
      type="button"
      onClick={apply}
      disabled={!complete}
      className={buttonClasses("primaire", cx("min-h-11! px-6! py-2! disabled:opacity-45!", sheet && "w-full"))}
    >
      Valider
    </button>
  );
  const actions = sheet ? (
    <div className="flex w-full flex-col gap-3">
      {valider}
      {effacer}
    </div>
  ) : (
    <div className="flex items-center justify-end gap-3">
      {effacer}
      {valider}
    </div>
  );

  const label = "Choisir les dates d’arrivée et de départ";

  if (sheet) {
    return createPortal(
      <>
        <div aria-hidden="true" className="fixed inset-0 z-[59] bg-black/50" onClick={() => close(true)} />
        <div
          ref={dialogRef}
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          aria-describedby={summaryId}
          className="fixed inset-x-0 bottom-0 z-[60] flex max-h-[90dvh] flex-col overflow-y-auto border-t-2 border-or-500 bg-blanc select-none"
        >
          <div className="flex flex-col gap-4 px-5 pt-3 pb-4">
            <span aria-hidden="true" className="mx-auto h-1 w-10 shrink-0 bg-sable-400" />
            <div className="flex items-center justify-between gap-4">
              <h2 id={titleId} className="t-h3 text-encre">
                Choisir vos dates
              </h2>
              <button
                type="button"
                onClick={() => close(true)}
                aria-label="Fermer"
                className="flex size-11 shrink-0 items-center justify-center border border-sable-400 hover:border-encre"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </button>
            </div>
            <p id={summaryId} className="t-petit text-doux" aria-live="polite">
              {summary}
            </p>
            {message && (
              <p role="alert" className="t-petit text-erreur">
                {message}
              </p>
            )}
            <div className="max-[359px]:-mx-3.5">{renderMonth(months[0], 0, 1)}</div>
          </div>
          <div className="sticky bottom-0 mt-auto border-t border-sable-200 bg-blanc px-5 py-4">{actions}</div>
        </div>
      </>,
      document.body,
    );
  }

  if (hero) {
    return createPortal(
      <div
        ref={dialogRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-describedby={summaryId}
        style={{
          top: pos?.top ?? -9999,
          left: pos?.left ?? 0,
          width: heroWidth,
          maxHeight: pos?.maxH,
          visibility: pos ? "visible" : "hidden",
        }}
        className="fixed z-50 flex flex-col gap-4 overflow-y-auto border border-or-500 bg-noir-900 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.35)] select-none"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p id={titleId} className="t-surtitre text-or-500">
            Arrivée — Départ
          </p>
          <p id={summaryId} className="t-petit text-clair-doux" aria-live="polite">
            {summary}
          </p>
        </div>
        {message && (
          <p role="alert" className="t-petit text-or-300">
            {message}
          </p>
        )}
        <div className="flex gap-12">{months.map((mo, i) => renderMonth(mo, i, months.length))}</div>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-or-500/40 pt-3">
          {legend}
          <div className="ml-auto">{actions}</div>
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div
      ref={dialogRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-describedby={summaryId}
      style={{
        top: pos?.top ?? -9999,
        left: pos?.left ?? 0,
        maxHeight: pos?.maxH,
        visibility: pos ? "visible" : "hidden",
      }}
      className="fixed z-50 flex flex-col gap-5 overflow-y-auto border border-sable-200 bg-blanc p-6 shadow-[0_16px_40px_rgba(0,0,0,0.14)] select-none"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p id={titleId} className="t-surtitre text-or-700">
          Arrivée — Départ
        </p>
        <p id={summaryId} className="t-petit text-doux" aria-live="polite">
          {summary}
        </p>
      </div>
      {message && (
        <p role="alert" className="t-petit text-erreur">
          {message}
        </p>
      )}
      <div className="flex gap-8">{months.map((mo, i) => renderMonth(mo, i, months.length))}</div>
      <div className="flex flex-col gap-4 border-t border-sable-200 pt-4">
        <div className="hidden md:block">{legend}</div>
        {actions}
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/* API publique                                                         */
/* ------------------------------------------------------------------ */

type RangeProps = {
  /** Préfixe des identifiants : `${id}-arrivee` et `${id}-depart` (champs déclencheurs). */
  id: string;
  arrival: string;
  departure: string;
  onChange: (arrival: string, departure: string) => void;
  labels?: { arrival: ReactNode; departure: ReactNode };
  names?: { arrival: string; departure: string };
  errors?: { arrival?: string | null; departure?: string | null };
  /** « dark » : bandeau noir de l’accueil ; « light » : champs de formulaire clairs. */
  tone?: "dark" | "light";
  /**
   * « hero » (bandeau de l’accueil, ≥ 640 px) : fenêtre sombre ouverte au-dessus de `barRef`, de sa largeur ;
   * les champs suivent la sélection en cours jusqu’à « Valider ».
   */
  variant?: "default" | "hero";
  /** Bandeau de réservation (variante « hero ») : sert d’ancre et donne la largeur de la fenêtre. */
  barRef?: RefObject<HTMLElement | null>;
  /** Barrer les nuits où l’hôtel est complet (règles de disponibilité de la maquette). */
  markFull?: boolean;
  /** Classes de chaque champ (conteneur). */
  fieldClassName?: string;
  /** Classes supplémentaires de la zone cliquable du champ départ (ex. mise en évidence). */
  departureTriggerClassName?: string;
  /** Élément inséré entre les deux champs (séparateur du bandeau). */
  separator?: ReactNode;
};

/** Deux champs liés « Arrivée / Départ » ouvrant le même calendrier de plage. */
export function DateRangePicker({
  id,
  arrival,
  departure,
  onChange,
  labels = { arrival: "Arrivée", departure: "Départ" },
  names,
  errors,
  tone = "light",
  variant = "default",
  barRef,
  markFull = false,
  fieldClassName,
  departureTriggerClassName,
  separator,
}: RangeProps) {
  const dialogId = `${useId()}-calendrier`;
  const today = useToday();
  const [open, setOpen] = useState<{ phase: Phase; trigger: HTMLButtonElement; anchor: HTMLElement; hero: boolean } | null>(
    null,
  );
  const [draft, setDraft] = useState<Draft | null>(null);
  const triggers = useRef<(HTMLElement | null)[]>([null, null]);

  // Fermer si la page est masquée par la navigation (<Activity>).
  useLayoutEffect(
    () => () => {
      setOpen(null);
      setDraft(null);
    },
    [],
  );

  function openFrom(phase: Phase, el: HTMLButtonElement) {
    const bar = variant === "hero" ? barRef?.current : null;
    // Ancre : le bandeau (variante « hero ») ou le conteneur du champ « Arrivée » (fenêtre sous les deux champs).
    const anchor = bar ?? document.getElementById(`${id}-arrivee`)?.parentElement ?? el;
    setDraft(null);
    setOpen((o) =>
      o && (o.hero || o.phase === phase)
        ? null
        : { phase: phase === "end" && !isIsoDate(arrival) ? "start" : phase, trigger: el, anchor, hero: Boolean(bar) },
    );
  }

  const close = useCallback(() => {
    setOpen(null);
    setDraft(null);
  }, []);

  const shown = open && draft ? draft : null;

  return (
    <>
      <Trigger
        id={`${id}-arrivee`}
        label={labels.arrival}
        value={shown ? shown.start : arrival}
        tone={tone}
        open={Boolean(open)}
        active={Boolean(shown && shown.phase === "start")}
        dialogId={dialogId}
        error={errors?.arrival}
        className={fieldClassName}
        name={names?.arrival}
        onOpen={(el) => openFrom("start", el)}
        triggerRef={(el) => {
          triggers.current[0] = el;
        }}
      />
      {separator}
      <Trigger
        id={`${id}-depart`}
        label={labels.departure}
        value={shown ? shown.end : departure}
        tone={tone}
        open={Boolean(open)}
        active={Boolean(shown && shown.phase === "end")}
        dialogId={dialogId}
        error={errors?.departure}
        className={fieldClassName}
        triggerClassName={departureTriggerClassName}
        name={names?.departure}
        onOpen={(el) => openFrom("end", el)}
        triggerRef={(el) => {
          triggers.current[1] = el;
        }}
      />
      {open && (
        <PickerDialog
          key={open.phase}
          id={dialogId}
          start={arrival}
          end={departure}
          initialPhase={open.phase}
          anchor={open.anchor}
          returnFocus={open.trigger}
          ignore={triggers}
          min={today}
          markFull={markFull}
          hero={open.hero}
          onDraft={setDraft}
          onApply={(a, d) => {
            onChange(a, d);
            if (a && d) {
              const t = open.trigger;
              close();
              requestAnimationFrame(() => t.focus({ preventScroll: true }));
            }
          }}
          onClose={close}
        />
      )}
    </>
  );
}
