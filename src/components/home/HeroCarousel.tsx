"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { PHOTOS, type PhotoKey } from "@/data/hotel";
import { cx } from "@/lib/format";

type Slide = { photo: PhotoKey; caption: string };

const INTERVAL_MS = 5000; // défilement automatique toutes les 5 s (maquette)
const FADE_MS = 800; // fondu enchaîné 0,8 s

/**
 * Composant « Hero / Carrousel » : photos plein cadre en fondu enchaîné,
 * dégradé sombre, légende en italique, traits indicateurs et flèches rondes.
 * Le contenu du hero (children) et le bandeau de réservation (bar) restent
 * posés par-dessus, inchangés.
 *
 * Accessibilité : boutons précédent/suivant/pause libellés, indicateurs
 * annoncés (« Photo 2 sur 5 »), pause au survol et au focus, lecture
 * automatique désactivée si l’utilisateur préfère réduire les animations.
 */
export function HeroCarousel({ slides, children, bar }: { slides: Slide[]; children: ReactNode; bar: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  const count = slides.length;
  const go = useCallback(
    (next: number, fromUser = true) => {
      setIndex(((next % count) + count) % count);
      if (fromUser) setAnnounce(true);
    },
    [count],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Réinitialise l’état transitoire quand la page est masquée (<Activity>).
  useLayoutEffect(
    () => () => {
      setHovered(false);
      setFocused(false);
    },
    [],
  );

  const playing = !userPaused && !reducedMotion && !hovered && !focused;

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => go(index + 1, false), INTERVAL_MS);
    return () => window.clearTimeout(t);
  }, [playing, index, go]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  };

  return (
    <div
      className="relative isolate flex min-h-[calc(100svh-76px)] flex-col overflow-hidden bg-noir-900 lg:min-h-[min(880px,calc(100svh-104px))]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Photos de fond */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {slides.map((s, i) => (
          <Image
            key={s.photo}
            src={PHOTOS[s.photo].src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={cx(
              "object-cover transition-opacity ease-in-out",
              i === index ? "opacity-100" : "opacity-0",
            )}
            style={{ transitionDuration: reducedMotion ? "0ms" : `${FADE_MS}ms` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/75" />
      </div>

      {/* Contenu hero (fixe) */}
      <div className="flex flex-1 flex-col items-center px-5 pt-14 md:px-10 lg:pt-24 xl:px-[120px] lg:[@media(max-height:820px)]:pt-12">{children}</div>

      {/* Légende et contrôles */}
      <div
        ref={regionRef}
        role="region"
        aria-roledescription="carrousel"
        aria-label="Photos de l’hôtel"
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!regionRef.current?.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
        className="mx-auto mt-10 flex w-full max-w-[1440px] flex-col gap-4 px-5 md:px-10 lg:mt-0 lg:flex-row lg:items-center lg:gap-6 xl:px-[120px]"
      >
        <p
          className="t-citation min-h-[34px] flex-1 text-clair"
          aria-live={announce ? "polite" : "off"}
          aria-atomic="true"
        >
          <span className="sr-only">
            Photo {index + 1} sur {count} :{" "}
          </span>
          {slides[index].caption}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 lg:flex-nowrap lg:justify-end lg:gap-6">
          <div className="flex items-center" role="group" aria-label="Choisir une photo">
            {slides.map((s, i) => (
              <button
                key={s.photo}
                type="button"
                onClick={() => go(i)}
                aria-label={`Photo ${i + 1} sur ${count} : ${s.caption}`}
                aria-current={i === index ? "true" : undefined}
                className="group flex size-11 items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    "block h-[1.5px] w-7 transition-colors lg:w-10",
                    i === index ? "bg-white" : "bg-white/40 group-hover:bg-white/70",
                  )}
                />
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-pressed={userPaused}
              aria-label={userPaused ? "Reprendre le défilement des photos" : "Mettre en pause le défilement des photos"}
              className="flex size-11 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:border-white hover:bg-white/10"
            >
              {userPaused ? (
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14">
                  <path d="M3.5 2.2v9.6L11.5 7z" fill="currentColor" />
                </svg>
              ) : (
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14">
                  <path d="M4 2.5v9M10 2.5v9" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Photo précédente"
              className="flex size-11 items-center justify-center rounded-full border border-white/50 transition-colors hover:border-white hover:bg-white/10"
            >
              <Image src="/icons/fleche-gauche.svg" alt="" width={18} height={18} unoptimized />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Photo suivante"
              className="flex size-11 items-center justify-center rounded-full border border-white/50 transition-colors hover:border-white hover:bg-white/10"
            >
              <Image src="/icons/fleche-droite.svg" alt="" width={18} height={18} unoptimized />
            </button>
          </div>
        </div>
      </div>

      {/* Bandeau de réservation (fixe) */}
      <div className="mx-auto w-full max-w-[1440px] px-5 pt-6 pb-10 md:px-10 lg:pt-[22px] lg:pb-14 xl:px-[120px] lg:[@media(max-height:820px)]:pb-10">{bar}</div>
    </div>
  );
}
