"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useLayoutEffect, useRef } from "react";
import { PHOTOS, type PhotoKey } from "@/data/hotel";
import { cx } from "@/lib/format";

export type LightboxItem = { photo: PhotoKey; caption: string };

type Props = {
  items: LightboxItem[];
  /** Index affiché ; null = fermé. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Complément de la ligne « Photo X sur N » (ex. « Filtre : Tout »). */
  context?: string;
};

/**
 * « 04.1 — Galerie · visionneuse photo » : fenêtre modale plein écran
 * (élément <dialog> natif : piège du focus, Échap, retour du focus),
 * flèches précédente / suivante, miniatures, clavier ← → et balayage tactile.
 */
export function Lightbox({ items, index, onIndexChange, onClose, context }: Props) {
  const uid = useId();
  const titleId = `${uid}-titre`;
  const positionId = `${uid}-position`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  const open = index !== null && items.length > 0;
  const current = open ? Math.min(index, items.length - 1) : 0;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Ouverture / fermeture du <dialog> natif.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Verrouillage du défilement de la page.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Page masquée par la navigation (<Activity>) : on ferme la visionneuse.
  useLayoutEffect(
    () => () => {
      if (dialogRef.current?.open) dialogRef.current.close();
      onCloseRef.current();
    },
    [],
  );

  // La miniature active reste visible.
  useEffect(() => {
    if (!open) return;
    const el = thumbsRef.current?.querySelector<HTMLElement>(`[data-index="${current}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [open, current]);

  const go = useCallback(
    (delta: number) => {
      if (!items.length) return;
      onIndexChange((current + delta + items.length) % items.length);
    },
    [current, items.length, onIndexChange],
  );

  const item = items[current];
  const photo = item ? PHOTOS[item.photo] : null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={positionId}
      onClose={() => onClose()}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        }
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (start == null || end == null) return;
        if (Math.abs(end - start) > 50) go(end < start ? 1 : -1);
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-noir-900 p-0 text-clair backdrop:bg-black/80"
    >
      {open && item && photo && (
        <div className="flex h-full flex-col items-center gap-4 px-4 py-5 md:gap-6 md:px-12 md:py-7">
          <div className="flex w-full items-start gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 id={titleId} className="t-h4 truncate text-clair">
                {item.caption}
              </h2>
              <p id={positionId} className="t-petit text-clair-doux" aria-live="polite">
                Photo {current + 1} sur {items.length}
                {context ? ` · ${context}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onClose()}
              className="t-label flex min-h-11 shrink-0 items-center gap-2 border border-or-500 px-3 py-2.5 text-or-300 hover:bg-or-500/10"
            >
              Fermer
              <Image src="/icons/visionneuse-fermer.svg" alt="" width={18} height={18} unoptimized />
            </button>
          </div>

          <div className="flex min-h-0 w-full flex-1 items-center gap-3 md:gap-6">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Photo précédente"
              className="hidden shrink-0 border border-or-500 p-3.5 hover:bg-or-500/10 sm:block"
            >
              <Image src="/icons/visionneuse-precedente.svg" alt="" width={24} height={24} unoptimized />
            </button>
            <div className="relative h-full min-w-0 flex-1">
              <Image
                key={item.photo}
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 80vw, 100vw"
                className="object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Photo suivante"
              className="hidden shrink-0 border border-or-500 p-3.5 hover:bg-or-500/10 sm:block"
            >
              <Image src="/icons/visionneuse-suivante.svg" alt="" width={24} height={24} unoptimized />
            </button>
          </div>

          <div className="flex w-full items-center justify-center gap-3 sm:hidden">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Photo précédente"
              className="border border-or-500 p-3 hover:bg-or-500/10"
            >
              <Image src="/icons/visionneuse-precedente.svg" alt="" width={24} height={24} unoptimized />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Photo suivante"
              className="border border-or-500 p-3 hover:bg-or-500/10"
            >
              <Image src="/icons/visionneuse-suivante.svg" alt="" width={24} height={24} unoptimized />
            </button>
          </div>

          <div ref={thumbsRef} className="flex max-w-full gap-2.5 overflow-x-auto pb-1">
            {items.map((it, i) => (
              <button
                key={`${it.photo}-${i}`}
                type="button"
                data-index={i}
                onClick={() => onIndexChange(i)}
                aria-label={`Afficher la photo ${i + 1} : ${it.caption}`}
                aria-current={i === current ? "true" : undefined}
                className={cx(
                  "relative h-12 w-[72px] shrink-0 md:h-16 md:w-24",
                  i === current ? "border-2 border-or-500" : "opacity-55 hover:opacity-90",
                )}
              >
                <Image src={PHOTOS[it.photo].src} alt="" fill sizes="96px" className="object-cover" />
              </button>
            ))}
          </div>

          <p className="t-petit hidden text-clair-doux md:block">
            Clavier : ← → pour naviguer, Échap pour fermer · balayage sur mobile
          </p>
        </div>
      )}
    </dialog>
  );
}
