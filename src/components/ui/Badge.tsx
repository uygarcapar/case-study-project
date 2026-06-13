import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClass: Record<Tone, string> = {
  neutral:
    "bg-[var(--color-surface-muted)] text-[var(--color-fg)]",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
