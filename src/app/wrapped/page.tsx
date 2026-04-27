import { createClient } from "@/lib/supabase/server";

type WrappedMemory = {
  mood: string;
};

export default async function WrappedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("memories")
    .select("*")
    .eq("user_id", user?.id);
  const memories = (data ?? []) as WrappedMemory[];

  const totalMemories = memories.length;
  
  // Basic stats
  const moods = memories.map((m) => m.mood);
  const topMood = moods.sort((a,b) =>
    moods.filter(v => v===a).length - moods.filter(v => v===b).length
  ).pop() || "calm";

  return (
    <div className="p-8 max-w-md mx-auto text-center">
      <h1 className="text-4xl font-bold mb-8">Your Year in Quran</h1>
      
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-8 rounded-3xl shadow-2xl mb-8">
        <h2 className="text-2xl font-bold mb-6">2026</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/20 p-4 rounded-xl">
            <div className="text-3xl font-bold">{totalMemories}</div>
            <div className="text-sm opacity-80">Moments Saved</div>
          </div>
          <div className="bg-white/20 p-4 rounded-xl">
            <div className="text-3xl font-bold capitalize">{topMood}</div>
            <div className="text-sm opacity-80">Top Emotion</div>
          </div>
        </div>
        
        <p className="italic opacity-90">&quot;A living journal of your spiritual life.&quot;</p>
      </div>

      <button className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-bold w-full">
        Share to Instagram
      </button>
    </div>
  );
}
