import { PageHeaderSkeleton } from "@/components/skeletons/PageHeaderSkeleton";
import { FormSkeleton } from "@/components/skeletons/FormSkeleton";

export default function NewCustomerLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <FormSkeleton fields={5} />
    </div>
  );
}
