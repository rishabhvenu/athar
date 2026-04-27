import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const searchMocks = vi.hoisted(() => ({
  performSearch: vi.fn(),
}));

vi.mock("@/app/actions/search", () => ({
  performSearch: searchMocks.performSearch,
}));

import SearchPage from "@/app/search/page";

describe("SearchPage", () => {
  it("submits a query and renders returned memory and Quran results", async () => {
    const user = userEvent.setup();
    searchMocks.performSearch.mockResolvedValue([
      { surah: 2, ayah: 286, note: "My memory note" },
      { surah: 94, ayah: 5, text: "With hardship comes ease." },
    ]);

    render(<SearchPage />);

    await user.type(screen.getByPlaceholderText(/verses about patience/i), "patience");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => expect(searchMocks.performSearch).toHaveBeenCalledWith("patience"));
    expect(screen.getByText("Surah 2, Ayah 286")).toBeInTheDocument();
    expect(screen.getByText(/my memory note/i)).toBeInTheDocument();
    expect(screen.getByText("Surah 94, Ayah 5")).toBeInTheDocument();
    expect(screen.getByText(/with hardship comes ease/i)).toBeInTheDocument();
  });

  it("shows an empty state when a completed search returns no results", async () => {
    const user = userEvent.setup();
    searchMocks.performSearch.mockResolvedValue([]);

    render(<SearchPage />);

    await user.type(screen.getByPlaceholderText(/verses about patience/i), "unknown");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => expect(screen.getByText(/no results found/i)).toBeInTheDocument());
  });
});
