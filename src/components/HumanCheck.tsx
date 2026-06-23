// Lightweight, "I'm Human"–style verification.
// Runs invisible bot heuristics on mount, animates a check the moment they
// pass, and persists the verified flag in sessionStorage so it never blocks
// real users twice. No third-party scripts, no image puzzles.

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, ShieldCheck } from "lucide-react";

const STORAGE_KEY = "dtv_human_v1";
const MIN_DELAY_MS = 700; // perceived "thinking" time
const TIMEOUT_MS = 4000;

interface Signals {
  webdriver: boolean;
  headlessUA: boolean;
  noLanguages: boolean;
  zeroPlugins: boolean;
  pluginsHidden: boolean;
  permissionsBroken: boolean;
  noChromeProps: boolean;
}

function collectSignals(): Signals {
  const nav = navigator as any;
  const ua = navigator.userAgent || "";
  return {
    webdriver: !!nav.webdriver,
    headlessUA: /HeadlessChrome|PhantomJS|Selenium|puppeteer|playwright/i.test(ua),
    noLanguages: !navigator.languages || navigator.languages.length === 0,
    zeroPlugins: (navigator.plugins?.length ?? 0) === 0 && !/Mobi|Android|iPhone/i.test(ua),
    pluginsHidden: typeof navigator.plugins === "undefined",
    permissionsBroken: false, // set asynchronously below
    noChromeProps:
      /Chrome\//.test(ua) && typeof (window as any).chrome === "undefined",
  };
}

async function checkPermissionsQuirk(): Promise<boolean> {
  // Classic headless tell: Notification.permission === "denied" while the
  // permissions API reports "prompt".
  try {
    if (!("permissions" in navigator) || !("Notification" in window)) return false;
    const status = await (navigator as any).permissions.query({ name: "notifications" });
    return (
      (Notification as any).permission === "denied" && status.state === "prompt"
    );
  } catch {
    return false;
  }
}

function scoreSignals(s: Signals): number {
  // Each suspicious signal adds risk. 2+ = block.
  let risk = 0;
  if (s.webdriver) risk += 3;
  if (s.headlessUA) risk += 3;
  if (s.noLanguages) risk += 1;
  if (s.zeroPlugins) risk += 1;
  if (s.pluginsHidden) risk += 1;
  if (s.permissionsBroken) risk += 2;
  if (s.noChromeProps) risk += 1;
  return risk;
}

export function HumanCheck({ children }: { children: React.ReactNode }) {
  // Start "verified" during SSR + first paint so hydration matches the
  // public site and search engines see the real content. We re-evaluate on
  // mount and overlay the gate if anything looks suspicious.
  const [verified, setVerified] = useState(true);
  const [phase, setPhase] = useState<"checking" | "ok" | "blocked">("ok");
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cached: { ts: number } | null = null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) cached = JSON.parse(raw);
    } catch {}

    if (cached && Date.now() - cached.ts < 60 * 60_000) {
      // Verified within the last hour, skip the overlay entirely.
      return;
    }

    // Show the overlay and run checks.
    setVerified(false);
    setPhase("checking");
    const t0 = performance.now();

    (async () => {
      const sigs = collectSignals();
      sigs.permissionsBroken = await checkPermissionsQuirk();
      const risk = scoreSignals(sigs);

      const elapsed = performance.now() - t0;
      const wait = Math.max(0, MIN_DELAY_MS - elapsed);
      await new Promise((r) => setTimeout(r, wait));

      if (risk >= 2) {
        setPhase("blocked");
        return;
      }
      setPhase("ok");
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now() }));
      } catch {}
      // Brief celebratory tick, then unmount the overlay.
      setTimeout(() => setVerified(true), 550);
    })();

    // Fallback: never freeze the page longer than TIMEOUT_MS.
    const timeout = setTimeout(() => setVerified(true), TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      {children}
      {!verified && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl">
          <div className="w-[min(92vw,360px)] rounded-2xl border border-white/10 bg-card/80 p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-[oklch(0.75_0.18_280)]" />
              Security check
            </div>

            <p className="mt-2 text-base font-semibold text-foreground">
              Verifying you're human
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              No puzzles. This usually takes less than a second.
            </p>

            <button
              type="button"
              disabled
              className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/10 bg-background/60 p-4 text-left"
              aria-live="polite"
            >
              <span className="flex items-center gap-3">
                <span
                  className={`relative grid h-7 w-7 place-items-center rounded-md border transition-all duration-300 ${
                    phase === "ok"
                      ? "border-emerald-400 bg-emerald-500/20 scale-110"
                      : phase === "blocked"
                        ? "border-red-400 bg-red-500/20"
                        : "border-white/30 bg-white/5"
                  }`}
                >
                  {phase === "checking" && (
                    <Loader2 className="h-4 w-4 animate-spin text-white/70" />
                  )}
                  {phase === "ok" && (
                    <Check
                      className="h-5 w-5 text-emerald-300 animate-in zoom-in duration-300"
                      strokeWidth={3}
                    />
                  )}
                  {phase === "blocked" && (
                    <span className="text-xs font-bold text-red-300">!</span>
                  )}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {phase === "checking" && "Verifying…"}
                  {phase === "ok" && "Verified"}
                  {phase === "blocked" && "Access blocked"}
                </span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Dtv Shield
              </span>
            </button>

            {phase === "blocked" && (
              <p className="mt-3 text-xs text-red-400">
                Automated traffic detected. If this is a mistake, please refresh
                or try a different browser.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
