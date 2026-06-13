"use client";

import { X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export function ClearHighlightButton() {
  const t = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const hasHighlight = !!searchParams.get("highlight");
  if (!hasHighlight) return null;

  function clear() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("highlight");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <Button variant="secondary" className="rounded-full" onClick={clear}>
      <X className="h-4 w-4" />
      {t("clearHighlight")}
    </Button>
  );
}
