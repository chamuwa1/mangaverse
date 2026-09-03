import { getMangaById, getMangaFeed, getCoverUrl, getMangaTitle, getMangaDescription, getMangaAuthor } from "@/lib/api/mangadex";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, User, Calendar, BookMarked, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { BookmarkButton } from "@/components/catalog/BookmarkButton";

interface MangaPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MangaPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data: manga } = await getMangaById(id);
    const title = getMangaTitle(manga);
    return {
      title,
      description: getMangaDescription(manga).slice(0, 155),
    };
  } catch {
    return { title: "Manga Not Found" };
  }
}

export const revalidate = 7200;

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  ongoing:   { label: "Ongoing",   class: "badge-ongoing" },
  completed: { label: "Completed", class: "badge-completed" },
  hiatus:    { label: "Hiatus",    class: "badge-hiatus" },
  cancelled: { label: "Cancelled", class: "badge-hiatus" },
};

export default async function MangaPage({ params }: MangaPageProps) {
  const { id } = await params;

  let manga, chapters;
  try {
    [{ data: manga }, { data: chapters }] = await Promise.all([
      getMangaById(id),
      getMangaFeed(id, { limit: 100 }),
    ]);
  } catch {
    notFound();
  }

  const title = getMangaTitle(manga);
  const description = getMangaDescription(manga);
  const author = getMangaAuthor(manga);
  const coverUrl = getCoverUrl(manga, "512");
  const status = manga.attributes.status;
  const statusInfo = STATUS_MAP[status] ?? { label: status, class: "badge-hiatus" };
  const genres = manga.attributes.tags.filter((t) => t.attributes.group === "genre");
  const themes = manga.attributes.tags.filter((t) => t.attributes.group === "theme").slice(0, 6);

  const sortedChapters = [...(chapters ?? [])].sort((a, b) => {
    const na = parseFloat(a.attributes.chapter ?? "0");
    const nb = parseFloat(b.attributes.chapter ?? "0");
    return nb - na; // Latest first
  });

  const latestChapter = sortedChapters[0];
  const firstChapter = sortedChapters[sortedChapters.length - 1];

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px 80px" }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
        <Link href="/" style={{ textDecoration: "none", color: "var(--text-muted)" }}>Home</Link>
        <ChevronRight size={14} />
        <Link href="/browse" style={{ textDecoration: "none", color: "var(--text-muted)" }}>Browse</Link>
        <ChevronRight size={14} />
        <span style={{ color: "var(--text-secondary)" }}>{title}</span>
      </nav>

      {/* Main content */}
      <div className="manga-detail-layout">

        {/* Left: Cover */}
        <div className="manga-cover-col">
          <div style={{
            borderRadius: "20px",
            overflow: "hidden",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-card)",
            marginBottom: "16px",
          }}>
            <div style={{ position: "relative", aspectRatio: "2/3" }}>
              <Image
                src={coverUrl}
                alt={title}
                fill
                priority
                unoptimized={true}
                referrerPolicy="no-referrer"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {firstChapter && (
              <Link
                href={`/manga/${id}/chapter/${firstChapter.id}`}
                className="btn-primary"
                style={{ justifyContent: "center", padding: "12px" }}
              >
                <BookOpen size={16} /> Read First Chapter
              </Link>
            )}
            {latestChapter && latestChapter.id !== firstChapter?.id && (
              <Link
                href={`/manga/${id}/chapter/${latestChapter.id}`}
                className="btn-secondary"
                style={{ justifyContent: "center", padding: "12px" }}
              >
                <BookOpen size={16} /> Latest Chapter
              </Link>
            )}
            <BookmarkButton mangaId={id} mangaTitle={title} coverUrl={coverUrl} />
          </div>
        </div>

        {/* Right: Info */}
        <div>
          <h1 style={{ fontSize: "clamp(22px,4vw,40px)", marginBottom: "12px", lineHeight: 1.2 }}>
            {title}
          </h1>

          {/* Meta row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
            <span className={statusInfo.class} style={{ padding: "4px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}>
              {statusInfo.label}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-muted)", fontSize: "13px" }}>
              <User size={13} /> {author}
            </span>
            {manga.attributes.year && (
              <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-muted)", fontSize: "13px" }}>
                <Calendar size={13} /> {manga.attributes.year}
              </span>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-muted)", fontSize: "13px" }}>
              <BookMarked size={13} /> {sortedChapters.length} chapters
            </span>
          </div>

          {/* Genres */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
            {genres.map((tag) => (
              <Link
                key={tag.id}
                href={`/genre/${(tag.attributes.name.en ?? "").toLowerCase()}`}
                style={{ textDecoration: "none" }}
              >
                <span className="genre-tag">
                  {tag.attributes.name.en ?? Object.values(tag.attributes.name)[0]}
                </span>
              </Link>
            ))}
            {themes.map((tag) => (
              <span key={tag.id} className="genre-tag" style={{ opacity: 0.7 }}>
                {tag.attributes.name.en ?? Object.values(tag.attributes.name)[0]}
              </span>
            ))}
          </div>

          {/* Description */}
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "36px",
          }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px", color: "var(--text-secondary)" }}>
              Synopsis
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.8" }}>
              {description}
            </p>
          </div>

          {/* Chapter list */}
          <div>
            <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>
              Chapters ({sortedChapters.length})
            </h2>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              maxHeight: "480px",
              overflowY: "auto",
              paddingRight: "8px",
            }}>
              {sortedChapters.length === 0 ? (
                <div style={{ padding: "32px 16px", textAlign: "center", background: "var(--bg-elevated)", borderRadius: "12px", border: "1px dashed var(--border-subtle)" }}>
                  <span style={{ fontSize: "24px", marginBottom: "8px", display: "block" }}>📭</span>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>No English chapters available yet.</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>Check back later for updates.</p>
                </div>
              ) : (
                sortedChapters.map((chapter) => {
                  const scanlator = chapter.relationships.find((r) => r.type === "scanlation_group");
                  return (
                    <Link
                      key={chapter.id}
                      href={`/manga/${id}/chapter/${chapter.id}`}
                      id={`chapter-${chapter.id}`}
                      className="chapter-link"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        textDecoration: "none",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                        transition: "all 0.15s",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{
                          minWidth: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          background: "var(--gradient-main)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "white",
                          flexShrink: 0,
                        }}>
                          {chapter.attributes.chapter ?? "?"}
                        </span>
                        <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>
                          {chapter.attributes.title || `Chapter ${chapter.attributes.chapter ?? "?"}`}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                        {scanlator?.attributes?.name && (
                          <span style={{ fontSize: "11px", color: "var(--text-disabled)", display: "none" }}
                            className="chapter-group">
                            {scanlator.attributes.name}
                          </span>
                        )}
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {new Date(chapter.attributes.publishAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <ChevronRight size={14} color="var(--text-disabled)" />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .chapter-link:hover {
          border-color: var(--border-accent) !important;
          background: var(--bg-hover) !important;
        }
        @media (min-width: 480px) {
          .chapter-group { display: block !important; }
        }
      `}</style>
    </div>
  );
}
