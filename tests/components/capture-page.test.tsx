import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const captureMocks = vi.hoisted(() => ({
  saveMemory: vi.fn(),
}));

vi.mock("@/app/actions/capture", () => ({
  saveMemory: captureMocks.saveMemory,
}));

import CapturePage from "@/app/capture/page";

describe("CapturePage", () => {
  it("selects a mood and submits the expected FormData", async () => {
    const user = userEvent.setup();
    const alertMock = vi.fn();
    captureMocks.saveMemory.mockResolvedValue({ id: "memory-1" });
    Object.defineProperty(window, "alert", { configurable: true, value: alertMock });

    render(<CapturePage />);

    await user.clear(screen.getByLabelText(/surah/i));
    await user.type(screen.getByLabelText(/surah/i), "94");
    await user.clear(screen.getByLabelText(/ayah/i));
    await user.type(screen.getByLabelText(/ayah/i), "5");
    await user.click(screen.getByRole("button", { name: "grateful" }));
    await user.type(
      screen.getByLabelText(/reflection/i),
      "I noticed ease after a difficult moment."
    );
    await user.click(screen.getByRole("button", { name: /save memory/i }));

    await waitFor(() => expect(captureMocks.saveMemory).toHaveBeenCalledOnce());
    const formData = captureMocks.saveMemory.mock.calls[0]?.[0] as FormData;
    expect(formData.get("surah")).toBe("94");
    expect(formData.get("ayah")).toBe("5");
    expect(formData.get("mood")).toBe("grateful");
    expect(formData.get("note")).toBe("I noticed ease after a difficult moment.");
    expect(alertMock).toHaveBeenCalledWith("Memory saved!");
  });

  it("shows a failure alert when saving fails", async () => {
    const user = userEvent.setup();
    const alertMock = vi.fn();
    captureMocks.saveMemory.mockRejectedValue(new Error("failed"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    Object.defineProperty(window, "alert", { configurable: true, value: alertMock });

    render(<CapturePage />);

    await user.click(screen.getByRole("button", { name: /save memory/i }));

    await waitFor(() => expect(alertMock).toHaveBeenCalledWith("Failed to save memory"));
  });
});
