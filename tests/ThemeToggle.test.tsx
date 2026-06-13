import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { renderWithProviders } from "./test-utils";

function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    clearCookie("theme");
    document.documentElement.dataset.theme = "light";
  });

  it("renders a button with an accessible label", () => {
    renderWithProviders(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAccessibleName();
  });

  it("toggles theme between light and dark when clicked", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<ThemeToggle />);
    expect(store.getState().ui.theme).toBe("light");

    await user.click(screen.getByRole("button"));
    expect(store.getState().ui.theme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");

    await user.click(screen.getByRole("button"));
    expect(store.getState().ui.theme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("persists theme choice to cookie on toggle", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeToggle />);

    await user.click(screen.getByRole("button"));
    expect(getCookie("theme")).toBe("dark");

    await user.click(screen.getByRole("button"));
    expect(getCookie("theme")).toBe("light");
  });
});
