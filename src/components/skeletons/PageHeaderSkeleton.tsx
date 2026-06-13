import { Skeleton } from "@/components/ui/Skeleton";

export function PageHeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-7 w-40" />
      {withAction && <Skeleton className="h-10 w-36" />}
    </div>
  );
}
