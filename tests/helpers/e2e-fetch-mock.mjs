const originalFetch = globalThis.fetch;

globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  if (url.startsWith("https://api.quran.com/api/v4/verses/by_key/2:286")) {
    return Response.json({
      verse: {
        verse_key: "2:286",
        text_uthmani: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
        translations: [
          {
            id: 20,
            resource_id: 20,
            text: "Allah does not burden a soul beyond that it can bear.",
          },
        ],
      },
    });
  }

  return originalFetch(input, init);
};
