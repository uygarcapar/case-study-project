"use client";

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { TH } from "./Table";
import { cn } from "@/lib/utils";

type Props = {
  field: string;
  currentSort: string;
  onSortChange: (sort: string) => void;
  align?: "left" | "right";
  children: React.ReactNode;
};

export function SortableTH({
  field,
  currentSort,
  onSortChange,
  align = "left",
  children,
}: Props) {
  const isAsc = currentSort === `${field}_asc`;
  const isDesc = currentSort === `${field}_desc`;
  const isActive = isAsc || isDesc;

  function handleClick() {
    onSortChange(isAsc ? `${field}_desc` : `${field}_asc`);
  }

  const Icon = isAsc ? ChevronUp : isDesc ? ChevronDown : ChevronsUpDown;

  return (
    <TH
      onClick={handleClick}
      tabIndex={-1}
      className={cn(
        "cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none hover:bg-[var(--color-surface-muted)]/60",
        align === "right" && "text-right",
      )}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <Icon className={cn("h-3.5 w-3.5", !isActive && "opacity-30")} />
      </span>
    </TH>
  );
}
