"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, footer, className }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl bg-[var(--color-surface)] shadow-[var(--shadow-card)]",
          className,
        )}
      >
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-xl font-semibold text-[var(--color-fg)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl cursor-pointer p-1 text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-fg)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-1 text-sm">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
