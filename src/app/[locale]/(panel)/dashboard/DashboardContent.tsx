"use client";

import { useState } from "react";
import {
  Package,
  Users,
  ShoppingBag,
  AlertTriangle,
  Pencil,
  Trash2,
} from "lucide-react";
import { ProductPhoto } from "@/components/products/ProductPhoto";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardBody } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import {
  useDeleteProductMutation,
  useGetProductsSummaryQuery,
} from "@/store/slices/productsApi";
import { useGetCustomersSummaryQuery } from "@/store/slices/customersApi";
import { useAppDispatch } from "@/store/hooks";
import { openProductForm } from "@/store/slices/uiSlice";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { useRole } from "@/lib/auth/useRole";
import { formatCurrency } from "@/lib/utils";
import type { ProductRow } from "@/types/database";

export function DashboardContent() {
  const t = useTranslations("dashboard");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tProducts = useTranslations("products");
  const locale = useLocale() as "tr" | "en";
  const dispatch = useAppDispatch();
  const { canWrite } = useRole();

  const products = useGetProductsSummaryQuery();
  const customers = useGetCustomersSummaryQuery();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [pendingDelete, setPendingDelete] = useState<ProductRow | null>(null);

  const totalProducts = products.data?.total ?? 0;
  const totalCustomers = customers.data?.total ?? 0;
  const totalOrders = customers.data?.totalOrders ?? 0;
  const lowStockCount = products.data?.lowStock ?? 0;
  const recent = products.data?.recent ?? [];

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteProduct(pendingDelete.id).unwrap();
      toast.success(tProducts("deleted"));
      setPendingDelete(null);
    } catch {
      toast.error(tCommon("error"));
    }
  }

  const stats = [
    {
      label: t("stats.totalProducts"),
      value: totalProducts,
      icon: Package,
      href: "/products",
    },
    {
      label: t("stats.totalCustomers"),
      value: totalCustomers,
      icon: Users,
      href: "/customers",
    },
    {
      label: t("stats.totalOrders"),
      value: totalOrders,
      icon: ShoppingBag,
      href: "/customers?sort=total_orders_desc&highlight=total_orders",
    },
    {
      label: t("stats.lowStock"),
      value: lowStockCount,
      icon: AlertTriangle,
      href: "/products?sort=stock_asc&highlight=stock",
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="flex flex-col gap-6 px-4 pt-4 pb-4 lg:px-6 lg:pb-6">
      <PageHeader title={tNav("dashboard")} className="mb-0" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardBody className="flex flex-col gap-4 px-5 pt-5 pb-4">
              <div className="text-sm font-medium text-[var(--color-fg-muted)]">
                {s.label}
              </div>
              <div className="flex items-center justify-between gap-3">
                {products.isLoading || customers.isLoading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <div className="text-3xl font-semibold text-[var(--color-fg)]">
                    {s.value}
                  </div>
                )}
                <div className="text-[var(--color-fg)]">
                  <s.icon className="h-8 w-8" />
                </div>
              </div>
              <Link
                href={s.href}
                className="self-end text-xs font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:underline"
              >
                {t("viewAll")}
              </Link>
            </CardBody>
          </Card>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--color-fg)]">
            {t("recentProducts")}
          </h2>
          <Link href="/products">
            <Button variant="ghost" size="sm">
              {t("viewAll")}
            </Button>
          </Link>
        </div>

        {products.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-square w-full rounded-2xl border border-[var(--color-border)]" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center text-sm text-[var(--color-fg-muted)]">
            {t("noData")}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {recent.map((p) => (
              <div key={p.id} className="flex flex-col">
                <div className="group relative aspect-square w-full overflow-hidden mb-3 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                  <ProductPhoto src={p.image_url} alt={p.name[locale]} />
                  {canWrite && (
                    <div className="pointer-events-none absolute inset-0 flex items-start justify-end gap-1 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => dispatch(openProductForm(p))}
                        aria-label={tCommon("edit")}
                        className="pointer-events-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-white/90 text-[var(--color-fg)] backdrop-blur transition-colors hover:bg-white dark:bg-black/60 dark:text-white dark:hover:bg-black/80"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(p)}
                        aria-label={tCommon("delete")}
                        className="pointer-events-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-white/90 text-[var(--color-danger)] backdrop-blur transition-colors hover:bg-white dark:bg-black/60 dark:hover:bg-black/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="truncate text-sm px-2 font-medium text-[var(--color-fg)]">
                  {p.name[locale]}
                </div>
                <div className="text-sm font-normal px-2 text-[var(--color-fg-muted)]">
                  {formatCurrency(p.price, locale)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={tCommon("delete")}
        description={tProducts("deleteConfirm")}
        confirmLabel={tCommon("delete")}
        cancelLabel={tCommon("cancel")}
        busy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ProductFormModal />
      </div>
    </div>
  );
}
