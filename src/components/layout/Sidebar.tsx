"use client";

import { startTransition, useOptimistic } from "react";
import { useTranslations } from "next-intl";
import { Boxes, LayoutDashboard, Package, Users, X } from "lucide-react";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarOpen } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/products", labelKey: "products", icon: Package },
  { href: "/customers", labelKey: "customers", icon: Users },
] as const;

export function Sidebar() {
  const t = useTranslations("nav");
  const tApp = useTranslations("app");
  const tHeader = useTranslations("header");
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.sidebarOpen);

  const [optimisticPath, setOptimisticPath] = useOptimistic(pathname);

  function isActive(href: string) {
    return optimisticPath === href || optimisticPath.startsWith(`${href}/`);
  }

  function onNavigate(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    ) {
      return;
    }
    e.preventDefault();
    dispatch(setSidebarOpen(false));
    startTransition(() => {
      setOptimisticPath(href);
      router.push(href);
    });
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-transform",
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Sidebar"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-primary)] text-[var(--color-primary-fg)]">
              <Boxes className="h-5 w-5" />
            </span>
            <span className="text-xl font-normal text-[var(--color-fg)]">
              {tApp("name")}
            </span>
          </div>
          <button
            type="button"
            className="rounded p-1 text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)] lg:hidden"
            onClick={() => dispatch(setSidebarOpen(false))}
            aria-label={tHeader("closeMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-1">
            {items.map(({ href, labelKey, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    prefetch={true}
                    onClick={(e) => onNavigate(e, href)}
                    className={cn(
                      "squircle flex items-center gap-2 overflow-hidden rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                        : "text-[var(--color-fg)] hover:bg-[var(--color-surface-muted)]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t(labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
