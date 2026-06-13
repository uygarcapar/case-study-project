"use client";

import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";

type Crumb = { label: string; href: string | null };

function isUuidLike(segment: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
}

export function Breadcrumb() {
  const t = useTranslations("breadcrumb");
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: Crumb[] = [{ label: t("home"), href: "/dashboard" }];
  const knownKeys = ["dashboard", "products", "customers", "new", "edit"] as const;
  type KnownKey = (typeof knownKeys)[number];

  let acc = "";
  segments.forEach((segment, idx) => {
    acc += `/${segment}`;
    if (knownKeys.includes(segment as KnownKey)) {
      const isLast = idx === segments.length - 1;
      crumbs.push({
        label: t(segment as KnownKey),
        href: isLast ? null : acc,
      });
    } else if (isUuidLike(segment)) {
      // Skip raw IDs in display
    } else {
      crumbs.push({ label: segment, href: idx === segments.length - 1 ? null : acc });
    }
  });

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-[14px] text-[var(--color-fg-muted)]">
        {crumbs.map((c, idx) => (
          <Fragment key={`${c.label}-${idx}`}>
            {idx > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
            <li>
              {c.href ? (
                <Link
                  href={c.href}
                  className="hover:text-[var(--color-fg)] hover:underline"
                >
                  {c.label}
                </Link>
              ) : (
                <span className="font-medium text-[var(--color-fg)]" aria-current="page">
                  {c.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
