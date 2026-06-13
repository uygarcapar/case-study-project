"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProductFilters, type Filters, type SortKey } from "./ProductFilters";
import { ProductTable, type HighlightColumn } from "./ProductTable";
import { ProductFormModal } from "./ProductFormModal";
import { NewProductButton } from "./NewProductButton";
import {
  useDeleteProductMutation,
  useListProductsQuery,
} from "@/store/slices/productsApi";
import { useAppDispatch } from "@/store/hooks";
import { openProductForm } from "@/store/slices/uiSlice";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import type { ProductRow } from "@/types/database";

const VALID_SORTS: SortKey[] = [
  "newest",
  "name_asc",
  "name_desc",
  "category_asc",
  "category_desc",
  "price_asc",
  "price_desc",
  "stock_asc",
  "stock_desc",
];

const VALID_HIGHLIGHTS: HighlightColumn[] = ["stock", "status"];

export function ProductsView() {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "tr" | "en";
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const initialFilters: Filters = useMemo(() => {
    const sortParam = searchParams.get("sort");
    const sort: SortKey =
      sortParam && VALID_SORTS.includes(sortParam as SortKey)
        ? (sortParam as SortKey)
        : "newest";
    return { search: "", sort };
    // Only re-init on first mount or if user navigates from outside (URL change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const highlightParam = searchParams.get("highlight");
  const highlightColumn: HighlightColumn | undefined =
    highlightParam && VALID_HIGHLIGHTS.includes(highlightParam as HighlightColumn)
      ? (highlightParam as HighlightColumn)
      : undefined;

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [pendingDelete, setPendingDelete] = useState<ProductRow | null>(null);

  const { data, isLoading } = useListProductsQuery();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.tr.toLowerCase().includes(q) ||
          p.name.en.toLowerCase().includes(q),
      );
    }
    list = [...list];
    switch (filters.sort) {
      case "name_asc":
        list.sort((a, b) => a.name[locale].localeCompare(b.name[locale]));
        break;
      case "name_desc":
        list.sort((a, b) => b.name[locale].localeCompare(a.name[locale]));
        break;
      case "category_asc":
        list.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case "category_desc":
        list.sort((a, b) => b.category.localeCompare(a.category));
        break;
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "stock_asc":
        list.sort((a, b) => a.stock - b.stock);
        break;
      case "stock_desc":
        list.sort((a, b) => b.stock - a.stock);
        break;
      case "newest":
      default:
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    }
    return list;
  }, [data, filters, locale]);

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteProduct(pendingDelete.id).unwrap();
      toast.success(t("deleted"));
      setPendingDelete(null);
    } catch {
      toast.error(tCommon("error"));
    }
  }

  const { visibleCount, sentinelRef, rootRef, isLoadingMore, hasMore } =
    useInfiniteScroll({ total: filtered.length, pageSize: 10 });
  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ProductFilters value={filters} onChange={setFilters} />
        <NewProductButton />
      </div>
      <ProductTable
        products={visible}
        loading={isLoading}
        loadingMore={isLoadingMore}
        onDelete={(p) => setPendingDelete(p)}
        onEdit={(p) => dispatch(openProductForm(p))}
        highlightColumn={highlightColumn}
        rootRef={rootRef}
        sentinelRef={sentinelRef}
        showSentinel={hasMore}
        currentSort={filters.sort}
        onSortChange={(sort) => setFilters({ ...filters, sort: sort as SortKey })}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("delete")}
        description={t("deleteConfirm")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        busy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
      <ProductFormModal />
    </div>
  );
}
