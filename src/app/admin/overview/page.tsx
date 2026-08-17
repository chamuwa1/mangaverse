"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, Bookmark, BookOpen, Star, Eye, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface StatsData {
  overview: {
    uniqueUsers: number;
    totalBookmarks: number;
    totalReads: number;
    totalRatings: number;
    totalPageViews: number;
    avgRating: string;
  };
  dailyEngagement: Array<{
    date: string;
    bookmarks: number;
    reads: number;
    views: number;
  }>;
}

export default function OverviewPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="overview-loading-grid">
        <style jsx>{`
          .overview-loading-grid {
            display: flex;
            flex-direction: column;
            gap: 32px;
          }
          .skeleton-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          .skeleton-card {
            height: 120px;
            border-radius: var(--radius-lg);
          }
          .skeleton-chart-container {
            height: 400px;
            border-radius: var(--radius-lg);
          }
        `}</style>
        <div className="skeleton-cards">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
        <div className="skeleton skeleton-chart-container" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="error-fallback card glass-strong">
        <style jsx>{`
          .error-fallback {
            padding: 40px;
            text-align: center;
            border-color: var(--error);
          }
          .error-fallback h2 {
            color: var(--error);
            margin-bottom: 12px;
          }
        `}</style>
        <h2>Metrics Unavailable</h2>
        <p className="gradient-text">Unable to load application stats. Please try again later.</p>
      </div>
    );
  }

  const { overview, dailyEngagement } = data;

  const cards = [
    {
      title: "Unique Users",
      value: overview.uniqueUsers,
      icon: Users,
      color: "var(--accent-purple-light)",
      bg: "rgba(157, 92, 246, 0.08)",
    },
    {
      title: "Page Views",
      value: overview.totalPageViews,
      icon: Eye,
      color: "var(--accent-pink-light)",
      bg: "rgba(240, 80, 168, 0.08)",
    },
    {
      title: "Total Bookmarks",
      value: overview.totalBookmarks,
      icon: Bookmark,
      color: "#3b82f6",
      bg: "rgba(59, 130, 246, 0.08)",
    },
    {
      title: "Total Reads",
      value: overview.totalReads,
      icon: BookOpen,
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.08)",
    },
    {
      title: "Ratings Logged",
      value: overview.totalRatings,
      icon: Star,
      color: "#fbbf24",
      bg: "rgba(251, 191, 36, 0.08)",
    },
    {
      title: "Avg Rating",
      value: `${overview.avgRating} / 10`,
      icon: Star,
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.08)",
    },
  ];

  return (
    <div className="overview-page-wrapper animate-fade-in">
      <style jsx>{`
        .overview-page-wrapper {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .overview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .overview-title h1 {
          font-size: 28px;
          margin-bottom: 4px;
        }
        .overview-subtitle {
          color: var(--text-muted);
          font-size: 14px;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        .metric-card {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .metric-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .metric-details {
          display: flex;
          flex-direction: column;
        }
        .metric-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .metric-value {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 2px;
        }
        .chart-section {
          padding: 32px;
        }
        .chart-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }
        .chart-header h2 {
          font-size: 20px;
        }
        .chart-container {
          height: 380px;
          width: 100%;
        }
        .custom-tooltip {
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 13px;
          box-shadow: var(--shadow-card);
        }
        .tooltip-title {
          font-weight: 700;
          margin-bottom: 6px;
          color: var(--text-primary);
        }
        .tooltip-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
      `}</style>

      {/* Title Header */}
      <div className="overview-header">
        <div className="overview-title">
          <h1>Overview Dashboard</h1>
          <div className="overview-subtitle">Real-time reader engagement and analytics control.</div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="metrics-grid">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="card metric-card">
              <div
                className="metric-icon-box"
                style={{ backgroundColor: card.bg, color: card.color }}
              >
                <Icon size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-title">{card.title}</span>
                <span className="metric-value">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 30-Day Engagement Chart */}
      <div className="card chart-section">
        <div className="chart-header">
          <Calendar size={20} color="var(--accent-pink)" />
          <h2>30-Day Reader Engagement</h2>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyEngagement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-pink)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--accent-pink)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorReads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorBookmarks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                tickFormatter={(str) => {
                  const d = new Date(str);
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const date = new Date(label ?? "").toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                    return (
                      <div className="glass-strong custom-tooltip">
                        <div className="tooltip-title">{date}</div>
                        {payload.map((item, idx) => (
                          <div key={idx} className="tooltip-item">
                            <div className="dot" style={{ backgroundColor: item.color }} />
                            <span style={{ color: "var(--text-secondary)" }}>
                              {item.name}: <strong>{item.value}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(val) => <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{val}</span>}
              />
              <Area
                type="monotone"
                dataKey="views"
                name="Page Views"
                stroke="var(--accent-pink)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorViews)"
              />
              <Area
                type="monotone"
                dataKey="reads"
                name="Reads"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReads)"
              />
              <Area
                type="monotone"
                dataKey="bookmarks"
                name="Bookmarks"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBookmarks)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
