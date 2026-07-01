import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Maximize2, RotateCw } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { animeCatalog, findAnime, sourceUrlFor } from "@/lib/anime";

export const Route = createFileRoute("/anime/$id")({
  loader: ({ params }) => {
    const item = findAnime(params.id);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.item?.title ?? "Anime";
    return {
      meta: [
        { title: `${t} — Watch on Dtv` },
        { name: "description", content: `Watch ${t} online. Streamed from watchanimeworld.net.` },
        { property: "og:title", content: `${t} — Watch on Dtv` },
        { property: "og:image", content: loaderData?.item?.poster ?? "" },
      ],
    };
  },
  errorComponent: () => (
    <div className="p-8 text-center text-sm text-muted-foreground">
      Something went wrong. <Link to="/anime" className="text-foreground underline">Back to library</Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center text-sm text-muted-foreground">
      Title not found. <Link to="/anime" className="text-foreground underline">Back to library</Link>
    </div>
  ),
  component: AnimeDetail,
});

function AnimeDetail() {
  const { item } = Route.useLoaderData();
  const [reloadKey, setReloadKey] = useState(0);
  const src = sourceUrlFor(item);

  const related = animeCatalog
    .filter(
      (x) =>
        x.id !== item.id &&
        x.categories.some((c) => item.categories.includes(c)),
    )
    .slice(0, 8);

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
              <img
                src={item.poster}
                alt={item.title}
                className="aspect-[2/3] w-full object-cover"
                loading="eager"
              />
            </div>
            <div>
              <span className="mb-2 inline-block rounded-full bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {item.type === "movie" ? "Movie" : "Series"}
              </span>
              <h1 className="text-2xl font-black leading-tight text-foreground">
                {item.title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-border bg-card/60 px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-[oklch(0.7_0.18_290/0.7)]"
              >
                <RotateCw className="h-3.5 w-3.5" /> Reload
              </button>
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] px-3 py-2 text-xs font-semibold text-white shadow-[0_0_20px_oklch(0.7_0.2_290/0.4)]"
              >
                Open source <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </aside>

          {/* Player */}
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-black shadow-[0_30px_80px_-30px_oklch(0.65_0.22_290/0.8)]">
              <div className="aspect-video w-full">
                <iframe
                  key={reloadKey}
                  src={src}
                  title={item.title}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
                />
              </div>
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur transition hover:bg-black/80"
              >
                <Maximize2 className="h-3 w-3" /> Full page
              </a>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Streams and episodes are loaded directly from watchanimeworld.net.
              If the player fails to load (some browsers block third-party
              frames), tap <span className="text-foreground font-semibold">Open source</span>{" "}
              to watch in a new tab.
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
                        <img
                          src={r.poster}
                          alt={r.title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
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
          </div>
        </div>
      </main>
    </div>
  );
}
