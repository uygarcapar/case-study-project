import { PageHeaderSkeleton } from "@/components/skeletons/PageHeaderSkeleton";
import { FormSkeleton } from "@/components/skeletons/FormSkeleton";

export default function EditCustomerLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <FormSkeleton fields={5} />
    </div>
  );
}
