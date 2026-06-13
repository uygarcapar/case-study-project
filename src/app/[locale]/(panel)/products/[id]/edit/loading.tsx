import { PageHeaderSkeleton } from "@/components/skeletons/PageHeaderSkeleton";
import { FormSkeleton } from "@/components/skeletons/FormSkeleton";

export default function EditProductLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <FormSkeleton fields={9} />
    </div>
  );
}
