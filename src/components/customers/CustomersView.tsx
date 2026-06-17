"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  CustomerTable,
  type HighlightColumn,
  type CustomerSortKey,
} from "./CustomerTable";
import { CustomerFormModal } from "./CustomerFormModal";
import { NewCustomerButton } from "./NewCustomerButton";
import {
  useDeleteCustomerMutation,
  useListCustomersPageQuery,
} from "@/store/slices/customersApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openCustomerForm, setCustomersListState } from "@/store/slices/uiSlice";
import type { CustomerRow } from "@/types/database";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const VALID_HIGHLIGHTS: HighlightColumn[] = ["total_orders"];

const VALID_SORTS: CustomerSortKey[] = [
  "newest",
  "name_asc",
  "name_desc",
  "email_asc",
  "email_desc",
  "city_asc",
  "city_desc",
  "total_orders_asc",
  "total_orders_desc",
];

export function CustomersView() {
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const storedList = useAppSelector((s) => s.ui.customersList);
  const [pendingDelete, setPendingDelete] = useState<CustomerRow | null>(null);

  const initialSort: CustomerSortKey = useMemo(() => {
    const sortParam = searchParams.get("sort");
    if (sortParam === "orders_desc") return "total_orders_desc";
    if (sortParam && VALID_SORTS.includes(sortParam as CustomerSortKey)) {
      return sortParam as CustomerSortKey;
    }
    if (
      storedList.sort &&
      VALID_SORTS.includes(storedList.sort as CustomerSortKey)
    ) {
      return storedList.sort as CustomerSortKey;
    }
    return "newest";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [sort, setSort] = useState<CustomerSortKey>(initialSort);

  const [page, setPage] = useState(() =>
    storedList.sort === initialSort ? storedList.page : 0,
  );

  useEffect(() => {
    dispatch(setCustomersListState({ page, sort }));
  }, [dispatch, page, sort]);

  const highlightParam = searchParams.get("highlight");
  const highlightColumn: HighlightColumn | undefined =
    highlightParam && VALID_HIGHLIGHTS.includes(highlightParam as HighlightColumn)
      ? (highlightParam as HighlightColumn)
      : undefined;

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  const [resetKey, setResetKey] = useState({ search: debouncedSearch, sort });
  if (resetKey.search !== debouncedSearch || resetKey.sort !== sort) {
    setResetKey({ search: debouncedSearch, sort });
    setPage(0);
  }

  const { data, isFetching, isLoading } = useListCustomersPageQuery({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    sort,
  });

  const [deleteCustomer, { isLoading: deleting }] = useDeleteCustomerMutation();

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
      await deleteCustomer(pendingDelete.id).unwrap();
      toast.success(t("deleted"));
      setPendingDelete(null);
    } catch {
      toast.error(tCommon("error"));
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-md rounded-full border border-[var(--color-border)]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-fg-muted)]" />
          <input
            type="search"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-full bg-[var(--color-surface)] pl-10 pr-3 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-muted)] outline-none focus:outline-none focus-visible:outline-none"
          />
        </label>
        <NewCustomerButton />
      </div>
      <CustomerTable
        customers={items}
        loading={isLoading}
        loadingMore={isLoadingMore}
        onDelete={(c) => setPendingDelete(c)}
        onEdit={(c) => dispatch(openCustomerForm(c))}
        highlightColumn={highlightColumn}
        searchQuery={debouncedSearch}
        rootRef={rootRef}
        sentinelRef={sentinelRef}
        showSentinel={hasMore}
        currentSort={sort}
        onSortChange={(s) => setSort(s as CustomerSortKey)}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        title={tCommon("delete")}
        description={t("deleteConfirm")}
        confirmLabel={tCommon("delete")}
        cancelLabel={tCommon("cancel")}
        busy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
      <CustomerFormModal />
    </div>
  );
}
