"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import { BarChart3, Star, Heart, Activity } from "lucide-react";
import toast from "react-hot-toast";

interface MangaItem {
  id: string;
  title: string;
  cover: string;
  count: number;
}

interface RatingItem {
  score: number;
  count: number;
}

interface EngagementItem {
  date: string;
  bookmarks: number;
  reads: number;
  views: number;
}

interface AnalyticsData {
  topBookmarkedManga: MangaItem[];
  topReadManga: MangaItem[];
  ratingsChart: RatingItem[];
  dailyEngagement: EngagementItem[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to fetch statistics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load analytics metrics");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-loading-grid">
        <style jsx>{`
          .analytics-loading-grid {
            display: flex;
            flex-direction: column;
            gap: 32px;
          }
          .skeleton-chart-half {
            height: 380px;
            border-radius: var(--radius-lg);
          }
          .half-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 24px;
          }
          @media (max-width: 640px) {
            .half-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
        <div className="skeleton skeleton-chart-half" />
        <div className="half-grid">
          <div className="skeleton skeleton-chart-half" />
          <div className="skeleton skeleton-chart-half" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card glass-strong" style={{ padding: 40, textAlign: "center", borderColor: "var(--error)" }}>
        <h2 style={{ color: "var(--error)", marginBottom: 12 }}>Analytics Unavailable</h2>
        <p className="gradient-text">Unable to load visualization dashboards. Please retry.</p>
      </div>
    );
  }

  const { topBookmarkedManga, ratingsChart, dailyEngagement } = data;

  // Process data for the calendar heatmap
  // react-calendar-heatmap needs values array of { date: 'YYYY-MM-DD', count: number }
  const heatmapValues = dailyEngagement.map((day) => ({
    date: day.date,
    count: day.bookmarks + day.reads + day.views,
  }));

  // Define date range for heatmap (last 30 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  // Ratings histogram colors (from purple to pink)
  const ratingsColors = [
    "#7c3aed",
    "#8b5cf6",
    "#a78bfa",
    "#c084fc",
    "#d946ef",
    "#f472b6",
    "#f050a8",
    "#e91e8c",
    "#be185d",
    "#9d174d",
  ];

  return (
    <div className="analytics-page-wrapper animate-fade-in">
      <style jsx global>{`
        /* Heatmap Styles */
        .react-calendar-heatmap {
          font-family: inherit;
        }
        .react-calendar-heatmap text {
          fill: var(--text-muted);
          font-size: 8px;
        }
        .react-calendar-heatmap rect {
          rx: 3px;
          ry: 3px;
          transition: fill 0.2s ease;
        }
        .react-calendar-heatmap .color-empty {
          fill: var(--bg-secondary);
        }
        .react-calendar-heatmap .color-scale-0 { fill: var(--bg-secondary); }
        .react-calendar-heatmap .color-scale-1 { fill: rgba(124, 58, 237, 0.2); }
        .react-calendar-heatmap .color-scale-2 { fill: rgba(124, 58, 237, 0.45); }
        .react-calendar-heatmap .color-scale-3 { fill: rgba(233, 30, 140, 0.65); }
        .react-calendar-heatmap .color-scale-4 { fill: var(--accent-pink-light); }
      `}</style>
      <style jsx>{`
        .analytics-page-wrapper {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .analytics-title h1 {
          font-size: 28px;
          margin-bottom: 4px;
        }
        .analytics-subtitle {
          color: var(--text-muted);
          font-size: 14px;
        }
        .chart-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }
        .analytics-card {
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
        .chart-box {
          height: 320px;
          width: 100%;
        }
        .heatmap-box {
          padding: 10px 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .heatmap-legend {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 8px;
        }
        .legend-square {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }
        @media (max-width: 640px) {
          .chart-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header */}
      <div className="analytics-title">
        <h1>Deep-dive Analytics</h1>
        <div className="analytics-subtitle">Visual and statistical trends of user actions and favorites.</div>
      </div>

      {/* Heatmap Section */}
      <div className="card analytics-card">
        <div className="card-header">
          <Activity size={20} color="var(--accent-purple-light)" />
          <h2>Daily Activity Heatmap (Last 30 Days)</h2>
        </div>
        <div className="heatmap-box">
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={heatmapValues}
            classForValue={(value) => {
              if (!value || value.count === 0) return "color-empty";
              if (value.count < 5) return "color-scale-1";
              if (value.count < 15) return "color-scale-2";
              if (value.count < 30) return "color-scale-3";
              return "color-scale-4";
            }}
            titleForValue={(value) => {
              if (!value || !value.date) return "No activity";
              return `${value.date}: ${value.count} actions`;
            }}
            showWeekdayLabels
          />
          <div className="heatmap-legend">
            <span>Less</span>
            <div className="legend-square" style={{ backgroundColor: "var(--bg-secondary)" }} />
            <div className="legend-square" style={{ backgroundColor: "rgba(124, 58, 237, 0.2)" }} />
            <div className="legend-square" style={{ backgroundColor: "rgba(124, 58, 237, 0.45)" }} />
            <div className="legend-square" style={{ backgroundColor: "rgba(233, 30, 140, 0.65)" }} />
            <div className="legend-square" style={{ backgroundColor: "var(--accent-pink-light)" }} />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="chart-grid">
        {/* Top Bookmarks */}
        <div className="card analytics-card">
          <div className="card-header">
            <Heart size={20} color="var(--accent-pink)" />
            <h2>Top Bookmarked Manga</h2>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topBookmarkedManga.slice(0, 8)}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis
                  dataKey="title"
                  type="category"
                  stroke="var(--text-secondary)"
                  fontSize={11}
                  tickLine={false}
                  width={90}
                  tickFormatter={(val) => (val.length > 12 ? `${val.slice(0, 10)}…` : val)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-strong" style={{ padding: "8px 12px", borderRadius: "8px", fontSize: 13 }}>
                          <strong>{payload[0].payload.title}</strong>
                          <div style={{ color: "var(--accent-pink-light)", marginTop: 4 }}>
                            Bookmarks: <strong>{payload[0].value}</strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="url(#bookmarksGrad)" radius={[0, 4, 4, 0]}>
                  {topBookmarkedManga.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? "var(--accent-pink)" : "var(--accent-purple)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ratings Histogram */}
        <div className="card analytics-card">
          <div className="card-header">
            <Star size={20} color="#fbbf24" />
            <h2>Ratings Distribution</h2>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingsChart} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="score" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-strong" style={{ padding: "8px 12px", borderRadius: "8px", fontSize: 13 }}>
                          Score: <strong>{payload[0].payload.score} / 10</strong>
                          <div style={{ color: "#fbbf24", marginTop: 4 }}>
                            Ratings: <strong>{payload[0].value}</strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {ratingsChart.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={ratingsColors[index % ratingsColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
