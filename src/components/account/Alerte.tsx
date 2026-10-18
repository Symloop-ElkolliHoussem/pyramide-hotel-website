import Image from "next/image";
import { forwardRef, type ReactNode } from "react";
import { cx } from "@/lib/format";

type Props = {
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
};

/**
 * « Alerte / erreur » de la maquette : fond erreur-fond, filet gauche rouge,
 * icône triangle. Annoncée aux lecteurs d’écran (role="alert") et focalisable.
 */
export const Alerte = forwardRef<HTMLDivElement, Props>(function Alerte({ title, children, className, id }, ref) {
  return (
    <div
      ref={ref}
      id={id}
      role="alert"
      tabIndex={-1}
      className={cx(
        "flex w-full items-start gap-3.5 border-l-[3px] border-erreur bg-erreur-fond px-5 py-4 outline-none focus-visible:outline-2 focus-visible:outline-or-700 md:px-6",
        className,
      )}
    >
      <Image src="/icons/alerte.svg" alt="" aria-hidden="true" width={22} height={22} unoptimized className="mt-0.5 shrink-0" />
      <div className="flex flex-1 flex-col gap-1.5">
        {title && <p className="t-h4 text-erreur">{title}</p>}
        {children && <div className={cx("t-petit", title ? "text-encre" : "text-erreur")}>{children}</div>}
      </div>
    </div>
  );
});
