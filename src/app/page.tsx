import { getTrendingManga } from "@/lib/api/anilist";
import { getLatestUpdates, getPopularManga } from "@/lib/api/mangadex";
import { HeroBanner } from "@/components/home/HeroBanner";
import { MangaSection } from "@/components/home/MangaSection";
import { GenreStrip } from "@/components/home/GenreStrip";
import { ContinueReading } from "@/components/home/ContinueReading";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MangaVerse — Read Manga, Manhua & Comics Free",
  description:
    "Discover and read manga, manhwa, manhua online for free. Trending titles, latest updates, and your personal library — all in one place.",
};

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Fetch data in parallel — server-side, no waterfall
  const [trendingData, latestData, popularData] = await Promise.allSettled([
    getTrendingManga(8),
    getLatestUpdates(18),
    getPopularManga(18),
  ]);

  const trendingManga =
    trendingData.status === "fulfilled"
      ? trendingData.value.Page.media
      : [];

  const latestManga =
    latestData.status === "fulfilled"
      ? latestData.value.data
      : [];

  const popularManga =
    popularData.status === "fulfilled"
      ? popularData.value.data
      : [];

  return (
    <div style={{ paddingBottom: "80px" }}>
      {/* Hero */}
      <HeroBanner featuredManga={trendingManga} />

      {/* Continue Reading */}
      <ContinueReading />

      {/* Genre Strip */}
      <GenreStrip />

      {/* Latest Updates */}
      <MangaSection
        title="Latest Updates"
        subtitle="Fresh chapters added today"
        manga={latestManga}
        viewAllHref="/browse?sort=latest"
      />

      {/* Popular */}
      <MangaSection
        title="Most Popular"
        subtitle="All-time fan favourites"
        manga={popularManga}
        viewAllHref="/browse?sort=popular"
      />

      {/* Trending (AniList) */}
      {trendingManga.length > 0 && (
        <section style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px 60px" }}>
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "clamp(20px,3vw,28px)", color: "var(--text-primary)", marginBottom: "6px" }}>
              🔥 Trending Now
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              What everyone is reading right now
            </p>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "20px",
          }}>
            {trendingManga.map((media) => {
              const title = media.title.english || media.title.romaji;
              return (
                <Link
                  key={media.id}
                  href={`/browse?q=${encodeURIComponent(title)}`}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div className="card" style={{ overflow: "hidden", cursor: "pointer", height: "100%" }}>
                    <div style={{ position: "relative", aspectRatio: "2/3", background: "var(--bg-elevated)" }}>
                      <img
                        src={media.coverImage.extraLarge || media.coverImage.large}
                        alt={title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        loading="lazy"
                      />
                      {media.averageScore && (
                        <div style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "rgba(0,0,0,0.75)",
                          backdropFilter: "blur(8px)",
                          borderRadius: "8px",
                          padding: "3px 8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#fbbf24",
                        }}>
                          ⭐ {(media.averageScore / 10).toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "12px" }}>
                      <p style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {title}
                      </p>
                      {media.genres[0] && (
                        <span className="genre-tag" style={{ marginTop: "6px", fontSize: "10px", padding: "2px 8px" }}>
                          {media.genres[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
