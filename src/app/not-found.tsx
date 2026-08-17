import Link from "next/link";
import { BookOpen, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      textAlign: "center",
      padding: "48px 24px",
    }}>
      <div style={{
        fontSize: "clamp(80px,20vw,160px)",
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 900,
        lineHeight: 1,
        background: "var(--gradient-main)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        marginBottom: "8px",
      }}>
        404
      </div>
      <h1 style={{ fontSize: "clamp(20px,4vw,32px)", marginBottom: "12px" }}>
        Page Not Found
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "15px", marginBottom: "36px", maxWidth: "400px" }}>
        This page doesn&apos;t exist. The manga you&apos;re looking for might have been moved or doesn&apos;t exist.
      </p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="btn-primary">
          <Home size={16} /> Back to Home
        </Link>
        <Link href="/browse" className="btn-secondary">
          <BookOpen size={16} /> Browse Manga
        </Link>
      </div>
    </div>
  );
}
