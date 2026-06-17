import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductsView } from "@/components/products/ProductsView";
import { makeStore } from "@/store";
import { setProductsListState } from "@/store/slices/uiSlice";
import { renderWithProviders, fullAccessUser } from "./test-utils";
import {
  createSupabaseMock,
  installIntersectionObserver,
  makeProduct,
  type IntersectionObserverMock,
} from "./supabaseMock";

let searchParamsString = "";
vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation",
  );
  return {
    ...actual,
    useSearchParams: () => new URLSearchParams(searchParamsString),
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    }),
    usePathname: () => "/products",
  };
});

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={typeof href === "string" ? href : "#"}>{children}</a>
  ),
  usePathname: () => "/products",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  redirect: vi.fn(),
  getPathname: vi.fn(),
}));

let supabaseMock = createSupabaseMock();
vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => supabaseMock.client,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

let io: IntersectionObserverMock;

beforeEach(() => {
  searchParamsString = "";
  io = installIntersectionObserver();
});

function setupProducts(count: number) {
  const products = Array.from({ length: count }, (_, i) => makeProduct(i + 1));
  supabaseMock = createSupabaseMock({ products });
}

describe("ProductsView — initial render and pagination", () => {
  it("fetches page 0 on mount and renders first batch", async () => {
    setupProducts(25);
    renderWithProviders(<ProductsView />, { user: fullAccessUser });

    await waitFor(() => {
      expect(screen.getByText("Ürün 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Ürün 10")).toBeInTheDocument();
    expect(screen.queryByText("Ürün 11")).not.toBeInTheDocument();

    const rangeCalls = supabaseMock.state.calls.range.filter(
      (c) => c.table === "products",
    );
    expect(rangeCalls[0]).toEqual({ table: "products", from: 0, to: 9 });
  });

  it("merges next page when sentinel intersects (infinite scroll)", async () => {
    setupProducts(25);
    renderWithProviders(<ProductsView />, { user: fullAccessUser });

    await waitFor(() => {
      expect(screen.getByText("Ürün 10")).toBeInTheDocument();
    });

    await act(async () => {
      io.trigger();
    });

    await waitFor(() => {
      expect(screen.getByText("Ürün 20")).toBeInTheDocument();
    });

    const rangeCalls = supabaseMock.state.calls.range.filter(
      (c) => c.table === "products",
    );
    expect(rangeCalls).toContainEqual({ table: "products", from: 10, to: 19 });
    expect(screen.getByText("Ürün 1")).toBeInTheDocument();
  });
});

describe("ProductsView — sort behavior", () => {
  it("clicking a sortable column header resets page to 0 and re-fetches", async () => {
    setupProducts(25);
    const { store } = renderWithProviders(<ProductsView />, {
      user: fullAccessUser,
    });

    await waitFor(() => {
      expect(screen.getByText("Ürün 1")).toBeInTheDocument();
    });

    await act(async () => {
      io.trigger();
    });
    await waitFor(() => {
      expect(screen.getByText("Ürün 20")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const nameHeader = screen.getByText("İsim").closest("th") as HTMLElement;
    await user.click(nameHeader);

    await waitFor(() => {
      expect(store.getState().ui.productsList.sort).toBe("name_asc");
      expect(store.getState().ui.productsList.page).toBe(0);
    });

    const orderCalls = supabaseMock.state.calls.order.filter(
      (c) => c.table === "products",
    );
    expect(orderCalls.some((c) => c.column.includes("name"))).toBe(true);
  });

  it("URL ?sort=stock_asc wins over storedList.sort on mount", async () => {
    setupProducts(25);
    const store = makeStore();
    store.dispatch(setProductsListState({ page: 2, sort: "name_asc" }));

    searchParamsString = "sort=stock_asc&highlight=stock";

    renderWithProviders(<ProductsView />, { user: fullAccessUser, store });

    await waitFor(() => {
      expect(
        supabaseMock.state.calls.order.some(
          (c) => c.table === "products" && c.column === "stock",
        ),
      ).toBe(true);
    });

    const rangeCalls = supabaseMock.state.calls.range.filter(
      (c) => c.table === "products",
    );
    expect(rangeCalls[0]).toEqual({ table: "products", from: 0, to: 9 });
    expect(store.getState().ui.productsList.sort).toBe("stock_asc");
    expect(store.getState().ui.productsList.page).toBe(0);
  });
});

describe("ProductsView — Redux page/sort restoration", () => {
  it("restores storedList.sort and storedList.page when URL has no params", async () => {
    setupProducts(50);
    const store = makeStore();
    store.dispatch(setProductsListState({ page: 2, sort: "price_desc" }));

    renderWithProviders(<ProductsView />, { user: fullAccessUser, store });

    await waitFor(() => {
      expect(
        supabaseMock.state.calls.order.some(
          (c) => c.table === "products" && c.column === "price",
        ),
      ).toBe(true);
    });

    const rangeCalls = supabaseMock.state.calls.range.filter(
      (c) => c.table === "products",
    );
    expect(rangeCalls[0]).toEqual({ table: "products", from: 20, to: 29 });
    expect(store.getState().ui.productsList.sort).toBe("price_desc");
    expect(store.getState().ui.productsList.page).toBe(2);
  });

  it("does not restore storedList.page when URL forces a different sort", async () => {
    setupProducts(50);
    const store = makeStore();
    store.dispatch(setProductsListState({ page: 3, sort: "price_desc" }));
    searchParamsString = "sort=category_asc";

    renderWithProviders(<ProductsView />, { user: fullAccessUser, store });

    await waitFor(() => {
      expect(
        supabaseMock.state.calls.order.some(
          (c) => c.table === "products" && c.column === "category",
        ),
      ).toBe(true);
    });

    const rangeCalls = supabaseMock.state.calls.range.filter(
      (c) => c.table === "products",
    );
    expect(rangeCalls[0]).toEqual({ table: "products", from: 0, to: 9 });
  });
});

describe("ProductsView — search", () => {
  it("debounces search input and triggers query with .or filter", async () => {
    setupProducts(10);
    renderWithProviders(<ProductsView />, { user: fullAccessUser });

    await waitFor(() => {
      expect(screen.getByText("Ürün 1")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText(/ürün ara/i);
    await user.type(searchInput, "kalem");

    await waitFor(
      () => {
        expect(
          supabaseMock.state.calls.or.some(
            (c) => c.table === "products" && c.filter.includes("kalem"),
          ),
        ).toBe(true);
      },
      { timeout: 1500 },
    );
  });
});

describe("ProductsView — highlight column", () => {
  it("URL ?highlight=stock applies highlight bg to stock cell", async () => {
    setupProducts(5);
    searchParamsString = "highlight=stock";
    renderWithProviders(<ProductsView />, { user: fullAccessUser });

    await waitFor(() => {
      expect(screen.getByText("Ürün 1")).toBeInTheDocument();
    });

    const firstRow = screen.getByText("Ürün 1").closest("tr")!;
    const cells = firstRow.querySelectorAll("td");
    // columns: image(0), name(1), category(2), price(3), stock(4), status(5), actions(6)
    const stockCell = cells[4];
    expect(stockCell.className).toContain("warning");
  });

  it("no highlight without ?highlight param", async () => {
    setupProducts(5);
    renderWithProviders(<ProductsView />, { user: fullAccessUser });

    await waitFor(() => {
      expect(screen.getByText("Ürün 1")).toBeInTheDocument();
    });

    const firstRow = screen.getByText("Ürün 1").closest("tr")!;
    const cells = firstRow.querySelectorAll("td");
    const stockCell = cells[4];
    expect(stockCell.className).not.toContain("warning");
  });
});

describe("ProductsView — delete", () => {
  it("opens confirm dialog and calls delete on confirm", async () => {
    setupProducts(3);
    renderWithProviders(<ProductsView />, { user: fullAccessUser });

    await waitFor(() => {
      expect(screen.getByText("Ürün 1")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const deleteButtons = screen.getAllByLabelText(/sil/i);
    await user.click(deleteButtons[0]);

    const dialog = await screen.findByRole("dialog");
    const confirmButton = within(dialog).getByRole("button", { name: /sil/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(
        supabaseMock.state.calls.delete.some((c) => c.table === "products"),
      ).toBe(true);
    });
  });
});
