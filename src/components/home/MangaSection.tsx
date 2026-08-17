"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MangaCard, MangaCardSkeleton } from "@/components/catalog/MangaCard";
import type { MangaItem } from "@/lib/api/mangadex";

interface MangaSectionProps {
  title: string;
  subtitle?: string;
  manga: MangaItem[];
  viewAllHref?: string;
  isLoading?: boolean;
}

export function MangaSection({ title, subtitle, manga, viewAllHref, isLoading }: MangaSectionProps) {
  return (
    <section style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px 60px" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: "28px",
        gap: "16px",
      }}>
        <div>
          <h2 style={{
            fontSize: "clamp(18px,3vw,26px)",
            color: "var(--text-primary)",
            marginBottom: "4px",
          }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{subtitle}</p>
          )}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "var(--accent-pink-light)",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              flexShrink: 0,
              transition: "gap 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.gap = "8px")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.gap = "4px")}
          >
            View All <ChevronRight size={14} />
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="manga-grid">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <MangaCardSkeleton key={i} />)
          : manga.map((m) => <MangaCard key={m.id} manga={m} />)
        }
      </div>
    </section>
  );
}
