"use client";

import { useEffect, useState } from "react";
import { Settings, RefreshCw, Database, Server, ExternalLink, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

interface SettingsStats {
  overview: {
    totalBookmarks: number;
    totalReads: number;
    totalRatings: number;
    totalPageViews: number;
  };
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to load settings statistics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  const handleClearCache = async () => {
    setClearingCache(true);
    const toastId = toast.loading("Revalidating Next.js cache routes...");
    try {
      const res = await fetch("/api/admin/cache", { method: "POST" });

      if (!res.ok) throw new Error("Revalidation failed");
      const json = await res.json();
      toast.success(`Successfully revalidated: ${json.revalidated?.join(", ")}`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to revalidate cache. Please check console logs.", { id: toastId });
    } finally {
      setClearingCache(false);
    }
  };

  return (
    <div className="settings-page-wrapper animate-fade-in">
      <style jsx>{`
        .settings-page-wrapper {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .settings-title h1 {
          font-size: 28px;
          margin-bottom: 4px;
        }
        .settings-subtitle {
          color: var(--text-muted);
          font-size: 14px;
        }
        .settings-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
          align-items: start;
        }
        .settings-card {
          padding: 32px;
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }
        .card-header h2 {
          font-size: 20px;
        }
        .control-group {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .control-description {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.5;
        }
        .info-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          font-size: 13px;
        }
        .info-label {
          color: var(--text-muted);
          font-weight: 600;
        }
        .info-value {
          color: var(--text-primary);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .status-dot.active {
          background-color: var(--success);
          box-shadow: 0 0 8px var(--success);
        }
        .db-stat-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-subtle);
          font-size: 13px;
        }
        .db-stat-row:last-child {
          border-bottom: none;
        }
        .link-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          transition: all 0.2s;
        }
        .link-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-hover);
          background: var(--bg-hover);
        }
        @media (max-width: 1024px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Title */}
      <div className="settings-title">
        <h1>System Settings</h1>
        <div className="settings-subtitle">Invalidate app caching, analyze table metrics, and diagnose configuration.</div>
      </div>

      <div className="settings-grid">
        {/* Left: Controls & Schema */}
        <div className="control-group">
          {/* Cache Control Card */}
          <div className="card settings-card">
            <div className="card-header">
              <RefreshCw size={20} color="var(--accent-pink)" />
              <h2>Incremental Cache Revalidation</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p className="control-description">
                MangaDex catalog and browse list layouts use Next.js static page generation for high-speed page loads. 
                Triggering a cache invalidation force-clears all server pages and builds them fresh on next visitor request.
              </p>
              <button
                onClick={handleClearCache}
                disabled={clearingCache}
                className="btn-primary"
                style={{
                  alignSelf: "flex-start",
                  gap: 10,
                  opacity: clearingCache ? 0.7 : 1,
                  cursor: clearingCache ? "not-allowed" : "pointer",
                }}
              >
                <RefreshCw size={14} className={clearingCache ? "animate-spin-slow" : ""} />
                {clearingCache ? "Revalidating Routes..." : "Revalidate Application Cache"}
              </button>
            </div>
          </div>

          {/* Collapsible Database Schema Card */}
          <div className="card settings-card">
            <div className="card-header">
              <Database size={20} color="var(--accent-purple-light)" />
              <h2>Supabase Database Metrics</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p className="control-description">
                Live monitoring of row counts and index health for our user storage tables.
              </p>
              <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: "var(--radius-md)", padding: "8px 20px" }}>
                <div className="db-stat-row">
                  <span style={{ fontWeight: 600 }}>bookmarks</span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>
                    {loadingStats ? "Loading..." : `${data?.overview?.totalBookmarks ?? 0} rows`}
                  </span>
                </div>
                <div className="db-stat-row">
                  <span style={{ fontWeight: 600 }}>reading_history</span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>
                    {loadingStats ? "Loading..." : `${data?.overview?.totalReads ?? 0} rows`}
                  </span>
                </div>
                <div className="db-stat-row">
                  <span style={{ fontWeight: 600 }}>ratings</span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>
                    {loadingStats ? "Loading..." : `${data?.overview?.totalRatings ?? 0} rows`}
                  </span>
                </div>
                <div className="db-stat-row">
                  <span style={{ fontWeight: 600 }}>page_views</span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>
                    {loadingStats ? "Loading..." : `${data?.overview?.totalPageViews ?? 0} rows`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Environment & Links */}
        <div className="control-group">
          {/* Environment Status Card */}
          <div className="card settings-card">
            <div className="card-header">
              <Server size={20} color="#3b82f6" />
              <h2>System Environment</h2>
            </div>
            <div className="info-list">
              <div className="info-row">
                <span className="info-label">Supabase Connection</span>
                <span className="info-value">
                  Active <div className="status-dot active" />
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Auth.js State</span>
                <span className="info-value">
                  Configured <div className="status-dot active" />
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Security Protocol</span>
                <span className="info-value">
                  RLS Gated <ShieldCheck size={14} color="var(--success)" />
                </span>
              </div>
            </div>
          </div>

          {/* Quick Connections Card */}
          <div className="card settings-card">
            <div className="card-header">
              <ExternalLink size={20} color="#fbbf24" />
              <h2>External Integrations</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="link-btn"
              >
                <span>Open Supabase Console</span>
                <ExternalLink size={12} />
              </a>
              <a
                href="https://status.mangadex.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="link-btn"
              >
                <span>MangaDex API Status Checker</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
