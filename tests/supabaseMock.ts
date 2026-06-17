import { vi } from "vitest";
import type { CustomerRow, ProductRow } from "@/types/database";

export type SupabaseMockState = {
  customers: CustomerRow[];
  products: ProductRow[];
  calls: {
    range: Array<{ table: string; from: number; to: number }>;
    order: Array<{ table: string; column: string; ascending: boolean }>;
    or: Array<{ table: string; filter: string }>;
    delete: Array<{ table: string; id: string }>;
  };
};

export function createSupabaseMock(initial?: {
  customers?: CustomerRow[];
  products?: ProductRow[];
}) {
  const state: SupabaseMockState = {
    customers: initial?.customers ?? [],
    products: initial?.products ?? [],
    calls: { range: [], order: [], or: [], delete: [] },
  };

  function makeSelectChain(table: "customers" | "products") {
    const ctx = { filtered: [...state[table]] as Array<CustomerRow | ProductRow> };
    const chain = {
      or: vi.fn().mockImplementation((filter: string) => {
        state.calls.or.push({ table, filter });
        return chain;
      }),
      order: vi.fn().mockImplementation(
        (column: string, opts?: { ascending: boolean }) => {
          state.calls.order.push({
            table,
            column,
            ascending: opts?.ascending ?? true,
          });
          return chain;
        },
      ),
      range: vi.fn().mockImplementation((from: number, to: number) => {
        state.calls.range.push({ table, from, to });
        const data = ctx.filtered.slice(from, to + 1);
        return Promise.resolve({
          data,
          count: ctx.filtered.length,
          error: null,
        });
      }),
      eq: vi.fn().mockImplementation(() =>
        Promise.resolve({ data: ctx.filtered[0] ?? null, error: null }),
      ),
      maybeSingle: vi.fn().mockImplementation(() =>
        Promise.resolve({ data: ctx.filtered[0] ?? null, error: null }),
      ),
      lte: vi.fn().mockImplementation(() =>
        Promise.resolve({ data: null, count: 0, error: null }),
      ),
      limit: vi.fn().mockImplementation(() =>
        Promise.resolve({ data: ctx.filtered, error: null }),
      ),
    };
    return chain;
  }

  function from(table: "customers" | "products") {
    return {
      select: vi.fn().mockImplementation(() => makeSelectChain(table)),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockImplementation((_col: string, id: string) => {
          state.calls.delete.push({ table, id });
          if (table === "customers") {
            state.customers = state.customers.filter((c) => c.id !== id);
          } else {
            state.products = state.products.filter((p) => p.id !== id);
          }
          return Promise.resolve({ error: null });
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    };
  }

  const client = { from: vi.fn().mockImplementation(from) };

  return { client, state };
}

export type IntersectionObserverMock = {
  trigger: () => void;
  triggerAll: () => void;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

export function installIntersectionObserver(): IntersectionObserverMock {
  const callbacks: Array<{
    cb: IntersectionObserverCallback;
    target: Element | null;
  }> = [];

  const observe = vi.fn();
  const disconnect = vi.fn();

  class MockIO implements IntersectionObserver {
    root = null;
    rootMargin = "";
    thresholds: ReadonlyArray<number> = [];
    private cb: IntersectionObserverCallback;
    private targets: Element[] = [];

    constructor(cb: IntersectionObserverCallback) {
      this.cb = cb;
      callbacks.push({ cb, target: null });
    }

    observe(target: Element) {
      this.targets.push(target);
      callbacks[callbacks.length - 1].target = target;
      observe(target);
    }

    unobserve() {}

    disconnect() {
      disconnect();
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  (globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver })
    .IntersectionObserver = MockIO as unknown as typeof IntersectionObserver;

  return {
    observe,
    disconnect,
    trigger() {
      const last = callbacks[callbacks.length - 1];
      if (!last) return;
      last.cb(
        [
          {
            isIntersecting: true,
            target: last.target,
            intersectionRatio: 1,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: 0,
          } as unknown as IntersectionObserverEntry,
        ],
        last as unknown as IntersectionObserver,
      );
    },
    triggerAll() {
      for (const entry of callbacks) {
        entry.cb(
          [
            {
              isIntersecting: true,
              target: entry.target,
              intersectionRatio: 1,
              boundingClientRect: {} as DOMRectReadOnly,
              intersectionRect: {} as DOMRectReadOnly,
              rootBounds: null,
              time: 0,
            } as unknown as IntersectionObserverEntry,
          ],
          entry as unknown as IntersectionObserver,
        );
      }
    },
  };
}

export function makeCustomer(
  i: number,
  overrides: Partial<CustomerRow> = {},
): CustomerRow {
  return {
    id: `c-${i}`,
    full_name: `Customer ${i}`,
    email: `c${i}@test.com`,
    phone: null,
    city: `City ${i}`,
    total_orders: i,
    status: "active",
    created_at: new Date(2024, 0, i + 1).toISOString(),
    ...overrides,
  } as CustomerRow;
}

export function makeProduct(
  i: number,
  overrides: Partial<ProductRow> = {},
): ProductRow {
  return {
    id: `p-${i}`,
    name: { tr: `Ürün ${i}`, en: `Product ${i}` },
    description: null,
    category: "general",
    price: 100 + i,
    stock: i,
    image_url: null,
    status: "active",
    created_at: new Date(2024, 0, i + 1).toISOString(),
    updated_at: new Date(2024, 0, i + 1).toISOString(),
    ...overrides,
  };
}
