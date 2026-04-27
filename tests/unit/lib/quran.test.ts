import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { fetchTafsir, fetchVerse } from "@/lib/quran";
import { server } from "../../helpers/msw/server";

describe("quran API helpers", () => {
  it("fetches a verse with Quran.com caching options", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const data = await fetchVerse(2, 286);

    expect(data.verse.verse_key).toBe("2:286");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.quran.com/api/v4/verses/by_key/2:286?language=en&words=true&translations=20",
      { next: { revalidate: 86400 } }
    );
  });

  it("throws when the verse request fails", async () => {
    server.use(
      http.get("https://api.quran.com/api/v4/verses/by_key/:verseKey", () =>
        HttpResponse.json({ message: "nope" }, { status: 500 })
      )
    );

    await expect(fetchVerse(2, 286)).rejects.toThrow("Failed to fetch verse");
  });

  it("fetches tafsir with Quran.com caching options", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const data = await fetchTafsir(169, 2, 286);

    expect(data.tafsir.text).toBe("A test tafsir response.");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.quran.com/api/v4/tafsirs/169/by_ayah/2:286",
      { next: { revalidate: 86400 } }
    );
  });

  it("throws when the tafsir request fails", async () => {
    server.use(
      http.get("https://api.quran.com/api/v4/tafsirs/:tafsirId/by_ayah/:verseKey", () =>
        HttpResponse.json({ message: "nope" }, { status: 404 })
      )
    );

    await expect(fetchTafsir(169, 2, 286)).rejects.toThrow("Failed to fetch tafsir");
  });
});
