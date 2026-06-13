"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-fg)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-10 w-full rounded-md border bg-[var(--color-surface)] px-3 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-muted)] outline-none focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]",
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          {...rest}
        />
        {error ? (
          <p className="text-xs text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-[var(--color-fg-muted)]">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
