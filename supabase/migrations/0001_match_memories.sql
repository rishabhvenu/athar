-- Add match_memories function for pgvector search
CREATE OR REPLACE FUNCTION public.match_memories(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  surah int,
  ayah int,
  mood public.mood_type,
  note text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.surah,
    m.ayah,
    m.mood,
    m.note,
    1 - (me.embedding <=> query_embedding) AS similarity
  FROM public.memory_embeddings me
  JOIN public.memories m ON m.id = me.memory_id
  WHERE m.user_id = p_user_id
    AND 1 - (me.embedding <=> query_embedding) > match_threshold
  ORDER BY me.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
