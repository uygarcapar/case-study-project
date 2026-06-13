import { cn } from "@/lib/utils";
import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

export function Table({ className, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full text-left text-sm", className)} {...rest} />;
}

export function THead({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)] text-xs uppercase text-[var(--color-fg-muted)]",
        className,
      )}
      {...rest}
    />
  );
}

export function TBody({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn(
        "divide-y divide-[var(--color-border)] [&_tr]:transition-colors [&_tr:hover]:bg-[var(--color-surface-muted)]/40",
        className,
      )}
      {...rest}
    />
  );
}

export function TR({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn(className)} {...rest} />;
}

export function TH({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-4 py-3 font-semibold", className)} {...rest} />;
}

export function TD({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...rest} />;
}
