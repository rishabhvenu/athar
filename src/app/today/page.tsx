import { getTodayCard } from "../actions/today";
import Link from "next/link";

export default async function TodayPage() {
  const data = await getTodayCard();

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">No card for today yet.</h1>
        <p className="text-gray-500 mb-8">Capture a new memory or check back later.</p>
        <Link href="/capture" className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold">
          Capture a Memory
        </Link>
      </div>
    );
  }

  const { card, reflections } = data;
  const memory = card.memory;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        <div className="text-sm text-gray-500 uppercase tracking-widest mb-4">
          {card.reason === "anniversary" ? "On this day" : card.reason === "dormant" ? "Revisit" : "Mood Match"}
        </div>
        <h2 className="text-2xl font-bold mb-2">Surah {memory.surah}, Ayah {memory.ayah}</h2>
        <p className="text-lg italic mb-6">"{memory.note}"</p>
        <div className="flex gap-2 mb-8">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {memory.mood}
          </span>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-bold mb-4">Past Reflections</h3>
          {reflections?.map((ref: any) => (
            <div key={ref.id} className="mb-4 bg-white dark:bg-gray-900 p-4 rounded-lg">
              <p>{ref.body}</p>
              <span className="text-xs text-gray-400">{new Date(ref.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>

        <form action={async (formData) => {
          "use server";
          const { addReflection } = await import("../actions/today");
          await addReflection(memory.id, formData.get("body") as string);
        }} className="mt-6 flex flex-col gap-4">
          <textarea name="body" className="border p-3 rounded w-full text-black" placeholder="Add a new reflection today..." required />
          <button type="submit" className="bg-blue-600 text-white p-3 rounded font-bold">Save Reflection</button>
        </form>
      </div>
    </div>
  );
}
