// Placeholder for Quran MCP client
// In a real app, this would connect to the MCP server to perform semantic search
export async function semanticSearchVerses(query: string) {
  console.log("Semantic search via Quran MCP:", query);
  // Returns mock data for now
  return [
    { surah: 2, ayah: 286, text: "Allah does not burden a soul beyond that it can bear..." }
  ];
}
