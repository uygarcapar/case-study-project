import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "../supabaseBaseQuery";
import type {
  CustomerInsert,
  CustomerRow,
  CustomerUpdate,
} from "@/types/database";

export type CustomerSortKey =
  | "newest"
  | "name_asc"
  | "name_desc"
  | "email_asc"
  | "email_desc"
  | "city_asc"
  | "city_desc"
  | "total_orders_asc"
  | "total_orders_desc";

export type ListCustomersPageArgs = {
  page: number;
  pageSize: number;
  search: string;
  sort: CustomerSortKey;
};

export type ListCustomersPageResult = {
  items: CustomerRow[];
  total: number;
};

function sortToOrder(sort: CustomerSortKey): {
  column: string;
  ascending: boolean;
} {
  switch (sort) {
    case "name_asc":
      return { column: "full_name", ascending: true };
    case "name_desc":
      return { column: "full_name", ascending: false };
    case "email_asc":
      return { column: "email", ascending: true };
    case "email_desc":
      return { column: "email", ascending: false };
    case "city_asc":
      return { column: "city", ascending: true };
    case "city_desc":
      return { column: "city", ascending: false };
    case "total_orders_asc":
      return { column: "total_orders", ascending: true };
    case "total_orders_desc":
      return { column: "total_orders", ascending: false };
    case "newest":
    default:
      return { column: "created_at", ascending: false };
  }
}

function escapeOrTerm(value: string) {
  return value.replace(/[\\,()]/g, " ").trim();
}

export const customersApi = createApi({
  reducerPath: "customersApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Customer", "CustomerSummary"],
  endpoints: (build) => ({
    listCustomersPage: build.query<ListCustomersPageResult, ListCustomersPageArgs>({
      keepUnusedDataFor: 1800,
      query: ({ page, pageSize, search, sort }) => ({
        fn: async (client) => {
          let q = client.from("customers").select("*", { count: "exact" });
          const term = escapeOrTerm(search);
          if (term) {
            const like = `%${term}%`;
            q = q.or(`full_name.ilike.${like},email.ilike.${like}`);
          }
          const order = sortToOrder(sort);
          q = q.order(order.column, { ascending: order.ascending });
          const from = page * pageSize;
          const to = from + pageSize - 1;
          q = q.range(from, to);
          const res = await q;
          if (res.error) return { data: null, error: res.error };
          return {
            data: { items: res.data ?? [], total: res.count ?? 0 },
            error: null,
          };
        },
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        const { page: _page, ...rest } = queryArgs;
        return rest;
      },
      merge: (current, incoming, { arg }) => {
        if (arg.page === 0) {
          current.items = incoming.items;
          current.total = incoming.total;
          return;
        }
        const seen = new Set(current.items.map((c) => c.id));
        for (const item of incoming.items) {
          if (!seen.has(item.id)) current.items.push(item);
        }
        current.total = incoming.total;
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        if (!previousArg || !currentArg) return true;
        return (
          currentArg.page !== previousArg.page ||
          currentArg.search !== previousArg.search ||
          currentArg.sort !== previousArg.sort ||
          currentArg.pageSize !== previousArg.pageSize
        );
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((c) => ({ type: "Customer" as const, id: c.id })),
              { type: "Customer" as const, id: "LIST" },
            ]
          : [{ type: "Customer" as const, id: "LIST" }],
    }),
    getCustomersSummary: build.query<{ total: number; totalOrders: number }, void>({
      query: () => ({
        fn: async (client) => {
          const [totalRes, ordersRes] = await Promise.all([
            client.from("customers").select("*", { count: "exact", head: true }),
            client.from("customers").select("total_orders"),
          ]);
          const err = totalRes.error ?? ordersRes.error;
          if (err) return { data: null, error: err };
          const totalOrders = (ordersRes.data ?? []).reduce(
            (sum, c) => sum + (c.total_orders ?? 0),
            0,
          );
          return {
            data: { total: totalRes.count ?? 0, totalOrders },
            error: null,
          };
        },
      }),
      providesTags: [{ type: "CustomerSummary", id: "ALL" }],
    }),
    getCustomer: build.query<CustomerRow | null, string>({
      query: (id) => ({
        fn: (client) =>
          client.from("customers").select("*").eq("id", id).maybeSingle(),
      }),
      transformResponse: (response: unknown) => (response as CustomerRow | null) ?? null,
      providesTags: (_, __, id) => [{ type: "Customer", id }],
    }),
    createCustomer: build.mutation<CustomerRow, CustomerInsert>({
      query: (input) => ({
        fn: (client) =>
          client.from("customers").insert(input).select().single(),
      }),
      transformResponse: (response: unknown) => response as CustomerRow,
      invalidatesTags: [
        { type: "Customer", id: "LIST" },
        { type: "CustomerSummary", id: "ALL" },
      ],
    }),
    updateCustomer: build.mutation<CustomerRow, { id: string; patch: CustomerUpdate }>({
      query: ({ id, patch }) => ({
        fn: (client) =>
          client.from("customers").update(patch).eq("id", id).select().single(),
      }),
      transformResponse: (response: unknown) => response as CustomerRow,
      invalidatesTags: (_, __, { id }) => [
        { type: "Customer", id },
        { type: "Customer", id: "LIST" },
        { type: "CustomerSummary", id: "ALL" },
      ],
    }),
    deleteCustomer: build.mutation<{ id: string }, string>({
      query: (id) => ({
        fn: async (client) => {
          const res = await client.from("customers").delete().eq("id", id);
          return { data: res.error ? null : { id }, error: res.error };
        },
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Customer", id },
        { type: "Customer", id: "LIST" },
        { type: "CustomerSummary", id: "ALL" },
      ],
    }),
  }),
});

export const {
  useListCustomersPageQuery,
  useGetCustomersSummaryQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
