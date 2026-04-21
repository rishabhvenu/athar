"use client";

import { useState } from "react";
import { performSearch } from "../actions/search";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await performSearch(query);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Search Memories & Quran</h1>
      <form onSubmit={handleSearch} className="flex gap-4 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., verses about patience..."
          className="flex-1 border p-3 rounded-lg text-black"
          required
        />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {results.map((res: any, i) => (
          <div key={i} className="border p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-lg mb-2">Surah {res.surah}, Ayah {res.ayah}</h3>
            <p className="italic text-gray-700 dark:text-gray-300">"{res.text || res.note}"</p>
          </div>
        ))}
        {results.length === 0 && !loading && query && (
          <p className="text-gray-500">No results found.</p>
        )}
      </div>
    </div>
  );
}
