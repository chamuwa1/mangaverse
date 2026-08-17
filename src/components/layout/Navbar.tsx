"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { Search, BookOpen, Library, Menu, X, LogIn, LogOut, User, ChevronDown, Sparkles, Home, Shield } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };



  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: "all 0.3s ease",
          background: scrolled
            ? "rgba(13,15,20,0.92)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid var(--border-subtle)" : "none",
        }}
      >
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          gap: "32px",
        }}>
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            style={{
              display: pathname.startsWith("/admin") ? "none" : "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-glow-pink)",
              overflow: "hidden"
            }}>
              <Image src="/icon.jpg" width={36} height={36} alt="Logo" />
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

          <div className="hide-mobile" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "32px" }}>
            <Link
              href="/"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              style={{
                textDecoration: "none",
                color: pathname === "/" ? "var(--accent-pink)" : "var(--text-secondary)",
                fontSize: "15px",
                fontWeight: 600,
                transition: "all 0.2s",
                textShadow: pathname === "/" ? "0 0 10px rgba(233,30,140,0.5)" : "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-pink-light)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = pathname === "/" ? "var(--accent-pink)" : "var(--text-secondary)")}
            >
              Home
            </Link>
            <Link
              href="/browse"
              style={{
                textDecoration: "none",
                color: pathname.startsWith("/browse") ? "var(--accent-pink)" : "var(--text-secondary)",
                fontSize: "15px",
                fontWeight: 600,
                transition: "all 0.2s",
                textShadow: pathname.startsWith("/browse") ? "0 0 10px rgba(233,30,140,0.5)" : "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-pink-light)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = pathname.startsWith("/browse") ? "var(--accent-pink)" : "var(--text-secondary)")}
            >
              Browse
            </Link>

            <a
              href="/api/random"
              style={{
                textDecoration: "none",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "var(--gradient-main)",
                padding: "6px 14px",
                borderRadius: "12px",
                boxShadow: "var(--shadow-glow-pink)",
              }}
            >
              <Sparkles size={14} fill="currentColor" /> Surprise Me
            </a>
          </div>

          <div className="hide-desktop" style={{ flex: 1 }} />

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

            <button
              className="hide-mobile"
              onClick={() => setSearchOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "0 12px",
                height: "38px",
                width: "220px",
                borderRadius: "10px",
                border: "1px solid var(--border-default)",
                background: "var(--bg-elevated)",
                color: "var(--text-muted)",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
            >
              <Search size={14} />
              <span style={{ fontSize: "13px" }}>Search manga...</span>
              <span style={{ marginLeft: "auto", fontSize: "10px", padding: "2px 6px", background: "var(--bg-secondary)", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>⌘K</span>
            </button>

            <button
              className="hide-desktop"
              id="nav-search-btn"
              onClick={() => setSearchOpen(true)}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                border: "1px solid var(--border-default)",
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Search size={16} />
            </button>

            {status === "loading" ? (
              <div className="hide-mobile skeleton" style={{ width: "38px", height: "38px", borderRadius: "10px" }} />
            ) : session && (
              <Link
                href="/library"
                id="nav-library-btn"
                className="hide-mobile"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  border: pathname.startsWith("/library") ? "1px solid var(--accent-pink)" : "1px solid var(--border-default)",
                  background: pathname.startsWith("/library") ? "rgba(233,30,140,0.1)" : "var(--bg-elevated)",
                  color: pathname.startsWith("/library") ? "var(--accent-pink)" : "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  boxShadow: pathname.startsWith("/library") ? "var(--shadow-glow-pink)" : "none",
                }}
              >
                <Library size={16} />
              </Link>
            )}

            {status === "loading" ? (
              <div className="hide-mobile skeleton" style={{ width: "80px", height: "38px", borderRadius: "10px" }} />
            ) : session ? (
              <div ref={userMenuRef} className="hide-mobile" style={{ position: "relative" }}>
                <button
                  id="nav-user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "4px 8px 4px 4px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-default)",
                    background: "var(--bg-elevated)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      width={28}
                      height={28}
                      style={{ borderRadius: "8px" }}
                    />
                  ) : (
                    <div style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: "var(--gradient-main)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <User size={14} color="white" />
                    </div>
                  )}
                  <ChevronDown size={14} color="var(--text-muted)" />
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    minWidth: "180px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "12px",
                    padding: "8px",
                    boxShadow: "var(--shadow-card)",
                    animation: "fadeIn 0.15s ease",
                  }}>
                    <div style={{
                      padding: "8px 12px",
                      borderBottom: "1px solid var(--border-subtle)",
                      marginBottom: "8px",
                    }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {session.user?.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {session.user?.email}
                      </div>
                    </div>
                    {(session.user as any).isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: "var(--accent-pink-light)",
                          fontSize: "13px",
                          transition: "all 0.15s",
                          fontWeight: 600,
                          background: "rgba(233,30,140,0.08)",
                          border: "1px solid rgba(233,30,140,0.15)",
                          marginBottom: "6px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(233,30,140,0.15)";
                          e.currentTarget.style.borderColor = "var(--accent-pink)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(233,30,140,0.08)";
                          e.currentTarget.style.borderColor = "rgba(233,30,140,0.15)";
                        }}
                      >
                        <Shield size={14} /> Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        color: "var(--text-secondary)",
                        fontSize: "13px",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <User size={14} /> Profile
                    </Link>
                    <Link
                      href="/library"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        color: "var(--text-secondary)",
                        fontSize: "13px",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Library size={14} /> Library
                    </Link>
                    <button
                      onClick={() => { signOut(); setUserMenuOpen(false); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        color: "var(--error)",
                        fontSize: "13px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        width: "100%",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="nav-signin-btn"
                onClick={() => signIn()}
                className="btn-primary hide-mobile"
                style={{ padding: "8px 16px", fontSize: "13px" }}
              >
                <LogIn size={14} /> Sign In
              </button>
            )}

            <button
              className="hide-desktop"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                border: "1px solid var(--border-default)",
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{
            position: "absolute",
            top: "72px",
            left: "16px",
            right: "16px",
            background: "rgba(20, 22, 28, 0.95)",
            backdropFilter: "blur(16px)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "16px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            animation: "fadeIn 0.2s ease-out",
          }}>
            {status === "loading" ? (
              <div className="skeleton" style={{ width: "100%", height: "150px", borderRadius: "10px" }} />
            ) : session ? (
              <>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "4px 8px 12px",
                  borderBottom: "1px solid var(--border-subtle)",
                  marginBottom: "4px",
                }}>
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      width={36}
                      height={36}
                      style={{ borderRadius: "50%" }}
                    />
                  ) : (
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "var(--gradient-main)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <User size={16} color="white" />
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {session.user?.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {session.user?.email}
                    </div>
                  </div>
                </div>

                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    color: pathname === "/" ? "var(--accent-pink-light)" : "var(--text-secondary)",
                    fontSize: "14px",
                    fontWeight: pathname === "/" ? "700" : "600",
                    background: pathname === "/" ? "rgba(233,30,140,0.15)" : "transparent",
                  }}
                >
                  <Home size={16} /> Home
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    color: pathname.startsWith("/profile") ? "var(--accent-pink-light)" : "var(--text-secondary)",
                    fontSize: "14px",
                    fontWeight: pathname.startsWith("/profile") ? "700" : "600",
                    background: pathname.startsWith("/profile") ? "rgba(233,30,140,0.15)" : "transparent",
                  }}
                >
                  <User size={16} /> Profile
                </Link>

                <Link
                  href="/browse"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    color: pathname.startsWith("/browse") ? "var(--accent-pink-light)" : "var(--text-secondary)",
                    fontSize: "14px",
                    fontWeight: pathname.startsWith("/browse") ? "700" : "600",
                    background: pathname.startsWith("/browse") ? "rgba(233,30,140,0.15)" : "transparent",
                  }}
                >
                  <Search size={16} /> Browse All
                </Link>

                <Link
                  href="/library"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    color: pathname.startsWith("/library") ? "var(--accent-pink-light)" : "var(--text-secondary)",
                    fontSize: "14px",
                    fontWeight: pathname.startsWith("/library") ? "700" : "600",
                    background: pathname.startsWith("/library") ? "rgba(233,30,140,0.15)" : "transparent",
                  }}
                >
                  <Library size={16} /> My Library
                </Link>

                {(session.user as any).isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      textDecoration: "none",
                      color: "var(--accent-pink-light)",
                      fontSize: "14px",
                      fontWeight: "700",
                      background: pathname.startsWith("/admin") ? "rgba(233,30,140,0.15)" : "rgba(233,30,140,0.05)",
                    }}
                  >
                    <Shield size={16} /> Admin Panel
                  </Link>
                )}

                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    color: "var(--error)",
                    fontSize: "14px",
                    fontWeight: "600",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                    marginTop: "4px",
                  }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: "500",
                  background: "var(--gradient-main)",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <LogIn size={16} /> Sign In
              </button>
            )}
          </div>
        )}
      </nav>

      {searchOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "120px",
            animation: "fadeIn 0.15s ease",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <form
            onSubmit={handleSearch}
            style={{
              width: "100%",
              maxWidth: "640px",
              margin: "0 24px",
              position: "relative",
            }}
          >
            <Search
              size={20}
              color="var(--text-muted)"
              style={{
                position: "absolute",
                left: "20px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              ref={searchRef}
              id="nav-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search manga, manhwa, manhua..."
              style={{
                width: "100%",
                padding: "18px 20px 18px 52px",
                borderRadius: "16px",
                border: "1px solid var(--border-accent)",
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                fontSize: "16px",
                outline: "none",
                boxShadow: "var(--shadow-glow-pink)",
              }}
            />
          </form>
        </div>
      )}

      <div style={{ height: "64px" }} />
    </>
  );
}
