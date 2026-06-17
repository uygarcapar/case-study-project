import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CustomerRow, ProductRow } from "@/types/database";

export type ThemeMode = "light" | "dark";

type FormModal<T> = { open: false } | { open: true; entity: T | null };

type ListScrollState = {
  page: number;
  sort: string;
};

type UiState = {
  theme: ThemeMode;
  sidebarOpen: boolean;
  productForm: FormModal<ProductRow>;
  customerForm: FormModal<CustomerRow>;
  productsList: ListScrollState;
  customersList: ListScrollState;
};

const initialState: UiState = {
  theme: "light",
  sidebarOpen: false,
  productForm: { open: false },
  customerForm: { open: false },
  productsList: { page: 0, sort: "" },
  customersList: { page: 0, sort: "" },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openProductForm(state, action: PayloadAction<ProductRow | null>) {
      state.productForm = { open: true, entity: action.payload };
    },
    closeProductForm(state) {
      state.productForm = { open: false };
    },
    openCustomerForm(state, action: PayloadAction<CustomerRow | null>) {
      state.customerForm = { open: true, entity: action.payload };
    },
    closeCustomerForm(state) {
      state.customerForm = { open: false };
    },
    setProductsListState(state, action: PayloadAction<ListScrollState>) {
      state.productsList = action.payload;
    },
    setCustomersListState(state, action: PayloadAction<ListScrollState>) {
      state.customersList = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  openProductForm,
  closeProductForm,
  openCustomerForm,
  closeCustomerForm,
  setProductsListState,
  setCustomersListState,
} = uiSlice.actions;
export default uiSlice.reducer;
