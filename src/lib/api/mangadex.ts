// MangaDex API v5 Client
const BASE_URL = "https://api.mangadex.org";

export interface MangaSearchParams {
  title?: string;
  limit?: number;
  offset?: number;
  includedTags?: string[];
  excludedTags?: string[];
  status?: string[];
  contentRating?: string[];
  order?: Record<string, "asc" | "desc">;
  includes?: string[];
  publicationDemographic?: string[];
}

export interface MangaAttributes {
  title: Record<string, string>;
  altTitles: Record<string, string>[];
  description: Record<string, string>;
  status: string;
  year: number | null;
  contentRating: string;
  tags: Array<{ id: string; attributes: { name: Record<string, string>; group: string } }>;
  originalLanguage: string;
  lastChapter: string | null;
  lastVolume: string | null;
  updatedAt: string;
  createdAt: string;
  publicationDemographic: string | null;
}

export interface MangaRelationship {
  id: string;
  type: string;
  attributes?: {
    fileName?: string;
    name?: string;
    description?: string;
    biography?: Record<string, string>;
  };
}

export interface MangaItem {
  id: string;
  type: string;
  attributes: MangaAttributes;
  relationships: MangaRelationship[];
}

export interface ChapterAttributes {
  title: string | null;
  volume: string | null;
  chapter: string | null;
  pages: number;
  translatedLanguage: string;
  externalUrl: string | null;
  publishAt: string;
  readableAt: string;
  updatedAt: string;
}

export interface ChapterItem {
  id: string;
  type: string;
  attributes: ChapterAttributes;
  relationships: MangaRelationship[];
}

export interface AtHomeResponse {
  result: string;
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

const RATE_LIMIT_DELAY = 250; // 4 req/sec to stay under 5/sec limit
let lastRequestTime = 0;

async function rateLimitedFetch(url: string, options?: RequestInit): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_DELAY) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_DELAY - elapsed));
  }
  lastRequestTime = Date.now();
  return fetch(url, options);
}

async function mangadexFetch<T>(path: string, params?: Record<string, string | string[] | number | boolean>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        const paramKey = key.endsWith("[]") ? key : `${key}[]`;
        value.forEach((v) => url.searchParams.append(paramKey, String(v)));
      } else if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const res = await rateLimitedFetch(url.toString(), {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`MangaDex API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function searchManga(params: MangaSearchParams) {
  const queryParams: Record<string, string | string[] | number | boolean> = {
    limit: params.limit ?? 20,
    offset: params.offset ?? 0,
    "includes[]": ["cover_art", "author", "artist"],
    "contentRating[]": params.contentRating ?? ["safe", "suggestive"],
  };

  if (params.title) {
    queryParams.title = params.title;
  }

  if (params.status?.length) {
    queryParams["status[]"] = params.status;
  }

  if (params.includedTags?.length) {
    queryParams["includedTags[]"] = params.includedTags;
  }

  if (params.order) {
    Object.entries(params.order).forEach(([key, value]) => {
      queryParams[`order[${key}]`] = value;
    });
  } else if (params.title) {
    queryParams["order[relevance]"] = "desc";
  } else {
    queryParams["order[updatedAt]"] = "desc"; // default sort
  }

  return mangadexFetch<{ data: MangaItem[]; total: number; limit: number; offset: number }>("/manga", queryParams);
}

export async function getMangaById(id: string) {
  return mangadexFetch<{ data: MangaItem }>(`/manga/${id}`, {
    "includes[]": ["cover_art", "author", "artist"],
  } as Record<string, string | string[] | number | boolean>);
}

export async function getMangaFeed(id: string, params?: { limit?: number; offset?: number; language?: string }) {
  return mangadexFetch<{ data: ChapterItem[]; total: number }>(`/manga/${id}/feed`, {
    limit: params?.limit ?? 100,
    offset: params?.offset ?? 0,
    "translatedLanguage[]": params?.language ?? "en",
    "order[chapter]": "desc",
    "includes[]": ["scanlation_group"],
    "contentRating[]": ["safe", "suggestive"],
  } as Record<string, string | string[] | number | boolean>);
}

export async function getMangaAggregate(id: string) {
  return mangadexFetch<{ volumes: Record<string, { chapters: Record<string, { id: string; chapter: string; count: number }> }> }>(`/manga/${id}/aggregate`, {
    "translatedLanguage[]": "en",
  } as Record<string, string | string[] | number | boolean>);
}

export async function getAtHomeServer(chapterId: string) {
  return mangadexFetch<AtHomeResponse>(`/at-home/server/${chapterId}`);
}

export async function getLatestUpdates(limit = 20, offset = 0) {
  return mangadexFetch<{ data: MangaItem[]; total: number }>("/manga", {
    limit,
    offset,
    "order[updatedAt]": "desc",
    "includes[]": ["cover_art"],
    "contentRating[]": ["safe", "suggestive"],
    "hasAvailableChapters": "true",
  } as Record<string, string | string[] | number | boolean>);
}

export async function getPopularManga(limit = 20) {
  return mangadexFetch<{ data: MangaItem[]; total: number }>("/manga", {
    limit,
    "order[followedCount]": "desc",
    "includes[]": ["cover_art"],
    "contentRating[]": ["safe", "suggestive"],
    "hasAvailableChapters": "true",
  } as Record<string, string | string[] | number | boolean>);
}

export function getCoverUrl(manga: MangaItem, size: "256" | "512" | "" = "512"): string {
  const cover = manga.relationships.find((r) => r.type === "cover_art");
  if (!cover?.attributes?.fileName) return "/images/placeholder-cover.jpg";
  const suffix = size ? `.${size}.jpg` : "";
  return `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}${suffix}`;
}

export function getMangaTitle(manga: MangaItem): string {
  return (
    manga.attributes.title.en ||
    manga.attributes.title["ja-ro"] ||
    Object.values(manga.attributes.title)[0] ||
    "Unknown Title"
  );
}

export function getMangaDescription(manga: MangaItem): string {
  return (
    manga.attributes.description.en ||
    Object.values(manga.attributes.description)[0] ||
    "No description available."
  );
}

export function getMangaAuthor(manga: MangaItem): string {
  const author = manga.relationships.find((r) => r.type === "author");
  return author?.attributes?.name ?? "Unknown";
}
