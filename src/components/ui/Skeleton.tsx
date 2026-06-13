import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("shimmer rounded-md bg-[var(--color-surface-muted)]", className)}
    />
  );
}
