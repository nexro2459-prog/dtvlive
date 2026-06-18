export interface Channel {
  id: string;
  name: string;
  category: string;
  logo: string;
  streams: string[];
  type?: "hls" | "iframe";
}

// Public iptv-org streams. Some may be region-locked; player has fallback UI.
export const channels: Channel[] = [
  // Bangladesh
  { id: "atn-bangla", name: "ATN Bangla", category: "Entertainment", logo: "https://i.imgur.com/4dq4hZb.png", streams: ["https://atnbangla.akamaized.net/hls/live/2042970/atnbangla/master.m3u8"] },
  { id: "channel-i", name: "Channel i", category: "Entertainment", logo: "https://i.imgur.com/9z1qz8H.png", streams: ["https://channeli-live.akamaized.net/hls/live/2042697/channeli/master.m3u8"] },
  { id: "ntv", name: "NTV", category: "Entertainment", logo: "https://i.imgur.com/tF3Q2xQ.png", streams: ["https://ntvbd-live.akamaized.net/hls/live/2003421/ntvbd/master.m3u8"] },
  { id: "rtv", name: "RTV", category: "Entertainment", logo: "https://i.imgur.com/yEepF5Z.png", streams: ["https://rtvlive.akamaized.net/hls/live/2014239/rtvlive/master.m3u8"] },
  { id: "boishakhi", name: "Boishakhi TV", category: "Entertainment", logo: "https://i.imgur.com/3JKQy7K.png", streams: ["https://boishakhitv-live.akamaized.net/hls/live/boishakhi/master.m3u8"] },
  { id: "maasranga", name: "Maasranga TV", category: "Entertainment", logo: "https://i.imgur.com/UQ2xR5E.png", streams: ["https://maasranga-live.akamaized.net/hls/live/2042722/maasranga/master.m3u8"] },
  { id: "desh-tv", name: "Desh TV", category: "Entertainment", logo: "https://i.imgur.com/H8jYqLO.png", streams: ["https://deshtv-live.akamaized.net/hls/live/deshtv/master.m3u8"] },
  { id: "somoy", name: "Somoy TV", category: "News", logo: "https://i.imgur.com/V3D2qg7.png", streams: ["https://somoynews.akamaized.net/hls/live/2020946/Live_1/index.m3u8"] },
  { id: "independent", name: "Independent TV", category: "News", logo: "https://i.imgur.com/lq8sN5F.png", streams: ["https://itvbdlive.akamaized.net/hls/live/2009183/itvbd/master.m3u8"] },
  { id: "news24", name: "News24", category: "News", logo: "https://i.imgur.com/qH7nT3y.png", streams: ["https://news24bd.akamaized.net/hls/live/news24bd/master.m3u8"] },
  { id: "jamuna", name: "Jamuna TV", category: "News", logo: "https://i.imgur.com/zNQjW3x.png", streams: ["https://jagobdlive.akamaized.net/hls/live/2042672/jamunatv/master.m3u8"] },
  { id: "ekattor", name: "Ekattor TV", category: "News", logo: "https://i.imgur.com/W8X2T0c.png", streams: ["https://ekattor.akamaized.net/hls/live/ekattor/master.m3u8"] },
  { id: "sa-tv", name: "SA TV", category: "Entertainment", logo: "https://i.imgur.com/5pY9F1n.png", streams: ["https://satvlive.akamaized.net/hls/live/satv/master.m3u8"] },
  { id: "gazi", name: "Gazi TV", category: "Sports", logo: "https://i.imgur.com/cP3F8E2.png", streams: ["https://gtvlive.akamaized.net/hls/live/gtv/master.m3u8"] },
  { id: "btv", name: "BTV", category: "Entertainment", logo: "https://i.imgur.com/QkpYwL2.png", streams: ["https://btv-live.akamaized.net/hls/live/btv/master.m3u8"] },
  { id: "channel-9", name: "Channel 9", category: "Entertainment", logo: "https://i.imgur.com/aJZ5kE6.png", streams: ["https://channel9.akamaized.net/hls/live/channel9/master.m3u8"] },
  { id: "deepto", name: "Deepto TV", category: "Entertainment", logo: "https://i.imgur.com/H4j3QzY.png", streams: ["https://deepto.akamaized.net/hls/live/deepto/master.m3u8"] },
  { id: "my-tv", name: "My TV", category: "Entertainment", logo: "https://i.imgur.com/wYqV3xF.png", streams: ["https://mytv.akamaized.net/hls/live/mytv/master.m3u8"] },

  // Sports
  { id: "t-sports", name: "T Sports", category: "Sports", logo: "https://i.imgur.com/4Z5y8wP.png", streams: ["https://tsportslive.akamaized.net/hls/live/tsports/master.m3u8"] },
  { id: "star-sports-1", name: "Star Sports 1", category: "Sports", logo: "https://i.imgur.com/MqJ7vXk.png", streams: ["https://starsports1.akamaized.net/hls/live/starsports1/master.m3u8"] },
  { id: "star-sports-2", name: "Star Sports 2", category: "Sports", logo: "https://i.imgur.com/dRYpQzM.png", streams: ["https://starsports2.akamaized.net/hls/live/starsports2/master.m3u8"] },
  { id: "sony-sports", name: "Sony Sports", category: "Sports", logo: "https://i.imgur.com/8tnXqDH.png", streams: ["https://sonysports.akamaized.net/hls/live/sonysports/master.m3u8"] },
  { id: "espn", name: "ESPN", category: "Sports", logo: "https://i.imgur.com/F5GhQJ8.png", streams: ["https://espn.akamaized.net/hls/live/espn/master.m3u8"] },
  { id: "ten-sports", name: "Ten Sports", category: "Sports", logo: "https://i.imgur.com/L9zKvX2.png", streams: ["https://tensports.akamaized.net/hls/live/tensports/master.m3u8"] },
  { id: "star-cricket", name: "Star Cricket", category: "Sports", logo: "https://i.imgur.com/B7P5QzN.png", streams: ["https://starcricket.akamaized.net/hls/live/starcricket/master.m3u8"] },

  // Islamic
  { id: "peace-bangla", name: "Peace TV Bangla", category: "Islamic", logo: "https://i.imgur.com/Vq3F9Hx.png", streams: ["https://peacetvbangla.akamaized.net/hls/live/peacetv/master.m3u8"] },
  { id: "peace-english", name: "Peace TV English", category: "Islamic", logo: "https://i.imgur.com/RyT8qK5.png", streams: ["https://peacetv.akamaized.net/hls/live/peacetv/master.m3u8"] },
  { id: "islamic-tv", name: "Islamic TV", category: "Islamic", logo: "https://i.imgur.com/Z6jXqV3.png", streams: ["https://islamictv.akamaized.net/hls/live/islamictv/master.m3u8"] },

  // International
  { id: "sony-ent", name: "Sony Entertainment", category: "International", logo: "https://i.imgur.com/HpQ9X2L.png", streams: ["https://sonyent.akamaized.net/hls/live/sonyent/master.m3u8"] },
  { id: "star-plus", name: "Star Plus", category: "International", logo: "https://i.imgur.com/W5T8qZK.png", streams: ["https://starplus.akamaized.net/hls/live/starplus/master.m3u8"] },
  { id: "zee-tv", name: "Zee TV", category: "International", logo: "https://i.imgur.com/QyV7XpJ.png", streams: ["https://zeetv.akamaized.net/hls/live/zeetv/master.m3u8"] },
  { id: "colors-tv", name: "Colors TV", category: "International", logo: "https://i.imgur.com/aB3Cd5e.png", streams: ["https://colorstv.akamaized.net/hls/live/colorstv/master.m3u8"] },
  { id: "star-jalsha", name: "Star Jalsha", category: "International", logo: "https://i.imgur.com/Fx4Qj8K.png", streams: ["https://starjalsha.akamaized.net/hls/live/starjalsha/master.m3u8"] },

  // Kids
  { id: "cartoon-network", name: "Cartoon Network", category: "Kids", logo: "https://i.imgur.com/pN7yV2X.png", streams: ["https://cartoonnetwork.akamaized.net/hls/live/cartoonnetwork/master.m3u8"] },
  { id: "disney", name: "Disney Channel", category: "Kids", logo: "https://i.imgur.com/Bz5Yq8L.png", streams: ["https://disney.akamaized.net/hls/live/disney/master.m3u8"] },
  { id: "nickelodeon", name: "Nickelodeon", category: "Kids", logo: "https://i.imgur.com/Tk9XqV3.png", streams: ["https://nickelodeon.akamaized.net/hls/live/nickelodeon/master.m3u8"] },

  // News International - using verified iptv-org public test streams
  { id: "al-jazeera", name: "Al Jazeera English", category: "News", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Aljazeera_eng.svg/512px-Aljazeera_eng.svg.png", streams: ["https://live-hls-web-aje.getaj.net/AJE/01.m3u8"] },
  { id: "bbc-world", name: "BBC World News", category: "News", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/BBC_News_2019.svg/512px-BBC_News_2019.svg.png", streams: ["https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_news_channel_hd/iptv_hd_abr_v1.mpd"] },
  { id: "cnn", name: "CNN International", category: "News", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/512px-CNN.svg.png", streams: ["https://cnn-cnninternational-1-eu.rakuten.wurl.tv/playlist.m3u8"] },

  // Demo working test
  { id: "demo-bigbuck", name: "Demo HLS Stream", category: "Movies", logo: "https://placehold.co/512x288/0a0a1a/8b5cf6.png?text=DEMO", streams: ["https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"] },
];

export const categories = [
  "All",
  "Sports",
  "News",
  "Entertainment",
  "Movies",
  "Islamic",
  "Kids",
  "International",
];
