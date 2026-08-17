import { getPopularManga } from "@/lib/api/mangadex";
import { MangaCard } from "@/components/catalog/MangaCard";
import type { Metadata } from "next";

interface GenrePageProps {
  params: Promise<{ genre: string }>;
}



import { searchManga } from "@/lib/api/mangadex";

// MangaDex tag IDs for common genres
const GENRE_TAGS: Record<string, string> = {
  action:       "391b0423-d847-456f-aff0-8b0cfc03066b",
  romance:      "423e2eae-a7a2-4a8b-ac03-a8351462d71d",
  fantasy:      "cdc58593-87dd-415e-bbc0-2ec27bf404cc",
  comedy:       "4d32cc48-9f00-4cca-9b5a-a839f0764984",
  horror:       "cdad7e68-1419-41dd-bdce-27753074a640",
  mystery:      "ee968100-4191-4968-93d3-f5d17663e6da",
  drama:        "b9af3a63-f058-46de-a9a0-e0c13906197a",
  adventure:    "87cc87cd-a395-47af-b27a-93258283bbc6",
  supernatural: "eabc5b4c-d38e-4e8b-bef9-2585c68d1e28",
  sports:       "69964a64-2f90-4d33-beeb-f3ed2875eb4c",
  "sci-fi":     "256c8bd9-4904-4360-bf4f-508a76d67183",
  isekai:       "ace04997-f6bd-436e-b261-779182193d3d",
};

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { genre } = await params;
  const label = genre.charAt(0).toUpperCase() + genre.slice(1);
  return {
    title: `${label} Manga — MangaVerse`,
    description: `Read the best ${label} manga, manhwa and manhua online free.`,
  };
}

export const revalidate = 7200;

export default async function GenrePage({ params }: GenrePageProps) {
  const { genre } = await params;
  const label = genre.charAt(0).toUpperCase() + genre.slice(1);
  const tagId = GENRE_TAGS[genre.toLowerCase()];

  let result;
  try {
    if (tagId) {
      result = await searchManga({
        includedTags: [tagId],
        limit: 36,
        order: { followedCount: "desc" },
      });
    } else {
      result = await searchManga({
        limit: 36,
        order: { followedCount: "desc" },
      });
    }
  } catch {
    result = { data: [] };
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px 80px" }}>
      <div style={{
        marginBottom: "40px",
        padding: "32px",
        borderRadius: "20px",
        background: "var(--gradient-glow)",
        border: "1px solid var(--border-accent)",
      }}>
        <h1 style={{ fontSize: "clamp(24px,5vw,48px)", marginBottom: "8px" }}>
          {label} Manga
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
          The best {label.toLowerCase()} manga, manhwa and manhua — updated daily.
        </p>
      </div>

      <div className="manga-grid">
        {result.data.map((m) => <MangaCard key={m.id} manga={m} />)}
      </div>
    </div>
  );
}
