import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface AnimeEpisodeSource {
  id: string;
  number: number;
  title: string;
  url: string;
}

export interface AnimeStreamSource {
  id: string;
  label: string;
  url: string;
  type: "iframe";
  audio: "sub" | "dub" | "raw";
}

export interface AnimePlaybackSources {
  source: "hianime";
  title: string;
  watchUrl: string;
  animeId: string;
  episodeId: string;
  episodeNumber: number;
  episodes: AnimeEpisodeSource[];
  servers: AnimeStreamSource[];
}

const HIANIME = "https://hianime.ro";

function decodeHtml(value: string): string {
  return value
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function normalizeTitle(value: string): string {
  return decodeHtml(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(season|part|movie|the|ova|ona|tv|special|episode|english|sub|dub)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function attr(tag: string, name: string): string {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function absoluteUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http")) return decodeHtml(url);
  return `${HIANIME}${url.startsWith("/") ? "" : "/"}${decodeHtml(url)}`;
}

async function fetchSource(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      referer: HIANIME,
    },
  });
  if (!response.ok) throw new Error(`Anime source responded ${response.status}`);
  return response.text();
}

function parseSearchResults(html: string) {
  return html
    .split(/<div class="flw-item[^>]*">/g)
    .slice(1)
    .map((chunk) => {
      const linkTag = chunk.match(/<a\s+[^>]*href=["'][^"']*\/watch\/[^"']+["'][^>]*>/i)?.[0] ?? "";
      const imgTag = chunk.match(/<img\s+[^>]*class=["'][^"']*film-poster-img[^"']*["'][^>]*>/i)?.[0] ?? "";
      const nameTag = chunk.match(/<a\s+[^>]*class=["'][^"']*dynamic-name[^"']*["'][^>]*>[\s\S]*?<\/a>/i)?.[0] ?? "";
      const title =
        attr(linkTag, "title") ||
        attr(imgTag, "alt") ||
        decodeHtml(nameTag.replace(/<[^>]+>/g, " "));
      const href = absoluteUrl(attr(linkTag, "href"));
      const id = attr(linkTag, "data-id");
      const poster = attr(imgTag, "data-src") || attr(imgTag, "src");
      const episodes = Number(chunk.match(/tick-eps[^>]*>\s*(\d+)/i)?.[1] ?? 0);
      if (!title || !href) return null;
      return { id, title, href, poster: decodeHtml(poster), episodes };
    })
    .filter(Boolean) as Array<{
    id: string;
    title: string;
    href: string;
    poster: string;
    episodes: number;
  }>;
}

function scoreResult(resultTitle: string, wanted: string[]) {
  const result = normalizeTitle(resultTitle);
  let score = 0;
  for (const raw of wanted) {
    const title = normalizeTitle(raw);
    if (!title) continue;
    if (result === title) score = Math.max(score, 1000);
    if (result.startsWith(title) || title.startsWith(result)) score = Math.max(score, 700);
    if (result.includes(title) || title.includes(result)) score = Math.max(score, 500);
    const words = title.split(" ").filter((word) => word.length > 2);
    score += words.filter((word) => result.includes(word)).length * 20;
  }
  return score;
}

function decodeBase64(value: string): string {
  try {
    if (typeof atob === "function") return atob(value);
  } catch {}
  try {
    return Buffer.from(value, "base64").toString("utf8");
  } catch {
    return "";
  }
}

function parseAniDetail(html: string) {
  const detailTag = html.match(/<div\s+id=["']ani_detail["'][^>]*>/i)?.[0] ?? "";
  return {
    animeId: attr(detailTag, "data-anime-id"),
    episodeId: attr(detailTag, "data-id"),
  };
}

function parseEpisodes(html: string): AnimeEpisodeSource[] {
  const matches = html.match(/<a\s+[^>]*class=["'][^"']*ep-item[^"']*["'][^>]*>[\s\S]*?<\/a>/gi) ?? [];
  return matches
    .map((tag) => {
      const number = Number(attr(tag, "data-number"));
      const id = attr(tag, "data-id");
      const url = absoluteUrl(attr(tag, "href"));
      const title = decodeHtml(
        tag.match(/<div[^>]*class=["'][^"']*ep-name[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1]?.replace(/<[^>]+>/g, " ") ??
          `Episode ${number || ""}`,
      );
      if (!id || !number) return null;
      return { id, number, title, url };
    })
    .filter(Boolean) as AnimeEpisodeSource[];
}

function parseServers(html: string, preferDub: boolean): AnimeStreamSource[] {
  const sourcePriority = (url: string) => {
    const host = url.toLowerCase();
    if (host.includes("vidnest.fun")) return 0;
    if (host.includes("tryembed")) return 1;
    if (host.includes("megaplay")) return 2;
    return 3;
  };

  const matches = html.match(/<div\s+class=["']item server-item["'][^>]*>/gi) ?? [];
  const all = matches
    .map((tag, index) => {
      const audio = (attr(tag, "data-type") || "raw").toLowerCase() as "sub" | "dub" | "raw";
      const name = attr(tag, "data-server-name") || `Server ${index + 1}`;
      const url = decodeBase64(attr(tag, "data-hash"));
      if (!url.startsWith("http")) return null;
      return {
        id: `${audio}-${normalizeTitle(name) || index}`,
        label: `Hianime ${name}${audio === "raw" ? "" : ` ${audio.toUpperCase()}`}`,
        url,
        type: "iframe" as const,
        audio,
      };
    })
    .filter(Boolean) as AnimeStreamSource[];

  const byReliability = (a: AnimeStreamSource, b: AnimeStreamSource) =>
    sourcePriority(a.url) - sourcePriority(b.url);
  const preferred = all
    .filter((server) => server.audio === (preferDub ? "dub" : "sub"))
    .sort(byReliability);
  const fallback = all
    .filter((server) => server.audio !== (preferDub ? "dub" : "sub"))
    .sort(byReliability);
  return [...preferred, ...fallback];
}

async function findHianimeTitle(title: string, romaji?: string) {
  const wanted = [title, romaji].filter(Boolean) as string[];
  const queries = Array.from(new Set(wanted));
  const results = [] as ReturnType<typeof parseSearchResults>;

  for (const query of queries) {
    const html = await fetchSource(`${HIANIME}/?s=${encodeURIComponent(query)}`);
    results.push(...parseSearchResults(html));
    if (results.some((result) => scoreResult(result.title, wanted) >= 1000)) break;
  }

  return results
    .map((result) => ({ result, score: scoreResult(result.title, wanted) }))
    .sort((a, b) => b.score - a.score || b.result.episodes - a.result.episodes)[0]?.result;
}

const InputSchema = z.object({
  title: z.string().min(1).max(220),
  romaji: z.string().max(220).optional(),
  episode: z.number().int().min(1).max(4000).default(1),
  dub: z.boolean().default(false),
});

export const resolveAnimePlaybackSources = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<AnimePlaybackSources> => {
    const match = await findHianimeTitle(data.title, data.romaji);
    if (!match) throw new Error("No playable source was found for this title.");

    const watchHtml = await fetchSource(match.href);
    const detail = parseAniDetail(watchHtml);
    if (!detail.animeId) throw new Error("The source did not return episode data.");

    const episodeResponse = await fetch(`${HIANIME}/wp-json/v1/otakuthemes/episode/list/${detail.animeId}`, {
      headers: { accept: "application/json", referer: match.href, "user-agent": "Mozilla/5.0" },
    });
    if (!episodeResponse.ok) throw new Error("Could not load episodes from the source.");
    const episodeJson = (await episodeResponse.json()) as { status?: boolean; html?: string };
    const episodes = parseEpisodes(episodeJson.html ?? "");
    if (!episodes.length) throw new Error("No episodes were available from the source.");

    const selected =
      episodes.find((episode) => episode.number === data.episode) ??
      episodes.find((episode) => episode.id === detail.episodeId) ??
      episodes[0];

    const serversResponse = await fetch(
      `${HIANIME}/wp-json/v1/otakuthemes/episode/servers?episodeId=${encodeURIComponent(selected.id)}`,
      { headers: { accept: "application/json", referer: selected.url, "user-agent": "Mozilla/5.0" } },
    );
    if (!serversResponse.ok) throw new Error("Could not load stream servers from the source.");
    const serversJson = (await serversResponse.json()) as { status?: boolean; html?: string };
    const servers = parseServers(serversJson.html ?? "", data.dub);
    if (!servers.length) throw new Error("No playable stream servers were available for this episode.");

    return {
      source: "hianime",
      title: match.title,
      watchUrl: selected.url,
      animeId: detail.animeId,
      episodeId: selected.id,
      episodeNumber: selected.number,
      episodes,
      servers,
    };
  });