"use client";

import {
  forwardRef,
  useEffect,
  useState,
  type FocusEvent,
  type InputHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> & {
  label?: string;
  error?: string;
  value?: number;
  onValueChange?: (value: number) => void;
};

const FORMATTER = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatNumber(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n) || !Number.isFinite(n)) return "";
  return FORMATTER.format(n);
}

/**
 * Accepts user input in TR (1.234,56) or US-loose (1234.56 / 1234,56) form.
 * Returns 0 for empty/invalid input.
 */
function parseInput(s: string): number {
  const cleaned = s.replace(/[^\d.,]/g, "");
  if (!cleaned) return 0;
  let normalized: string;
  if (cleaned.includes(",")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = cleaned;
  }
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

export const MoneyInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      error,
      value,
      onValueChange,
      onBlur,
      onFocus,
      className,
      id,
      ...rest
    },
    ref,
  ) => {
    const [display, setDisplay] = useState(() => formatNumber(value));
    const [focused, setFocused] = useState(false);

    // Re-sync when external value changes (e.g., form reset, initial load),
    // but only when not currently being edited by the user.
    useEffect(() => {
      if (!focused) setDisplay(formatNumber(value));
    }, [value, focused]);

    const inputId = id ?? rest.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-fg)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-fg-muted)]">
            ₺
          </span>
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            value={display}
            onFocus={(e: FocusEvent<HTMLInputElement>) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onChange={(e) => {
              setDisplay(e.target.value);
              onValueChange?.(parseInput(e.target.value));
            }}
            onBlur={(e: FocusEvent<HTMLInputElement>) => {
              const n = parseInput(e.target.value);
              setFocused(false);
              setDisplay(formatNumber(n));
              onValueChange?.(n);
              onBlur?.(e);
            }}
            className={cn(
              "h-10 w-full rounded-md border bg-[var(--color-surface)] pl-8 pr-3 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-muted)] outline-none focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-[var(--color-danger)]"
                : "border-[var(--color-border)]",
              className,
            )}
            aria-invalid={error ? "true" : undefined}
            {...rest}
          />
        </div>
        {error && (
          <p className="text-xs text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

MoneyInput.displayName = "MoneyInput";
