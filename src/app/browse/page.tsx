import { searchManga } from "@/lib/api/mangadex";
import { MangaCard } from "@/components/catalog/MangaCard";
import { FilterPanel } from "@/components/catalog/FilterPanel";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Browse Manga, Manhwa & Manhua",
  description: "Browse thousands of manga, manhwa, and manhua titles. Filter by genre, status, and type.",
};

interface BrowsePageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
    tags?: string;
    demographic?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}

const SORT_OPTIONS: Record<string, Record<string, "asc" | "desc">> = {
  latest: { updatedAt: "desc" },
  popular: { followedCount: "desc" },
  rating: { rating: "desc" },
  title: { title: "asc" },
  new: { createdAt: "desc" },
};

const ITEMS_PER_PAGE = 24;

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1"));
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const order = SORT_OPTIONS[sp.sort ?? "latest"] ?? SORT_OPTIONS.latest;
  const statusFilter = sp.status ? sp.status.split(",") : [];
  const tagsFilter = sp.tags ? sp.tags.split(",") : [];
  const demographicFilter = sp.demographic ? sp.demographic.split(",") : [];
  const ratingFilter = sp.rating ? sp.rating.split(",") : ["safe", "suggestive"];

  let result;
  try {
    result = await searchManga({
      title: sp.q,
      limit: ITEMS_PER_PAGE,
      offset,
      status: statusFilter.length ? statusFilter : undefined,
      order,
      contentRating: ratingFilter,
      includedTags: tagsFilter.length ? tagsFilter : undefined,
      publicationDemographic: demographicFilter.length ? demographicFilter : undefined,
    });
  } catch (err) {
    console.error("Browse API Error:", err);
    result = { data: [], total: 0 };
  }

  const totalPages = Math.ceil(result.total / ITEMS_PER_PAGE);

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q: sp.q, status: sp.status, tags: sp.tags, demographic: sp.demographic, rating: sp.rating, sort: sp.sort, ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    return `/browse?${params.toString()}`;
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: "clamp(20px,4vw,36px)", marginBottom: "8px" }}>
        {sp.q ? `Results for "${sp.q}"` : "Browse"}
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "32px" }}>
        {result.total.toLocaleString()} titles found
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "32px", alignItems: "start" }}
        className="browse-layout">
        {/* Sidebar filters */}
        <FilterPanel />

        {/* Grid */}
        <div>
          <div className="manga-grid" style={{ marginBottom: "40px" }}>
            {result.data.map((m) => <MangaCard key={m.id} manga={m} />)}
            {result.data.length === 0 && (
              <div style={{
                gridColumn: "1/-1",
                textAlign: "center",
                padding: "80px 24px",
                color: "var(--text-muted)",
              }}>
                <p style={{ fontSize: "48px", marginBottom: "16px" }}>📚</p>
                <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                  No results found
                </p>
                <p>Try a different search or filter</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}>
              {page > 1 && (
                <Link href={buildUrl({ page: String(page - 1) })} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                  <ChevronLeft size={14} /> Prev
                </Link>
              )}

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <Link
                    key={p}
                    href={buildUrl({ page: String(p) })}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 600,
                      textDecoration: "none",
                      background: p === page ? "var(--gradient-main)" : "var(--bg-elevated)",
                      color: p === page ? "white" : "var(--text-secondary)",
                      border: p === page ? "none" : "1px solid var(--border-default)",
                    }}
                  >
                    {p}
                  </Link>
                );
              })}

              {page < totalPages && (
                <Link href={buildUrl({ page: String(page + 1) })} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                  Next <ChevronRight size={14} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .browse-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
