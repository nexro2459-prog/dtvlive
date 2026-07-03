// Client-side hook to fetch admin-managed channel stream overrides and
// merge them into the base catalog. Overrides let admins swap the stream
// source of any channel without redeploying code.

import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listChannelOverrides,
  type ChannelOverride,
} from "@/lib/admin.functions";
import { channels as baseChannels, type Channel } from "@/lib/channels";

export type OverrideMap = Record<string, ChannelOverride>;

let cache: OverrideMap | null = null;

export function useChannelOverrides() {
  const [map, setMap] = useState<OverrideMap>(cache ?? {});
  const [loaded, setLoaded] = useState(cache !== null);
  const listFn = useServerFn(listChannelOverrides);

  useEffect(() => {
    let cancelled = false;
    listFn()
      .then((rows) => {
        if (cancelled) return;
        const m: OverrideMap = {};
        for (const r of rows) m[r.channel_id] = r;
        cache = m;
        setMap(m);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [listFn]);

  return { overrides: map, loaded };
}

// Merge overrides into channel objects — stream URLs and type only.
export function mergeChannelWithOverride(
  channel: Channel,
  override?: ChannelOverride,
): Channel {
  if (!override) return channel;
  const overrideStreams = override.streams.filter(Boolean);
  const embed = override.embed_url ? [override.embed_url] : [];
  // Admin streams win; original streams remain as fallbacks below them.
  const merged = [
    ...overrideStreams,
    ...embed,
    ...channel.streams.filter((s) => !overrideStreams.includes(s)),
  ];
  return {
    ...channel,
    type: overrideStreams.length ? override.type : channel.type,
    streams: merged,
  };
}

export function applyOverrides(
  list: Channel[],
  map: OverrideMap,
): Channel[] {
  return list.map((c) => mergeChannelWithOverride(c, map[c.id]));
}

export { baseChannels };
