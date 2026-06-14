import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "../supabaseBaseQuery";
import type {
  ProductInsert,
  ProductRow,
  ProductUpdate,
} from "@/types/database";

const LOW_STOCK_THRESHOLD = 10;

export type ProductSortKey =
  | "newest"
  | "name_asc"
  | "name_desc"
  | "category_asc"
  | "category_desc"
  | "price_asc"
  | "price_desc"
  | "stock_asc"
  | "stock_desc";

export type ListProductsPageArgs = {
  page: number;
  pageSize: number;
  search: string;
  sort: ProductSortKey;
  locale: "tr" | "en";
};

export type ListProductsPageResult = {
  items: ProductRow[];
  total: number;
};

function sortToOrder(
  sort: ProductSortKey,
  locale: "tr" | "en",
): { column: string; ascending: boolean } {
  switch (sort) {
    case "name_asc":
      return { column: `name->>${locale}`, ascending: true };
    case "name_desc":
      return { column: `name->>${locale}`, ascending: false };
    case "category_asc":
      return { column: "category", ascending: true };
    case "category_desc":
      return { column: "category", ascending: false };
    case "price_asc":
      return { column: "price", ascending: true };
    case "price_desc":
      return { column: "price", ascending: false };
    case "stock_asc":
      return { column: "stock", ascending: true };
    case "stock_desc":
      return { column: "stock", ascending: false };
    case "newest":
    default:
      return { column: "created_at", ascending: false };
  }
}

function escapeOrTerm(value: string) {
  return value.replace(/[\\,()]/g, " ").trim();
}

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Product", "ProductSummary"],
  endpoints: (build) => ({
    listProductsPage: build.query<ListProductsPageResult, ListProductsPageArgs>({
      keepUnusedDataFor: 1800,
      query: ({ page, pageSize, search, sort, locale }) => ({
        fn: async (client) => {
          let q = client.from("products").select("*", { count: "exact" });
          const term = escapeOrTerm(search);
          if (term) {
            const like = `%${term}%`;
            q = q.or(`name->>tr.ilike.${like},name->>en.ilike.${like}`);
          }
          const order = sortToOrder(sort, locale);
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
        const seen = new Set(current.items.map((p) => p.id));
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
          currentArg.locale !== previousArg.locale ||
          currentArg.pageSize !== previousArg.pageSize
        );
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((p) => ({ type: "Product" as const, id: p.id })),
              { type: "Product" as const, id: "LIST" },
            ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),
    getProductsSummary: build.query<
      { total: number; lowStock: number; recent: ProductRow[] },
      void
    >({
      query: () => ({
        fn: async (client) => {
          const [totalRes, lowRes, recentRes] = await Promise.all([
            client.from("products").select("*", { count: "exact", head: true }),
            client
              .from("products")
              .select("*", { count: "exact", head: true })
              .lte("stock", LOW_STOCK_THRESHOLD),
            client
              .from("products")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(10),
          ]);
          const err = totalRes.error ?? lowRes.error ?? recentRes.error;
          if (err) return { data: null, error: err };
          return {
            data: {
              total: totalRes.count ?? 0,
              lowStock: lowRes.count ?? 0,
              recent: recentRes.data ?? [],
            },
            error: null,
          };
        },
      }),
      providesTags: [{ type: "ProductSummary", id: "ALL" }],
    }),
    getProduct: build.query<ProductRow | null, string>({
      query: (id) => ({
        fn: (client) =>
          client.from("products").select("*").eq("id", id).maybeSingle(),
      }),
      transformResponse: (response: unknown) => (response as ProductRow | null) ?? null,
      providesTags: (_, __, id) => [{ type: "Product", id }],
    }),
    createProduct: build.mutation<ProductRow, ProductInsert>({
      query: (input) => ({
        fn: (client) =>
          client.from("products").insert(input).select().single(),
      }),
      transformResponse: (response: unknown) => response as ProductRow,
      invalidatesTags: [
        { type: "Product", id: "LIST" },
        { type: "ProductSummary", id: "ALL" },
      ],
    }),
    updateProduct: build.mutation<ProductRow, { id: string; patch: ProductUpdate }>({
      query: ({ id, patch }) => ({
        fn: (client) =>
          client.from("products").update(patch).eq("id", id).select().single(),
      }),
      transformResponse: (response: unknown) => response as ProductRow,
      invalidatesTags: (_, __, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
        { type: "ProductSummary", id: "ALL" },
      ],
    }),
    deleteProduct: build.mutation<{ id: string }, string>({
      query: (id) => ({
        fn: async (client) => {
          const res = await client.from("products").delete().eq("id", id);
          return { data: res.error ? null : { id }, error: res.error };
        },
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
        { type: "ProductSummary", id: "ALL" },
      ],
    }),
  }),
});

export const {
  useListProductsPageQuery,
  useGetProductsSummaryQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
