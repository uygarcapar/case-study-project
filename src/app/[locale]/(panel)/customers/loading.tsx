import { PageHeaderSkeleton } from "@/components/skeletons/PageHeaderSkeleton";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

export default function CustomersLoading() {
  return (
    <div>
      <PageHeaderSkeleton withAction />
      <TableSkeleton rows={6} />
    </div>
  );
}
