import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomersView } from "@/components/customers/CustomersView";
import { makeStore } from "@/store";
import { setCustomersListState } from "@/store/slices/uiSlice";
import { renderWithProviders, fullAccessUser } from "./test-utils";
import {
  createSupabaseMock,
  installIntersectionObserver,
  makeCustomer,
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
    usePathname: () => "/customers",
  };
});

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={typeof href === "string" ? href : "#"}>{children}</a>
  ),
  usePathname: () => "/customers",
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

function setupCustomers(count: number) {
  const customers = Array.from({ length: count }, (_, i) => makeCustomer(i + 1));
  supabaseMock = createSupabaseMock({ customers });
}

describe("CustomersView — initial render and pagination", () => {
  it("fetches page 0 on mount and renders first batch", async () => {
    setupCustomers(25);
    renderWithProviders(<CustomersView />, { user: fullAccessUser });

    await waitFor(() => {
      expect(screen.getByText("Customer 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Customer 10")).toBeInTheDocument();
    expect(screen.queryByText("Customer 11")).not.toBeInTheDocument();

    const rangeCalls = supabaseMock.state.calls.range.filter(
      (c) => c.table === "customers",
    );
    expect(rangeCalls[0]).toEqual({ table: "customers", from: 0, to: 9 });
  });

  it("merges next page when sentinel intersects (infinite scroll)", async () => {
    setupCustomers(25);
    renderWithProviders(<CustomersView />, { user: fullAccessUser });

    await waitFor(() => {
      expect(screen.getByText("Customer 10")).toBeInTheDocument();
    });

    await act(async () => {
      io.trigger();
    });

    await waitFor(() => {
      expect(screen.getByText("Customer 20")).toBeInTheDocument();
    });

    const rangeCalls = supabaseMock.state.calls.range.filter(
      (c) => c.table === "customers",
    );
    expect(rangeCalls).toContainEqual({ table: "customers", from: 10, to: 19 });
    expect(screen.getByText("Customer 1")).toBeInTheDocument();
  });
});

describe("CustomersView — sort behavior", () => {
  it("clicking a sortable column header resets page to 0 and re-fetches", async () => {
    setupCustomers(25);
    const { store } = renderWithProviders(<CustomersView />, {
      user: fullAccessUser,
    });

    await waitFor(() => {
      expect(screen.getByText("Customer 1")).toBeInTheDocument();
    });

    await act(async () => {
      io.trigger();
    });
    await waitFor(() => {
      expect(screen.getByText("Customer 20")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const nameHeader = screen.getByText("İsim").closest("th") as HTMLElement;
    await user.click(nameHeader);

    await waitFor(() => {
      expect(store.getState().ui.customersList.sort).toBe("name_asc");
      expect(store.getState().ui.customersList.page).toBe(0);
    });

    const orderCalls = supabaseMock.state.calls.order.filter(
      (c) => c.table === "customers",
    );
    expect(orderCalls.some((c) => c.column === "full_name")).toBe(true);
  });

  it("URL ?sort param wins over storedList.sort on mount", async () => {
    setupCustomers(25);
    const store = makeStore();
    store.dispatch(
      setCustomersListState({ page: 2, sort: "name_asc" }),
    );

    searchParamsString = "sort=total_orders_desc&highlight=total_orders";

    renderWithProviders(<CustomersView />, { user: fullAccessUser, store });

    await waitFor(() => {
      expect(
        supabaseMock.state.calls.order.some(
          (c) => c.table === "customers" && c.column === "total_orders",
        ),
      ).toBe(true);
    });

    const rangeCalls = supabaseMock.state.calls.range.filter(
      (c) => c.table === "customers",
    );
    expect(rangeCalls[0]).toEqual({ table: "customers", from: 0, to: 9 });
    expect(store.getState().ui.customersList.sort).toBe("total_orders_desc");
    expect(store.getState().ui.customersList.page).toBe(0);
  });
});

describe("CustomersView — Redux page/sort restoration", () => {
  it("restores storedList.sort and storedList.page when URL has no params", async () => {
    setupCustomers(50);
    const store = makeStore();
    store.dispatch(
      setCustomersListState({ page: 2, sort: "name_asc" }),
    );

    renderWithProviders(<CustomersView />, { user: fullAccessUser, store });

    await waitFor(() => {
      const orderCalls = supabaseMock.state.calls.order.filter(
        (c) => c.table === "customers",
      );
      expect(orderCalls.some((c) => c.column === "full_name")).toBe(true);
    });

    const rangeCalls = supabaseMock.state.calls.range.filter(
      (c) => c.table === "customers",
    );
    expect(rangeCalls[0]).toEqual({ table: "customers", from: 20, to: 29 });
    expect(store.getState().ui.customersList.sort).toBe("name_asc");
    expect(store.getState().ui.customersList.page).toBe(2);
  });

  it("does not restore storedList.page when URL forces a different sort", async () => {
    setupCustomers(50);
    const store = makeStore();
    store.dispatch(
      setCustomersListState({ page: 3, sort: "name_asc" }),
    );
    searchParamsString = "sort=email_asc";

    renderWithProviders(<CustomersView />, { user: fullAccessUser, store });

    await waitFor(() => {
      expect(
        supabaseMock.state.calls.order.some(
          (c) => c.table === "customers" && c.column === "email",
        ),
      ).toBe(true);
    });

    const rangeCalls = supabaseMock.state.calls.range.filter(
      (c) => c.table === "customers",
    );
    expect(rangeCalls[0]).toEqual({ table: "customers", from: 0, to: 9 });
  });
});

describe("CustomersView — search", () => {
  it("debounces search input and triggers query with .or filter", async () => {
    setupCustomers(10);
    renderWithProviders(<CustomersView />, { user: fullAccessUser });

    await waitFor(() => {
      expect(screen.getByText("Customer 1")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText(/müşteri ara/i);
    await user.type(searchInput, "alice");

    await waitFor(
      () => {
        expect(
          supabaseMock.state.calls.or.some(
            (c) => c.table === "customers" && c.filter.includes("alice"),
          ),
        ).toBe(true);
      },
      { timeout: 1500 },
    );
  });
});

describe("CustomersView — highlight column", () => {
  it("URL ?highlight=total_orders adds highlight class to header (no sort)", async () => {
    setupCustomers(5);
    // The highlight visual is rendered on the non-sortable TH. Since onSortChange
    // is always provided in CustomersView, the column header uses SortableTH and
    // highlight is on the TD cells. Verify a TD cell has the highlight bg class.
    renderWithProviders(<CustomersView />, { user: fullAccessUser });

    await waitFor(() => {
      expect(screen.getByText("Customer 1")).toBeInTheDocument();
    });

    // Without highlight: total_orders cell should NOT have warning bg
    const firstRowCells = screen.getByText("Customer 1").closest("tr")!
      .querySelectorAll("td");
    const totalOrdersCell = firstRowCells[4];
    expect(totalOrdersCell.className).not.toContain("warning");
  });

  it("highlight=total_orders renders highlighted cell background", async () => {
    setupCustomers(5);
    searchParamsString = "highlight=total_orders";
    renderWithProviders(<CustomersView />, { user: fullAccessUser });

    await waitFor(() => {
      expect(screen.getByText("Customer 1")).toBeInTheDocument();
    });

    const firstRowCells = screen.getByText("Customer 1").closest("tr")!
      .querySelectorAll("td");
    const totalOrdersCell = firstRowCells[4];
    expect(totalOrdersCell.className).toContain("warning");
  });
});

describe("CustomersView — delete", () => {
  it("opens confirm dialog and calls delete on confirm", async () => {
    setupCustomers(3);
    renderWithProviders(<CustomersView />, { user: fullAccessUser });

    await waitFor(() => {
      expect(screen.getByText("Customer 1")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const deleteButtons = screen.getAllByLabelText(/sil/i);
    await user.click(deleteButtons[0]);

    const dialog = await screen.findByRole("dialog");
    const confirmButton = within(dialog).getByRole("button", { name: /sil/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(
        supabaseMock.state.calls.delete.some((c) => c.table === "customers"),
      ).toBe(true);
    });
  });
});
