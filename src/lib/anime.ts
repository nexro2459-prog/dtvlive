// AniList-backed anime library.
// Streams are played through public embed providers keyed by AniList ID,
// which is far more reliable than iframing the source website (blocked by CF/XFO).

export interface AnimeItem {
  id: string; // stringified AniList ID
  anilistId: number;
  title: string;
  romaji: string;
  poster: string;
  banner?: string;
  description?: string;
  type: "series" | "movie";
  format?: string;
  episodes: number; // 0 = unknown/ongoing
  status?: string;
  year?: number;
  averageScore?: number;
  genres: string[];
  categories: string[]; // lowercase genres for filtering
}

// Genres surfaced in the filter bar (AniList canonical list, keep lowercase).
export const animeGenres = [
  "All",
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
  "Ecchi",
  "Mecha",
  "Music",
  "Psychological",
];

const ANILIST = "https://graphql.anilist.co";

interface AniListMedia {
  id: number;
  title: { romaji: string; english: string | null; native: string | null };
  format: string | null;
  episodes: number | null;
  status: string | null;
  seasonYear: number | null;
  averageScore: number | null;
  genres: string[];
  description: string | null;
  coverImage: { large: string | null; extraLarge: string | null };
  bannerImage: string | null;
}

function toItem(m: AniListMedia): AnimeItem {
  const isMovie = m.format === "MOVIE";
  const title = m.title.english || m.title.romaji || m.title.native || "Untitled";
  return {
    id: String(m.id),
    anilistId: m.id,
    title,
    romaji: m.title.romaji || title,
    poster: m.coverImage.extraLarge || m.coverImage.large || "",
    banner: m.bannerImage || undefined,
    description: m.description
      ? m.description.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")
      : undefined,
    type: isMovie ? "movie" : "series",
    format: m.format || undefined,
    episodes: m.episodes ?? 0,
    status: m.status || undefined,
    year: m.seasonYear || undefined,
    averageScore: m.averageScore || undefined,
    genres: m.genres || [],
    categories: (m.genres || []).map((g) => g.toLowerCase()),
  };
}

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  format
  episodes
  status
  seasonYear
  averageScore
  genres
  description(asHtml: false)
  coverImage { large extraLarge }
  bannerImage
`;

export interface ListOptions {
  page?: number;
  perPage?: number;
  search?: string;
  genre?: string; // canonical AniList genre e.g. "Action"
  type?: "series" | "movie" | "all";
  sort?: "TRENDING" | "POPULARITY" | "SCORE" | "RECENT";
}

export interface ListResult {
  items: AnimeItem[];
  hasNextPage: boolean;
  total: number;
}

export async function fetchAnimeList(opts: ListOptions = {}): Promise<ListResult> {
  const {
    page = 1,
    perPage = 30,
    search,
    genre,
    type = "all",
    sort = "TRENDING",
  } = opts;

  const sortMap: Record<string, string> = {
    TRENDING: "TRENDING_DESC",
    POPULARITY: "POPULARITY_DESC",
    SCORE: "SCORE_DESC",
    RECENT: "START_DATE_DESC",
  };

  const variables: Record<string, unknown> = {
    page,
    perPage,
    sort: [sortMap[sort] || "TRENDING_DESC"],
  };
  if (search && search.trim()) variables.search = search.trim();
  if (genre && genre !== "All") variables.genre = genre;
  if (type === "movie") variables.format = "MOVIE";
  else if (type === "series")
    variables.formatNot = "MOVIE"; // exclude movies

  // Build the query dynamically so unused variables don't get declared.

  const dynamicQuery = `
    query ($page: Int, $perPage: Int${search ? ", $search: String" : ""}${genre && genre !== "All" ? ", $genre: String" : ""}, $sort: [MediaSort]${type === "movie" ? ", $format: MediaFormat" : ""}${type === "series" ? ", $formatNot: MediaFormat" : ""}) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { hasNextPage total }
        media(
          type: ANIME
          isAdult: false
          ${search ? "search: $search" : ""}
          ${genre && genre !== "All" ? "genre_in: [$genre]" : ""}
          sort: $sort
          ${type === "movie" ? "format: $format" : ""}
          ${type === "series" ? "format_not: $formatNot" : ""}
        ) { ${MEDIA_FIELDS} }
      }
    }
  `;

  const res = await fetch(ANILIST, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ query: dynamicQuery, variables }),
  });
  if (!res.ok) throw new Error(`AniList error ${res.status}`);
  const json = (await res.json()) as {
    data?: {
      Page?: {
        pageInfo: { hasNextPage: boolean; total: number };
        media: AniListMedia[];
      };
    };
    errors?: Array<{ message: string }>;
  };
  if (json.errors?.length)
    throw new Error(json.errors.map((e) => e.message).join("; "));
  const p = json.data?.Page;
  return {
    items: (p?.media || []).map(toItem),
    hasNextPage: p?.pageInfo.hasNextPage ?? false,
    total: p?.pageInfo.total ?? 0,
  };
}

export async function fetchAnimeById(id: number | string): Promise<AnimeItem | null> {
  const numId = typeof id === "string" ? Number(id) : id;
  if (!Number.isFinite(numId)) return null;
  const query = `query ($id: Int) { Media(id: $id, type: ANIME) { ${MEDIA_FIELDS} } }`;
  const res = await fetch(ANILIST, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ query, variables: { id: numId } }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: { Media?: AniListMedia | null } };
  const m = json.data?.Media;
  return m ? toItem(m) : null;
}

// Embed providers keyed by AniList ID. Multiple servers for reliability.
export interface EmbedServer {
  id: string;
  label: string;
  url: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function embedServers(
  item: AnimeItem,
  episode: number,
  dub: boolean,
): EmbedServer[] {
  const ep = Math.max(1, episode || 1);
  const slug = slugify(item.romaji);
  return [
    {
      id: "vidsrc",
      label: "Vidsrc (HD)",
      url: `https://vidsrc.cc/v2/embed/anime/ani${item.anilistId}/${ep}/${dub ? "true" : "false"}`,
    },
    {
      id: "vidsrc-icu",
      label: "Vidsrc ICU",
      url: `https://vidsrc.icu/embed/anime/${item.anilistId}/${ep}/${dub ? "1" : "0"}`,
    },
    {
      id: "2anime",
      label: "2Anime",
      url: `https://2anime.xyz/embed/${slug}-episode-${ep}${dub ? "-dub" : ""}`,
    },
    {
      id: "2embed",
      label: "2Embed",
      url: `https://www.2embed.cc/embedanime/ani${item.anilistId}&s=${ep}`,
    },
  ];
}

// Legacy compatibility shim: existing routes may still reference `sourceUrlFor`.
export function sourceUrlFor(item: AnimeItem, episode = 1, dub = false): string {
  return embedServers(item, episode, dub)[0].url;
}
