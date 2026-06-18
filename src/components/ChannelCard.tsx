import { Link } from "@tanstack/react-router";
import { Heart, Play } from "lucide-react";
import type { Channel } from "@/lib/channels";

interface Props {
  channel: Channel;
  isFav: boolean;
  onToggleFav: (id: string) => void;
}

export function ChannelCard({ channel, isFav, onToggleFav }: Props) {
  return (
    <Link
      to="/watch/$id"
      params={{ id: channel.id }}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[oklch(0.7_0.18_290/0.6)] hover:shadow-[0_10px_40px_-10px_oklch(0.65_0.22_290/0.6)]"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-[oklch(0.2_0.05_280)] to-[oklch(0.15_0.04_220)]">
        <img
          src={channel.logo}
          alt={channel.name}
          className="absolute inset-0 m-auto h-3/5 w-3/5 object-contain transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-90" />

        <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          Live
        </span>

        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFav(channel.id);
          }}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/50 backdrop-blur-md transition hover:bg-black/80"
          aria-label="Toggle favorite"
        >
          <Heart
            className={`h-4 w-4 transition ${isFav ? "fill-red-500 text-red-500" : "text-white"}`}
          />
        </button>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[oklch(0.65_0.2_290)] to-[oklch(0.7_0.15_220)] shadow-[0_0_30px_oklch(0.7_0.2_290/0.7)]">
            <Play className="h-6 w-6 translate-x-0.5 fill-white text-white" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{channel.name}</h3>
          <p className="text-xs text-muted-foreground">{channel.category}</p>
        </div>
      </div>
    </Link>
  );
}
