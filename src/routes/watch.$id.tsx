import { createFileRoute, Link, useParams, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import { channels } from "@/lib/channels";
import { useFavorites } from "@/lib/favorites";
import { VideoPlayer } from "@/components/VideoPlayer";
import { SiteHeader } from "@/components/SiteHeader";
import { ChannelCard } from "@/components/ChannelCard";

export const Route = createFileRoute("/watch/$id")({
  head: ({ params }) => {
    const channel = channels.find((c) => c.id === params.id);
    const title = channel ? `${channel.name} Live — Dtv` : "Watch Live — Dtv";
    return {
      meta: [
        { title },
        { name: "description", content: channel ? `Watch ${channel.name} live on Dtv.` : "Live TV on Dtv." },
        { property: "og:title", content: title },
      ],
    };
  },
  loader: ({ params }) => {
    const channel = channels.find((c) => c.id === params.id);
    if (!channel) throw notFound();
    return { channel };
  },
  component: Watch,
});

function Watch() {
  const { id } = useParams({ from: "/watch/$id" });
  const channel = channels.find((c) => c.id === id)!;
  const [serverIdx, setServerIdx] = useState(0);
  const { isFav, toggle } = useFavorites();

  const servers = channel.streams.length > 0
    ? channel.streams
    : [channel.streams[0]];
  // Pad servers up to 4 by reusing primary stream
  const paddedServers = Array.from({ length: Math.max(4, servers.length) }, (_, i) => servers[i] ?? servers[0]);

  const related = channels.filter((c) => c.category === channel.category && c.id !== channel.id).slice(0, 6);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Channels
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <VideoPlayer src={paddedServers[serverIdx]} poster={channel.logo} />

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{channel.name}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                Live
              </span>
              <span className="rounded-full border border-border bg-card/60 px-3 py-0.5 text-xs text-muted-foreground">
                {channel.category}
              </span>
              <button
                onClick={() => toggle(channel.id)}
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium transition hover:border-[oklch(0.7_0.18_290/0.6)]"
              >
                <Heart
                  className={`h-4 w-4 ${isFav(channel.id) ? "fill-red-500 text-red-500" : ""}`}
                />
                {isFav(channel.id) ? "Favorited" : "Add to Favorites"}
              </button>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Servers
              </p>
              <div className="flex flex-wrap gap-2">
                {paddedServers.slice(0, 4).map((_, i) => {
                  const active = i === serverIdx;
                  return (
                    <button
                      key={i}
                      onClick={() => setServerIdx(i)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        active
                          ? "border-transparent bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] text-white shadow-[0_0_20px_oklch(0.7_0.2_280/0.4)]"
                          : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Server {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Related Channels
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {related.map((c) => (
                <ChannelCard key={c.id} channel={c} isFav={isFav(c.id)} onToggleFav={toggle} />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
