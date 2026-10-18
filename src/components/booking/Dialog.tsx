"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Fenêtre modale accessible : <dialog> natif (showModal → piège du focus,
 * Échap pour fermer), focus rendu à l’élément déclencheur à la fermeture.
 */
export function Dialog({
  open,
  onClose,
  labelledBy,
  describedBy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const closeRef = useRef(onClose);

  useLayoutEffect(() => {
    closeRef.current = onClose;
  });

  // Fermeture si la page est masquée par <Activity> (navigation).
  useLayoutEffect(() => () => closeRef.current(), []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
      (opener.current as HTMLElement | null)?.focus?.();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(520px,calc(100vw-32px))] bg-transparent p-0 backdrop:bg-noir-900/60"
    >
      {children}
    </dialog>
  );
}
