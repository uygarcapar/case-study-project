import { PackageOpen } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="text-[var(--color-fg)]">
        <PackageOpen className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-[var(--color-fg)]">{title}</h3>
        {description && (
          <p className="text-xs text-[var(--color-fg-muted)]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
