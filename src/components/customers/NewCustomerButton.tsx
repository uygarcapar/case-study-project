"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useRole } from "@/lib/auth/useRole";
import { useAppDispatch } from "@/store/hooks";
import { openCustomerForm } from "@/store/slices/uiSlice";

export function NewCustomerButton() {
  const t = useTranslations("customers");
  const { canWrite } = useRole();
  const dispatch = useAppDispatch();
  if (!canWrite) return null;

  return (
    <Button className="rounded-full" onClick={() => dispatch(openCustomerForm(null))}>
      <Plus className="h-4 w-4" />
      {t("new")}
    </Button>
  );
}
