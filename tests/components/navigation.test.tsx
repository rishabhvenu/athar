import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const navigationMocks = vi.hoisted(() => ({
  pathname: "/today",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMocks.pathname,
}));

import { Navigation } from "@/components/Navigation";

describe("Navigation", () => {
  it("hides navigation on the login route", () => {
    navigationMocks.pathname = "/login";

    render(<Navigation />);

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("renders the primary app navigation and marks the active item", () => {
    navigationMocks.pathname = "/capture";

    render(<Navigation />);

    expect(screen.getByRole("link", { name: /today/i })).toHaveAttribute("href", "/today");
    expect(screen.getByRole("link", { name: /capture/i })).toHaveClass("text-blue-600");
    expect(screen.getByRole("link", { name: /search/i })).toHaveClass("text-gray-500");
  });
});
