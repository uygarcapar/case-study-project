import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]",
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3", className)}
      {...rest}
    />
  );
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-sm font-normal text-[var(--color-fg-muted)] ", className)} {...rest} />
  );
}
