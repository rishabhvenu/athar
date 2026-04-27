import { describe, expect, it, vi } from "vitest";

import { buildSupabaseMock } from "../helpers/supabase-mock";

const actionMocks = vi.hoisted(() => ({
  currentSupabase: undefined as unknown,
  generateEmbedding: vi.fn(),
  semanticSearchVerses: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => actionMocks.currentSupabase),
}));

vi.mock("@/lib/gemini", () => ({
  generateEmbedding: actionMocks.generateEmbedding,
}));

vi.mock("@/lib/mcp", () => ({
  semanticSearchVerses: actionMocks.semanticSearchVerses,
}));

import { performSearch } from "@/app/actions/search";

describe("performSearch", () => {
  it("throws when the user is not authenticated", async () => {
    actionMocks.currentSupabase = buildSupabaseMock({ user: null });

    await expect(performSearch("patience")).rejects.toThrow("Unauthorized");
  });

  it("combines personal pgvector matches with Quran MCP results", async () => {
    const memories = [{ id: "memory-1", surah: 2, ayah: 286, note: "my note" }];
    const quranResults = [{ surah: 94, ayah: 5, text: "With hardship comes ease." }];
    actionMocks.generateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
    actionMocks.semanticSearchVerses.mockResolvedValue(quranResults);
    actionMocks.currentSupabase = buildSupabaseMock({
      rpc: {
        match_memories: (args) => {
          expect(args).toEqual({
            query_embedding: "[0.1,0.2,0.3]",
            match_threshold: 0.7,
            match_count: 5,
            p_user_id: "user-1",
          });
          return { data: memories, error: null };
        },
      },
    });

    await expect(performSearch("patience")).resolves.toEqual([...memories, ...quranResults]);
    expect(actionMocks.generateEmbedding).toHaveBeenCalledWith("patience");
    expect(actionMocks.semanticSearchVerses).toHaveBeenCalledWith("patience");
  });

  it("returns Quran results when personal memory matches are absent", async () => {
    const quranResults = [{ surah: 2, ayah: 286, text: "Allah does not burden a soul." }];
    actionMocks.generateEmbedding.mockResolvedValue([0.1]);
    actionMocks.semanticSearchVerses.mockResolvedValue(quranResults);
    actionMocks.currentSupabase = buildSupabaseMock({
      rpc: {
        match_memories: () => ({ data: null, error: null }),
      },
    });

    await expect(performSearch("burden")).resolves.toEqual(quranResults);
  });
});
