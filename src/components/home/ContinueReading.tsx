"use client";

import Link from "next/link";
import { Play, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getRecentReadingHistoryAction } from "@/app/library/actions";

interface HistoryRow {
  manga_id: string;
  chapter_id: string;
  manga_title: string;
  cover_url: string;
  chapter_num: string;
  updated_at: string;
}

export function ContinueReading() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<HistoryRow[]>([]);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Delay setNow slightly to avoid React Compiler cascading renders warning
    const timer = setTimeout(() => setNow(Date.now()), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only fetch for logged-in users
    if (status !== "authenticated" || !session?.user?.id) return;

    getRecentReadingHistoryAction().then((data) => {
      if (data) setItems(data as HistoryRow[]);
    });
  }, [session, status]);

  if (status !== "authenticated" || items.length === 0) return null;

  const timeAgo = (iso: string) => {
    if (!now) return "";
    const diff = Math.floor((now - new Date(iso).getTime()) / 1000 / 60);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <section style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 24px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <Clock size={20} color="var(--accent-pink)" />
        <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Continue Reading</h2>
      </div>

      <div className="continue-carousel" style={{
        display: "flex",
        gap: "20px",
        overflowX: "auto",
        paddingBottom: "16px",
        scrollSnapType: "x mandatory",
      }}>
        {items.map((item) => (
          <div key={item.manga_id} style={{
            display: "flex",
            background: "var(--bg-elevated)",
            borderRadius: "16px",
            padding: "16px",
            gap: "16px",
            border: "1px solid var(--border-default)",
            alignItems: "center",
            minWidth: "300px",
            maxWidth: "360px",
            flex: "0 0 auto",
            boxShadow: "var(--shadow-card)",
            scrollSnapAlign: "start",
          }}>
            <div style={{
              width: "64px",
              height: "90px",
              borderRadius: "8px",
              overflow: "hidden",
              flexShrink: 0,
              border: "1px solid var(--border-subtle)",
            }}>
              <img
                src={item.cover_url || "/images/placeholder-cover.jpg"}
                alt={item.manga_title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: "15px",
                fontWeight: 700,
                marginBottom: "4px",
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {item.manga_title}
              </h3>
              <p style={{
                color: "var(--text-secondary)",
                fontSize: "13px",
                marginBottom: "8px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                Ch. {item.chapter_num}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {timeAgo(item.updated_at)}
                </div>

                <Link
                  href={`/manga/${item.manga_id}/chapter/${item.chapter_id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    background: "rgba(233,30,140,0.1)",
                    color: "var(--accent-pink-light)",
                    borderRadius: "8px",
                    fontWeight: 600,
                    textDecoration: "none"
                  }}
                >
                  <Play size={12} fill="currentColor" /> Resume
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .continue-carousel::-webkit-scrollbar {
          height: 6px;
        }
        .continue-carousel::-webkit-scrollbar-thumb {
          background: var(--border-subtle);
          border-radius: 4px;
        }
        .continue-carousel::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </section>
  );
}
