"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
};

const variantClass: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50",
  secondary:
    "bg-[var(--color-surface)] text-[var(--color-fg)] border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50",
  danger:
    "bg-[var(--color-danger)] text-[var(--color-danger-fg)] hover:opacity-90 disabled:opacity-50",
  ghost:
    "bg-transparent text-[var(--color-fg)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50",
};

const sizeClass: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", fullWidth, className, type = "button", ...rest },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed",
        variantClass[variant],
        sizeClass[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    />
  ),
);

Button.displayName = "Button";
