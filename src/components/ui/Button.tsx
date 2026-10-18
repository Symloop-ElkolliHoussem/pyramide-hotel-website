import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/format";

/**
 * Boutons de la maquette (composants « Bouton/* ») :
 * - primaire : fond or/500, texte noir
 * - contour-clair : bordure or/500, texte or/300 (sur fond sombre)
 * - contour-sombre : bordure encre, texte encre (sur fond clair)
 * - noir : fond noir, texte or/300
 */
export type ButtonVariant = "primaire" | "contour-clair" | "contour-sombre" | "noir";

const VARIANTS: Record<ButtonVariant, string> = {
  primaire: "bg-or-500 text-noir-900 hover:bg-or-300 border border-or-500 hover:border-or-300",
  "contour-clair": "border border-or-500 text-or-300 hover:bg-or-500 hover:text-noir-900",
  "contour-sombre": "border border-encre text-encre hover:bg-encre hover:text-sable-50",
  noir: "bg-noir-900 text-or-300 border border-noir-900 hover:bg-noir-700",
};

export function buttonClasses(variant: ButtonVariant = "primaire", extra?: string) {
  return cx(
    "t-bouton inline-flex min-h-[52px] items-center justify-center px-8 py-4 text-center transition-colors duration-200",
    "disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    extra,
  );
}

type LinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({ variant = "primaire", className, children, ...rest }: LinkProps) {
  return (
    <Link className={buttonClasses(variant, className)} {...rest}>
      {children}
    </Link>
  );
}

type BtnProps = ComponentProps<"button"> & { variant?: ButtonVariant };

export function Button({ variant = "primaire", className, type = "button", ...rest }: BtnProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...rest} />;
}
