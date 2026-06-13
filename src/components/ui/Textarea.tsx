"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...rest }, ref) => {
    const textareaId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-[var(--color-fg)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={4}
          className={cn(
            "w-full resize-none rounded-md border bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-muted)] outline-none focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]",
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          {...rest}
        />
        {error && (
          <p className="text-xs text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
