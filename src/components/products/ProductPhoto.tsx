"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null;
  alt: string;
  iconClassName?: string;
};

export function ProductPhoto({ src, alt, iconClassName = "h-10 w-10" }: Props) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error",
  );
  const showFallback = !src || status !== "loaded";

  return (
    <>
      {showFallback && (
        <div className="absolute inset-0 flex items-center justify-center text-[var(--color-fg-muted)]">
          <ImageIcon className={cn(iconClassName)} />
        </div>
      )}
      {src && status !== "error" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-200",
            status === "loaded" ? "opacity-100" : "opacity-0",
          )}
          loading="lazy"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
    </>
  );
}
