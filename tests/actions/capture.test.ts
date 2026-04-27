import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildSupabaseMock,
  createQueryChain,
  type SupabaseChain,
} from "../helpers/supabase-mock";

const actionMocks = vi.hoisted(() => ({
  currentSupabase: undefined as unknown,
  generateEmbedding: vi.fn(),
  inferMood: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => actionMocks.currentSupabase),
}));

vi.mock("@/lib/gemini", () => ({
  generateEmbedding: actionMocks.generateEmbedding,
  inferMood: actionMocks.inferMood,
}));

import { saveMemory } from "@/app/actions/capture";

function createFormData(values: Record<string, string>) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.append(key, value));
  return formData;
}

describe("saveMemory", () => {
  beforeEach(() => {
    actionMocks.generateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
    actionMocks.inferMood.mockResolvedValue("grateful");
  });

  it("throws when the user is not authenticated", async () => {
    actionMocks.currentSupabase = buildSupabaseMock({ user: null });

    await expect(
      saveMemory(createFormData({ surah: "2", ayah: "286", mood: "calm", note: "test" }))
    ).rejects.toThrow("Unauthorized");
  });

  it("infers mood when mood is blank and a note exists", async () => {
    const memory = { id: "memory-1", surah: 2, ayah: 286, mood: "grateful", note: "thankful" };
    const memories = createQueryChain({ data: memory, error: null });
    const embeddings = createQueryChain({ data: null, error: null });
    actionMocks.currentSupabase = buildSupabaseMock({
      queries: {
        memories: memories as unknown as SupabaseChain<unknown>,
        memory_embeddings: embeddings as unknown as SupabaseChain<unknown>,
      },
    });

    const result = await saveMemory(
      createFormData({ surah: "2", ayah: "286", mood: "", note: "thankful" })
    );

    expect(result).toEqual(memory);
    expect(actionMocks.inferMood).toHaveBeenCalledWith("thankful");
    expect(memories.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      surah: 2,
      ayah: 286,
      mood: "grateful",
      note: "thankful",
    });
    expect(actionMocks.generateEmbedding).toHaveBeenCalledWith("thankful");
    expect(embeddings.insert).toHaveBeenCalledWith({
      memory_id: "memory-1",
      embedding: "[0.1,0.2,0.3]",
    });
  });

  it("uses an explicit mood and skips embedding when no note exists", async () => {
    const memory = { id: "memory-1", surah: 3, ayah: 7, mood: "calm", note: "" };
    const memories = createQueryChain({ data: memory, error: null });
    const embeddings = createQueryChain({ data: null, error: null });
    actionMocks.currentSupabase = buildSupabaseMock({
      queries: {
        memories: memories as unknown as SupabaseChain<unknown>,
        memory_embeddings: embeddings as unknown as SupabaseChain<unknown>,
      },
    });

    await saveMemory(createFormData({ surah: "3", ayah: "7", mood: "calm", note: "" }));

    expect(actionMocks.inferMood).not.toHaveBeenCalled();
    expect(actionMocks.generateEmbedding).not.toHaveBeenCalled();
    expect(embeddings.insert).not.toHaveBeenCalled();
    expect(memories.insert).toHaveBeenCalledWith(
      expect.objectContaining({ mood: "calm", note: "" })
    );
  });

  it("propagates Supabase insert errors", async () => {
    actionMocks.currentSupabase = buildSupabaseMock({
      queries: {
        memories: createQueryChain({
          data: null,
          error: new Error("insert failed"),
        }) as unknown as SupabaseChain<unknown>,
      },
    });

    await expect(
      saveMemory(createFormData({ surah: "2", ayah: "286", mood: "calm", note: "test" }))
    ).rejects.toThrow("insert failed");
  });
});
