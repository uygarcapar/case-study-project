"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SortableTH } from "@/components/ui/SortableTH";
import { ProductPhoto } from "./ProductPhoto";
import type { SortKey } from "./ProductFilters";
import { useRole } from "@/lib/auth/useRole";
import { cn, formatCurrency } from "@/lib/utils";
import type { ProductRow } from "@/types/database";

export type HighlightColumn = "stock" | "status";

type Props = {
  products: ProductRow[];
  loading: boolean;
  loadingMore?: boolean;
  onDelete: (product: ProductRow) => void;
  onEdit: (product: ProductRow) => void;
  highlightColumn?: HighlightColumn;
  rootRef?: (node: HTMLDivElement | null) => void;
  sentinelRef?: (node: HTMLDivElement | null) => void;
  showSentinel?: boolean;
  currentSort?: SortKey;
  onSortChange?: (sort: SortKey) => void;
};

const HIGHLIGHT_TH = "bg-[var(--color-warning)]/20 text-[var(--color-fg)]";
const HIGHLIGHT_TD = "bg-[var(--color-warning)]/10";
const SKELETON_ROW_COUNT = 3;

export function ProductTable({
  products,
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
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("products.status");
  const locale = useLocale() as "tr" | "en";
  const { canWrite } = useRole();

  if (loading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <Table>
          <THead>
            <TR>
              <TH className="w-16">{t("table.image")}</TH>
              <TH>{t("table.name")}</TH>
              <TH>{t("table.category")}</TH>
              <TH className="text-right">{t("table.price")}</TH>
              <TH className="text-right">{t("table.stock")}</TH>
              <TH>{t("table.status")}</TH>
              <TH className="text-right">{tCommon("actions")}</TH>
            </TR>
          </THead>
          <TBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TR key={i}>
                <TD>
                  <Skeleton className="h-10 w-10 rounded" />
                </TD>
                <TD>
                  <Skeleton className="h-4 w-40" />
                </TD>
                <TD>
                  <Skeleton className="h-4 w-20" />
                </TD>
                <TD className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TD>
                <TD className="text-right">
                  <Skeleton className="ml-auto h-4 w-10" />
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

  if (products.length === 0) {
    return (
      <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <EmptyState title={t("empty")} />
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="max-h-[60vh] overflow-auto rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)]"
    >
      <Table>
        <THead>
          <TR>
            <TH className="w-16">{t("table.image")}</TH>
            {onSortChange ? (
              <SortableTH
                field="name"
                currentSort={currentSort}
                onSortChange={(s) => onSortChange(s as SortKey)}
              >
                {t("table.name")}
              </SortableTH>
            ) : (
              <TH>{t("table.name")}</TH>
            )}
            {onSortChange ? (
              <SortableTH
                field="category"
                currentSort={currentSort}
                onSortChange={(s) => onSortChange(s as SortKey)}
              >
                {t("table.category")}
              </SortableTH>
            ) : (
              <TH>{t("table.category")}</TH>
            )}
            {onSortChange ? (
              <SortableTH
                field="price"
                currentSort={currentSort}
                onSortChange={(s) => onSortChange(s as SortKey)}
                align="right"
              >
                {t("table.price")}
              </SortableTH>
            ) : (
              <TH className="text-right">{t("table.price")}</TH>
            )}
            {onSortChange ? (
              <SortableTH
                field="stock"
                currentSort={currentSort}
                onSortChange={(s) => onSortChange(s as SortKey)}
                align="right"
              >
                {t("table.stock")}
              </SortableTH>
            ) : (
              <TH
                className={cn(
                  "text-right",
                  highlightColumn === "stock" && HIGHLIGHT_TH,
                )}
              >
                {t("table.stock")}
              </TH>
            )}
            <TH className={cn(highlightColumn === "status" && HIGHLIGHT_TH)}>
              {t("table.status")}
            </TH>
            <TH className="text-right">{tCommon("actions")}</TH>
          </TR>
        </THead>
        <TBody>
          {products.map((p) => (
            <TR key={p.id}>
              <TD>
                <div className="relative h-10 w-10 overflow-hidden rounded bg-[var(--color-surface-muted)]">
                  <ProductPhoto
                    src={p.image_url}
                    alt={p.name[locale]}
                    iconClassName="h-5 w-5"
                  />
                </div>
              </TD>
              <TD>
                <div className="font-medium text-[var(--color-fg)]">
                  {p.name[locale]}
                </div>
                {p.description?.[locale] && (
                  <div className="line-clamp-1 text-xs text-[var(--color-fg-muted)]">
                    {p.description[locale]}
                  </div>
                )}
              </TD>
              <TD className="text-[var(--color-fg-muted)]">{p.category}</TD>
              <TD className="text-right tabular-nums">
                {formatCurrency(p.price, locale)}
              </TD>
              <TD
                className={cn(
                  "text-right tabular-nums",
                  highlightColumn === "stock" && HIGHLIGHT_TD,
                )}
              >
                {p.stock}
              </TD>
              <TD className={cn(highlightColumn === "status" && HIGHLIGHT_TD)}>
                <Badge
                  tone={
                    p.status === "active"
                      ? "success"
                      : p.status === "draft"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {tStatus(p.status)}
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
                        onClick={() => onEdit(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={tCommon("delete")}
                        onClick={() => onDelete(p)}
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
                  <Skeleton className="h-10 w-10 rounded" />
                </TD>
                <TD>
                  <Skeleton className="h-4 w-40" />
                </TD>
                <TD>
                  <Skeleton className="h-4 w-20" />
                </TD>
                <TD className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TD>
                <TD className="text-right">
                  <Skeleton className="ml-auto h-4 w-10" />
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
