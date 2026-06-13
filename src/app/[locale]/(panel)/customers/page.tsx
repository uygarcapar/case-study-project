import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { CustomersView } from "@/components/customers/CustomersView";
import { ClearHighlightButton } from "@/components/layout/ClearHighlightButton";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CustomersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("customers");

  return (
    <div>
      <PageHeader title={t("title")} actions={<ClearHighlightButton />} />
      <CustomersView />
    </div>
  );
}
