import { signIn } from "@/auth";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — MangaVerse",
  description: "Sign in to MangaVerse to sync your library and reading history.",
};

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

const ERRORS: Record<string, string> = {
  OAuthSignin: "Error signing in. Please try again.",
  OAuthCallback: "OAuth callback error. Please try again.",
  OAuthCreateAccount: "Could not create account.",
  AccessDenied: "Access denied.",
  Default: "An error occurred. Please try again.",
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const sp = await searchParams;
  const errorMsg = sp.error ? (ERRORS[sp.error] ?? ERRORS.Default) : null;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "var(--bg-primary)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute",
        top: "30%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(233,30,140,0.08) 0%, rgba(124,58,237,0.05) 50%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "24px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "420px",
        position: "relative",
        boxShadow: "var(--shadow-card), var(--shadow-glow-purple)",
        animation: "fadeIn 0.4s ease",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "var(--gradient-main)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "var(--shadow-glow-pink)",
            fontSize: "24px",
          }}>
            📚
          </div>
          <h1 style={{ fontSize: "24px", fontFamily: "'Nunito', sans-serif", marginBottom: "6px" }}>
            Welcome to MangaVerse
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Sign in to sync your library and reading progress
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "13px",
            color: "var(--error)",
          }}>
            {errorMsg}
          </div>
        )}

        {/* OAuth buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <form action={async () => {
            "use server";
            await signIn("google", { redirectTo: sp.callbackUrl ?? "/" });
          }}>
            <button
              id="signin-google-btn"
              type="submit"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid var(--border-default)",
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"/>
                <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.76-2.7.76-2.08 0-3.84-1.4-4.47-3.29H1.87v2.07A8 8 0 0 0 8.98 17z" fill="#34A853"/>
                <path d="M4.51 10.52A4.8 4.8 0 0 1 4.26 9c0-.53.09-1.04.25-1.52V5.41H1.87A8 8 0 0 0 .98 9c0 1.29.31 2.51.89 3.59l2.64-2.07z" fill="#FBBC05"/>
                <path d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 .98 9l2.89 2.07c.63-1.89 2.39-3.29 4.47-3.29z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>
        </div>

        {/* Divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          margin: "24px 0",
          color: "var(--text-disabled)",
          fontSize: "12px",
        }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
          No account required to read
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
        </div>

        <Link href="/browse" className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
          Browse without signing in
        </Link>

        <p style={{
          marginTop: "24px",
          fontSize: "11px",
          color: "var(--text-disabled)",
          textAlign: "center",
          lineHeight: 1.6,
        }}>
          By signing in, you agree to our{" "}
          <Link href="/privacy" style={{ color: "var(--text-muted)" }}>Privacy Policy</Link>.
          Content powered by{" "}
          <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-pink)" }}>
            MangaDex
          </a>.
        </p>
      </div>
    </div>
  );
}
