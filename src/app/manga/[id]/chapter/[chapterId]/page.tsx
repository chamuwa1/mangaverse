import { getAtHomeServer, getMangaFeed, getMangaById, getMangaTitle, getCoverUrl } from "@/lib/api/mangadex";
import { notFound } from "next/navigation";
import { ChapterReaderClient } from "@/components/reader/ChapterReaderClient";
import type { Metadata } from "next";

interface ReaderPageProps {
  params: Promise<{ id: string; chapterId: string }>;
}

export async function generateMetadata({ params }: ReaderPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data: manga } = await getMangaById(id);
    const title = getMangaTitle(manga);
    return {
      title: `Reading ${title}`,
      description: `Read ${title} online free at MangaVerse.`,
      robots: { index: false, follow: false }, // Don't index reader pages
    };
  } catch {
    return { title: "Chapter Reader" };
  }
}

export default async function ChapterReaderPage({ params }: ReaderPageProps) {
  const { id, chapterId } = await params;

  let atHome, chapters, manga;
  try {
    [atHome, { data: chapters }, { data: manga }] = await Promise.all([
      getAtHomeServer(chapterId),
      getMangaFeed(id, { limit: 200 }),
      getMangaById(id),
    ]);
  } catch {
    notFound();
  }

  if (atHome.result !== "ok") notFound();

  // Build direct image URLs to bypass Vercel Origin Transfer
  const imageUrls = atHome.chapter.data.map(
    (filename) => `${atHome.baseUrl}/data/${atHome.chapter.hash}/${filename}`
  );

  // Build chapter navigation list (sorted ascending)
  const sortedChapters = [...(chapters ?? [])].sort((a, b) => {
    const na = parseFloat(a.attributes.chapter ?? "0");
    const nb = parseFloat(b.attributes.chapter ?? "0");
    return na - nb;
  });

  const currentIdx = sortedChapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIdx > 0 ? sortedChapters[currentIdx - 1] : null;
  const nextChapter = currentIdx < sortedChapters.length - 1 ? sortedChapters[currentIdx + 1] : null;
  const currentChapter = sortedChapters[currentIdx];

  return (
    <ChapterReaderClient
      mangaId={id}
      mangaTitle={getMangaTitle(manga)}
      chapterId={chapterId}
      chapterNum={currentChapter?.attributes.chapter ?? "?"}
      imageUrls={imageUrls}
      prevChapterId={prevChapter?.id ?? null}
      nextChapterId={nextChapter?.id ?? null}
      chapters={sortedChapters.map((c) => ({
        id: c.id,
        num: c.attributes.chapter ?? "?",
        title: c.attributes.title,
      }))}
      coverUrl={getCoverUrl(manga)}
    />
  );
}
