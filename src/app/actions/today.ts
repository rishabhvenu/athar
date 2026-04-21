"use server";

import { createClient } from "@/lib/supabase/server";

export async function getTodayCard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch today's card
  const { data: card, error } = await supabase
    .from("daily_cards")
    .select("*, memory:memories(*)")
    .eq("user_id", user.id)
    .eq("card_date", new Date().toISOString().split("T")[0])
    .single();

  if (error || !card) return null;

  // Fetch reflections for this memory
  const { data: reflections } = await supabase
    .from("reflections")
    .select("*")
    .eq("memory_id", card.memory_id)
    .order("created_at", { ascending: true });

  return { card, reflections };
}

export async function addReflection(memoryId: string, body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("reflections")
    .insert({
      memory_id: memoryId,
      user_id: user.id,
      body,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
