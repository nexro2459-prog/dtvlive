// =====================================================================
// EMBED CONFIGURATION
// ---------------------------------------------------------------------
// Add one or more embed BASE URLs below. The player will append each
// channel's `embedSlug` (or its `id`) to the base to build the final
// iframe URL.
//
// Example:
//   base: "https://example.com/embed/"
//   channel.embedSlug: "somoy-tv"
//   final iframe src: "https://example.com/embed/somoy-tv"
//
// Each entry becomes a "Server" button under the player. Leave the
// array empty to fall back to the built-in HLS .m3u8 streams.
// =====================================================================

export interface EmbedServer {
  name: string;
  base: string; // include trailing slash or query separator as needed
}

export const EMBED_SERVERS: EmbedServer[] = [
  // { name: "Server 1", base: "https://your-embed-host.com/embed/" },
  // { name: "Server 2", base: "https://your-backup-host.com/play/" },
];

export function buildEmbedUrl(base: string, slug: string): string {
  return base.includes("{slug}") ? base.replace("{slug}", slug) : base + slug;
}
