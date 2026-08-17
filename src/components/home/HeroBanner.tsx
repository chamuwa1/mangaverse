"use client";

import Link from "next/link";
import { ChevronRight, Play, BookOpen, Star } from "lucide-react";
import type { AniListMedia } from "@/lib/api/anilist";
import { getAniListTitle } from "@/lib/api/anilist";
import { useState, useEffect } from "react";

interface HeroBannerProps {
  featuredManga: AniListMedia[];
}

export function HeroBanner({ featuredManga }: HeroBannerProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const featured = featuredManga.slice(0, 5);
  const current = featured[activeIdx];

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((i) => (i + 1) % featured.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featured.length]);

  if (!current) {
    return (
      <section style={{
        position: "relative",
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        background: "var(--bg-primary)",
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>
          <h1 className="gradient-text" style={{ fontSize: "clamp(32px,6vw,72px)", marginBottom: "16px" }}>
            Your Universe of Manga
          </h1>
          <p style={{ fontSize: "18px", color: "var(--text-muted)", marginBottom: "32px" }}>
            Read manga, manhwa, manhua — thousands of titles, free forever.
          </p>
          <Link href="/browse" className="btn-primary" style={{ fontSize: "16px", padding: "14px 28px" }}>
            <BookOpen size={18} /> Start Reading
          </Link>
        </div>
      </section>
    );
  }

  const title = getAniListTitle(current);
  const description = current.description
    ?.replace(/<[^>]*>/g, "")
    .slice(0, 200) + "...";

  return (
    <section style={{
      position: "relative",
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
    }}>
      <div
        key={activeIdx}
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${current.bannerImage || current.coverImage.extraLarge})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          filter: "blur(2px) brightness(0.25) saturate(1.5)",
          transform: "scale(1.05)",
          transition: "all 0.8s ease",
        }}
      />

      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "url(/hero-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.4,
        mixBlendMode: "overlay",
      }} />

      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to right, rgba(13,15,20,0.95) 40%, rgba(13,15,20,0.3) 100%)",
      }} />
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "200px",
        background: "linear-gradient(to top, var(--bg-primary), transparent)",
      }} />

      <div style={{
        position: "relative",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "80px 24px",
        display: "flex",
        flexWrap: "wrap-reverse",
        justifyContent: "center",
        gap: "60px",
        alignItems: "center",
        width: "100%",
      }}>
        <div style={{ animation: "fadeIn 0.5s ease", flex: "1 1 300px" }} key={activeIdx}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            <span style={{
              padding: "4px 12px",
              borderRadius: "999px",
              background: "var(--gradient-main)",
              color: "white",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              {current.countryOfOrigin === "KR" ? "Manhwa" : current.countryOfOrigin === "CN" ? "Manhua" : "Manga"}
            </span>
            {current.genres.slice(0, 3).map((g) => (
              <span key={g} className="genre-tag">{g}</span>
            ))}
          </div>

          <h1 style={{
            fontSize: "clamp(28px,5vw,64px)",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            lineHeight: 1.1,
            color: "var(--text-primary)",
            marginBottom: "20px",
            maxWidth: "680px",
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}>
            {title}
          </h1>

          {current.averageScore && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "16px",
              color: "#fbbf24",
              fontSize: "15px",
              fontWeight: 600,
            }}>
              <Star size={16} fill="#fbbf24" />
              {(current.averageScore / 10).toFixed(1)} / 10
              <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "13px" }}>
                ({current.popularity.toLocaleString()} followers)
              </span>
            </div>
          )}

          <p style={{
            fontSize: "clamp(13px,1.5vw,15px)",
            color: "var(--text-secondary)",
            lineHeight: "1.7",
            maxWidth: "560px",
            marginBottom: "32px",
          }}>
            {description}
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href={`/browse?q=${encodeURIComponent(title)}`}
              className="btn-primary"
              style={{ fontSize: "15px", padding: "14px 28px" }}
            >
              <Play size={16} fill="white" /> Read Now
            </Link>
            <Link
              href="/browse"
              className="btn-secondary"
              style={{ fontSize: "15px", padding: "14px 28px" }}
            >
              Browse All <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        <div style={{
          position: "relative",
          width: "220px",
          flexShrink: 0,
        }}>
          <div style={{
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.6), var(--shadow-glow-pink)",
            border: "1px solid var(--border-default)",
            animation: "fadeIn 0.5s ease",
          }} key={`cover-${activeIdx}`}>
            <img
              src={current.coverImage.extraLarge || current.coverImage.large}
              alt={title}
              style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }}
            />
          </div>

          <div style={{
            position: "absolute",
            inset: "-20px",
            background: `radial-gradient(circle, ${current.coverImage.color || "rgba(233,30,140,0.15)"} 0%, transparent 70%)`,
            zIndex: -1,
            filter: "blur(20px)",
            opacity: 0.6,
          }} />
        </div>
      </div>

      {featured.length > 1 && (
        <div style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
        }}>
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              style={{
                width: i === activeIdx ? "24px" : "8px",
                height: "8px",
                borderRadius: "999px",
                background: i === activeIdx ? "var(--accent-pink)" : "var(--bg-elevated)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
