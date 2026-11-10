import type { ReactNode } from "react";

import { LanguageSelect } from "@/components/language-select";
import { FieldLabel } from "@/components/page-header";
import { cn } from "@/lib/utils";

export function ToolLayout({ form, output }: { form: ReactNode; output: ReactNode }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="surface-card p-5 sm:p-6">{form}</div>
      <div className="lg:sticky lg:top-24">{output}</div>
    </div>
  );
}

export function LanguageField({ id = "tool-language" }: { id?: string }) {
  return (
    <div>
      <FieldLabel htmlFor={id} hint="Applies to all tools">
        Response language
      </FieldLabel>
      <LanguageSelect id={id} />
    </div>
  );
}

/** Accessible single-choice chip group. */
export function ChoiceChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold">{label}</legend>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-glow"
                  : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary-soft",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
