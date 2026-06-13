import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeaderSkeleton } from "@/components/skeletons/PageHeaderSkeleton";

export default function DashboardLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardBody className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-16" />
                </div>
                <Skeleton className="h-9 w-9 rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-10 w-10 flex-shrink-0 rounded" />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-48 max-w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="hidden h-4 w-20 sm:block" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
