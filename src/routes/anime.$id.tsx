import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Maximize2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Server,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  embedServers,
  fetchAnimeById,
  fetchAnimeList,
  type AnimeItem,
} from "@/lib/anime";

export const Route = createFileRoute("/anime/$id")({
  loader: async ({ params }) => {
    const item = await fetchAnimeById(params.id);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.item?.title ?? "Anime";
    return {
      meta: [
        { title: `${t} — Watch on Dtv` },
        {
          name: "description",
          content:
            loaderData?.item?.description?.slice(0, 160) ??
            `Watch ${t} online in HD on Dtv.`,
        },
        { property: "og:title", content: `${t} — Watch on Dtv` },
        { property: "og:image", content: loaderData?.item?.poster ?? "" },
      ],
    };
  },
  errorComponent: () => (
    <div className="p-8 text-center text-sm text-muted-foreground">
      Something went wrong.{" "}
      <Link to="/anime" className="text-foreground underline">
        Back to library
      </Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center text-sm text-muted-foreground">
      Title not found.{" "}
      <Link to="/anime" className="text-foreground underline">
        Back to library
      </Link>
    </div>
  ),
  component: AnimeDetail,
});

function AnimeDetail() {
  const { item } = Route.useLoaderData();
  const [episode, setEpisode] = useState(1);
  const [dub, setDub] = useState(false);
  const [serverIdx, setServerIdx] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [related, setRelated] = useState<AnimeItem[]>([]);

  const totalEps = item.episodes && item.episodes > 0 ? item.episodes : 1;
  const isMovie = item.type === "movie";
  const servers = useMemo(
    () => embedServers(item, isMovie ? 1 : episode, dub),
    [item, episode, dub, isMovie],
  );
  const activeServer = servers[Math.min(serverIdx, servers.length - 1)];

  useEffect(() => {
    let cancelled = false;
    const g = item.genres[0];
    if (!g) return;
    fetchAnimeList({ perPage: 12, genre: g, sort: "POPULARITY" })
      .then((r) => {
        if (cancelled) return;
        setRelated(r.items.filter((x) => x.id !== item.id).slice(0, 8));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [item.id, item.genres]);

  const episodes = useMemo(
    () => Array.from({ length: totalEps }, (_, i) => i + 1),
    [totalEps],
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-[1600px] px-4 pb-12 pt-6">
        <Link
          to="/anime"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Anime
        </Link>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Poster + info */}
          <aside className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-card/50 shadow-[0_20px_60px_-30px_oklch(0.65_0.22_290/0.7)]">
              {item.poster ? (
                <img
                  src={item.poster}
                  alt={item.title}
                  className="aspect-[2/3] w-full object-cover"
                  loading="eager"
                />
              ) : null}
            </div>
            <div>
              <span className="mb-2 inline-block rounded-full bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {isMovie ? "Movie" : "Series"}
              </span>
              <h1 className="text-2xl font-black leading-tight text-foreground">
                {item.title}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.year ?? ""}
                {item.episodes ? ` · ${item.episodes} episodes` : ""}
                {item.averageScore
                  ? ` · ★ ${(item.averageScore / 10).toFixed(1)}`
                  : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.genres.map((c: string) => (
                  <span
                    key={c}
                    className="rounded-full border border-border bg-card/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
              {item.description ? (
                <p className="mt-3 line-clamp-6 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>
          </aside>

          {/* Player */}
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-black shadow-[0_30px_80px_-30px_oklch(0.65_0.22_290/0.8)]">
              <div className="aspect-video w-full">
                <iframe
                  key={`${activeServer.id}-${episode}-${dub}-${reloadKey}`}
                  src={activeServer.url}
                  title={item.title}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                />
              </div>
              <a
                href={activeServer.url}
                target="_blank"
                rel="noreferrer"
                className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur transition hover:bg-black/80"
              >
                <Maximize2 className="h-3 w-3" /> Full page
              </a>
            </div>

            {/* Server + controls */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 p-1">
                <button
                  onClick={() => setDub(false)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${!dub ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}
                >
                  SUB
                </button>
                <button
                  onClick={() => setDub(true)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${dub ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}
                >
                  DUB
                </button>
              </div>

              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Server className="h-3.5 w-3.5" />
                <span className="mr-1">Server:</span>
                {servers.map((s, i) => {
                  const active = i === serverIdx;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setServerIdx(i);
                        setReloadKey((k) => k + 1);
                      }}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                        active
                          ? "border-transparent bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] text-white"
                          : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-[11px] font-semibold text-foreground transition hover:border-[oklch(0.7_0.18_290/0.7)]"
              >
                <RotateCw className="h-3.5 w-3.5" /> Reload
              </button>
            </div>

            {/* Episode selector for series */}
            {!isMovie && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Episodes {item.episodes ? `(${item.episodes})` : ""}
                  </h2>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEpisode((e) => Math.max(1, e - 1))}
                      disabled={episode <= 1}
                      className="grid h-7 w-7 place-items-center rounded-full border border-border bg-card/60 text-muted-foreground transition hover:text-foreground disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="min-w-16 text-center text-xs font-semibold text-foreground">
                      EP {episode}
                    </span>
                    <button
                      onClick={() =>
                        setEpisode((e) => Math.min(totalEps, e + 1))
                      }
                      disabled={episode >= totalEps}
                      className="grid h-7 w-7 place-items-center rounded-full border border-border bg-card/60 text-muted-foreground transition hover:text-foreground disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid max-h-56 grid-cols-6 gap-1.5 overflow-y-auto rounded-xl border border-border bg-card/40 p-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
                  {episodes.map((n) => {
                    const active = n === episode;
                    return (
                      <button
                        key={n}
                        onClick={() => setEpisode(n)}
                        className={`rounded-md py-1.5 text-[11px] font-semibold transition ${
                          active
                            ? "bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] text-white shadow-[0_0_15px_oklch(0.7_0.2_290/0.5)]"
                            : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="mt-3 text-xs text-muted-foreground">
              Playing from{" "}
              <span className="font-semibold text-foreground">
                {activeServer.label}
              </span>
              . If it doesn't load or lags, switch to another server above.
            </p>

            {related.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  You might also like
                </h2>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      to="/anime/$id"
                      params={{ id: r.id }}
                      className="group overflow-hidden rounded-lg border border-border bg-card/60 transition hover:-translate-y-0.5 hover:border-[oklch(0.7_0.18_290/0.6)]"
                    >
                      <div className="relative aspect-[2/3]">
                        {r.poster ? (
                          <img
                            src={r.poster}
                            alt={r.title}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : null}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
                          <p className="line-clamp-2 text-[10px] font-semibold text-white">
                            {r.title}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 text-right">
              <a
                href={`https://anilist.co/anime/${item.anilistId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                View on AniList <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
