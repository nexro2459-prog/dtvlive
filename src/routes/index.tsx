import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { channels, categories } from "@/lib/channels";
import { EMBED_SERVERS, buildEmbedUrl, useChannelEmbeds } from "@/lib/embeds";
import { useFavorites } from "@/lib/favorites";
import { SiteHeader } from "@/components/SiteHeader";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Heart, Play, Link2, X } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dtv — Free Live TV Streaming" },
      {
        name: "description",
        content:
          "Watch free live TV channels from Bangladesh and around the world. Sports, News, Entertainment, Movies and more on Dtv.",
      },
      { property: "og:title", content: "Dtv — Free Live TV Streaming" },
      {
        property: "og:description",
        content: "Stream live TV channels free in HD on Dtv.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [currentId, setCurrentId] = useState<string>(channels[0].id);
  const [serverIdx, setServerIdx] = useState(0);
  const { favs, isFav, toggle } = useFavorites();
  const embeds = useChannelEmbeds();
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [embedDraft, setEmbedDraft] = useState("");

  const filtered = useMemo(() => {
    return channels.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        cat === "All"
          ? true
          : cat === "Favorites"
            ? favs.includes(c.id)
            : c.category === cat;
      return matchSearch && matchCat;
    });
  }, [search, cat, favs]);

  const current = channels.find((c) => c.id === currentId) ?? channels[0];

  // Build server list: HLS streams + global embed hosts + per-channel custom embed.
  const customEmbed = embeds.get(current.id);
  const slug = current.embedSlug ?? current.id;
  const channelType: "hls" | "iframe" = current.type ?? "hls";
  const servers: { url: string; label: string; type: "hls" | "iframe" }[] = [
    ...current.streams.map((u, i) => ({
      url: u,
      label: `Server ${i + 1}`,
      type: channelType,
    })),
    ...EMBED_SERVERS.map((s, i) => ({
      url: buildEmbedUrl(s.base, slug),
      label: s.name || `Embed ${i + 1}`,
      type: "iframe" as const,
    })),
    ...(customEmbed
      ? [{ url: customEmbed, label: "Embed", type: "iframe" as const }]
      : []),
  ];

  const safeIdx = Math.min(serverIdx, servers.length - 1);
  const currentServer = servers[safeIdx];

  const tabs = ["All", ...categories.filter((c) => c !== "All"), "Favorites"];

  const selectChannel = (id: string) => {
    setCurrentId(id);
    setServerIdx(0);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader search={search} onSearch={setSearch} />

      <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-6 sm:py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Player column */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <VideoPlayer
              src={currentServer.url}
              poster={current.logo}
              type={currentServer.type}
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                {current.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                Live
              </span>
              <span className="rounded-full border border-border bg-card/60 px-3 py-0.5 text-xs text-muted-foreground">
                {current.category}
              </span>
              <button
                onClick={() => toggle(current.id)}
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium transition hover:border-[oklch(0.7_0.18_290/0.6)]"
              >
                <Heart
                  className={`h-4 w-4 ${isFav(current.id) ? "fill-red-500 text-red-500" : ""}`}
                />
                {isFav(current.id) ? "Favorited" : "Favorite"}
              </button>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Change Server
              </p>
              <div className="flex flex-wrap gap-2">
                {servers.map((s, i) => {
                  const active = i === safeIdx;
                  return (
                    <button
                      key={i}
                      onClick={() => setServerIdx(i)}
                      className={`rounded-lg border px-4 py-1.5 text-xs font-medium transition ${
                        active
                          ? "border-transparent bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] text-white shadow-[0_0_20px_oklch(0.7_0.2_280/0.4)]"
                          : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3">
                {showEmbedInput ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="url"
                      value={embedDraft}
                      onChange={(e) => setEmbedDraft(e.target.value)}
                      placeholder="https://your-host.com/embed/channel-id"
                      className="min-w-0 flex-1 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-[oklch(0.7_0.18_290/0.7)] focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const v = embedDraft.trim();
                        if (!v) return;
                        embeds.set(current.id, v);
                        setShowEmbedInput(false);
                        setEmbedDraft("");
                        setServerIdx(current.streams.length + EMBED_SERVERS.length);
                      }}
                      className="rounded-lg bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowEmbedInput(false);
                        setEmbedDraft("");
                      }}
                      className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setEmbedDraft(customEmbed ?? "");
                        setShowEmbedInput(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-card/40 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:border-[oklch(0.7_0.18_290/0.6)] hover:text-foreground"
                    >
                      <Link2 className="h-3 w-3" />
                      {customEmbed ? "Edit iframe embed URL" : "Add iframe embed URL"}
                    </button>
                    {customEmbed && (
                      <button
                        onClick={() => {
                          embeds.remove(current.id);
                          setServerIdx(0);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card/40 px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-red-400"
                        title="Remove embed"
                      >
                        <X className="h-3 w-3" /> Clear
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Channel list column */}
          <div>
            <div className="mb-3 overflow-x-auto">
              <div className="flex gap-2 pb-1">
                {tabs.map((t) => {
                  const active = cat === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setCat(t)}
                      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                        active
                          ? "border-transparent bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] text-white shadow-[0_0_20px_oklch(0.7_0.2_280/0.4)]"
                          : "border-border bg-card/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t === "Favorites" ? (
                        <span className="flex items-center gap-1.5">
                          <Heart className="h-3 w-3" /> Favs ({favs.length})
                        </span>
                      ) : (
                        t
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card/40 py-16 text-center text-sm text-muted-foreground">
                No channels found.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {filtered.map((c) => {
                  const isCurrent = c.id === currentId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectChannel(c.id)}
                      className={`group relative overflow-hidden rounded-xl border bg-card/60 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[oklch(0.7_0.18_290/0.7)] hover:shadow-[0_8px_30px_-10px_oklch(0.65_0.22_290/0.7)] ${
                        isCurrent
                          ? "border-[oklch(0.7_0.18_290)] shadow-[0_0_20px_oklch(0.65_0.22_290/0.5)]"
                          : "border-border"
                      }`}
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-[oklch(0.2_0.05_280)] to-[oklch(0.15_0.04_220)]">
                        <img
                          src={c.logo}
                          alt={c.name}
                          className="absolute inset-0 m-auto h-3/5 w-3/5 object-contain transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-red-500/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                          <span className="relative flex h-1 w-1">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex h-1 w-1 rounded-full bg-white" />
                          </span>
                          Live
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(c.id);
                          }}
                          role="button"
                          className="absolute right-1.5 top-1.5 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-black/60 backdrop-blur-md transition hover:bg-black/90"
                        >
                          <Heart
                            className={`h-3 w-3 ${isFav(c.id) ? "fill-red-500 text-red-500" : "text-white"}`}
                          />
                        </span>
                        {isCurrent && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)]">
                              <Play className="h-4 w-4 translate-x-0.5 fill-white text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="truncate text-xs font-semibold text-foreground">{c.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{c.category}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-10 border-t border-border/60 bg-background/60 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
          <p className="mx-auto max-w-2xl">
            <strong className="text-foreground">Disclaimer:</strong> We do not host any content.
            All streams are from publicly available sources.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Dtv ·{" "}
            <Link to="/" className="hover:text-foreground">Home</Link>
          </p>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}
