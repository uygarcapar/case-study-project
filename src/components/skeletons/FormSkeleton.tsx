import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

type Props = {
  fields?: number;
  twoColumns?: boolean;
};

export function FormSkeleton({ fields = 8, twoColumns = true }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardBody
          className={
            twoColumns
              ? "grid grid-cols-1 gap-4 md:grid-cols-2"
              : "flex flex-col gap-4"
          }
        >
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardBody>
      </Card>
      <div className="flex items-center justify-end gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}
