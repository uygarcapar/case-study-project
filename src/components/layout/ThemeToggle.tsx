"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme } from "@/store/slices/uiSlice";

export function ThemeToggle() {
  const t = useTranslations("header");
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.ui.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  }, [theme]);

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      className="inline-flex h-9 w-9 items-center justify-center cursor-pointer rounded-xl border border-[var(--color-border)] text-[var(--color-fg)] hover:bg-[var(--color-surface-muted)]"
      aria-label={isDark ? t("themeLight") : t("themeDark")}
      title={isDark ? t("themeLight") : t("themeDark")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
