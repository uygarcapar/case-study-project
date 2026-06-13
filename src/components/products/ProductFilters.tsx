"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

export type SortKey =
  | "newest"
  | "name_asc"
  | "name_desc"
  | "category_asc"
  | "category_desc"
  | "price_asc"
  | "price_desc"
  | "stock_asc"
  | "stock_desc";

export type Filters = {
  search: string;
  sort: SortKey;
};

type Props = {
  value: Filters;
  onChange: (next: Filters) => void;
};

export function ProductFilters({ value, onChange }: Props) {
  const t = useTranslations("products");

  return (
    <label className="relative block w-full sm:max-w-md rounded-full border border-[var(--color-border)]">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-fg-muted)]" />
      <input
        type="search"
        placeholder={t("search")}
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
        className="h-10 w-full rounded-full bg-[var(--color-surface)] pl-10 pr-3 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-muted)] outline-none focus:outline-none focus-visible:outline-none"
      />
    </label>
  );
}
