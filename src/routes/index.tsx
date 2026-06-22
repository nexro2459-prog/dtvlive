import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { channels, categories } from "@/lib/channels";
import { EMBED_SERVERS, buildEmbedUrl, useChannelEmbeds } from "@/lib/embeds";
import { useFavorites } from "@/lib/favorites";
import { SiteHeader } from "@/components/SiteHeader";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Heart, Play, Link2, X, Tv, Sparkles, Radio, Trophy, Calendar, Facebook, ChevronRight, Zap, Globe } from "lucide-react";

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
      const el = document.getElementById("live-tv");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToLive = () => {
    if (typeof window === "undefined") return;
    document.getElementById("live-tv")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Highlight reels for the hero
  const heroChannels = useMemo(() => {
    const seen = new Set<string>();
    const picks: typeof channels = [];
    for (const c of channels) {
      if (!c.logo || seen.has(c.name)) continue;
      seen.add(c.name);
      picks.push(c);
      if (picks.length >= 14) break;
    }
    return picks;
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of channels) counts[c.category] = (counts[c.category] ?? 0) + 1;
    return counts;
  }, []);

  const featuredSports = useMemo(
    () => channels.filter((c) => c.category === "Sports").slice(0, 8),
    [],
  );

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const footballFixtures = [
    { time: "19:00", comp: "FIFA World Cup 2026 — Qualifier", a: "Netherlands", b: "Sweden", channel: "T Sports" },
    { time: "21:30", comp: "UEFA Champions League", a: "Real Madrid", b: "Bayern Munich", channel: "Sony Sports 5" },
    { time: "23:45", comp: "Premier League", a: "Manchester City", b: "Arsenal", channel: "FOX Sports" },
    { time: "02:00", comp: "La Liga", a: "Barcelona", b: "Atlético Madrid", channel: "beIN SPORTS" },
  ];

  const cricketFixtures = [
    { time: "14:30", comp: "ICC Test Series", a: "Bangladesh", b: "Pakistan", channel: "T Sports" },
    { time: "18:00", comp: "T20I", a: "India", b: "Australia", channel: "SONY TEN Cricket" },
    { time: "20:00", comp: "BPL 2026", a: "Dhaka Capitals", b: "Comilla Victorians", channel: "T Sports" },
    { time: "22:30", comp: "ODI", a: "England", b: "South Africa", channel: "Willow HD" },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader search={search} onSearch={setSearch} />

      {/* ============ PREMIUM LIVE TV HERO ============ */}
      <section className="relative overflow-hidden">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[oklch(0.65_0.22_290/0.35)] blur-3xl animate-pulse" />
          <div className="absolute -right-32 top-20 h-[26rem] w-[26rem] rounded-full bg-[oklch(0.7_0.18_220/0.3)] blur-3xl animate-pulse [animation-delay:1.5s]" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[oklch(0.7_0.2_340/0.25)] blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        </div>

        <div className="mx-auto grid max-w-[1600px] gap-8 px-3 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          {/* Left: copy */}
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
              </span>
              On Air Now · {todayLabel}
            </div>

            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Watch{" "}
              <span className="bg-gradient-to-r from-[oklch(0.78_0.2_290)] via-[oklch(0.78_0.18_220)] to-[oklch(0.78_0.2_340)] bg-clip-text text-transparent">
                Live TV
              </span>
              <br /> Channels in HD
            </h1>

            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Sports, News, Movies, Music & more — streaming free in HD &amp; Ultra HD with
              instant playback and zero buffering.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2 text-xs sm:text-sm">
              {[
                { icon: Tv, label: `${channels.length}+ Live Channels` },
                { icon: Zap, label: "HD & 4K Streaming" },
                { icon: Globe, label: "Worldwide Coverage" },
                { icon: Sparkles, label: "100% Free Forever" },
              ].map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-medium text-white/85 backdrop-blur-xl"
                >
                  <Icon className="h-3.5 w-3.5 text-[oklch(0.8_0.18_290)]" />
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={scrollToLive}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[oklch(0.65_0.22_290)] via-[oklch(0.68_0.2_260)] to-[oklch(0.7_0.18_220)] px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_50px_-5px_oklch(0.65_0.22_290/0.9)] transition-transform hover:scale-[1.03] sm:text-base"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 backdrop-blur-md">
                  <Play className="h-3.5 w-3.5 translate-x-0.5 fill-white text-white" />
                </span>
                Watch Live TV Now
              </button>
              <a
                href="#schedules"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 backdrop-blur-xl transition hover:bg-white/10"
              >
                <Calendar className="h-4 w-4" /> Today’s Schedule
              </a>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
              <div>
                <p className="text-2xl font-black text-foreground">{channels.length.toLocaleString()}+</p>
                <p>Channels</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-2xl font-black text-foreground">{categoryCounts["Sports"] ?? 0}</p>
                <p>Sports streams</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-2xl font-black text-foreground">24/7</p>
                <p>Always On</p>
              </div>
            </div>
          </div>

          {/* Right: glass preview card */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-br from-[oklch(0.65_0.22_290/0.6)] via-transparent to-[oklch(0.7_0.18_220/0.5)] blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_18px_rgba(239,68,68,0.7)]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    Live
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                    Featured Channels
                  </span>
                </div>
                <Radio className="h-4 w-4 text-white/60" />
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                {heroChannels.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => selectChannel(c.id)}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] transition hover:-translate-y-0.5 hover:border-[oklch(0.75_0.2_290/0.7)] hover:shadow-[0_10px_30px_-10px_oklch(0.65_0.22_290/0.8)]"
                    style={{ animation: `fade-in 0.6s ease-out ${i * 60}ms both` }}
                    title={c.name}
                  >
                    <img
                      src={c.logo}
                      alt={c.name}
                      loading="lazy"
                      className="absolute inset-0 m-auto h-3/4 w-3/4 object-contain transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                    />
                    <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
                  </button>
                ))}
              </div>

              <button
                onClick={scrollToLive}
                className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-gradient-to-r from-[oklch(0.65_0.22_290/0.25)] to-[oklch(0.7_0.18_220/0.25)] px-4 py-3 text-left text-sm font-semibold text-white backdrop-blur-xl transition hover:from-[oklch(0.65_0.22_290/0.4)] hover:to-[oklch(0.7_0.18_220/0.4)]"
              >
                <span className="flex items-center gap-2">
                  <Tv className="h-4 w-4" />
                  Browse all {channels.length.toLocaleString()} live channels
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MAIN LIVE TV PLAYER + GRID ============ */}
      <div id="live-tv" className="mx-auto max-w-[1600px] scroll-mt-20 px-3 py-4 sm:px-6 sm:py-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[oklch(0.78_0.18_290)]">
              ▸ Now Streaming
            </p>
            <h2 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">Live TV Channels</h2>
          </div>
        </div>

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

      {/* ============ SCHEDULES ============ */}
      <section id="schedules" className="mx-auto max-w-[1600px] scroll-mt-20 px-3 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            { title: "Football Schedule", icon: "⚽", data: footballFixtures, accent: "from-[oklch(0.7_0.18_220)] to-[oklch(0.65_0.22_290)]" },
            { title: "Cricket Schedule", icon: "🏏", data: cricketFixtures, accent: "from-[oklch(0.7_0.2_140)] to-[oklch(0.7_0.18_180)]" },
          ].map((block) => (
            <div
              key={block.title}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-6"
            >
              <div className={`absolute -top-20 right-0 h-40 w-40 rounded-full bg-gradient-to-br ${block.accent} opacity-30 blur-3xl`} />
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{block.icon}</span>
                  <div>
                    <h3 className="text-lg font-black text-foreground sm:text-xl">{block.title}</h3>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Today · {todayLabel}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  Live
                </span>
              </div>
              <ul className="space-y-2.5">
                {block.data.map((m, i) => (
                  <li
                    key={i}
                    className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-[oklch(0.7_0.18_290/0.5)] hover:bg-white/[0.05]"
                  >
                    <div className="grid w-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] py-2 text-sm font-black text-foreground">
                      {m.time}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {m.a} <span className="text-muted-foreground">vs</span> {m.b}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">{m.comp} · {m.channel}</p>
                    </div>
                    <button
                      onClick={scrollToLive}
                      className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-white/80 opacity-0 transition group-hover:opacity-100 hover:bg-[oklch(0.65_0.22_290)] hover:text-white"
                      aria-label="Watch"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURED SPORTS EVENTS ============ */}
      <section className="mx-auto max-w-[1600px] px-3 py-10 sm:px-6 sm:py-14">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[oklch(0.78_0.18_290)]">
              <Trophy className="h-3.5 w-3.5" /> Featured Sports
            </p>
            <h2 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">Live Sports Events</h2>
          </div>
          <button onClick={() => { setCat("Sports"); scrollToLive(); }} className="text-xs font-semibold text-[oklch(0.78_0.18_290)] hover:underline">
            View all sports →
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {featuredSports.map((c) => (
            <button
              key={c.id}
              onClick={() => selectChannel(c.id)}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left backdrop-blur-xl transition hover:-translate-y-1 hover:border-[oklch(0.7_0.18_290/0.7)] hover:shadow-[0_20px_50px_-15px_oklch(0.65_0.22_290/0.7)]"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-[oklch(0.2_0.05_280)] to-[oklch(0.15_0.04_220)]">
                <img
                  src={c.logo}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 m-auto h-2/3 w-2/3 object-contain transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-white" /> Live
                </span>
                <div className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] shadow-[0_0_30px_oklch(0.65_0.22_290/0.8)]">
                    <Play className="h-5 w-5 translate-x-0.5 fill-white text-white" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-bold text-foreground">{c.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.category}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ============ CHANNEL CATEGORIES ============ */}
      <section className="mx-auto max-w-[1600px] px-3 py-10 sm:px-6 sm:py-14">
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[oklch(0.78_0.18_290)]">▸ Explore</p>
          <h2 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">Channel Categories</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {categories.filter((c) => c !== "All" && (categoryCounts[c] ?? 0) > 0).map((c) => (
            <button
              key={c}
              onClick={() => { setCat(c); scrollToLive(); }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-5 text-left backdrop-blur-xl transition hover:-translate-y-1 hover:border-[oklch(0.7_0.18_290/0.7)] hover:shadow-[0_20px_50px_-15px_oklch(0.65_0.22_290/0.6)]"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_290/0.4)] to-transparent blur-2xl transition group-hover:scale-150" />
              <p className="text-3xl font-black text-foreground">{categoryCounts[c]}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{c}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Live channels</p>
              <ChevronRight className="absolute bottom-3 right-3 h-4 w-4 text-white/30 transition group-hover:translate-x-1 group-hover:text-[oklch(0.78_0.18_290)]" />
            </button>
          ))}
        </div>
      </section>

      {/* ============ OWNER CREDITS ============ */}
      <section className="mx-auto max-w-[1600px] px-3 py-10 sm:px-6 sm:py-14">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[oklch(0.2_0.08_290/0.5)] via-[oklch(0.15_0.05_260/0.5)] to-[oklch(0.18_0.07_220/0.5)] p-8 text-center backdrop-blur-xl sm:p-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-0 h-40 w-40 rounded-full bg-[oklch(0.65_0.22_290/0.4)] blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-[oklch(0.7_0.18_220/0.4)] blur-3xl" />
          </div>
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[oklch(0.78_0.18_290)]">Founder & Creator</p>
            <h3 className="mt-3 text-3xl font-black text-foreground sm:text-4xl">Abu Talib Fahim</h3>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Built with passion to deliver the best free Live TV streaming experience to viewers worldwide.
            </p>
            <a
              href="https://www.facebook.com/profile.php?id=61555694050570"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1877F2] to-[#0a5dc7] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(24,119,242,0.9)] transition hover:scale-105"
            >
              <Facebook className="h-4 w-4" /> Follow on Facebook
            </a>
          </div>
        </div>
      </section>

      <footer className="mt-6 border-t border-border/60 bg-background/60 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
          <p className="mx-auto max-w-2xl">
            <strong className="text-foreground">Disclaimer:</strong> We do not host any content.
            All streams are from publicly available sources.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Dtv · Crafted by Abu Talib Fahim ·{" "}
            <Link to="/" className="hover:text-foreground">Home</Link>
          </p>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  );
}
