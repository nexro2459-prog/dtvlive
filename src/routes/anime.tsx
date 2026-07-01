import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Film, Tv2, Play, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { ScrollToTop } from "@/components/ScrollToTop";
import { animeCatalog, animeGenres } from "@/lib/anime";

export const Route = createFileRoute("/anime")({
  head: () => ({
    meta: [
      { title: "Anime — Dtv" },
      {
        name: "description",
        content:
          "Browse and watch anime series and movies. Curated from watchanimeworld.net — dubbed and subbed, action, romance, isekai, sports and more.",
      },
      { property: "og:title", content: "Anime — Dtv" },
      {
        property: "og:description",
        content: "A clean anime library with smooth streaming on Dtv.",
      },
    ],
  }),
  component: AnimePage,
});

type TypeFilter = "all" | "series" | "movie";

function AnimePage() {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string>("All");
  const [typeF, setTypeF] = useState<TypeFilter>("all");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return animeCatalog.filter((a) => {
      if (typeF !== "all" && a.type !== typeF) return false;
      if (genre !== "All" && !a.categories.includes(genre)) return false;
      if (ql && !a.title.toLowerCase().includes(ql)) return false;
      return true;
    });
  }, [q, genre, typeF]);

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
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Anime Library
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {animeCatalog.length} titles · series &amp; movies · powered by
              watchanimeworld.net
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

        {/* Type toggle */}
        <div className="mb-3 flex gap-2">
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

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/40 py-16 text-center text-sm text-muted-foreground">
            No titles match your search.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filtered.map((a) => (
              <Link
                key={a.id}
                to="/anime/$id"
                params={{ id: a.id }}
                className="group relative overflow-hidden rounded-xl border border-border bg-card/60 transition hover:-translate-y-1 hover:border-[oklch(0.7_0.18_290/0.7)] hover:shadow-[0_15px_40px_-15px_oklch(0.65_0.22_290/0.7)]"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-gradient-to-br from-[oklch(0.2_0.05_280)] to-[oklch(0.15_0.04_320)]">
                  <img
                    src={a.poster}
                    alt={a.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-70 transition group-hover:opacity-95" />
                  <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur">
                    {a.type === "movie" ? "Movie" : "Series"}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-2.5">
                    <p className="line-clamp-2 text-xs font-semibold leading-tight text-white drop-shadow">
                      {a.title}
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

        <div className="mt-10 rounded-2xl border border-border/60 bg-card/40 p-5 text-center text-xs text-muted-foreground backdrop-blur">
          Looking for more? Browse the full catalog on{" "}
          <a
            href="https://watchanimeworld.net/series/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline"
          >
            watchanimeworld.net <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </main>

      <footer className="border-t border-border/60 bg-background/60 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dtv · Anime metadata &amp; streams via
          watchanimeworld.net. We do not host any content.
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}
