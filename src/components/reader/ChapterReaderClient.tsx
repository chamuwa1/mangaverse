"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

import { useReaderStore } from "@/store/readerStore";
import {
  ChevronLeft, ChevronRight, Settings, Home, List,
  AlignJustify, ArrowLeftRight, BookOpen, X
} from "lucide-react";
import { useSession } from "next-auth/react";
import { upsertReadingHistoryAction } from "@/app/library/actions";


interface Chapter { id: string; num: string; title: string | null }

interface ChapterReaderClientProps {
  mangaId: string;
  mangaTitle: string;
  chapterId: string;
  chapterNum: string;
  imageUrls: string[];
  prevChapterId: string | null;
  nextChapterId: string | null;
  chapters: Chapter[];
  coverUrl: string;
}

export function ChapterReaderClient({
  mangaId, mangaTitle, chapterId, chapterNum,
  imageUrls, prevChapterId, nextChapterId, chapters, coverUrl
}: ChapterReaderClientProps) {
  const { 
    mode, setMode, direction, setDirection, pageFit, setPageFit, 
    backgroundColor, setBackgroundColor, currentPage, setCurrentPage, 
    showControls, setShowControls, nextPage, prevPage 
  } = useReaderStore();
  const { data: session } = useSession();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chapterListOpen, setChapterListOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const readerRef = useRef<HTMLDivElement>(null);

  // Reset page to 1 when navigating to a new chapter
  useEffect(() => {
    setCurrentPage(1);
  }, [chapterId, setCurrentPage]);

  // Save reading progress via server action (logged-in users only)
  useEffect(() => {
    if (!session?.user?.id) return;
    const timeout = setTimeout(async () => {
      try {
        await upsertReadingHistoryAction({
          mangaId,
          mangaTitle,
          coverUrl,
          chapterId,
          chapterNum,
          pageNum: Math.min(currentPage, Math.max(1, imageUrls.length)),
        });
      } catch (error) {
        console.error("[MangaVerse] Failed to save reading history:", error);
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [session, mangaId, mangaTitle, chapterId, chapterNum, currentPage, coverUrl, imageUrls.length]);


  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isRtl = direction === "rtl" && mode === "horizontal";
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isRtl) prevPage();
        else nextPage(imageUrls.length);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        nextPage(imageUrls.length);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (isRtl) nextPage(imageUrls.length);
        else prevPage();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        prevPage();
      }
      if (e.key === "Escape") setSettingsOpen(false);
      if (e.key === "f") setShowControls(!showControls);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [nextPage, prevPage, imageUrls.length, showControls, setShowControls, direction, mode]);

  const handleImageLoad = useCallback((idx: number) => {
    setLoadedImages((prev) => new Set(prev).add(idx));
  }, []);

  const progress = ((currentPage) / imageUrls.length) * 100;

  return (
    <div ref={readerRef} style={{
      minHeight: "100vh",
      background: backgroundColor === "black" ? "#000" : backgroundColor === "gray" ? "#1f1f1f" : "#fff",
      color: backgroundColor === "white" ? "#000" : "#fff",
      position: "relative",
      userSelect: "none",
    }}>
      {/* Progress bar */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "rgba(255,255,255,0.1)",
        zIndex: 200,
      }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: "var(--gradient-main)",
          transition: "width 0.3s ease",
        }} />
      </div>

      {/* Top bar */}
      {showControls && (
        <div className="glass" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 150,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          <Link href={`/manga/${mangaId}`} className="btn-secondary" style={{ padding: "8px 12px", fontSize: "12px" }}>
            <ChevronLeft size={14} /> Back
          </Link>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {mangaTitle}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Chapter {chapterNum} · Page {currentPage} / {imageUrls.length}
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={() => setChapterListOpen(!chapterListOpen)}
              className="btn-secondary"
              style={{ padding: "8px 12px", fontSize: "12px" }}
            >
              <List size={14} /> Chapters
            </button>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="btn-secondary"
              style={{ padding: "8px", width: "36px" }}
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Chapter list drawer */}
      {chapterListOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "280px",
          zIndex: 300,
          background: "var(--bg-secondary)",
          borderLeft: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          animation: "slideInLeft 0.2s ease",
        }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: "15px" }}>Chapters</span>
            <button onClick={() => setChapterListOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ overflowY: "auto", flex: 1, padding: "8px" }}>
            {chapters.map((c) => (
              <Link
                key={c.id}
                href={`/manga/${mangaId}/chapter/${c.id}`}
                id={`chapter-list-${c.id}`}
                onClick={() => setChapterListOpen(false)}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  background: c.id === chapterId ? "rgba(233,30,140,0.15)" : "transparent",
                  color: c.id === chapterId ? "var(--accent-pink-light)" : "var(--text-secondary)",
                  fontSize: "13px",
                  fontWeight: c.id === chapterId ? 600 : 400,
                  borderLeft: c.id === chapterId ? "3px solid var(--accent-pink)" : "3px solid transparent",
                  transition: "all 0.15s",
                  marginBottom: "2px",
                }}
              >
                Chapter {c.num} {c.title ? `— ${c.title}` : ""}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Settings panel */}
      {settingsOpen && (
        <div className="glass" style={{
          position: "fixed",
          top: "64px",
          right: "16px",
          zIndex: 200,
          padding: "20px",
          borderRadius: "16px",
          minWidth: "240px",
          background: "rgba(20, 22, 28, 0.95)",
          backdropFilter: "blur(16px)",
          border: "1px solid var(--border-default)",
          animation: "fadeIn 0.15s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ fontWeight: 700, fontSize: "14px" }}>Reading Mode</span>
            <button onClick={() => setSettingsOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
              <X size={14} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {([
              { value: "vertical", label: "Vertical Scroll", icon: <AlignJustify size={14} /> },
              { value: "horizontal", label: "Horizontal Pages", icon: <ArrowLeftRight size={14} /> },
              { value: "double", label: "Double Page", icon: <BookOpen size={14} /> },
            ] as const).map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: mode === value ? "rgba(233,30,140,0.15)" : "var(--bg-elevated)",
                  color: mode === value ? "var(--accent-pink-light)" : "var(--text-secondary)",
                  border: mode === value ? "1px solid var(--border-accent)" : "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: mode === value ? 600 : 400,
                  transition: "all 0.15s",
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "16px", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            
            {/* Direction */}
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>Direction</span>
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => setDirection("ltr")} style={{ flex: 1, padding: "6px", fontSize: "12px", borderRadius: "6px", border: direction === "ltr" ? "1px solid var(--accent-pink)" : "1px solid var(--border-subtle)", background: direction === "ltr" ? "rgba(233,30,140,0.15)" : "transparent", color: direction === "ltr" ? "var(--accent-pink-light)" : "var(--text-secondary)", cursor: "pointer" }}>LTR</button>
                <button onClick={() => setDirection("rtl")} style={{ flex: 1, padding: "6px", fontSize: "12px", borderRadius: "6px", border: direction === "rtl" ? "1px solid var(--accent-pink)" : "1px solid var(--border-subtle)", background: direction === "rtl" ? "rgba(233,30,140,0.15)" : "transparent", color: direction === "rtl" ? "var(--accent-pink-light)" : "var(--text-secondary)", cursor: "pointer" }}>RTL</button>
              </div>
            </div>

            {/* Page Fit */}
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>Page Fit</span>
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => setPageFit("width")} style={{ flex: 1, padding: "6px", fontSize: "12px", borderRadius: "6px", border: pageFit === "width" ? "1px solid var(--accent-pink)" : "1px solid var(--border-subtle)", background: pageFit === "width" ? "rgba(233,30,140,0.15)" : "transparent", color: pageFit === "width" ? "var(--accent-pink-light)" : "var(--text-secondary)", cursor: "pointer" }}>Width</button>
                <button onClick={() => setPageFit("height")} style={{ flex: 1, padding: "6px", fontSize: "12px", borderRadius: "6px", border: pageFit === "height" ? "1px solid var(--accent-pink)" : "1px solid var(--border-subtle)", background: pageFit === "height" ? "rgba(233,30,140,0.15)" : "transparent", color: pageFit === "height" ? "var(--accent-pink-light)" : "var(--text-secondary)", cursor: "pointer" }}>Height</button>
                <button onClick={() => setPageFit("original")} style={{ flex: 1, padding: "6px", fontSize: "12px", borderRadius: "6px", border: pageFit === "original" ? "1px solid var(--accent-pink)" : "1px solid var(--border-subtle)", background: pageFit === "original" ? "rgba(233,30,140,0.15)" : "transparent", color: pageFit === "original" ? "var(--accent-pink-light)" : "var(--text-secondary)", cursor: "pointer" }}>Original</button>
              </div>
            </div>

            {/* Background */}
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>Background</span>
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => setBackgroundColor("black")} style={{ flex: 1, padding: "6px", fontSize: "12px", borderRadius: "6px", border: backgroundColor === "black" ? "1px solid var(--accent-pink)" : "1px solid var(--border-subtle)", background: backgroundColor === "black" ? "rgba(233,30,140,0.15)" : "transparent", color: backgroundColor === "black" ? "var(--accent-pink-light)" : "var(--text-secondary)", cursor: "pointer" }}>Black</button>
                <button onClick={() => setBackgroundColor("gray")} style={{ flex: 1, padding: "6px", fontSize: "12px", borderRadius: "6px", border: backgroundColor === "gray" ? "1px solid var(--accent-pink)" : "1px solid var(--border-subtle)", background: backgroundColor === "gray" ? "rgba(233,30,140,0.15)" : "transparent", color: backgroundColor === "gray" ? "var(--accent-pink-light)" : "var(--text-secondary)", cursor: "pointer" }}>Gray</button>
                <button onClick={() => setBackgroundColor("white")} style={{ flex: 1, padding: "6px", fontSize: "12px", borderRadius: "6px", border: backgroundColor === "white" ? "1px solid var(--accent-pink)" : "1px solid var(--border-subtle)", background: backgroundColor === "white" ? "rgba(233,30,140,0.15)" : "transparent", color: backgroundColor === "white" ? "var(--accent-pink-light)" : "var(--text-secondary)", cursor: "pointer" }}>White</button>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "16px", paddingTop: "16px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Keyboard shortcuts</p>
            <p style={{ fontSize: "11px", color: "var(--text-disabled)" }}>← / → : Navigate pages</p>
            <p style={{ fontSize: "11px", color: "var(--text-disabled)" }}>F : Toggle controls</p>
          </div>
        </div>
      )}

      {/* Reader area */}
      <div
        onClick={() => {
          if (!settingsOpen && !chapterListOpen) setShowControls(!showControls);
        }}
        style={{ 
          paddingTop: showControls ? "64px" : "0", 
          minHeight: "100vh",
          touchAction: mode === "vertical" ? "pan-y" : "pan-x"
        }}
      >
        {mode === "vertical" ? (
          // ── Vertical scroll ──
          <div style={{ 
            maxWidth: pageFit === "original" ? "none" : pageFit === "width" ? "100%" : "900px", 
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            {imageUrls.map((url, idx) => (
              <div
                key={idx}
                style={{ position: "relative", width: "100%", backgroundColor: "#000" }}
                onMouseEnter={() => setCurrentPage(idx + 1)}
              >
                {!loadedImages.has(idx) && (
                  <div className="skeleton" style={{ position: "absolute", inset: 0, zIndex: 10 }} />
                )}
                <Image
                  src={url}
                  alt={`Page ${idx + 1}`}
                  width={0}
                  height={0}
                  sizes="100vw"
                  unoptimized={true}
                  style={{
                    width: pageFit === "original" ? "auto" : pageFit === "width" ? "100%" : "auto",
                    height: pageFit === "height" ? "100vh" : "auto",
                    maxWidth: "100%",
                    objectFit: pageFit === "height" ? "contain" : "cover",
                    display: "block",
                    minHeight: loadedImages.has(idx) ? "auto" : "60vh",
                    backgroundColor: backgroundColor === "white" ? "#f0f0f0" : "var(--bg-elevated)",
                  }}
                  onLoad={() => handleImageLoad(idx)}
                  onError={() => handleImageLoad(idx)}
                  priority={idx < 3}
                  loading={idx < 3 ? undefined : "lazy"}
                />
              </div>
            ))}
          </div>
        ) : mode === "horizontal" ? (
          // ── Horizontal page flip ──
          <div style={{
            height: "calc(100vh - 64px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}>
            {imageUrls[currentPage - 1] && (
              <div style={{ position: "relative", maxHeight: "90vh", maxWidth: "90vw" }}>
                {!loadedImages.has(currentPage - 1) && (
                  <div className="skeleton" style={{ position: "absolute", inset: 0, zIndex: 10 }} />
                )}
                <Image
                  src={imageUrls[currentPage - 1]}
                  alt={`Page ${currentPage}`}
                  width={0}
                  height={0}
                  sizes="100vw"
                  unoptimized={true}
                  style={{
                    maxHeight: pageFit === "height" ? "100vh" : pageFit === "width" ? "none" : "90vh",
                    maxWidth: pageFit === "width" ? "100vw" : "90vw",
                    width: pageFit === "width" ? "100vw" : "auto",
                    height: pageFit === "height" ? "100vh" : "auto",
                    objectFit: "contain",
                    display: "block",
                    minHeight: loadedImages.has(currentPage - 1) ? "auto" : "60vh",
                    minWidth: loadedImages.has(currentPage - 1) ? "auto" : "40vw",
                  }}
                  onLoad={() => handleImageLoad(currentPage - 1)}
                  onError={() => handleImageLoad(currentPage - 1)}
                  priority
                />
              </div>
            )}
            {/* Prev/Next overlay buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (direction === "rtl") nextPage(imageUrls.length);
                else prevPage();
              }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "35%",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (direction === "rtl") prevPage();
                else nextPage(imageUrls.length);
              }}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: "35%",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            />
          </div>
        ) : (
          // ── Double page ──
          <div style={{
            height: "calc(100vh - 64px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}>
            {[currentPage - 1, currentPage].map((pageIdx) =>
              imageUrls[pageIdx] ? (
                <div key={pageIdx} style={{ position: "relative", maxHeight: "90vh" }}>
                  <Image
                    src={imageUrls[pageIdx]}
                    alt={`Page ${pageIdx + 1}`}
                    width={0}
                    height={0}
                    sizes="50vw"
                    unoptimized={true}
                    style={{ maxHeight: "90vh", maxWidth: "45vw", width: "100%", height: "auto", objectFit: "contain", display: "block" }}
                    onLoad={() => handleImageLoad(pageIdx)}
                    onError={() => handleImageLoad(pageIdx)}
                    priority
                  />
                </div>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* Bottom nav bar */}
      {showControls && (
        <div className="glass" style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 150,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}>
          {prevChapterId ? (
            <Link href={`/manga/${mangaId}/chapter/${prevChapterId}`} id="prev-chapter-btn" className="btn-secondary" style={{ padding: "8px 14px", fontSize: "12px" }}>
              <ChevronLeft size={14} /> Prev Chapter
            </Link>
          ) : <div />}

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {mode !== "vertical" && (
              <>
                <button onClick={() => prevPage()} className="btn-secondary" style={{ padding: "8px", width: "36px" }}>
                  <ChevronLeft size={16} />
                </button>
                <span style={{ color: "var(--text-muted)", fontSize: "13px", minWidth: "80px", textAlign: "center" }}>
                  {currentPage} / {imageUrls.length}
                </span>
                <button onClick={() => nextPage(imageUrls.length)} className="btn-secondary" style={{ padding: "8px", width: "36px" }}>
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {nextChapterId ? (
            <Link href={`/manga/${mangaId}/chapter/${nextChapterId}`} id="next-chapter-btn" className="btn-primary" style={{ padding: "8px 14px", fontSize: "12px" }}>
              Next Chapter <ChevronRight size={14} />
            </Link>
          ) : (
            <Link href={`/manga/${mangaId}`} className="btn-secondary" style={{ padding: "8px 14px", fontSize: "12px" }}>
              <Home size={14} /> Manga Page
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
