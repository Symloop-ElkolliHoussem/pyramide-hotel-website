import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/format";

/**
 * Champs de formulaire de la maquette (« Champ/Texte », « Champ/Sélecteur »,
 * « Champ/Date », « Champ/Zone de texte ») avec libellé en IBM Plex Mono,
 * zone de saisie blanche bordée sable/400 et message d’erreur en rouge.
 * Accessibles : <label for>, aria-invalid, aria-describedby.
 */

type Common = {
  id: string;
  label: ReactNode;
  error?: string | null;
  hint?: ReactNode;
  className?: string;
  /** Champ obligatoire : ajoute « * » au libellé (déjà présent dans certains libellés de la maquette). */
  requiredMark?: boolean;
};

export const inputBase =
  "t-corps w-full border bg-blanc px-4 text-encre placeholder:text-doux/80 transition-colors " +
  "focus:border-or-700 focus:outline-2 focus:outline-offset-0 focus:outline-or-500 disabled:bg-sable-100 disabled:text-doux";

function borderFor(error?: string | null) {
  return error ? "border-erreur border-2 bg-erreur-fond/40" : "border-sable-400";
}

function describedBy(id: string, error?: string | null, hint?: ReactNode) {
  return [error ? `${id}-erreur` : null, hint ? `${id}-aide` : null].filter(Boolean).join(" ") || undefined;
}

function FieldShell({ id, label, error, hint, className, requiredMark, children }: Common & { children: ReactNode }) {
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={cx("t-label", error ? "text-erreur" : "text-doux")}>
        {label}
        {requiredMark && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-aide`} className="t-petit text-doux">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-erreur`} className="t-petit flex items-start gap-1.5 text-erreur">
          <span aria-hidden="true">!</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export function TextField({
  id,
  label,
  error,
  hint,
  className,
  requiredMark,
  inputClassName,
  ...input
}: Common & Omit<ComponentProps<"input">, "id"> & { inputClassName?: string }) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={className} requiredMark={requiredMark}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cx(inputBase, "h-[54px]", borderFor(error), inputClassName)}
        {...input}
      />
    </FieldShell>
  );
}

export function SelectField({
  id,
  label,
  error,
  hint,
  className,
  requiredMark,
  children,
  ...select
}: Common & Omit<ComponentProps<"select">, "id">) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={className} requiredMark={requiredMark}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cx(inputBase, "h-[54px] appearance-none pr-11", borderFor(error))}
          {...select}
        >
          {children}
        </select>
        <Image
          src="/icons/chevron.svg"
          alt=""
          aria-hidden="true"
          width={16}
          height={16}
          unoptimized
          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
        />
      </div>
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  label,
  error,
  hint,
  className,
  requiredMark,
  ...area
}: Common & Omit<ComponentProps<"textarea">, "id">) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={className} requiredMark={requiredMark}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cx(inputBase, "min-h-[160px] resize-y py-3.5", borderFor(error))}
        {...area}
      />
    </FieldShell>
  );
}

export function CheckboxField({
  id,
  label,
  error,
  className,
  ...input
}: { id: string; label: ReactNode; error?: string | null; className?: string } & Omit<ComponentProps<"input">, "id" | "type">) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-erreur` : undefined}
          className={cx(
            "mt-0.5 size-5 shrink-0 cursor-pointer appearance-none border bg-blanc bg-center bg-no-repeat",
            "checked:border-or-700 checked:bg-or-500 checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><path d=%22M3 8.5l3 3 7-7%22 fill=%22none%22 stroke=%22black%22 stroke-width=%221.6%22/></svg>')]",
            error ? "border-2 border-erreur" : "border-sable-400",
          )}
          {...input}
        />
        <label htmlFor={id} className="t-petit cursor-pointer text-encre">
          {label}
        </label>
      </div>
      {error && (
        <p id={`${id}-erreur`} className="t-petit pl-8 text-erreur">
          {error}
        </p>
      )}
    </div>
  );
}

/** Bandeau d’erreur récapitulatif (« 4 informations à corriger »). */
export function ErrorSummary({
  title,
  children,
  id = "resume-erreurs",
}: {
  title: ReactNode;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <div id={id} role="alert" tabIndex={-1} className="flex flex-col gap-1.5 border-l-4 border-erreur bg-erreur-fond px-5 py-4 outline-none">
      <p className="t-h4 text-erreur">{title}</p>
      {children && <div className="t-petit text-encre">{children}</div>}
    </div>
  );
}
