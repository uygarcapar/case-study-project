"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { makeStore } from "./index";
import { setTheme, type ThemeMode } from "./slices/uiSlice";
import { setUser, type AuthUser } from "./slices/authSlice";

type Props = {
  children: React.ReactNode;
  initialUser: AuthUser | null;
  initialTheme: ThemeMode;
};

export function Providers({ children, initialUser, initialTheme }: Props) {
  const [store] = useState(() => {
    const s = makeStore();
    s.dispatch(setUser(initialUser));
    s.dispatch(setTheme(initialTheme));
    return s;
  });

  useEffect(() => {
    store.dispatch(setUser(initialUser));
  }, [store, initialUser]);

  useEffect(() => {
    store.dispatch(setTheme(initialTheme));
    document.documentElement.dataset.theme = initialTheme;
  }, [store, initialTheme]);

  return (
    <Provider store={store}>
      {children}
      <Toaster richColors position="top-right" />
    </Provider>
  );
}
