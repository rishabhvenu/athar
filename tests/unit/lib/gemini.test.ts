import { describe, expect, it, vi } from "vitest";

const geminiMocks = vi.hoisted(() => ({
  embedContent: vi.fn(),
  generateContent: vi.fn(),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn(function GoogleGenAI() {
    return {
    models: {
      embedContent: geminiMocks.embedContent,
      generateContent: geminiMocks.generateContent,
    },
    };
  }),
}));

import { generateEmbedding, inferMood } from "@/lib/gemini";

describe("gemini helpers", () => {
  it("returns the first embedding vector", async () => {
    geminiMocks.embedContent.mockResolvedValue({
      embeddings: [{ values: [0.1, 0.2, 0.3] }],
    });

    await expect(generateEmbedding("patience")).resolves.toEqual([0.1, 0.2, 0.3]);
    expect(geminiMocks.embedContent).toHaveBeenCalledWith({
      model: "text-embedding-004",
      contents: "patience",
    });
  });

  it("falls back to an empty embedding when Gemini returns no values", async () => {
    geminiMocks.embedContent.mockResolvedValue({});

    await expect(generateEmbedding("")).resolves.toEqual([]);
  });

  it("normalizes inferred mood text", async () => {
    geminiMocks.generateContent.mockResolvedValue({ text: "  Grateful  " });

    await expect(inferMood("I feel thankful today")).resolves.toBe("grateful");
    expect(geminiMocks.generateContent).toHaveBeenCalledWith({
      model: "gemini-1.5-flash",
      contents: expect.stringContaining("Reflection: \"I feel thankful today\""),
    });
  });

  it("falls back to calm when Gemini returns no mood text", async () => {
    geminiMocks.generateContent.mockResolvedValue({});

    await expect(inferMood("")).resolves.toBe("calm");
  });
});
