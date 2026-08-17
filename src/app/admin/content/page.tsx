"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FileText, Heart, BookOpen, Layers } from "lucide-react";
import toast from "react-hot-toast";

interface PageViewStats {
  path: string;
  count: number;
}

interface MangaItem {
  id: string;
  title: string;
  cover: string;
  count: number;
}

interface ContentStats {
  topPages: PageViewStats[];
  topBookmarkedManga: MangaItem[];
  topReadManga: MangaItem[];
}

export default function ContentPage() {
  const [data, setData] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"bookmarks" | "reads">("bookmarks");

  useEffect(() => {
    async function fetchContentStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to load content stats");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load content metrics");
      } finally {
        setLoading(false);
      }
    }
    fetchContentStats();
  }, []);

  if (loading) {
    return (
      <div className="content-loading-wrapper">
        <style jsx>{`
          .content-loading-wrapper {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 24px;
          }
          .skeleton-block {
            height: 500px;
            border-radius: var(--radius-lg);
          }
          @media (max-width: 1024px) {
            .content-loading-wrapper {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
        <div className="skeleton skeleton-block" />
        <div className="skeleton skeleton-block" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card glass-strong" style={{ padding: 40, textAlign: "center", borderColor: "var(--error)" }}>
        <h2 style={{ color: "var(--error)", marginBottom: 12 }}>Content Metrics Unavailable</h2>
        <p className="gradient-text">Unable to load application content statistics.</p>
      </div>
    );
  }

  const { topPages, topBookmarkedManga, topReadManga } = data;
  const activeMangaList = tab === "bookmarks" ? topBookmarkedManga : topReadManga;

  return (
    <div className="content-page-wrapper animate-fade-in">
      <style jsx>{`
        .content-page-wrapper {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .content-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .content-title h1 {
          font-size: 28px;
          margin-bottom: 4px;
        }
        .content-subtitle {
          color: var(--text-muted);
          font-size: 14px;
        }
        .content-layout {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 24px;
          align-items: start;
        }
        .ranking-card {
          padding: 32px;
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .header-title-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .card-header h2 {
          font-size: 20px;
        }
        .tab-btn-group {
          display: flex;
          background: var(--bg-elevated);
          padding: 4px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          background: none;
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-btn:hover {
          color: var(--text-primary);
        }
        .tab-btn.active {
          background: var(--gradient-main);
          color: white;
          box-shadow: var(--shadow-glow-pink);
        }
        .manga-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 16px;
        }
        .manga-tile {
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
          text-decoration: none;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          transition: all 0.25s ease;
        }
        .manga-tile:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .cover-box {
          position: relative;
          aspect-ratio: 2 / 3;
          width: 100%;
          overflow: hidden;
          background: var(--bg-elevated);
        }
        .cover-img {
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .manga-tile:hover .cover-img {
          transform: scale(1.05);
        }
        .badge-count {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(13, 15, 20, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border-default);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .tile-details {
          padding: 8px 12px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .manga-title-text {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        }
        .pages-card {
          padding: 32px;
        }
        .pages-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .page-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          font-size: 13px;
          transition: border-color 0.2s;
        }
        .page-item:hover {
          border-color: var(--border-default);
        }
        .page-path {
          font-family: monospace;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 70%;
        }
        .page-views-badge {
          background: rgba(233, 30, 140, 0.1);
          color: var(--accent-pink-light);
          border: 1px solid rgba(233, 30, 140, 0.2);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-size: 11px;
        }
        .empty-manga-state {
          grid-column: 1 / -1;
          padding: 48px;
          text-align: center;
          color: var(--text-muted);
        }

        @media (max-width: 1024px) {
          .content-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header */}
      <div className="content-header">
        <div className="content-title">
          <h1>Content Rankings</h1>
          <div className="content-subtitle">Performance breakdown of catalog pages and individual title demand.</div>
        </div>
      </div>

      {/* Content Layout Grid */}
      <div className="content-layout">
        {/* Manga Ranking Column */}
        <div className="card ranking-card">
          <div className="card-header">
            <div className="header-title-box">
              <Layers size={20} color="var(--accent-pink)" />
              <h2>Catalog Standings</h2>
            </div>
            <div className="tab-btn-group">
              <button
                className={`tab-btn ${tab === "bookmarks" ? "active" : ""}`}
                onClick={() => setTab("bookmarks")}
              >
                <Heart size={12} fill={tab === "bookmarks" ? "currentColor" : "none"} /> Bookmarked
              </button>
              <button
                className={`tab-btn ${tab === "reads" ? "active" : ""}`}
                onClick={() => setTab("reads")}
              >
                <BookOpen size={12} /> Read Count
              </button>
            </div>
          </div>

          <div className="manga-grid">
            {activeMangaList.length > 0 ? (
              activeMangaList.map((manga) => (
                <a
                  key={manga.id}
                  href={`/manga/${manga.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="manga-tile"
                >
                  <div className="cover-box">
                    <Image
                      src={manga.cover || "/placeholder.jpg"}
                      alt={manga.title}
                      fill
                      sizes="150px"
                      className="cover-img"
                    />
                    <div className="badge-count">
                      {tab === "bookmarks" ? <Heart size={10} fill="currentColor" /> : <BookOpen size={10} />}
                      {manga.count}
                    </div>
                  </div>
                  <div className="tile-details">
                    <div className="manga-title-text" title={manga.title}>
                      {manga.title}
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="empty-manga-state">No manga statistics recorded yet.</div>
            )}
          </div>
        </div>

        {/* Page Views Column */}
        <div className="card pages-card">
          <div className="card-header">
            <div className="header-title-box">
              <FileText size={20} color="var(--accent-purple-light)" />
              <h2>Top Visited Pages</h2>
            </div>
          </div>
          <div className="pages-list">
            {topPages.length > 0 ? (
              topPages.map((page, idx) => (
                <div key={idx} className="page-item">
                  <span className="page-path" title={page.path}>
                    {page.path}
                  </span>
                  <span className="page-views-badge">{page.count} views</span>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: "24px 0", textAlign: "center", color: "var(--text-muted)" }}>
                No page view records yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
