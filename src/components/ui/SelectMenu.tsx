"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/format";

export type SelectOption = { value: string; label: string };

/** Écart entre le champ et la liste ; au-dessus, la liste laisse aussi voir le libellé du champ. */
const GAP_BELOW = 12;
const GAP_ABOVE = 40;
const MIN_WIDTH = 200;

/**
 * Liste déroulante sur mesure (remplace le <select> natif) — style sombre du
 * « Bandeau de réservation » : panneau noir, filet or, option choisie en or.
 * Accessible : bouton + listbox (flèches, Début/Fin, Entrée/Espace, Échap, Tab).
 *
 * La liste est rendue dans <body> en position fixe : aucun parent ne peut la
 * couper (le hero du carrousel est en overflow hidden). Elle s’ouvre sous le
 * champ s’il y a la place à l’écran, sinon du côté le plus grand, suit le champ
 * au défilement, et n’entraîne jamais de défilement de la page.
 */
export function SelectMenu({
  id,
  labelId,
  value,
  options,
  onChange,
  className,
}: {
  id: string;
  labelId: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((o) => o.value === value)));
  const [style, setStyle] = useState<CSSProperties | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  /** Place la liste par rapport au champ, dans l’écran. */
  const place = useCallback(() => {
    const btn = buttonRef.current;
    const list = listRef.current;
    if (!btn || !list) return;
    const r = btn.getBoundingClientRect();
    const h = list.offsetHeight;
    const width = Math.max(r.width, MIN_WIDTH);
    const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
    const below = window.innerHeight - r.bottom - GAP_BELOW;
    const above = r.top - GAP_ABOVE;
    const up = below < h && above > below;
    setStyle(
      up
        ? { position: "fixed", left, width, bottom: window.innerHeight - r.top + GAP_ABOVE }
        : { position: "fixed", left, width, top: r.bottom + GAP_BELOW },
    );
  }, []);

  // Premier placement avant l’affichage (la liste reste invisible tant qu’elle n’est pas placée).
  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  // Focus sur la liste une fois visible, sans faire défiler la page.
  useLayoutEffect(() => {
    if (open && style) listRef.current?.focus({ preventScroll: true });
  }, [open, style]);

  // Suit le champ au défilement et au redimensionnement ; ferme au clic extérieur.
  useEffect(() => {
    if (!open) return;
    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!buttonRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    };
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    document.addEventListener("pointerdown", onDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, place]);

  function openList() {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setStyle(null);
    setOpen(true);
  }

  function close(refocus: boolean) {
    setOpen(false);
    setStyle(null);
    if (refocus) buttonRef.current?.focus({ preventScroll: true });
  }

  function choose(i: number) {
    onChange(options[i].value);
    close(true);
  }

  function onButtonKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openList();
    }
  }

  function onListKey(e: KeyboardEvent<HTMLUListElement>) {
    const last = options.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(last, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(last);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "Tab") {
      e.preventDefault();
      close(true);
    }
  }

  return (
    <div className={cx("relative", className)}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={`${labelId} ${id}`}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={onButtonKey}
        className="t-corps flex h-11 w-full cursor-pointer items-center justify-between gap-3 bg-transparent text-left text-clair outline-none lg:h-auto focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-or-500"
      >
        <span className="truncate">{current.label}</span>
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cx("shrink-0 text-or-500 transition-transform duration-200", open && "rotate-180")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={labelId}
            aria-activedescendant={`${listId}-${active}`}
            onKeyDown={onListKey}
            style={style ?? { position: "fixed", left: 0, top: 0, width: MIN_WIDTH }}
            className={cx(
              "z-[60] border border-or-500 bg-noir-900 py-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.45)] outline-none",
              !style && "invisible",
            )}
          >
            {options.map((o, i) => {
              const selected = o.value === value;
              return (
                <li
                  key={o.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={selected}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => choose(i)}
                  className={cx(
                    "t-corps flex min-h-11 cursor-pointer items-center justify-between gap-3 px-5 py-2.5 transition-colors",
                    selected ? "text-or-500" : "text-clair",
                    i === active && "bg-noir-700",
                  )}
                >
                  <span>{o.label}</span>
                  {selected && (
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M5 12.5 10 17.5 19 7" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}
