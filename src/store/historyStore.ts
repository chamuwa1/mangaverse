import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ReadHistoryItem {
  mangaId: string;
  chapterId: string;
  title: string;
  coverUrl: string;
  chapterTitle: string | null;
  chapterNumber: string | null;
  timestamp: number;
}

interface HistoryState {
  history: Record<string, ReadHistoryItem>;
  addHistory: (item: ReadHistoryItem) => void;
  removeHistory: (mangaId: string) => void;
  clearHistory: () => void;
}

// Cache stores by userId so we don't recreate on every render
const storeCache = new Map<string, ReturnType<typeof buildHistoryStore>>();

function buildHistoryStore(storageKey: string) {
  return create<HistoryState>()(
    persist(
      (set) => ({
        history: {},
        addHistory: (item) =>
          set((state) => ({
            history: {
              ...state.history,
              [item.mangaId]: item,
            },
          })),
        removeHistory: (mangaId) =>
          set((state) => {
            const newHistory = { ...state.history };
            delete newHistory[mangaId];
            return { history: newHistory };
          }),
        clearHistory: () => set({ history: {} }),
      }),
      {
        name: storageKey,
        storage: createJSONStorage(() => localStorage),
      }
    )
  );
}

/**
 * Returns a per-user history store.
 * Pass the logged-in user's ID to get their own isolated history.
 * Pass null/undefined for guests — they get a shared guest store.
 */
export function getHistoryStore(userId?: string | null) {
  const key = userId
    ? `mangaverse-history-${userId}`
    : "mangaverse-history-guest";
  if (!storeCache.has(key)) {
    storeCache.set(key, buildHistoryStore(key));
  }
  return storeCache.get(key)!;
}

// Legacy export kept for backward compatibility — uses guest key
export const useHistoryStore = buildHistoryStore("mangaverse-history-guest");

