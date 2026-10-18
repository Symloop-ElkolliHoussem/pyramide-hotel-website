"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { GALLERY, GALLERY_FILTERS, PHOTOS, type GalleryCategory, type GalleryItem } from "@/data/hotel";
import { cx } from "@/lib/format";
import { Lightbox } from "./Lightbox";

type FilterId = "tout" | GalleryCategory;

/** Ordre de lecture ligne par ligne de la mosaïque desktop (colonne 1, 2, 3, puis rang suivant). */
function rowMajor(items: GalleryItem[]): GalleryItem[] {
  const cols = [1, 2, 3].map((c) => items.filter((it) => it.column === c));
  const out: GalleryItem[] = [];
  const max = Math.max(...cols.map((c) => c.length));
  for (let i = 0; i < max; i++) for (const col of cols) if (col[i]) out.push(col[i]);
  return out;
}

function distribute<T>(items: T[], n: number): T[][] {
  const cols: T[][] = Array.from({ length: n }, () => []);
  items.forEach((it, i) => cols[i % n].push(it));
  return cols;
}

function Tile({ item, priority, onOpen }: { item: GalleryItem; priority?: boolean; onOpen: () => void }) {
  const p = PHOTOS[item.photo];
  return (
    <li>
      <figure className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onOpen}
          className="group relative block w-full overflow-hidden bg-sable-100"
          style={{ aspectRatio: `${p.width} / ${p.height}` }}
          aria-label={`Agrandir : ${item.caption}`}
        >
          <Image
            src={p.src}
            alt={p.alt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 384px, (min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </button>
        <figcaption className="t-petit text-doux">{item.caption}</figcaption>
      </figure>
    </li>
  );
}

/** Galerie 04 / 04.2 : filtres, mosaïque en colonnes et visionneuse 04.1. */
export function GalleryGrid() {
  const [filter, setFilter] = useState<FilterId>("tout");
  const [index, setIndex] = useState<number | null>(null);

  const ordered = useMemo(() => {
    const all = rowMajor(GALLERY);
    return filter === "tout" ? all : all.filter((g) => g.category === filter);
  }, [filter]);

  const filterLabel = GALLERY_FILTERS.find((f) => f.id === filter)?.label ?? "Tout";
  const position = new Map(ordered.map((it, i) => [it, i]));

  const desktopCols = distribute(ordered, 3);
  const tabletCols = distribute(ordered, 2);

  return (
    <>
      <div role="group" aria-label="Filtrer les photos" className="flex flex-wrap justify-center gap-2 lg:gap-3">
        {GALLERY_FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setFilter(f.id);
                setIndex(null);
              }}
              className={cx(
                "t-label min-h-11 border px-[22px] py-[11px] transition-colors lg:min-h-0",
                active ? "border-noir-900 bg-noir-900 text-or-300" : "border-sable-400 text-encre hover:border-encre",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {ordered.length} photo{ordered.length > 1 ? "s" : ""} — filtre : {filterLabel}
      </p>

      {/* Desktop : 3 colonnes (maquette 04) */}
      <div className="mt-12 hidden gap-6 lg:flex">
        {desktopCols.map((col, c) => (
          <ul key={c} className="flex flex-1 flex-col gap-7">
            {col.map((item, r) => (
              <Tile key={item.photo} item={item} priority={r === 0} onOpen={() => setIndex(position.get(item) ?? 0)} />
            ))}
          </ul>
        ))}
      </div>
      {/* Tablette : 2 colonnes */}
      <div className="mt-10 hidden gap-5 sm:flex lg:hidden">
        {tabletCols.map((col, c) => (
          <ul key={c} className="flex flex-1 flex-col gap-6">
            {col.map((item) => (
              <Tile key={item.photo} item={item} onOpen={() => setIndex(position.get(item) ?? 0)} />
            ))}
          </ul>
        ))}
      </div>
      {/* Mobile : 1 colonne */}
      <ul className="mt-8 flex flex-col gap-6 sm:hidden">
        {ordered.map((item) => (
          <Tile key={item.photo} item={item} onOpen={() => setIndex(position.get(item) ?? 0)} />
        ))}
      </ul>

      <Lightbox
        items={ordered}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setIndex(null)}
        context={`Filtre : ${filterLabel}`}
      />
    </>
  );
}
