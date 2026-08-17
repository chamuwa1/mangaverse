// AniList GraphQL API Client
const ANILIST_URL = "https://graphql.anilist.co";

export interface AniListMedia {
  id: number;
  title: { romaji: string; english: string | null; native: string };
  coverImage: { large: string; extraLarge: string; color: string | null };
  bannerImage: string | null;
  description: string | null;
  genres: string[];
  averageScore: number | null;
  popularity: number;
  status: string;
  chapters: number | null;
  volumes: number | null;
  format: string;
  countryOfOrigin: string;
  tags: Array<{ name: string; category: string }>;
  staff: { edges: Array<{ role: string; node: { name: { full: string } } }> };
}

async function anilistQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 1800 },
  });

  if (!res.ok) throw new Error(`AniList API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data as T;
}

export async function getTrendingManga(perPage = 12) {
  const query = `
    query TrendingManga($perPage: Int) {
      Page(perPage: $perPage) {
        media(type: MANGA, sort: TRENDING_DESC, isAdult: false) {
          id title { romaji english native }
          coverImage { large extraLarge color }
          bannerImage description genres averageScore popularity
          status chapters volumes format countryOfOrigin
          tags { name category }
          staff { edges { role node { name { full } } } }
        }
      }
    }
  `;
  return anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { perPage });
}

export async function getPopularMangaAniList(perPage = 12) {
  const query = `
    query PopularManga($perPage: Int) {
      Page(perPage: $perPage) {
        media(type: MANGA, sort: POPULARITY_DESC, isAdult: false) {
          id title { romaji english native }
          coverImage { large extraLarge color }
          bannerImage description genres averageScore popularity
          status chapters volumes format countryOfOrigin
          tags { name category }
          staff { edges { role node { name { full } } } }
        }
      }
    }
  `;
  return anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { perPage });
}

export async function getMangaByIdAniList(id: number) {
  const query = `
    query MangaById($id: Int) {
      Media(id: $id, type: MANGA) {
        id title { romaji english native }
        coverImage { large extraLarge color }
        bannerImage description genres averageScore popularity
        status chapters volumes format countryOfOrigin
        tags { name category }
        staff { edges { role node { name { full } } } }
      }
    }
  `;
  return anilistQuery<{ Media: AniListMedia }>(query, { id });
}

export function getAniListTitle(media: AniListMedia): string {
  return media.title.english || media.title.romaji || media.title.native;
}
