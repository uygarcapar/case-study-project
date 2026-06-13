"use client";

import { useMemo, useState } from "react";
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
  useListCustomersQuery,
} from "@/store/slices/customersApi";
import { useAppDispatch } from "@/store/hooks";
import { openCustomerForm } from "@/store/slices/uiSlice";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import type { CustomerRow } from "@/types/database";

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
  const [pendingDelete, setPendingDelete] = useState<CustomerRow | null>(null);

  const initialSort: CustomerSortKey = useMemo(() => {
    const sortParam = searchParams.get("sort");
    // Backwards compat: dashboard used "orders_desc" before.
    if (sortParam === "orders_desc") return "total_orders_desc";
    if (sortParam && VALID_SORTS.includes(sortParam as CustomerSortKey)) {
      return sortParam as CustomerSortKey;
    }
    return "newest";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [sort, setSort] = useState<CustomerSortKey>(initialSort);

  const highlightParam = searchParams.get("highlight");
  const highlightColumn: HighlightColumn | undefined =
    highlightParam && VALID_HIGHLIGHTS.includes(highlightParam as HighlightColumn)
      ? (highlightParam as HighlightColumn)
      : undefined;

  const { data, isLoading } = useListCustomersQuery();
  const [deleteCustomer, { isLoading: deleting }] = useDeleteCustomerMutation();

  const filtered = useMemo(() => {
    let list = data ?? [];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q),
      );
    }
    list = [...list];
    switch (sort) {
      case "name_asc":
        list.sort((a, b) => a.full_name.localeCompare(b.full_name));
        break;
      case "name_desc":
        list.sort((a, b) => b.full_name.localeCompare(a.full_name));
        break;
      case "email_asc":
        list.sort((a, b) => a.email.localeCompare(b.email));
        break;
      case "email_desc":
        list.sort((a, b) => b.email.localeCompare(a.email));
        break;
      case "city_asc":
        list.sort((a, b) => (a.city ?? "").localeCompare(b.city ?? ""));
        break;
      case "city_desc":
        list.sort((a, b) => (b.city ?? "").localeCompare(a.city ?? ""));
        break;
      case "total_orders_asc":
        list.sort((a, b) => a.total_orders - b.total_orders);
        break;
      case "total_orders_desc":
        list.sort((a, b) => b.total_orders - a.total_orders);
        break;
      case "newest":
      default:
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    }
    return list;
  }, [data, search, sort]);

  const { visibleCount, sentinelRef, rootRef, isLoadingMore, hasMore } =
    useInfiniteScroll({ total: filtered.length, pageSize: 10 });
  const visible = filtered.slice(0, visibleCount);

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
    <div className="flex flex-col">
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
        customers={visible}
        loading={isLoading}
        loadingMore={isLoadingMore}
        onDelete={(c) => setPendingDelete(c)}
        onEdit={(c) => dispatch(openCustomerForm(c))}
        highlightColumn={highlightColumn}
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
