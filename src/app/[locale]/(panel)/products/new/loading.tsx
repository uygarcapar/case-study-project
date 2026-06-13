import { PageHeaderSkeleton } from "@/components/skeletons/PageHeaderSkeleton";
import { FormSkeleton } from "@/components/skeletons/FormSkeleton";

export default function NewProductLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <FormSkeleton fields={9} />
    </div>
  );
}
