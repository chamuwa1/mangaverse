import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ReadingMode = "vertical" | "horizontal" | "double";
export type ReadingDirection = "ltr" | "rtl";
export type PageFit = "width" | "height" | "original";
export type BackgroundColor = "black" | "gray" | "white";

interface ReaderState {
  mode: ReadingMode;
  direction: ReadingDirection;
  pageFit: PageFit;
  backgroundColor: BackgroundColor;
  currentPage: number;
  zoom: number;
  showControls: boolean;
  setMode: (mode: ReadingMode) => void;
  setDirection: (dir: ReadingDirection) => void;
  setPageFit: (fit: PageFit) => void;
  setBackgroundColor: (color: BackgroundColor) => void;
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  toggleControls: () => void;
  setShowControls: (show: boolean) => void;
  nextPage: (totalPages: number) => void;
  prevPage: () => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      mode: "vertical",
      direction: "ltr",
      pageFit: "width",
      backgroundColor: "black",
      currentPage: 1,
      zoom: 1,
      showControls: true,
      setMode: (mode) => set({ mode }),
      setDirection: (direction) => set({ direction }),
      setPageFit: (pageFit) => set({ pageFit }),
      setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3, zoom)) }),
      toggleControls: () => set((s) => ({ showControls: !s.showControls })),
      setShowControls: (showControls) => set({ showControls }),
      nextPage: (totalPages) => {
        const { currentPage } = get();
        if (currentPage < totalPages) set({ currentPage: currentPage + 1 });
      },
      prevPage: () => {
        const { currentPage } = get();
        if (currentPage > 1) set({ currentPage: currentPage - 1 });
      },
    }),
    {
      name: "mangaverse-reader",
      partialize: (state) => ({ 
        mode: state.mode, 
        direction: state.direction,
        pageFit: state.pageFit,
        backgroundColor: state.backgroundColor,
      }),
    }
  )
);
