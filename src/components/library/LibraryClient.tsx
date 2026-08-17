"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { deleteBookmarkAction, deleteHistoryItemAction, clearAllHistoryAction } from "@/app/library/actions";
import { useSession } from "next-auth/react";

interface Bookmark {
  id: string;
  manga_id: string;
  manga_title: string;
  cover_url: string | null;
  added_at: string;
}

interface HistoryItem {
  id: string;
  manga_id: string;
  manga_title: string;
  cover_url: string | null;
  chapter_id: string;
  chapter_num: string | null;
  updated_at: string;
}

interface LibraryClientProps {
  bookmarks: Bookmark[];
  history: HistoryItem[];
  userName: string;
  userImage: string | null;
}

export function LibraryClient({ bookmarks: initial, history, userName, userImage }: LibraryClientProps) {
  const [bookmarks, setBookmarks] = useState(initial);
  const [historyItems, setHistoryItems] = useState(history);
  const [activeTab, setActiveTab] = useState<"bookmarks" | "history">("bookmarks");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { data: session } = useSession();

  const removeBookmark = async (mangaId: string, bookmarkId: string) => {
    if (!session?.user?.id) return;
    try {
      await deleteBookmarkAction(bookmarkId);
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      toast.success("Removed from library");
    } catch (error: any) {
      console.error("Delete bookmark error:", error);
      toast.error(`Failed to remove: ${error.message}`);
    }
  };

  const removeHistoryItem = async (e: React.MouseEvent, historyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user?.id) return;
    
    try {
      await deleteHistoryItemAction(historyId);
      setHistoryItems((prev) => prev.filter((h) => h.id !== historyId));
      toast.success("Removed from history");
    } catch (error: any) {
      console.error("Delete history error:", error);
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  const clearAllHistory = async () => {
    setShowClearConfirm(true);
  };

  const confirmClearAllHistory = async () => {
    if (!session?.user?.id) return;
    
    try {
      await clearAllHistoryAction();
      setHistoryItems([]);
      setShowClearConfirm(false);
      toast.success("History cleared");
    } catch (error: any) {
      console.error("Clear all history error:", error);
      toast.error(`Failed to clear: ${error.message}`);
      setShowClearConfirm(false);
    }
  };


  const tabs = [
    { key: "bookmarks" as const, label: `Bookmarks (${bookmarks.length})` },
    { key: "history" as const, label: `History (${historyItems.length})` },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px 80px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
        {userImage && (
          <Image
            src={userImage}
            alt={userName}
            width={56}
            height={56}
            style={{ borderRadius: "14px", border: "2px solid var(--border-accent)" }}
          />
        )}
        <div>
          <h1 style={{ fontSize: "clamp(20px,4vw,32px)", marginBottom: "4px" }}>
            {userName}&apos;s Library
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            {bookmarks.length} bookmarks · {history.length} recently read
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", borderRadius: "12px", padding: "4px", width: "fit-content" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              id={`library-tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "8px 20px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                background: activeTab === tab.key ? "var(--gradient-main)" : "transparent",
                color: activeTab === tab.key ? "white" : "var(--text-muted)",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {activeTab === "history" && historyItems.length > 0 && (
          <button
            onClick={clearAllHistory}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: "rgba(255, 60, 60, 0.1)",
              color: "var(--error)",
              border: "1px solid rgba(255, 60, 60, 0.2)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Clear All History
          </button>
        )}
      </div>

      {/* Bookmarks */}
      {activeTab === "bookmarks" && (
        bookmarks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <Image src="/empty-library.png" alt="Empty Library" width={200} height={200} style={{ margin: "0 auto 24px", opacity: 0.8 }} />
            <p style={{ fontSize: "18px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "8px" }}>
              Your library is empty
            </p>
            <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
              Start bookmarking manga to keep track of them here.
            </p>
            <Link href="/browse" className="btn-primary">
              <BookOpen size={16} /> Browse Manga
            </Link>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "20px",
          }}>
            {bookmarks.map((bm) => (
              <div key={bm.id} style={{ position: "relative", group: "true" } as React.CSSProperties}>
                <Link href={`/manga/${bm.manga_id}`} style={{ textDecoration: "none", display: "block" }}>
                  <div className="card" style={{ overflow: "hidden" }}>
                    <div style={{ position: "relative", aspectRatio: "2/3", background: "var(--bg-elevated)" }}>
                      {bm.cover_url && (
                        <img
                          src={bm.cover_url}
                          alt={bm.manga_title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <p style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.3,
                        marginBottom: "4px",
                      }}>
                        {bm.manga_title}
                      </p>
                      <p style={{ fontSize: "10px", color: "var(--text-disabled)" }}>
                        {new Date(bm.added_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => removeBookmark(bm.manga_id, bm.id)}
                  title="Remove bookmark"
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.7)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--error)",
                    transition: "all 0.2s",
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* History */}
      {activeTab === "history" && (
        historyItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <p style={{ fontSize: "48px", marginBottom: "16px" }}>📖</p>
            <p style={{ fontSize: "18px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "8px" }}>
              No reading history yet
            </p>
            <p style={{ color: "var(--text-muted)" }}>Start reading and your progress will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {historyItems.map((item) => (
              <Link
                key={item.id}
                href={`/manga/${item.manga_id}/chapter/${item.chapter_id}`}
                id={`history-${item.manga_id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px",
                  borderRadius: "12px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  position: "relative",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
              >
                {item.cover_url && (
                  <div style={{ width: "48px", height: "64px", flexShrink: 0, borderRadius: "8px", overflow: "hidden" }}>
                    <img src={item.cover_url} alt={item.manga_title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0, paddingRight: "40px" }}>
                  <p style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.manga_title}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Chapter {item.chapter_num}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-disabled)", fontSize: "12px", flexShrink: 0 }}>
                    <Clock size={12} />
                    {new Date(item.updated_at).toLocaleDateString()}
                  </div>
                  <button
                    onClick={(e) => removeHistoryItem(e, item.id)}
                    title="Remove from history"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(255, 60, 60, 0.1)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--error)",
                      transition: "all 0.2s",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {/* Custom Confirmation Modal */}
      {showClearConfirm && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "var(--bg-elevated)",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-card)",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center",
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px", color: "var(--text-primary)" }}>
              Clear Reading History
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
              Are you sure you want to clear your entire reading history? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "transparent",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAllHistory}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "var(--error)",
                  border: "none",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
