import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { channels, categories } from "@/lib/channels";
import { useFavorites } from "@/lib/favorites";
import { ChannelCard } from "@/components/ChannelCard";
import { SiteHeader } from "@/components/SiteHeader";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Heart, Play, Sparkles } from "lucide-react";

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
  const { favs, isFav, toggle } = useFavorites();

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

  const tabs = ["All", ...categories.filter((c) => c !== "All"), "Favorites"];

  return (
    <div className="min-h-screen">
      <SiteHeader search={search} onSearch={setSearch} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at 20% 30%, oklch(0.5 0.25 290 / 0.35), transparent 60%), radial-gradient(ellipse at 80% 70%, oklch(0.55 0.18 220 / 0.35), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:py-24">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[oklch(0.75_0.18_290)]" />
            100% Free • No signup required
          </div>
          <h1 className="bg-gradient-to-br from-white via-[oklch(0.9_0.05_290)] to-[oklch(0.75_0.15_220)] bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-6xl">
            Watch Free Live TV
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Stream Bangladeshi and international channels in HD. Sports, News, Entertainment, Kids,
            Islamic — all in one place.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <a
              href="#channels"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_40px_oklch(0.7_0.2_280/0.5)] transition hover:brightness-110"
            >
              <Play className="h-4 w-4 fill-white" /> Browse Channels
            </a>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-16 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4">
          <div className="flex gap-2 py-3">
            {tabs.map((t) => {
              const active = cat === t;
              return (
                <button
                  key={t}
                  onClick={() => setCat(t)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-transparent bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] text-white shadow-[0_0_20px_oklch(0.7_0.2_280/0.4)]"
                      : "border-border bg-card/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "Favorites" ? (
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-3 w-3" /> Favorites
                    </span>
                  ) : (
                    t
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section id="channels" className="mx-auto max-w-7xl px-4 py-8">
        {filtered.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            <p>No channels found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((c) => (
              <ChannelCard key={c.id} channel={c} isFav={isFav(c.id)} onToggleFav={toggle} />
            ))}
          </div>
        )}
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-background/60 py-10">
      <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
        <p className="mx-auto max-w-2xl">
          <strong className="text-foreground">Disclaimer:</strong> We do not host any content. All
          streams are from publicly available sources. Dtv is not responsible for the content shown.
        </p>
        <p className="mt-3">
          © {new Date().getFullYear()} Dtv ·{" "}
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
        </p>
      </div>
    </footer>
  );
}
