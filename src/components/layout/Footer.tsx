"use client";

import Link from "next/link";
import { BookOpen, Heart, X } from "lucide-react";
import { useState } from "react";

interface FooterLink {
  label: string;
  href?: string;
  action?: string;
}

const footerLinks: Record<string, FooterLink[]> = {
  Browse: [
    { label: "All Manga", href: "/browse" },
    { label: "Manga", href: "/browse?type=manga" },
    { label: "Manhwa", href: "/browse?type=manhwa" },
    { label: "Manhua", href: "/browse?type=manhua" },
    { label: "Latest Updates", href: "/browse?sort=latest" },
  ],
  Genres: [
    { label: "Action", href: "/genre/action" },
    { label: "Romance", href: "/genre/romance" },
    { label: "Fantasy", href: "/genre/fantasy" },
    { label: "Horror", href: "/genre/horror" },
    { label: "Comedy", href: "/genre/comedy" },
  ],
  Info: [
    { label: "About", action: "about" },
    { label: "Credits", action: "credits" },
    { label: "Privacy Policy", action: "privacy" },
  ],
};

export function Footer() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <footer style={{
      background: "var(--bg-secondary)",
      borderTop: "1px solid var(--border-subtle)",
      marginTop: "80px",
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "60px 24px 32px",
      }}>
        {/* Top */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr repeat(3, 1fr)",
          gap: "48px",
          marginBottom: "48px",
        }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "16px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "var(--gradient-main)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <BookOpen size={18} color="white" />
              </div>
              <span style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 900,
                fontSize: "20px",
                background: "var(--gradient-main)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                MangaVerse
              </span>
            </Link>
            <p style={{
              color: "var(--text-muted)",
              fontSize: "14px",
              lineHeight: "1.6",
              maxWidth: "280px",
            }}>
              Your universe of manga, manhua, and manhwa. Read thousands of titles online, completely free.
            </p>
            <p style={{
              marginTop: "16px",
              color: "var(--text-disabled)",
              fontSize: "12px",
              lineHeight: "1.5",
            }}>
              Content powered by{" "}
              <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--accent-pink)", textDecoration: "none" }}>
                MangaDex
              </a>
              {" "}& AniList.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 style={{
                color: "var(--text-primary)",
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "16px",
              }}>
                {section}
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "14px",
                          textDecoration: "none",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-pink-light)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => setActiveModal(link.action ?? null)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          fontSize: "14px",
                          textDecoration: "none",
                          transition: "color 0.2s",
                          fontFamily: "inherit",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-pink-light)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <p style={{ color: "var(--text-disabled)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
            Made with <Heart size={13} color="var(--accent-pink)" fill="var(--accent-pink)" /> by MangaVerse
          </p>
          <p style={{ color: "var(--text-disabled)", fontSize: "13px" }}>
            © {new Date().getFullYear()} MangaVerse. All rights reserved.
          </p>
        </div>
      </div>

      {/* Info Modals */}
      {activeModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          animation: "fadeIn 0.2s ease",
        }} onClick={() => setActiveModal(null)}>
          <div className="modal-content" style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "24px",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "85vh",
            overflowY: "auto",
            position: "relative",
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              <X size={24} />
            </button>
            
            {activeModal === "about" && (
              <div>
                <h2 style={{ fontSize: "24px", marginBottom: "16px", color: "var(--text-primary)" }}>About MangaVerse</h2>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "12px" }}>
                  Welcome to MangaVerse! We are a passionate project dedicated to providing the best reading experience for manga, manhwa, and manhua enthusiasts across the globe.
                </p>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "12px" }}>
                  Our goal is to build an open, accessible, and fast platform with a premium UI that respects your reading time.
                </p>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  MangaVerse does not host any image files on its own servers. All content is provided by the amazing non-profit communities at MangaDex and AniList.
                </p>
              </div>
            )}

            {activeModal === "credits" && (
              <div>
                <h2 style={{ fontSize: "24px", marginBottom: "16px", color: "var(--text-primary)" }}>Credits & Acknowledgments</h2>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "24px" }}>
                  MangaVerse is built upon the incredible work of open-source projects, public APIs, and volunteer communities.
                </p>
                <h3 style={{ fontSize: "16px", marginBottom: "8px", color: "var(--text-primary)" }}>MangaDex</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "16px" }}>
                  MangaDex is an ad-free manga reader providing high-quality images and an open API. Almost all of the readable content on MangaVerse is sourced directly from their robust platform.
                </p>
                <h3 style={{ fontSize: "16px", marginBottom: "8px", color: "var(--text-primary)" }}>AniList</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "16px" }}>
                  AniList provides the GraphQL API powering our accurate &quot;Trending Now&quot; sections, high-quality cover images, and comprehensive genre tagging.
                </p>
              </div>
            )}

            {activeModal === "privacy" && (
              <div>
                <h2 style={{ fontSize: "24px", marginBottom: "16px", color: "var(--text-primary)" }}>Privacy Policy</h2>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "16px" }}>
                  If you choose to create an account, we collect your basic profile information provided by your authentication provider (such as Google), including your email address and display name.
                </p>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "16px" }}>
                  We use your account data exclusively to synchronize your reading progress, bookmarks, and favorite manga across your devices. We do not sell, rent, or share your personal data with any third parties.
                </p>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  MangaVerse acts as a client application. When you read manga or view cover art, your browser may make direct network requests to third-party APIs such as MangaDex and AniList. Those services are governed by their own respective privacy policies.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
