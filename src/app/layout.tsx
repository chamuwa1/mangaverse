import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { PageViewTracker } from "@/components/PageViewTracker";

export const viewport: Viewport = {
  themeColor: "#e91e8c",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "MangaVerse — Read Manga, Manhua & Comics Free",
    template: "%s | MangaVerse",
  },
  description:
    "Read manga, manhua, manhwa and comics online for free. Thousands of titles updated daily. No account required to read.",
  keywords: ["manga", "manhua", "manhwa", "comics", "read manga online", "free manga"],
  authors: [{ name: "MangaVerse" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "MangaVerse",
    title: "MangaVerse — Read Manga, Manhua & Comics Free",
    description: "Thousands of manga, manhua, manhwa and comics updated daily.",
  },
  icons: {
    icon: "/icon.jpg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Providers>
          <PageViewTracker />
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar />
            <main style={{ flex: 1 }}>{children}</main>
            <ScrollToTop />
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

