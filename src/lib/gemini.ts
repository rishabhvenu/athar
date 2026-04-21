import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateEmbedding(text: string) {
  const response = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: text,
  });
  return response.embeddings?.[0]?.values || [];
}

export async function inferMood(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: `Analyze the following reflection and classify the primary mood into exactly one of these categories: calm, anxious, grateful, grieving, seeking, joyful. Return ONLY the category name in lowercase.\n\nReflection: "${text}"`,
  });
  return response.text?.trim().toLowerCase() || "calm";
}
