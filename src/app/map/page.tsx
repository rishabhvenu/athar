import { createClient } from "@/lib/supabase/server";

type Memory = {
  id: string;
  surah: number;
  ayah: number;
  mood: string;
  note: string | null;
  created_at: string;
};

export default async function MapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("memories")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });
  const memories = (data ?? []) as Memory[];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Memory Map</h1>
      
      <div className="flex gap-4 mb-8 border-b pb-4">
        <button className="font-bold text-blue-600 border-b-2 border-blue-600 pb-2">Timeline</button>
        <button className="text-gray-500 hover:text-gray-800 pb-2">Constellation</button>
        <button className="text-gray-500 hover:text-gray-800 pb-2">Themes</button>
      </div>

      <div className="flex flex-col gap-6">
        {memories.map((mem) => (
          <div key={mem.id} className="border p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Surah {mem.surah}, Ayah {mem.ayah}</h3>
              <span className="text-sm text-gray-500">{new Date(mem.created_at).toLocaleDateString()}</span>
            </div>
            <p className="mb-4 text-lg italic">&quot;{mem.note}&quot;</p>
            <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm">
              {mem.mood}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
