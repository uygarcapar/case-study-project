import { Skeleton } from "@/components/ui/Skeleton";

type Props = {
  rows?: number;
  showFilters?: boolean;
  withImageColumn?: boolean;
};

export function TableSkeleton({
  rows = 6,
  showFilters = false,
  withImageColumn = false,
}: Props) {
  return (
    <div className="flex flex-col">
      {showFilters && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      )}
      <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="bg-[var(--color-surface-muted)] px-4 py-3">
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              {withImageColumn && <Skeleton className="h-10 w-10 flex-shrink-0 rounded" />}
              <Skeleton className="h-4 flex-1 max-w-[40%]" />
              <Skeleton className="hidden h-4 w-24 sm:block" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="ml-auto h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
