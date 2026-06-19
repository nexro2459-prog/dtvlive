// =====================================================================
// EMBED CONFIGURATION
// ---------------------------------------------------------------------
// Per-channel iframe embed URLs (for Maruf-TV style embed players).
// You can enter an embed URL for any channel from the player UI;
// it gets saved to localStorage and shown as an extra "Embed" server.
// =====================================================================

import { useEffect, useState } from "react";

export interface EmbedServer {
  name: string;
  base: string;
}

// Optional: global embed hosts (appended with channel slug). Leave empty
// if you only want to use per-channel custom embed URLs.
export const EMBED_SERVERS: EmbedServer[] = [];

export function buildEmbedUrl(base: string, slug: string): string {
  return base.includes("{slug}") ? base.replace("{slug}", slug) : base + slug;
}

const STORAGE_KEY = "dtv-channel-embeds";

type EmbedMap = Record<string, string>;

function read(): EmbedMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function write(map: EmbedMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("dtv-embeds-changed"));
}

export function useChannelEmbeds() {
  const [map, setMap] = useState<EmbedMap>({});

  useEffect(() => {
    setMap(read());
    const onChange = () => setMap(read());
    window.addEventListener("dtv-embeds-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("dtv-embeds-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return {
    get: (id: string) => map[id],
    set: (id: string, url: string) => {
      const next = { ...read(), [id]: url };
      write(next);
      setMap(next);
    },
    remove: (id: string) => {
      const next = { ...read() };
      delete next[id];
      write(next);
      setMap(next);
    },
  };
}
