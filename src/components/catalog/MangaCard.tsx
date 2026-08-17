"use client";

import Link from "next/link";
import Image from "next/image";

import type { MangaItem } from "@/lib/api/mangadex";
import { getCoverUrl, getMangaTitle } from "@/lib/api/mangadex";

interface MangaCardProps {
  manga: MangaItem;
  compact?: boolean;
}

const STATUS_CLASSES: Record<string, string> = {
  ongoing: "badge-ongoing",
  completed: "badge-completed",
  hiatus: "badge-hiatus",
  cancelled: "badge-hiatus",
};

export function MangaCard({ manga, compact = false }: MangaCardProps) {
  const title = getMangaTitle(manga);
  const coverUrl = `/api/images?url=${encodeURIComponent(getCoverUrl(manga, "512"))}`;
  const status = manga.attributes.status;
  const tags = manga.attributes.tags
    .filter((t) => t.attributes.group === "genre")
    .slice(0, 2);

  return (
    <Link
      href={`/manga/${manga.id}`}
      id={`manga-card-${manga.id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article className="card" style={{
        overflow: "hidden",
        cursor: "pointer",
        height: "100%",
      }}>
        {/* Cover */}
        <div style={{
          position: "relative",
          aspectRatio: "2/3",
          overflow: "hidden",
          background: "var(--bg-elevated)",
        }}>
          <Image
            src={coverUrl}
            alt={title}
            fill
            unoptimized={true}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="manga-card-image"
            style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
          />

          {/* Status badge */}
          <div style={{
            position: "absolute",
            top: "10px",
            left: "10px",
          }}>
            <span
              className={STATUS_CLASSES[status] ?? "badge-hiatus"}
              style={{
                padding: "3px 8px",
                borderRadius: "6px",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {status}
            </span>
          </div>

          {/* Gradient overlay */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background: "linear-gradient(to top, rgba(13,15,20,0.9), transparent)",
          }} />
        </div>

        {/* Info */}
        <div style={{ padding: compact ? "10px 12px" : "14px 16px" }}>
          <h3 style={{
            fontSize: compact ? "12px" : "13px",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: "1.3",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginBottom: "8px",
          }}>
            {title}
          </h3>

          {!compact && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {tags.map((tag) => (
                <span key={tag.id} className="genre-tag" style={{ fontSize: "10px", padding: "2px 8px" }}>
                  {tag.attributes.name.en ?? Object.values(tag.attributes.name)[0]}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

// Skeleton version
export function MangaCardSkeleton() {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "16px",
      overflow: "hidden",
    }}>
      <div className="skeleton" style={{ aspectRatio: "2/3" }} />
      <div style={{ padding: "14px 16px" }}>
        <div className="skeleton" style={{ height: "14px", marginBottom: "8px", borderRadius: "6px" }} />
        <div className="skeleton" style={{ height: "12px", width: "70%", borderRadius: "6px" }} />
      </div>
    </div>
  );
}
