"use client";

import { useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [, startTransition] = useTransition();

  function onChange(next: string) {
    startTransition(() => {
      // params include the current dynamic segments (e.g. id); pass them to keep on the same page
      router.replace(
        // @ts-expect-error -- next-intl's typed router rejects arbitrary params at compile time, but at runtime keys are forwarded as path segments
        { pathname, params },
        { locale: next },
      );
    });
  }

  return (
    <div className="relative">
      <select
        aria-label={t("locale")}
        value={locale}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none cursor-pointer rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] pl-3 pr-8 text-sm text-[var(--color-fg)] outline-none focus:outline-none focus-visible:outline-none"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {l.toUpperCase()}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-fg-muted)]"
        aria-hidden="true"
      />
    </div>
  );
}
