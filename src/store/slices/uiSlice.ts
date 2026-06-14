import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CustomerRow, ProductRow } from "@/types/database";

export type ThemeMode = "light" | "dark";

type FormModal<T> = { open: false } | { open: true; entity: T | null };

type UiState = {
  theme: ThemeMode;
  sidebarOpen: boolean;
  productForm: FormModal<ProductRow>;
  customerForm: FormModal<CustomerRow>;
  productsListPage: number;
  customersListPage: number;
};

const initialState: UiState = {
  theme: "light",
  sidebarOpen: false,
  productForm: { open: false },
  customerForm: { open: false },
  productsListPage: 0,
  customersListPage: 0,
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
    setProductsListPage(state, action: PayloadAction<number>) {
      state.productsListPage = action.payload;
    },
    setCustomersListPage(state, action: PayloadAction<number>) {
      state.customersListPage = action.payload;
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
  setProductsListPage,
  setCustomersListPage,
} = uiSlice.actions;
export default uiSlice.reducer;
