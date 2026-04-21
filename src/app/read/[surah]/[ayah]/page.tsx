import { fetchVerse } from "@/lib/quran";
import Link from "next/link";

export default async function ReadPage({ params }: { params: Promise<{ surah: string; ayah: string }> }) {
  const { surah, ayah } = await params;
  
  // In a real app, we'd handle errors and loading states
  const data = await fetchVerse(parseInt(surah), parseInt(ayah));
  const verse = data.verse;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Surah {surah}, Ayah {ayah}</h1>
        <Link href={`/capture?surah=${surah}&ayah=${ayah}`} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md hover:bg-blue-700">
          Save this moment
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border">
        <p className="text-4xl text-right leading-[3rem] mb-8 font-arabic" dir="rtl">
          {verse.text_uthmani}
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          {verse.translations?.[0]?.text || "Translation not available."}
        </p>
        <div className="mt-8 pt-6 border-t flex justify-between items-center">
          <span className="text-sm text-gray-500">Sahih International</span>
          <button className="text-blue-600 font-semibold text-sm hover:underline">Read Tafsir</button>
        </div>
      </div>
    </div>
  );
}
