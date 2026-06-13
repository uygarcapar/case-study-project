"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  total: number;
  pageSize?: number;
  delay?: number;
};

/**
 * Client-side infinite scroll over a fully loaded list.
 *
 * Returns ref callbacks for the scroll container (`rootRef`) and the bottom
 * sentinel (`sentinelRef`). The observer uses the root container as the
 * intersection root, so scrolling inside the table loads more rows without
 * scrolling the whole page.
 *
 * If `rootRef` is not attached anywhere, the viewport is used as the root.
 */
export function useInfiniteScroll({
  total,
  pageSize = 10,
  delay = 250,
}: Options) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastTotal, setLastTotal] = useState(total);
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null);
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  // Tracked via ref so its changes don't restart the observer (which would
  // clear the pending timer before it fires).
  const loadingRef = useRef(false);

  // Reset during render when total changes (filter/search changed).
  if (lastTotal !== total) {
    setLastTotal(total);
    setVisibleCount(pageSize);
    setIsLoadingMore(false);
  }

  // Reset ref outside of render; runs whenever the dataset size changes.
  useEffect(() => {
    loadingRef.current = false;
  }, [total]);

  const hasMore = visibleCount < total;

  useEffect(() => {
    if (!hasMore || !sentinelEl) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loadingRef.current) return;
        loadingRef.current = true;
        setIsLoadingMore(true);
        timer = setTimeout(() => {
          setVisibleCount((c) => Math.min(c + pageSize, total));
          loadingRef.current = false;
          setIsLoadingMore(false);
        }, delay);
      },
      { threshold: 0.1, rootMargin: "200px", root: rootEl },
    );

    observer.observe(sentinelEl);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [hasMore, sentinelEl, rootEl, pageSize, total, delay]);

  return {
    visibleCount,
    sentinelRef: setSentinelEl,
    rootRef: setRootEl,
    isLoadingMore,
    hasMore,
  };
}
