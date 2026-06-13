"use client";

import { useLocale, useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { CustomerForm } from "./CustomerForm";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeCustomerForm } from "@/store/slices/uiSlice";

export function CustomerFormModal() {
  const t = useTranslations("customers");
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const customerForm = useAppSelector((s) => s.ui.customerForm);

  if (!customerForm.open) return null;

  const customer = customerForm.entity;
  const close = () => dispatch(closeCustomerForm());

  return (
    <Modal
      open
      onClose={close}
      title={customer ? t("edit") : t("new")}
      className="max-w-2xl"
    >
      <CustomerForm
        mode={customer ? "update" : "create"}
        initial={customer ?? undefined}
        locale={locale}
        onSuccess={close}
        onCancel={close}
      />
    </Modal>
  );
}
