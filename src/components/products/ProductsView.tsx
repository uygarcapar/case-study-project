"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProductFilters } from "./ProductFilters";
import { ProductTable, type HighlightColumn } from "./ProductTable";
import { ProductFormModal } from "./ProductFormModal";
import { NewProductButton } from "./NewProductButton";
import {
  useDeleteProductMutation,
  useListProductsPageQuery,
  type ProductSortKey,
} from "@/store/slices/productsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openProductForm, setProductsListState } from "@/store/slices/uiSlice";
import type { ProductRow } from "@/types/database";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const VALID_SORTS: ProductSortKey[] = [
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
  const storedList = useAppSelector((s) => s.ui.productsList);

  const initialSort: ProductSortKey = useMemo(() => {
    const sortParam = searchParams.get("sort");
    if (sortParam && VALID_SORTS.includes(sortParam as ProductSortKey)) {
      return sortParam as ProductSortKey;
    }
    if (
      storedList.sort &&
      VALID_SORTS.includes(storedList.sort as ProductSortKey)
    ) {
      return storedList.sort as ProductSortKey;
    }
    return "newest";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const highlightParam = searchParams.get("highlight");
  const highlightColumn: HighlightColumn | undefined =
    highlightParam && VALID_HIGHLIGHTS.includes(highlightParam as HighlightColumn)
      ? (highlightParam as HighlightColumn)
      : undefined;

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProductSortKey>(initialSort);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(() =>
    storedList.sort === initialSort ? storedList.page : 0,
  );

  useEffect(() => {
    dispatch(setProductsListState({ page, sort }));
  }, [dispatch, page, sort]);
  const [pendingDelete, setPendingDelete] = useState<ProductRow | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  const [resetKey, setResetKey] = useState({
    search: debouncedSearch,
    sort,
    locale,
  });
  if (
    resetKey.search !== debouncedSearch ||
    resetKey.sort !== sort ||
    resetKey.locale !== locale
  ) {
    setResetKey({ search: debouncedSearch, sort, locale });
    setPage(0);
  }

  const { data, isFetching, isLoading } = useListProductsPageQuery({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    sort,
    locale,
  });

  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasMore = items.length < total;
  const isLoadingMore = isFetching && page > 0;

  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null);
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelEl || !hasMore || isFetching) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1, rootMargin: "200px", root: rootEl },
    );
    observer.observe(sentinelEl);
    return () => observer.disconnect();
  }, [sentinelEl, rootEl, hasMore, isFetching, setPage]);

  const rootRef = useCallback((node: HTMLDivElement | null) => {
    setRootEl(node);
  }, []);
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinelEl(node);
  }, []);

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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ProductFilters search={search} onSearchChange={setSearch} />
        <NewProductButton />
      </div>
      <ProductTable
        products={items}
        loading={isLoading}
        loadingMore={isLoadingMore}
        onDelete={(p) => setPendingDelete(p)}
        onEdit={(p) => dispatch(openProductForm(p))}
        highlightColumn={highlightColumn}
        searchQuery={debouncedSearch}
        rootRef={rootRef}
        sentinelRef={sentinelRef}
        showSentinel={hasMore}
        currentSort={sort}
        onSortChange={(s) => setSort(s as ProductSortKey)}
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
