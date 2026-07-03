import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Shield,
  KeyRound,
  Copy,
  Check,
  LogOut,
  Save,
  Loader2,
  Plus,
  Trash2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import {
  getAdminStatus,
  initAdminPassword,
  loginAdmin,
  logoutAdmin,
  verifyAdminToken,
  getSiteProfile,
  updateSiteProfile,
  listChannelOverrides,
  upsertChannelOverride,
  deleteChannelOverride,
  type SiteProfile,
  type ChannelOverride,
} from "@/lib/admin.functions";
import { channels as baseChannels } from "@/lib/channels";
import { SiteHeader } from "@/components/SiteHeader";

const TOKEN_KEY = "dtv_admin_token_v1";

export const Route = createFileRoute("/customize")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Customize — Dtv Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CustomizePage,
});

type Stage = "loading" | "init" | "login" | "editor";

function CustomizePage() {
  const [stage, setStage] = useState<Stage>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const getStatus = useServerFn(getAdminStatus);
  const initFn = useServerFn(initAdminPassword);
  const verifyFn = useServerFn(verifyAdminToken);

  useEffect(() => {
    (async () => {
      const stored = localStorage.getItem(TOKEN_KEY);
      const status = await getStatus();
      if (!status.initialized) {
        setStage("init");
        return;
      }
      if (stored) {
        const { valid } = await verifyFn({ data: { token: stored } });
        if (valid) {
          setToken(stored);
          setStage("editor");
          return;
        }
        localStorage.removeItem(TOKEN_KEY);
      }
      setStage("login");
    })();
  }, [getStatus, verifyFn]);

  async function handleInit() {
    try {
      const { password } = await initFn();
      setGeneratedPassword(password);
    } catch (e: any) {
      alert(e?.message ?? "Could not generate password");
    }
  }

  function handleLoggedIn(t: string) {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setStage("editor");
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setStage("login");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>

        {stage === "loading" && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading admin panel…
          </div>
        )}

        {stage === "init" && (
          <InitPanel
            password={generatedPassword}
            onGenerate={handleInit}
            onContinue={() => {
              setGeneratedPassword(null);
              setStage("login");
            }}
          />
        )}

        {stage === "login" && <LoginPanel onLoggedIn={handleLoggedIn} />}

        {stage === "editor" && token && (
          <div className="space-y-6">
            <EditorPanel token={token} onLogout={handleLogout} />
            <ChannelSourcesPanel token={token} />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
function InitPanel({
  password,
  onGenerate,
  onContinue,
}: {
  password: string | null;
  onGenerate: () => void;
  onContinue: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 p-8 shadow-xl backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)]">
          <Sparkles className="h-5 w-5 text-white" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">Set up admin access</h1>
          <p className="text-xs text-muted-foreground">
            One-time setup. The password is generated on the server and shown to you once.
          </p>
        </div>
      </div>

      {!password ? (
        <button
          onClick={onGenerate}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[oklch(0.65_0.2_290)] to-[oklch(0.7_0.15_220)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
        >
          <KeyRound className="h-4 w-4" /> Generate admin password
        </button>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Save this password now
            </p>
            <p className="mt-1 text-xs text-amber-200/80">
              This is the only time you'll see it. Store it in a password manager.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-background/60 p-3">
            <code className="flex-1 break-all font-mono text-sm text-foreground">
              {password}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(password);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <button
            onClick={onContinue}
            className="w-full rounded-full border border-white/10 bg-white/5 py-3 text-sm font-medium text-foreground transition hover:bg-white/10"
          >
            I've saved it — continue to login
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
function LoginPanel({ onLoggedIn }: { onLoggedIn: (token: string) => void }) {
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useServerFn(loginAdmin);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { token } = await login({ data: { password: pwd } });
      onLoggedIn(token);
    } catch (e: any) {
      setError(e?.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-white/10 bg-card/60 p-8 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)]">
          <Shield className="h-5 w-5 text-white" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">Admin sign in</h1>
          <p className="text-xs text-muted-foreground">
            Enter your admin password to edit your profile.
          </p>
        </div>
      </div>

      <label className="mt-6 block text-xs font-medium text-muted-foreground">
        Admin password
      </label>
      <input
        type="password"
        autoFocus
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        className="mt-1 w-full rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-sm text-foreground outline-none focus:border-[oklch(0.7_0.18_290)] focus:ring-2 focus:ring-[oklch(0.65_0.2_290/0.3)]"
        placeholder="••••••••••••••••"
      />

      {error && (
        <p className="mt-3 text-xs text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={busy || !pwd}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[oklch(0.65_0.2_290)] to-[oklch(0.7_0.15_220)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        Sign in
      </button>
    </form>
  );
}

// ============================================================
function EditorPanel({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getProfile = useServerFn(getSiteProfile);
  const updateProfile = useServerFn(updateSiteProfile);
  const logout = useServerFn(logoutAdmin);

  useEffect(() => {
    getProfile().then(setProfile);
  }, [getProfile]);

  if (!profile) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading profile…
      </div>
    );
  }

  const links = Object.entries(profile.social_links);

  function set<K extends keyof SiteProfile>(k: K, v: SiteProfile[K]) {
    setProfile((p) => (p ? { ...p, [k]: v } : p));
  }

  function setLink(idx: number, key: string, url: string) {
    const next = [...links];
    next[idx] = [key, url];
    set("social_links", Object.fromEntries(next.filter(([k]) => k)) as Record<string, string>);
  }

  function addLink() {
    const next = [...links, ["website", ""]];
    set("social_links", Object.fromEntries(next) as Record<string, string>);
  }

  function removeLink(idx: number) {
    const next = links.filter((_, i) => i !== idx);
    set("social_links", Object.fromEntries(next) as Record<string, string>);
  }

  async function save() {
    if (!profile) return;
    setBusy(true);
    setError(null);
    try {
      const sanitized = {
        ...profile,
        avatar_url: profile.avatar_url ?? "",
        social_links: Object.fromEntries(
          Object.entries(profile.social_links).filter(([k, v]) => k && v),
        ),
      };
      const updated = await updateProfile({ data: { token, profile: sanitized } });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e?.message ?? "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await logout().catch(() => {});
    onLogout();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customize profile</h1>
          <p className="text-xs text-muted-foreground">
            Changes are live for every visitor as soon as you save.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>

      <div className="space-y-5 rounded-2xl border border-white/10 bg-card/60 p-6 shadow-xl backdrop-blur-xl">
        <Field label="Display name">
          <input
            value={profile.display_name}
            onChange={(e) => set("display_name", e.target.value)}
            className={inputCls}
            maxLength={80}
          />
        </Field>

        <Field label="Tagline" hint="Shown right under your name (e.g. Owner of Dtv).">
          <input
            value={profile.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            className={inputCls}
            maxLength={120}
          />
        </Field>

        <Field label="Avatar URL" hint="Square image, at least 200×200px.">
          <div className="flex items-center gap-3">
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-12 w-12 rounded-full border border-white/10 object-cover"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            )}
            <input
              value={profile.avatar_url ?? ""}
              onChange={(e) => set("avatar_url", e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
          </div>
        </Field>

        <Field label="Bio">
          <textarea
            value={profile.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={3}
            maxLength={1000}
            className={`${inputCls} resize-none`}
          />
        </Field>

        <Field label="Badges" hint="Comma-separated. Shown next to your name.">
          <input
            value={profile.badges.join(", ")}
            onChange={(e) =>
              set(
                "badges",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .slice(0, 8),
              )
            }
            className={inputCls}
            placeholder="Verified, Founder"
          />
        </Field>

        <Field label="Social links" hint="Use full URLs (https://…).">
          <div className="space-y-2">
            {links.map(([key, url], idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  value={key}
                  onChange={(e) => setLink(idx, e.target.value, url)}
                  className={`${inputCls} w-32`}
                  placeholder="key"
                />
                <input
                  value={url}
                  onChange={(e) => setLink(idx, key, e.target.value)}
                  className={`${inputCls} flex-1`}
                  placeholder="https://…"
                />
                <button
                  type="button"
                  onClick={() => removeLink(idx)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 text-muted-foreground transition hover:bg-red-500/20 hover:text-red-300"
                  aria-label="Remove link"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addLink}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-white/20 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-white/40 hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Add link
            </button>
          </div>
        </Field>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
          <button
            onClick={save}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[oklch(0.65_0.2_290)] to-[oklch(0.7_0.15_220)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus:border-[oklch(0.7_0.18_290)] focus:ring-2 focus:ring-[oklch(0.65_0.2_290/0.3)]";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground/70">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

// ============================================================
// Channel sources — swap stream URLs for any channel from the admin panel.
// ============================================================
function ChannelSourcesPanel({ token }: { token: string }) {
  const [overrides, setOverrides] = useState<Record<string, ChannelOverride>>({});
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [streamsText, setStreamsText] = useState("");
  const [streamType, setStreamType] = useState<"hls" | "iframe">("hls");
  const [embedUrl, setEmbedUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listFn = useServerFn(listChannelOverrides);
  const upsertFn = useServerFn(upsertChannelOverride);
  const deleteFn = useServerFn(deleteChannelOverride);

  useEffect(() => {
    listFn()
      .then((rows) => {
        const m: Record<string, ChannelOverride> = {};
        for (const r of rows) m[r.channel_id] = r;
        setOverrides(m);
        setLoaded(true);
      })
      .catch((e) => {
        setError(e?.message ?? "Could not load overrides");
        setLoaded(true);
      });
  }, [listFn]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? baseChannels.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q),
        )
      : baseChannels;
    return list.slice(0, 60);
  }, [query]);

  const selected = selectedId
    ? baseChannels.find((c) => c.id === selectedId) ?? null
    : null;
  const activeOverride = selectedId ? overrides[selectedId] : undefined;

  function loadChannel(id: string) {
    setSelectedId(id);
    setSaved(false);
    setError(null);
    const c = baseChannels.find((x) => x.id === id);
    const ov = overrides[id];
    if (ov && ov.streams.length) {
      setStreamsText(ov.streams.join("\n"));
      setStreamType(ov.type);
      setEmbedUrl(ov.embed_url ?? "");
    } else if (c) {
      setStreamsText(c.streams.join("\n"));
      setStreamType(c.type ?? "hls");
      setEmbedUrl("");
    }
  }

  async function save() {
    if (!selectedId) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const streams = streamsText
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      const row = await upsertFn({
        data: {
          token,
          override: {
            channel_id: selectedId,
            streams,
            type: streamType,
            embed_url: embedUrl.trim() ? embedUrl.trim() : null,
          },
        },
      });
      setOverrides((m) => ({ ...m, [selectedId]: row }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e?.message ?? "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function resetDefault() {
    if (!selectedId) return;
    if (!confirm("Remove admin override and use the default catalog stream?")) return;
    setBusy(true);
    setError(null);
    try {
      await deleteFn({ data: { token, channel_id: selectedId } });
      setOverrides((m) => {
        const next = { ...m };
        delete next[selectedId];
        return next;
      });
      const c = baseChannels.find((x) => x.id === selectedId);
      if (c) {
        setStreamsText(c.streams.join("\n"));
        setStreamType(c.type ?? "hls");
        setEmbedUrl("");
      }
    } catch (e: any) {
      setError(e?.message ?? "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)]">
          <KeyRound className="h-5 w-5 text-white" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-foreground">Channel sources</h2>
          <p className="text-xs text-muted-foreground">
            Swap the HLS URL or iframe embed for any channel — no code changes needed.
            Saved sources take priority over the built-in catalog.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[300px_1fr]">
        <div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search channels…"
            className={inputCls}
          />
          <div className="mt-3 max-h-[420px] overflow-y-auto rounded-xl border border-white/10 bg-background/40">
            {!loaded ? (
              <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
              </div>
            ) : results.length === 0 ? (
              <div className="p-3 text-xs text-muted-foreground">No matches.</div>
            ) : (
              results.map((c) => {
                const active = c.id === selectedId;
                const hasOverride = !!overrides[c.id];
                return (
                  <button
                    key={c.id}
                    onClick={() => loadChannel(c.id)}
                    className={`flex w-full items-center gap-2 border-b border-white/5 px-3 py-2 text-left text-xs transition last:border-b-0 ${
                      active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <span className="flex-1 truncate">{c.name}</span>
                    {hasOverride && (
                      <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
                        Custom
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground/70">
            Showing {results.length} of {baseChannels.length} channels.
          </p>
        </div>

        <div>
          {!selected ? (
            <div className="grid h-full min-h-[300px] place-items-center rounded-xl border border-dashed border-white/10 bg-background/30 p-6 text-center text-xs text-muted-foreground">
              Select a channel on the left to edit its stream source.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={selected.logo}
                  alt=""
                  className="h-10 w-10 rounded-lg border border-white/10 object-contain"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{selected.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {selected.category} · id: {selected.id}
                    {activeOverride && (
                      <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
                        Custom
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <Field label="Stream type">
                <div className="flex gap-2">
                  {(["hls", "iframe"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setStreamType(t)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        streamType === t
                          ? "border-transparent bg-gradient-to-r from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] text-white"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t === "hls" ? "HLS (.m3u8)" : "Iframe embed"}
                    </button>
                  ))}
                </div>
              </Field>

              <Field
                label="Stream URLs"
                hint="One URL per line. The first working URL is used; the rest are automatic fallbacks."
              >
                <textarea
                  value={streamsText}
                  onChange={(e) => setStreamsText(e.target.value)}
                  rows={6}
                  spellCheck={false}
                  placeholder={streamType === "hls" ? "https://example.com/stream/index.m3u8" : "https://embed.example.com/channel"}
                  className={`${inputCls} font-mono text-[11px]`}
                />
              </Field>

              <Field label="Iframe embed URL (optional)" hint="Extra iframe fallback shown as an 'Embed' server.">
                <input
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  placeholder="https://your-host.com/embed/channel"
                  className={inputCls}
                />
              </Field>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                {saved && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                    <Check className="h-3.5 w-3.5" /> Saved
                  </span>
                )}
                {activeOverride && (
                  <button
                    onClick={resetDefault}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-muted-foreground transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Reset to default
                  </button>
                )}
                <button
                  onClick={save}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[oklch(0.65_0.2_290)] to-[oklch(0.7_0.15_220)] px-5 py-2 text-xs font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save source
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
