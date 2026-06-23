import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, ExternalLink } from "lucide-react";
import { getSiteProfile } from "@/lib/admin.functions";

export function OwnerCard() {
  const fetchProfile = useServerFn(getSiteProfile);
  const { data: profile } = useQuery({
    queryKey: ["site-profile"],
    queryFn: () => fetchProfile(),
    staleTime: 60_000,
  });

  if (!profile) return null;

  const links = Object.entries(profile.social_links ?? {});

  return (
    <section className="mx-auto mt-10 max-w-7xl px-4">
      <div className="rounded-2xl border border-white/10 bg-card/50 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <span className="inline-block h-px w-6 bg-gradient-to-r from-transparent to-[oklch(0.7_0.18_290)]" />
          About the Owner
        </div>

        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="h-20 w-20 shrink-0 rounded-full border-2 border-[oklch(0.7_0.18_290/0.4)] object-cover shadow-[0_0_30px_oklch(0.7_0.2_280/0.35)]"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          ) : (
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] text-2xl font-black text-white">
              {profile.display_name.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">
                {profile.display_name}
              </h3>
              {profile.badges?.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.7_0.18_290/0.15)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.85_0.15_290)]"
                >
                  <BadgeCheck className="h-3 w-3" /> {b}
                </span>
              ))}
            </div>
            {profile.tagline && (
              <p className="mt-0.5 text-sm text-[oklch(0.75_0.18_280)]">{profile.tagline}</p>
            )}
            {profile.bio && (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{profile.bio}</p>
            )}

            {links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {links.map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-foreground transition hover:bg-white/10"
                  >
                    {key}
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
