import { HttpResponse, http } from "msw";

export const verseFixture = {
  verse: {
    verse_key: "2:286",
    text_uthmani:
      "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translations: [
      {
        id: 20,
        resource_id: 20,
        text: "Allah does not burden a soul beyond that it can bear.",
      },
    ],
  },
};

export const tafsirFixture = {
  tafsir: {
    id: 169,
    resource_id: 169,
    text: "A test tafsir response.",
  },
};

export const handlers = [
  http.get("https://api.quran.com/api/v4/verses/by_key/:verseKey", () =>
    HttpResponse.json(verseFixture)
  ),
  http.get("https://api.quran.com/api/v4/tafsirs/:tafsirId/by_ayah/:verseKey", () =>
    HttpResponse.json(tafsirFixture)
  ),
];
