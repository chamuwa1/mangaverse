"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function TrackerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    // Construct full path with search parameters if they exist
    const searchString = searchParams?.toString();
    const fullPath = searchString ? `${pathname}?${searchString}` : pathname;

    // Prevent duplicate tracking of the same path in immediate succession
    if (lastTracked.current === fullPath) return;
    lastTracked.current = fullPath;

    // Track the view
    const trackView = async () => {
      try {
        await fetch("/api/page-views", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: fullPath,
            referrer: typeof document !== "undefined" ? document.referrer : null,
          }),
        });
      } catch (err) {
        console.error("Failed to record page view:", err);
      }
    };

    trackView();
  }, [pathname, searchParams]);

  return null;
}

export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerContent />
    </Suspense>
  );
}
