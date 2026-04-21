"use client";

import { useState } from "react";
import { saveMemory } from "../actions/capture";

const MOODS = ["calm", "anxious", "grateful", "grieving", "seeking", "joyful"];

export default function CapturePage() {
  const [surah, setSurah] = useState("2");
  const [ayah, setAyah] = useState("286");
  const [mood, setMood] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("surah", surah);
    formData.append("ayah", ayah);
    formData.append("mood", mood);
    formData.append("note", note);

    try {
      await saveMemory(formData);
      alert("Memory saved!");
      setNote("");
      setMood("");
    } catch (err) {
      console.error(err);
      alert("Failed to save memory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Capture a Moment</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex gap-4">
          <label className="flex flex-col">
            Surah
            <input type="number" value={surah} onChange={(e) => setSurah(e.target.value)} className="border p-2 rounded text-black" required />
          </label>
          <label className="flex flex-col">
            Ayah
            <input type="number" value={ayah} onChange={(e) => setAyah(e.target.value)} className="border p-2 rounded text-black" required />
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <span>Mood</span>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                className={`px-4 py-2 rounded-full border ${mood === m ? "bg-blue-500 text-white" : "bg-transparent"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-2">
          Reflection
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border p-2 rounded h-32 text-black"
            placeholder="What does this verse mean to you right now?"
          />
        </label>

        <button type="submit" disabled={loading} className="bg-blue-600 text-white p-3 rounded font-bold">
          {loading ? "Saving..." : "Save Memory"}
        </button>
      </form>
    </div>
  );
}
