"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Check, SlidersHorizontal, X } from "lucide-react";

export const GENRE_TAGS = {
  Action: "391b0423-d847-456f-aff0-8b0cfc03066b",
  Romance: "423e2eae-a7a2-4a8b-ac03-a8351462d71d",
  Fantasy: "cdc58593-87dd-415e-bbc0-2ec27bf404cc",
  Comedy: "4d32cc48-9f00-4cca-9b5a-a839f0764984",
  Horror: "cdad7e68-1419-41dd-bdce-27753074a640",
  Mystery: "ee968100-4191-4968-93d3-f5d17663e6da",
  Drama: "b9af3a63-f058-46de-a9a0-e0c13906197a",
  Adventure: "87cc87cd-a395-47af-b27a-93258283bbc6",
  Supernatural: "eabc5b4c-d38e-4e8b-bef9-2585c68d1e28",
  Sports: "69964a64-2f90-4d33-beeb-f3ed2875eb4c",
  "Sci-Fi": "256c8bd9-4904-4360-bf4f-508a76d67183",
  Isekai: "ace04997-f6bd-436e-b261-779182193d3d",
};

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Most Popular", value: "popular" },
  { label: "Top Rated", value: "rating" },
  { label: "Newest", value: "new" },
  { label: "A-Z", value: "title" },
];

const STATUS_OPTIONS = [
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
  { label: "Hiatus", value: "hiatus" },
];

const DEMOGRAPHIC_OPTIONS = [
  { label: "Shounen", value: "shounen" },
  { label: "Seinen", value: "seinen" },
  { label: "Shoujo", value: "shoujo" },
  { label: "Josei", value: "josei" },
];

const RATING_OPTIONS = [
  { label: "Safe", value: "safe" },
  { label: "Suggestive", value: "suggestive" },
  { label: "Erotica", value: "erotica" },
];

export function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State mapped from URL
  const [sort, setSort] = useState("latest");
  const [status, setStatus] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [demographic, setDemographic] = useState<string[]>([]);
  const [rating, setRating] = useState<string[]>(["safe", "suggestive"]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSort(searchParams.get("sort") || "latest");
    setStatus(searchParams.get("status")?.split(",") || []);
    setTags(searchParams.get("tags")?.split(",") || []);
    setDemographic(searchParams.get("demographic")?.split(",") || []);
    setRating(searchParams.get("rating")?.split(",") || ["safe", "suggestive"]);
  }, [searchParams]);

  const applyFilters = (updates: any) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // reset page on filter change
    
    const state = { sort, status, tags, demographic, rating, ...updates };

    if (state.sort !== "latest") params.set("sort", state.sort); else params.delete("sort");
    if (state.status.length) params.set("status", state.status.join(",")); else params.delete("status");
    if (state.tags.length) params.set("tags", state.tags.join(",")); else params.delete("tags");
    if (state.demographic.length) params.set("demographic", state.demographic.join(",")); else params.delete("demographic");
    
    // Only set rating if it differs from default (safe,suggestive)
    const ratingStr = state.rating.sort().join(",");
    if (ratingStr !== "safe,suggestive" && state.rating.length) params.set("rating", state.rating.join(",")); 
    else params.delete("rating");

    router.push(`/browse?${params.toString()}`);
  };

  const toggleArray = (arr: string[], val: string) => 
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const Checkbox = ({ checked, label, onClick }: any) => (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "6px 8px", borderRadius: "8px", background: checked ? "rgba(233,30,140,0.1)" : "transparent", color: checked ? "var(--accent-pink-light)" : "var(--text-secondary)", transition: "all 0.15s" }}>
      <div style={{ width: "16px", height: "16px", borderRadius: "4px", border: checked ? "none" : "1px solid var(--border-default)", background: checked ? "var(--accent-pink)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {checked && <Check size={12} fill="white" />}
      </div>
      <span style={{ fontSize: "13px" }}>{label}</span>
    </div>
  );

  return (
    <>
      <button 
        className="mobile-filter-toggle"
        onClick={() => setIsOpen(true)}
      >
        <SlidersHorizontal size={18} /> Filters
      </button>

      <aside className={`filter-panel ${isOpen ? "open" : ""}`} style={{
        background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "16px", padding: "24px", position: "sticky", top: "84px",
        maxHeight: "calc(100vh - 100px)", overflowY: "auto",
      }}>
        <button className="close-filter-btn" onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>

        <style>{`
          aside::-webkit-scrollbar { width: 4px; }
          aside::-webkit-scrollbar-thumb { background: var(--border-subtle); borderRadius: 4px; }
          .mobile-filter-toggle {
            display: none;
            width: 100%;
            padding: 14px;
            background: var(--bg-card);
            border: 1px solid var(--border-accent);
            color: var(--text-primary);
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            margin-bottom: 24px;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            box-shadow: var(--shadow-glow-pink);
          }
          .close-filter-btn {
            display: none;
            position: absolute;
            top: 24px;
            right: 24px;
            background: var(--bg-elevated);
            border: 1px solid var(--border-subtle);
            color: var(--text-primary);
            cursor: pointer;
            width: 36px;
            height: 36px;
            border-radius: 10px;
            align-items: center;
            justify-content: center;
            z-index: 10;
          }
          @media (max-width: 768px) {
            .mobile-filter-toggle { display: flex; }
            .close-filter-btn { display: flex; }
            .filter-panel {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              z-index: 1000;
              background: var(--bg-card) !important;
              max-height: 100vh !important;
              border-radius: 0 !important;
              border: none !important;
              padding-top: 64px !important;
              transform: translateY(100%);
              transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .filter-panel.open {
              transform: translateY(0);
            }
          }
        `}</style>
      
      {/* Sort */}
      <div style={{ marginBottom: "24px" }}>
        <h3 className="filter-title" style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "12px" }}>Sort By</h3>
        <select 
          value={sort} 
          onChange={(e) => applyFilters({ sort: e.target.value })}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", outline: "none" }}
        >
          {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {/* Genres */}
      <div style={{ marginBottom: "24px" }}>
        <h3 className="filter-title" style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "12px" }}>Genres</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
          {Object.entries(GENRE_TAGS).map(([name, id]) => (
            <Checkbox key={id} label={name} checked={tags.includes(id)} onClick={() => applyFilters({ tags: toggleArray(tags, id) })} />
          ))}
        </div>
      </div>

      {/* Demographic */}
      <div style={{ marginBottom: "24px" }}>
        <h3 className="filter-title" style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "12px" }}>Demographic</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {DEMOGRAPHIC_OPTIONS.map(opt => (
            <Checkbox key={opt.value} label={opt.label} checked={demographic.includes(opt.value)} onClick={() => applyFilters({ demographic: toggleArray(demographic, opt.value) })} />
          ))}
        </div>
      </div>

      {/* Status */}
      <div style={{ marginBottom: "24px" }}>
        <h3 className="filter-title" style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "12px" }}>Status</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {STATUS_OPTIONS.map(opt => (
            <Checkbox key={opt.value} label={opt.label} checked={status.includes(opt.value)} onClick={() => applyFilters({ status: toggleArray(status, opt.value) })} />
          ))}
        </div>
      </div>

      {/* Content Rating */}
      <div>
        <h3 className="filter-title" style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "12px" }}>Content Rating</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {RATING_OPTIONS.map(opt => (
            <Checkbox key={opt.value} label={opt.label} checked={rating.includes(opt.value)} onClick={() => applyFilters({ rating: toggleArray(rating, opt.value) })} />
          ))}
        </div>
      </div>
    </aside>
    </>
  );
}
