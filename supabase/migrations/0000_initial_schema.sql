-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "public";

-- Create ENUM types
CREATE TYPE public.mood_type AS ENUM ('calm', 'anxious', 'grateful', 'grieving', 'seeking', 'joyful');
CREATE TYPE public.daily_card_reason AS ENUM ('anniversary', 'mood-match', 'dormant');

-- 1. Profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    preferred_translation TEXT DEFAULT 'sahih',
    preferred_qari TEXT DEFAULT 'mishary',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Memories
CREATE TABLE public.memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    surah INTEGER NOT NULL,
    ayah INTEGER NOT NULL,
    mood public.mood_type NOT NULL,
    note TEXT,
    voice_path TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own memories" ON public.memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON public.memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON public.memories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON public.memories FOR DELETE USING (auth.uid() = user_id);

-- 3. Reflections
CREATE TABLE public.reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID REFERENCES public.memories(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reflections" ON public.reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reflections" ON public.reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reflections" ON public.reflections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reflections" ON public.reflections FOR DELETE USING (auth.uid() = user_id);

-- 4. Memory Embeddings
CREATE TABLE public.memory_embeddings (
    memory_id UUID PRIMARY KEY REFERENCES public.memories(id) ON DELETE CASCADE,
    embedding vector(768) NOT NULL
);

ALTER TABLE public.memory_embeddings ENABLE ROW LEVEL SECURITY;
-- We join with memories to check ownership
CREATE POLICY "Users can view own memory embeddings" ON public.memory_embeddings FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.memories m WHERE m.id = memory_id AND m.user_id = auth.uid())
);
CREATE POLICY "Users can insert own memory embeddings" ON public.memory_embeddings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.memories m WHERE m.id = memory_id AND m.user_id = auth.uid())
);

-- 5. Collections
CREATE TABLE public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    auto_generated BOOLEAN DEFAULT FALSE NOT NULL,
    theme TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own collections" ON public.collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collections" ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections" ON public.collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON public.collections FOR DELETE USING (auth.uid() = user_id);

-- 6. Collection Memories
CREATE TABLE public.collection_memories (
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    memory_id UUID REFERENCES public.memories(id) ON DELETE CASCADE,
    PRIMARY KEY (collection_id, memory_id)
);

ALTER TABLE public.collection_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own collection memories" ON public.collection_memories FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
);
CREATE POLICY "Users can insert own collection memories" ON public.collection_memories FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
);
CREATE POLICY "Users can delete own collection memories" ON public.collection_memories FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
);

-- 7. Daily Cards
CREATE TABLE public.daily_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    card_date DATE NOT NULL,
    memory_id UUID REFERENCES public.memories(id) ON DELETE CASCADE NOT NULL,
    reason public.daily_card_reason NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, card_date)
);

ALTER TABLE public.daily_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own daily cards" ON public.daily_cards FOR SELECT USING (auth.uid() = user_id);
-- Service role handles inserts via cron

-- 8. Goals
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    target INTEGER NOT NULL,
    progress INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Storage for voice notes
INSERT INTO storage.buckets (id, name, public) VALUES ('voice_notes', 'voice_notes', false) ON CONFLICT DO NOTHING;
CREATE POLICY "Users can upload own voice notes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'voice_notes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own voice notes" ON storage.objects FOR SELECT USING (bucket_id = 'voice_notes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Cron job function to generate daily cards
CREATE OR REPLACE FUNCTION public.generate_daily_cards()
RETURNS void AS $$
DECLARE
    u_id UUID;
    m_id UUID;
    r_reason public.daily_card_reason;
BEGIN
    FOR u_id IN SELECT id FROM public.profiles LOOP
        -- Skip if already generated for today
        IF EXISTS (SELECT 1 FROM public.daily_cards WHERE user_id = u_id AND card_date = CURRENT_DATE) THEN
            CONTINUE;
        END IF;

        -- 1. Anniversary (same day/month)
        SELECT id INTO m_id FROM public.memories 
        WHERE user_id = u_id AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(DAY FROM created_at) = EXTRACT(DAY FROM CURRENT_DATE) AND EXTRACT(YEAR FROM created_at) < EXTRACT(YEAR FROM CURRENT_DATE)
        ORDER BY RANDOM() LIMIT 1;
        
        IF m_id IS NOT NULL THEN
            r_reason := 'anniversary';
        ELSE
            -- 2. Dormant (not seen in 90 days)
            SELECT id INTO m_id FROM public.memories 
            WHERE user_id = u_id AND created_at < CURRENT_DATE - INTERVAL '90 days'
            ORDER BY RANDOM() LIMIT 1;
            
            IF m_id IS NOT NULL THEN
                r_reason := 'dormant';
            ELSE
                -- 3. Random fallback
                SELECT id INTO m_id FROM public.memories WHERE user_id = u_id ORDER BY RANDOM() LIMIT 1;
                IF m_id IS NOT NULL THEN
                    r_reason := 'mood-match'; -- Using as fallback
                END IF;
            END IF;
        END IF;

        IF m_id IS NOT NULL THEN
            INSERT INTO public.daily_cards (user_id, card_date, memory_id, reason)
            VALUES (u_id, CURRENT_DATE, m_id, r_reason);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: In a real Supabase project, you would schedule this via pg_cron:
-- SELECT cron.schedule('generate_daily_cards', '0 4 * * *', 'SELECT public.generate_daily_cards()');
