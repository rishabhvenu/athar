const BASE_URL = "https://api.quran.com/api/v4";

export async function fetchVerse(surah: number, ayah: number) {
  const res = await fetch(
    `${BASE_URL}/verses/by_key/${surah}:${ayah}?language=en&words=true&translations=20`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) throw new Error("Failed to fetch verse");
  return res.json();
}

export async function fetchTafsir(tafsirId: number, surah: number, ayah: number) {
  const res = await fetch(
    `${BASE_URL}/tafsirs/${tafsirId}/by_ayah/${surah}:${ayah}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) throw new Error("Failed to fetch tafsir");
  return res.json();
}
