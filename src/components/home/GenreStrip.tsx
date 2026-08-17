"use client";

import Link from "next/link";


const GENRES = [
  { label: "🔥 Action", value: "action" },
  { label: "💕 Romance", value: "romance" },
  { label: "🧙 Fantasy", value: "fantasy" },
  { label: "😂 Comedy", value: "comedy" },
  { label: "👻 Horror", value: "horror" },
  { label: "🔍 Mystery", value: "mystery" },
  { label: "🚀 Sci-Fi", value: "sci-fi" },
  { label: "🎭 Drama", value: "drama" },
  { label: "🥊 Sports", value: "sports" },
  { label: "🎌 Isekai", value: "isekai" },
  { label: "🧬 Supernatural", value: "supernatural" },
  { label: "⚔️ Adventure", value: "adventure" },
];

export function GenreStrip() {
  return (
    <section style={{
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "0 24px 60px",
    }}>
      <h2 style={{
        fontSize: "clamp(18px,3vw,26px)",
        color: "var(--text-primary)",
        marginBottom: "20px",
      }}>
        Browse by Genre
      </h2>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
      }}>
        {GENRES.map((genre) => (
          <Link
            key={genre.value}
            href={`/genre/${genre.value}`}
            id={`genre-${genre.value}`}
            style={{ textDecoration: "none" }}
          >
            <span
              className="genre-tag"
              style={{
                fontSize: "13px",
                padding: "8px 18px",
                borderRadius: "12px",
              }}
            >
              {genre.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
