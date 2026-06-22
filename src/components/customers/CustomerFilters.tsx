"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  search: string;
  onSearchChange: (next: string) => void;
};

export function CustomerFilters({ search, onSearchChange }: Props) {
  const t = useTranslations("customers");

  return (
    <label className="relative block w-full sm:max-w-md rounded-full border border-[var(--color-border)]">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-fg-muted)]" />
      <input
        type="search"
        placeholder={t("search")}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-10 w-full rounded-full bg-[var(--color-surface)] pl-10 pr-3 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-muted)] outline-none focus:outline-none focus-visible:outline-none"
      />
    </label>
  );
}
