"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...rest }, ref) => {
    const selectId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[var(--color-fg)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-10 w-full rounded-md border bg-[var(--color-surface)] px-3 text-sm text-[var(--color-fg)] outline-none focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]",
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          {...rest}
        >
          {children}
        </select>
        {error && (
          <p className="text-xs text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
