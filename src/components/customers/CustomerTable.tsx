"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SortableTH } from "@/components/ui/SortableTH";
import { useRole } from "@/lib/auth/useRole";
import { cn } from "@/lib/utils";
import type { CustomerRow } from "@/types/database";

export type HighlightColumn = "total_orders";

export type CustomerSortKey =
  | "newest"
  | "name_asc"
  | "name_desc"
  | "email_asc"
  | "email_desc"
  | "city_asc"
  | "city_desc"
  | "total_orders_asc"
  | "total_orders_desc";

type Props = {
  customers: CustomerRow[];
  loading: boolean;
  loadingMore?: boolean;
  onDelete: (customer: CustomerRow) => void;
  onEdit: (customer: CustomerRow) => void;
  highlightColumn?: HighlightColumn;
  rootRef?: (node: HTMLDivElement | null) => void;
  sentinelRef?: (node: HTMLDivElement | null) => void;
  showSentinel?: boolean;
  currentSort?: CustomerSortKey;
  onSortChange?: (sort: CustomerSortKey) => void;
};

const HIGHLIGHT_TH = "bg-[var(--color-warning)]/20 text-[var(--color-fg)]";
const HIGHLIGHT_TD = "bg-[var(--color-warning)]/10";
const SKELETON_ROW_COUNT = 3;

export function CustomerTable({
  customers,
  loading,
  loadingMore = false,
  onDelete,
  onEdit,
  highlightColumn,
  rootRef,
  sentinelRef,
  showSentinel = false,
  currentSort = "newest",
  onSortChange,
}: Props) {
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("customers.status");
  const { canWrite } = useRole();

  if (loading) {
    return (
      <div className="max-h-[calc(100dvh-260px-env(safe-area-inset-bottom))] lg:max-h-[calc(100dvh-220px)] overflow-auto [scrollbar-gutter:stable] rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <Table className="min-w-[1000px]">
          <THead>
            <TR>
              <TH className="w-1/5">{t("table.name")}</TH>
              <TH>{t("table.email")}</TH>
              <TH className="w-44">{t("table.phone")}</TH>
              <TH className="w-32">{t("table.city")}</TH>
              <TH className="w-24 text-right">{t("table.totalOrders")}</TH>
              <TH className="w-28">{t("table.status")}</TH>
              <TH className="w-24 text-right">{tCommon("actions")}</TH>
            </TR>
          </THead>
          <TBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TR key={i}>
                <TD>
                  <Skeleton className="h-4 w-32" />
                </TD>
                <TD>
                  <Skeleton className="h-4 w-40" />
                </TD>
                <TD>
                  <Skeleton className="h-4 w-28" />
                </TD>
                <TD>
                  <Skeleton className="h-4 w-20" />
                </TD>
                <TD className="text-right">
                  <Skeleton className="ml-auto h-4 w-8" />
                </TD>
                <TD>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TD>
                <TD>
                  <Skeleton className="ml-auto h-4 w-12" />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <EmptyState title={t("empty")} />
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="max-h-[calc(100dvh-260px-env(safe-area-inset-bottom))] lg:max-h-[calc(100dvh-220px)] overflow-auto [scrollbar-gutter:stable] rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <Table className="min-w-[1000px]">
        <THead>
          <TR>
            {onSortChange ? (
              <SortableTH
                field="name"
                currentSort={currentSort}
                onSortChange={(s) => onSortChange(s as CustomerSortKey)}
                className="w-1/5"
              >
                {t("table.name")}
              </SortableTH>
            ) : (
              <TH className="w-1/5">{t("table.name")}</TH>
            )}
            {onSortChange ? (
              <SortableTH
                field="email"
                currentSort={currentSort}
                onSortChange={(s) => onSortChange(s as CustomerSortKey)}
              >
                {t("table.email")}
              </SortableTH>
            ) : (
              <TH>{t("table.email")}</TH>
            )}
            <TH className="w-44">{t("table.phone")}</TH>
            {onSortChange ? (
              <SortableTH
                field="city"
                currentSort={currentSort}
                onSortChange={(s) => onSortChange(s as CustomerSortKey)}
                className="w-32"
              >
                {t("table.city")}
              </SortableTH>
            ) : (
              <TH className="w-32">{t("table.city")}</TH>
            )}
            {onSortChange ? (
              <SortableTH
                field="total_orders"
                currentSort={currentSort}
                onSortChange={(s) => onSortChange(s as CustomerSortKey)}
                align="right"
                className="w-24"
              >
                {t("table.totalOrders")}
              </SortableTH>
            ) : (
              <TH
                className={cn(
                  "w-24 text-right",
                  highlightColumn === "total_orders" && HIGHLIGHT_TH,
                )}
              >
                {t("table.totalOrders")}
              </TH>
            )}
            <TH className="w-28">{t("table.status")}</TH>
            <TH className="w-24 text-right">{tCommon("actions")}</TH>
          </TR>
        </THead>
        <TBody>
          {customers.map((c) => (
            <TR key={c.id}>
              <TD className="font-medium text-[var(--color-fg)]">{c.full_name}</TD>
              <TD className="text-[var(--color-fg-muted)]">{c.email}</TD>
              <TD className="text-[var(--color-fg-muted)]">{c.phone ?? "—"}</TD>
              <TD className="text-[var(--color-fg-muted)]">{c.city ?? "—"}</TD>
              <TD
                className={cn(
                  "text-right tabular-nums",
                  highlightColumn === "total_orders" && HIGHLIGHT_TD,
                )}
              >
                {c.total_orders}
              </TD>
              <TD>
                <Badge tone={c.status === "active" ? "success" : "neutral"}>
                  {tStatus(c.status)}
                </Badge>
              </TD>
              <TD>
                <div className="flex justify-end gap-1">
                  {canWrite ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={tCommon("edit")}
                        onClick={() => onEdit(c)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={tCommon("delete")}
                        onClick={() => onDelete(c)}
                      >
                        <Trash2 className="h-4 w-4 text-[var(--color-danger)]" />
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-[var(--color-fg-muted)]">—</span>
                  )}
                </div>
              </TD>
            </TR>
          ))}
          {loadingMore &&
            Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
              <TR key={`skeleton-${i}`}>
                <TD>
                  <Skeleton className="h-4 w-32" />
                </TD>
                <TD>
                  <Skeleton className="h-4 w-40" />
                </TD>
                <TD>
                  <Skeleton className="h-4 w-28" />
                </TD>
                <TD>
                  <Skeleton className="h-4 w-20" />
                </TD>
                <TD className="text-right">
                  <Skeleton className="ml-auto h-4 w-8" />
                </TD>
                <TD>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TD>
                <TD>
                  <Skeleton className="ml-auto h-4 w-12" />
                </TD>
              </TR>
            ))}
        </TBody>
      </Table>
      {showSentinel && (
        <div ref={sentinelRef} aria-hidden className="h-1 w-full" />
      )}
    </div>
  );
}
