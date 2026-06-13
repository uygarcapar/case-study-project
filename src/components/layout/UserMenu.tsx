"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/authSlice";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function UserMenu() {
  const tRoles = useTranslations("roles");
  const tNav = useTranslations("nav");
  const tHeader = useTranslations("header");
  const locale = useLocale();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!user) return null;

  const descriptionKey =
    user.role === "full_access" ? "full_accessDescription" : "readerDescription";

  async function logout() {
    if (signingOut) return;
    setSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    dispatch(clearUser());
    router.replace(`/${locale}/login`);
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 rounded-2xl cursor-pointer border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 text-sm hover:bg-[var(--color-surface-muted)]"
      >
        <div className="max-w-[140px] text-left sm:hidden">
          <div className="truncate text-xs font-medium text-[var(--color-fg)]">
            {user.email}
          </div>
        </div>
        <div className="hidden text-left sm:block">
          <div className="text-xs font-medium text-[var(--color-fg)]">{user.email}</div>
        </div>
        <Badge
          tone="neutral"
          className="hidden sm:inline-flex bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
        >
          {tRoles(user.role)}
        </Badge>
        <ChevronDown className="h-4 w-4 text-[var(--color-fg-muted)]" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">

            <p className="flex-1 text-xs text-[var(--color-fg)]">
              {tRoles(descriptionKey)}
            </p>

          <div className="my-3 h-px bg-[var(--color-border)]" />

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-[var(--color-fg)]">
              {tHeader("theme")}
            </span>
            <ThemeToggle />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-sm text-[var(--color-fg)]">
              {tHeader("locale")}
            </span>
            <LocaleSwitcher />
          </div>

          <div className="my-3 h-px bg-[var(--color-border)]" />

          <button
            type="button"
            onClick={logout}
            disabled={signingOut}
            className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--color-danger)] px-3 text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-[var(--color-danger-fg)] disabled:opacity-50"
          >
            <span>{tNav("logout")}</span>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
