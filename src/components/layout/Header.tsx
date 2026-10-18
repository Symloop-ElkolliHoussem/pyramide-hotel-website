"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { HOTEL, MAIN_NAV, PHOTOS } from "@/data/hotel";
import { buttonClasses } from "@/components/ui/Button";
import { cx } from "@/lib/format";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Composant « En-tête » : logo + nom, navigation, bouton « Réserver » ; menu mobile sous 1024 px. */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Ferme le menu quand la page est masquée (navigation conservée par <Activity>).
  useLayoutEffect(() => () => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>("a, button");
        const list = [toggleRef.current, ...Array.from(items)].filter(Boolean) as HTMLElement[];
        const idx = list.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && idx <= 0) {
          e.preventDefault();
          list[list.length - 1].focus();
        } else if (!e.shiftKey && idx === list.length - 1) {
          e.preventDefault();
          list[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="relative z-40 border-b border-or-500 bg-noir-900">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-6 px-5 md:px-10 lg:h-[104px] xl:px-16">
        <Link
          href="/"
          onNavigate={close}
          className="flex shrink-0 items-center gap-3 lg:gap-4"
          aria-label={`${HOTEL.name} — retour à l’accueil`}
        >
          <Image
            src={PHOTOS.logo.src}
            alt=""
            width={76}
            height={76}
            priority
            className="size-[52px] lg:size-[76px]"
          />
          <span className="flex flex-col gap-0.5 whitespace-nowrap">
            <span className="t-h4 text-[1.125rem] text-or-300 lg:text-[1.3125rem]">{HOTEL.name}</span>
            <span className="t-label text-[0.6875rem] text-clair-doux lg:text-xs">{HOTEL.location}</span>
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-5 xl:gap-9">
            {MAIN_NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "t-nav group flex flex-col items-center gap-2 pt-[9px] whitespace-nowrap transition-colors",
                      active ? "text-or-300" : "text-clair hover:text-or-300",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={cx(
                        "h-px w-6 transition-colors",
                        active ? "bg-or-500" : "bg-transparent group-hover:bg-or-500/60",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden md:block">
            <Link href="/reserver" onNavigate={close} className={buttonClasses("primaire")}>
              Réserver
            </Link>
          </span>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-12 items-center justify-center border border-or-500 text-or-300 lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
            <span aria-hidden="true" className="relative block h-3.5 w-5">
              <span
                className={cx(
                  "absolute left-0 h-px w-5 bg-current transition-transform",
                  open ? "top-1/2 rotate-45" : "top-0",
                )}
              />
              <span className={cx("absolute top-1/2 left-0 h-px w-5 bg-current", open && "opacity-0")} />
              <span
                className={cx(
                  "absolute left-0 h-px w-5 bg-current transition-transform",
                  open ? "top-1/2 -rotate-45" : "bottom-0",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="menu-mobile"
        ref={panelRef}
        hidden={!open}
        className="absolute inset-x-0 top-full z-50 h-[calc(100dvh-76px)] overflow-y-auto border-t border-or-500/40 bg-noir-900 lg:hidden"
      >
        <nav aria-label="Navigation mobile" className="flex flex-col gap-1 px-5 py-8 md:px-10">
          {MAIN_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onNavigate={close}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "t-h3 border-b border-noir-600 py-4",
                  active ? "text-or-300" : "text-clair hover:text-or-300",
                )}
              >
                {item.label === "FAQ" ? "Questions fréquentes" : item.label}
              </Link>
            );
          })}
          <Link href="/reservation" onNavigate={close} className="t-h3 border-b border-noir-600 py-4 text-clair hover:text-or-300">
            Demande de réservation
          </Link>
          <Link href="/ma-reservation" onNavigate={close} className="t-h3 border-b border-noir-600 py-4 text-clair hover:text-or-300">
            Gérer ma réservation
          </Link>
          <Link href="/reserver" onNavigate={close} className={buttonClasses("primaire", "mt-8 w-full")}>
            Réserver
          </Link>
        </nav>
      </div>
    </header>
  );
}
