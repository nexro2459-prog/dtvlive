import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { channels, categories } from "@/lib/channels";
import { SiteHeader } from "@/components/SiteHeader";
import { OwnerCard } from "@/components/OwnerCard";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Play, Radio, Tv, Zap, Globe2, Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dtv — Watch Free Live TV Channels" },
      {
        name: "description",
        content:
          "Free live TV streaming from Bangladesh and around the world. Sports, News, Movies, Kids and Entertainment — anytime, anywhere.",
      },
      { property: "og:title", content: "Dtv — Watch Free Live TV Channels" },
      {
        property: "og:description",
        content: "Stream live TV free in HD — Bangladesh & worldwide.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [tab, setTab] = useState<string>("All");

  const featured = useMemo(() => {
    const list = tab === "All" ? channels : channels.filter((c) => c.category === tab);
    return list.slice(0, 18);
  }, [tab]);

  const tabs = ["All", ...categories.filter((c) => c !== "All")].slice(0, 6);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 10%, oklch(0.28 0.09 240 / 0.55), transparent 60%), radial-gradient(ellipse 70% 55% at 85% 90%, oklch(0.35 0.18 330 / 0.45), transparent 60%), linear-gradient(180deg, oklch(0.12 0.03 260), oklch(0.08 0.02 280))",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.9 0.05 280 / 0.35) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0.05 280 / 0.35) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 40%, transparent 90%)",
        }}
      />

      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:pt-12 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          {/* ================= HERO ================= */}
          <section className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
              </span>
              {channels.length}+ channels streaming right now
            </div>

            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] shadow-[0_0_35px_oklch(0.7_0.2_280/0.55)]">
                <Tv className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="bg-gradient-to-r from-[oklch(0.85_0.15_290)] to-[oklch(0.85_0.13_220)] bg-clip-text text-3xl font-black leading-none tracking-tight text-transparent">
                  Dtv
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Free Live TV Streaming</p>
              </div>
            </div>

            <h1 className="text-5xl font-black uppercase leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Watch Free
              <br />
              <span className="bg-gradient-to-r from-[oklch(0.9_0.02_280)] via-[oklch(0.85_0.12_290)] to-[oklch(0.85_0.15_220)] bg-clip-text text-transparent">
                Live TV Channels
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-lg text-muted-foreground sm:text-xl">
              Bangladesh &amp; Worldwide — sports, news, movies, entertainment and kids.
              No sign-up. Just press play.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/livetv"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_40px_-8px_oklch(0.65_0.22_290/0.7)] transition hover:brightness-110"
              >
                <Play className="h-4 w-4 fill-white" />
                Watch Live Now
              </Link>
              <Link
                to="/livetv"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition hover:border-[oklch(0.7_0.18_290/0.6)]"
              >
                Browse Channels
              </Link>
            </div>

            <p className="mt-16 text-2xl font-light text-muted-foreground sm:text-3xl">
              Stream Anytime, Anywhere.
            </p>

            {/* Feature strip */}
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-4">
              {[
                { icon: Radio, label: "Live HD" },
                { icon: Zap, label: "Zero Buffer" },
                { icon: Globe2, label: "Worldwide" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur"
                >
                  <Icon className="h-4 w-4 text-[oklch(0.75_0.18_290)]" />
                  {label}
                </div>
              ))}
            </div>
          </section>

          {/* ================= CHANNEL RAIL ================= */}
          <section className="relative">
            {/* Tabs */}
            <div className="mb-4 flex flex-wrap justify-end gap-2">
              {tabs.map((t) => {
                const active = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                      active
                        ? "border-transparent bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] text-white shadow-[0_0_20px_oklch(0.7_0.2_280/0.45)]"
                        : "border-border bg-card/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Fading list */}
            <div
              className="relative max-h-[640px] overflow-hidden rounded-3xl border border-border/60 bg-card/30 p-3 backdrop-blur-xl"
              style={{
                maskImage:
                  "linear-gradient(180deg, black 0, black 85%, transparent 100%)",
              }}
            >
              <div className="grid grid-cols-3 gap-3">
                {featured.map((c) => (
                  <Link
                    key={c.id}
                    to="/watch/$id"
                    params={{ id: c.id }}
                    className="group relative overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur transition hover:-translate-y-0.5 hover:border-[oklch(0.7_0.18_290/0.6)] hover:shadow-[0_10px_30px_-10px_oklch(0.65_0.22_290/0.6)]"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[oklch(0.2_0.05_280)] to-[oklch(0.15_0.04_220)]">
                      <img
                        src={c.logo}
                        alt={c.name}
                        loading="lazy"
                        className="absolute inset-0 m-auto h-3/5 w-3/5 object-contain transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-red-500/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        <span className="relative flex h-1 w-1">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex h-1 w-1 rounded-full bg-white" />
                        </span>
                        Live
                      </span>
                      <Heart className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-white/70" />
                    </div>
                    <div className="p-2">
                      <p className="truncate text-[11px] font-semibold text-foreground">
                        {c.name}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {c.category}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-2">
              <Link
                to="/livetv"
                className="pointer-events-auto rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs font-semibold text-foreground backdrop-blur transition hover:border-[oklch(0.7_0.18_290/0.6)]"
              >
                See all {channels.length} channels →
              </Link>
            </div>
          </section>
        </div>
      </main>

      <OwnerCard />

      <footer className="mt-6 border-t border-border/60 bg-background/60 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
          <p className="mx-auto max-w-2xl">
            <strong className="text-foreground">Disclaimer:</strong> We do not host any
            content. All streams are from publicly available sources.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Dtv ·{" "}
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>{" "}
            ·{" "}
            <Link to="/livetv" className="hover:text-foreground">
              Live TV
            </Link>
          </p>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}
