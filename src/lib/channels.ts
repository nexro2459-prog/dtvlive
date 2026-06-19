// Auto-extracted from telezo.lovable.app + vibestream.ntechbd.app live stream sources.
export interface Channel {
  id: string;
  name: string;
  category: string;
  logo: string;
  streams: string[];
  embedSlug?: string;
  type?: "hls" | "iframe";
}

export const channels: Channel[] = [
  {"id":"world-cup-2026","name":"World Cup 2026","category":"Sports","logo":"https://digitalhub.fifa.com/transform/598a1d22-62b6-486b-849c-e8bf55894179/FIFA_FWC26_Tournament-Thumbnail-4-3","streams":["https://d1211whpimeups.cloudfront.net/smil:rtbgo/chunklist.m3u8"]},
];

export const categories = ["All","Sports"];
