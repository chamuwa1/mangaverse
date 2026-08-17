"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useTransition } from "react";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";
import toast from "react-hot-toast";
import { toggleBookmarkAction, checkBookmarkAction } from "@/app/library/actions";


interface BookmarkButtonProps {
  mangaId: string;
  mangaTitle: string;
  coverUrl: string;
}

export function BookmarkButton({ mangaId, mangaTitle, coverUrl }: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.user?.id) return;
    checkBookmarkAction(mangaId).then(({ bookmarked }) => setBookmarked(bookmarked));
  }, [session, mangaId]);

  const toggle = () => {
    if (!session) {
      toast.error("Please sign in to bookmark manga");
      return;
    }
    startTransition(async () => {
      try {
        const result = await toggleBookmarkAction({ mangaId, mangaTitle, coverUrl });
        setBookmarked(result.bookmarked);
        toast.success(result.bookmarked ? "Added to library! ✨" : "Removed from library");
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <button
      id={`bookmark-btn-${mangaId}`}
      onClick={toggle}
      disabled={isPending}
      className={bookmarked ? "btn-primary" : "btn-secondary"}
      style={{
        justifyContent: "center",
        padding: "12px",
        opacity: isPending ? 0.7 : 1,
        animation: bookmarked ? "pulse-glow 2s ease infinite" : "none",
      }}
    >
      {bookmarked ? (
        <><BookmarkCheck size={16} /> In Library</>
      ) : (
        <><BookmarkPlus size={16} /> Add to Library</>
      )}
    </button>
  );
}

