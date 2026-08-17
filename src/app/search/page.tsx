import { searchManga } from "@/lib/api/mangadex";
import { MangaCard } from "@/components/catalog/MangaCard";
import { Search } from "lucide-react";
import type { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: sp.q ? `Search: ${sp.q}` : "Search Manga",
    description: `Search results for "${sp.q}" on MangaVerse.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const query = sp.q ?? "";

  let results;
  try {
    results = query
      ? await searchManga({ title: query, limit: 30, contentRating: ["safe", "suggestive"] })
      : { data: [], total: 0 };
  } catch {
    results = { data: [], total: 0 };
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px 80px" }}>
      {/* Search header */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <Search size={24} color="var(--accent-pink)" />
          <h1 style={{ fontSize: "clamp(20px,4vw,32px)" }}>
            {query ? `Results for "${query}"` : "Search Manga"}
          </h1>
        </div>
        {query && (
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Found {results.total.toLocaleString()} titles
          </p>
        )}
      </div>

      {!query ? (
        <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "56px", marginBottom: "16px" }}>🔍</p>
          <p style={{ fontSize: "18px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "8px" }}>
            What are you looking for?
          </p>
          <p>Use the search bar in the navigation to find manga, manhwa, or manhua.</p>
        </div>
      ) : results.data.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "56px", marginBottom: "16px" }}>😢</p>
          <p style={{ fontSize: "18px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "8px" }}>
            No results for &ldquo;{query}&rdquo;
          </p>
          <p>Try a different title or check your spelling.</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "20px",
        }}>
          {results.data.map((m) => <MangaCard key={m.id} manga={m} />)}
        </div>
      )}
    </div>
  );
}
