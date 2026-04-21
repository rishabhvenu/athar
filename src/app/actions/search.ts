"use server";

import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/gemini";
import { semanticSearchVerses } from "@/lib/mcp";

export async function performSearch(query: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const embedding = await generateEmbedding(query);
  
  // 1. Search personal memory embeddings (pgvector)
  const { data: memories } = await supabase.rpc("match_memories", {
    query_embedding: `[${embedding.join(",")}]`,
    match_threshold: 0.7,
    match_count: 5,
    p_user_id: user.id
  });

  // 2. Search Quran MCP for new verses
  const quranResults = await semanticSearchVerses(query);

  // Combine and deduplicate
  return [...(memories || []), ...quranResults];
}
