"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  LogOut, Mail, User, Library, BookOpen, Shield
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "60px 24px 80px",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div className="skeleton" style={{ width: "96px", height: "96px", borderRadius: "50%" }} />
          <div className="skeleton" style={{ width: "200px", height: "24px", borderRadius: "8px" }} />
          <div className="skeleton" style={{ width: "260px", height: "16px", borderRadius: "8px" }} />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "120px 24px",
        textAlign: "center",
      }}>
        <User size={48} color="var(--text-disabled)" style={{ marginBottom: "16px" }} />
        <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Not Signed In</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
          Sign in to access your profile and library.
        </p>
        <Link href="/auth/signin" className="btn-primary">
          <LogOut size={16} /> Sign In
        </Link>
      </div>
    );
  }

  const user = session.user;

  return (
    <div style={{
      maxWidth: "600px",
      margin: "0 auto",
      padding: "48px 24px 80px",
    }}>
      {/* Profile Header Card */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "24px",
        padding: "40px 32px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        marginBottom: "24px",
      }}>
        {/* Gradient accent top bar */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "var(--gradient-main)",
        }} />

        {/* Avatar */}
        <div style={{
          width: "96px",
          height: "96px",
          borderRadius: "50%",
          margin: "0 auto 20px",
          position: "relative",
          border: "3px solid var(--border-default)",
          boxShadow: "var(--shadow-glow-pink)",
          overflow: "hidden",
          background: "var(--bg-elevated)",
        }}>
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "User avatar"}
              fill
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--gradient-main)",
            }}>
              <User size={40} color="white" />
            </div>
          )}
        </div>

        {/* Name */}
        <h1 style={{
          fontSize: "24px",
          fontWeight: 800,
          marginBottom: "6px",
          fontFamily: "'Nunito', sans-serif",
        }}>
          {user.name ?? "MangaVerse User"}
        </h1>

        {/* Email */}
        <p style={{
          color: "var(--text-muted)",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}>
          <Mail size={14} />
          {user.email}
        </p>
      </div>

      {/* Info Cards */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginBottom: "24px",
      }}>
        {/* Account Info */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "16px",
          padding: "20px 24px",
        }}>
          <h2 style={{
            fontSize: "13px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            marginBottom: "16px",
          }}>
            Account Info
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(233,30,140,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <User size={16} color="var(--accent-pink)" />
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Display Name</p>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {user.name ?? "Not set"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(124,58,237,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <Mail size={16} color="var(--accent-purple)" />
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Email</p>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {user.email}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(34,197,94,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <Shield size={16} color="var(--success)" />
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Auth Provider</p>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {user.image?.includes("googleusercontent") ? "Google" : "OAuth"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "16px",
          padding: "20px 24px",
        }}>
          <h2 style={{
            fontSize: "13px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            marginBottom: "16px",
          }}>
            Quick Links
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link
              href="/library"
              className="profile-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                textDecoration: "none",
                color: "var(--text-secondary)",
                fontSize: "14px",
                fontWeight: 500,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                transition: "all 0.15s",
              }}
            >
              <Library size={16} />
              My Library
              <span style={{ marginLeft: "auto", color: "var(--text-disabled)", fontSize: "12px" }}>→</span>
            </Link>
            <Link
              href="/"
              className="profile-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                textDecoration: "none",
                color: "var(--text-secondary)",
                fontSize: "14px",
                fontWeight: 500,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                transition: "all 0.15s",
              }}
            >
              <BookOpen size={16} />
              Browse Manga
              <span style={{ marginLeft: "auto", color: "var(--text-disabled)", fontSize: "12px" }}>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        id="profile-signout-btn"
        onClick={() => signOut({ callbackUrl: "/" })}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "14px",
          borderRadius: "14px",
          border: "1px solid rgba(239,68,68,0.3)",
          background: "rgba(239,68,68,0.08)",
          color: "var(--error)",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <LogOut size={16} />
        Sign Out
      </button>

      <style>{`
        .profile-link:hover {
          border-color: var(--border-accent) !important;
          background: var(--bg-hover) !important;
          color: var(--text-primary) !important;
        }
        #profile-signout-btn:hover {
          background: rgba(239,68,68,0.15) !important;
          border-color: rgba(239,68,68,0.5) !important;
        }
      `}</style>
    </div>
  );
}
