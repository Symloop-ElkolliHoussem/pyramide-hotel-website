"use client";

import { useState } from "react";
import { Lightbox, type LightboxItem } from "@/components/gallery/Lightbox";
import { buttonClasses } from "@/components/ui/Button";
import { FramedPhoto } from "@/components/ui/FramedPhoto";
import { GALLERY, PHOTOS, type Room } from "@/data/hotel";

/** « Galerie de la chambre » (02.x) : photo principale + deux photos, visionneuse. */
export function RoomGallery({ room }: { room: Room }) {
  const [index, setIndex] = useState<number | null>(null);
  const items: LightboxItem[] = room.photos.map((photo, i) => ({
    photo,
    caption: i === 0 ? room.fullName : (GALLERY.find((g) => g.photo === photo)?.caption ?? PHOTOS[photo].alt),
  }));

  const open = (i: number) => setIndex(i);

  return (
    <section aria-label={`Photos — ${room.fullName}`} className="bg-sable-50 pb-10 lg:pb-12">
      <div className="conteneur grid gap-4 lg:grid-cols-[784fr_400fr]">
        <button
          type="button"
          onClick={() => open(0)}
          className="group block text-left"
          aria-label={`Agrandir la photo principale — ${room.fullName}`}
        >
          <FramedPhoto
            photo={room.photos[0]}
            priority
            className="h-[280px] sm:h-[420px] lg:h-[520px]"
            sizes="(min-width: 1280px) 784px, (min-width: 1024px) 64vw, 100vw"
          />
        </button>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <button type="button" onClick={() => open(1)} className="block" aria-label={`Agrandir : ${items[1].caption}`}>
            <FramedPhoto
              photo={room.photos[1]}
              className="h-[160px] sm:h-[220px] lg:h-[252px]"
              sizes="(min-width: 1280px) 400px, (min-width: 1024px) 33vw, 50vw"
            />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => open(2)}
              className="block w-full"
              aria-label={`Agrandir : ${items[2].caption}`}
            >
              <FramedPhoto
                photo={room.photos[2]}
                className="h-[160px] sm:h-[220px] lg:h-[252px]"
                sizes="(min-width: 1280px) 400px, (min-width: 1024px) 33vw, 50vw"
              />
            </button>
            {/* Sur la photo à partir de 640 px ; sous les photos, pleine largeur, en dessous. */}
            <div className="hidden sm:block">
              <button
                type="button"
                onClick={() => open(0)}
                className={buttonClasses(
                  "contour-clair",
                  "absolute bottom-3 left-1/2 -translate-x-1/2 bg-noir-900/60 whitespace-nowrap backdrop-blur-[2px] lg:bottom-6",
                )}
              >
                Voir toutes les photos
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="conteneur pt-4 sm:hidden">
        <button type="button" onClick={() => open(0)} className={buttonClasses("contour-sombre", "w-full")}>
          Voir toutes les photos
        </button>
      </div>
      <Lightbox items={items} index={index} onIndexChange={setIndex} onClose={() => setIndex(null)} context={room.fullName} />
    </section>
  );
}
