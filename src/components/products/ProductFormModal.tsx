"use client";

import { useLocale, useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { ProductForm } from "./ProductForm";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeProductForm } from "@/store/slices/uiSlice";

export function ProductFormModal() {
  const t = useTranslations("products");
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const productForm = useAppSelector((s) => s.ui.productForm);

  if (!productForm.open) return null;

  const product = productForm.entity;
  const close = () => dispatch(closeProductForm());

  return (
    <Modal
      open
      onClose={close}
      title={product ? t("edit") : t("new")}
      className="max-w-3xl"
    >
      <ProductForm
        mode={product ? "update" : "create"}
        initial={product ?? undefined}
        locale={locale}
        onSuccess={close}
        onCancel={close}
      />
    </Modal>
  );
}
