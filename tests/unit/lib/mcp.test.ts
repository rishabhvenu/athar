import { describe, expect, it, vi } from "vitest";

import { semanticSearchVerses } from "@/lib/mcp";

describe("semanticSearchVerses", () => {
  it("returns the placeholder Quran MCP search result", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await expect(semanticSearchVerses("patience")).resolves.toEqual([
      {
        surah: 2,
        ayah: 286,
        text: "Allah does not burden a soul beyond that it can bear...",
      },
    ]);
    expect(logSpy).toHaveBeenCalledWith("Semantic search via Quran MCP:", "patience");
  });
});
