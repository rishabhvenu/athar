"use server";

import { createClient } from "@/lib/supabase/server";
import { generateEmbedding, inferMood } from "@/lib/gemini";

export async function saveMemory(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const surah = parseInt(formData.get("surah") as string);
  const ayah = parseInt(formData.get("ayah") as string);
  let mood = formData.get("mood") as string;
  const note = formData.get("note") as string;

  if (!mood && note) {
    mood = await inferMood(note);
  }

  // Insert memory
  const { data: memory, error } = await supabase
    .from("memories")
    .insert({
      user_id: user.id,
      surah,
      ayah,
      mood: mood || "calm",
      note,
    })
    .select()
    .single();

  if (error) throw error;

  // Background embedding
  if (note) {
    const embedding = await generateEmbedding(note);
    await supabase.from("memory_embeddings").insert({
      memory_id: memory.id,
      embedding: `[${embedding.join(",")}]`,
    });
  }

  return memory;
}
