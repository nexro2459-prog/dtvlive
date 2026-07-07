import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Film, Tv2, Play, Loader2, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { ScrollToTop } from "@/components/ScrollToTop";
import {
  animeGenres,
  fetchAnimeList,
  type AnimeItem,
  type ListOptions,
} from "@/lib/anime";

export const Route = createFileRoute("/anime")({
  head: () => ({
    meta: [
      { title: "Anime — Dtv" },
      {
        name: "description",
        content:
          "Browse and stream anime series and movies in HD. Powered by AniList with reliable HD playback.",
      },
      { property: "og:title", content: "Anime — Dtv" },
      {
        property: "og:description",
        content: "Endless anime library with smooth HD streaming on Dtv.",
      },
    ],
  }),
  component: AnimePage,
});

type TypeFilter = "all" | "series" | "movie";
type SortKey = NonNullable<ListOptions["sort"]>;

function AnimePage() {
  const pathname = useLocation({ select: (location) => location.pathname });

  if (pathname !== "/anime") return <Outlet />;

  return <AnimeLibrary />;
}

function AnimeLibrary() {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string>("All");
  const [typeF, setTypeF] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<SortKey>("TRENDING");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [q, genre, typeF, sort]);

  // Debounced search
  const [debouncedQ, setDebouncedQ] = useState(q);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAnimeList({
      page,
      perPage: debouncedQ.trim() ? 48 : 30,
      search: debouncedQ,
      genre,
      type: typeF,
      sort,
    })
      .then((r) => {
        if (cancelled) return;
        setItems((prev) => (page === 1 ? r.items : [...prev, ...r.items]));
        setHasNext(r.hasNextPage);
        setTotal(r.total);
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debouncedQ, genre, typeF, sort, page]);

  const sortOptions = useMemo(
    () =>
      [
        { id: "TRENDING", label: "Trending" },
        { id: "POPULARITY", label: "Popular" },
        { id: "SCORE", label: "Top Rated" },
        { id: "RECENT", label: "Newest" },
      ] as { id: SortKey; label: string }[],
    [],
  );

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 5%, oklch(0.28 0.09 320 / 0.45), transparent 60%), radial-gradient(ellipse 70% 55% at 90% 90%, oklch(0.32 0.16 260 / 0.4), transparent 60%), linear-gradient(180deg, oklch(0.12 0.03 300), oklch(0.08 0.02 280))",
        }}
      />
      <SiteHeader />

      <main className="mx-auto max-w-[1600px] px-4 pb-16 pt-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Anime Library
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {total > 0 ? `${total.toLocaleString()} titles · ` : ""}series &amp;
              movies · HD streaming
            </p>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search anime..."
              className="w-full rounded-full border border-border bg-card/60 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur outline-none transition focus:border-[oklch(0.7_0.18_290)] focus:ring-2 focus:ring-[oklch(0.65_0.2_290/0.3)]"
            />
          </div>
        </div>

        {/* Type + sort */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {[
            { id: "all" as TypeFilter, label: "All", icon: null },
            { id: "series" as TypeFilter, label: "Series", icon: Tv2 },
            { id: "movie" as TypeFilter, label: "Movies", icon: Film },
          ].map(({ id, label, icon: Icon }) => {
            const active = typeF === id;
            return (
              <button
                key={id}
                onClick={() => setTypeF(id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-transparent bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] text-white shadow-[0_0_20px_oklch(0.7_0.2_280/0.45)]"
                    : "border-border bg-card/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                {label}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-1.5">
            {sortOptions.map((s) => {
              const active = sort === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSort(s.id)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                    active
                      ? "border-transparent bg-white/10 text-foreground"
                      : "border-border bg-card/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Genre tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-1">
            {animeGenres.map((g) => {
              const active = genre === g;
              return (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition ${
                    active
                      ? "border-transparent bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] text-white shadow-[0_0_20px_oklch(0.7_0.2_280/0.45)]"
                      : "border-border bg-card/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {items.length === 0 && !loading ? (
          <div className="rounded-2xl border border-border bg-card/40 py-16 text-center text-sm text-muted-foreground">
            No titles match your search.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((a) => (
              <Link
                key={a.id}
                to="/anime/$id"
                params={{ id: a.id }}
                className="group relative overflow-hidden rounded-xl border border-border bg-card/60 transition hover:-translate-y-1 hover:border-[oklch(0.7_0.18_290/0.7)] hover:shadow-[0_15px_40px_-15px_oklch(0.65_0.22_290/0.7)]"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-gradient-to-br from-[oklch(0.2_0.05_280)] to-[oklch(0.15_0.04_320)]">
                  {a.poster ? (
                    <img
                      src={a.poster}
                      alt={a.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-70 transition group-hover:opacity-95" />
                  <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur">
                    {a.type === "movie" ? "Movie" : "Series"}
                  </span>
                  {a.averageScore ? (
                    <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                      ★ {(a.averageScore / 10).toFixed(1)}
                    </span>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 p-2.5">
                    <p className="line-clamp-2 text-xs font-semibold leading-tight text-white drop-shadow">
                      {a.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/70">
                      {a.year ?? ""} {a.episodes ? `· ${a.episodes} ep` : ""}
                    </p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] shadow-[0_0_30px_oklch(0.7_0.2_290/0.7)]">
                      <Play className="h-5 w-5 translate-x-0.5 fill-white text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {loading && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        )}

        {!loading && hasNext && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_oklch(0.7_0.2_290/0.5)] transition hover:scale-105"
            >
              Load more
            </button>
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-border/60 bg-card/40 p-5 text-center text-xs text-muted-foreground backdrop-blur">
          Powered by AniList &amp; multi-server HD embeds. If a stream is
          unavailable, switch servers on the watch page or{" "}
          <a
            href="https://anilist.co/search/anime"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline"
          >
            browse AniList <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </main>

      <footer className="border-t border-border/60 bg-background/60 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dtv · Anime metadata via AniList. We do
          not host any content.
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}
