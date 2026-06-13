"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Breadcrumb } from "./Breadcrumb";
import { UserMenu } from "./UserMenu";
import { useAppDispatch } from "@/store/hooks";
import { setSidebarOpen } from "@/store/slices/uiSlice";

export function Header() {
  const t = useTranslations("header");
  const dispatch = useAppDispatch();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          type="button"
          onClick={() => dispatch(setSidebarOpen(true))}
          aria-label={t("openMenu")}
          className="rounded-md border border-[var(--color-border)] p-2 text-[var(--color-fg)] hover:bg-[var(--color-surface-muted)] lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="hidden lg:block">
            <Breadcrumb />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
