import { useEffect, useRef, useState, useCallback } from "react";
import Hls, { type Level } from "hls.js";
import {
  Loader2,
  AlertTriangle,
  RotateCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  PictureInPicture2,
  Settings,
  Check,
  Radio,
} from "lucide-react";

interface Props {
  src: string;
  poster?: string;
  type?: "hls" | "iframe";
}

type QualityOption = { id: number; label: string; height: number; bitrate: number };

function formatBitrate(bps: number) {
  if (!bps) return "";
  const kbps = bps / 1000;
  if (kbps >= 1000) return `${(kbps / 1000).toFixed(1)} Mbps`;
  return `${Math.round(kbps)} kbps`;
}

function qualityLabel(h: number) {
  if (h >= 2160) return "4K";
  if (h >= 1440) return "1440p";
  if (h >= 1080) return "1080p HD";
  if (h >= 720) return "720p HD";
  if (h >= 480) return "480p";
  if (h >= 360) return "360p";
  if (h >= 240) return "240p";
  return `${h}p`;
}

export function VideoPlayer({ src, poster, type = "hls" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [pipActive, setPipActive] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [qualities, setQualities] = useState<QualityOption[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 = auto
  const [autoActiveHeight, setAutoActiveHeight] = useState<number | null>(null);

  const isIframe = type === "iframe";

  // ===== HLS setup =====
  useEffect(() => {
    if (isIframe) return;
    const video = videoRef.current;
    if (!video) return;

    setLoading(true);
    setError(null);
    setQualities([]);
    setCurrentLevel(-1);
    setAutoActiveHeight(null);

    let hls: Hls | null = null;

    const onLoaded = () => setLoading(false);

    if (Hls.isSupported() && src.includes(".m3u8")) {
      hls = new Hls({
        enableWorker: true,
        // Disable low-latency mode: live TV streams without LL-HLS tags
        // stall and rebuffer frequently when LL is forced on.
        lowLatencyMode: false,
        // Generous forward/back buffers smooth out network jitter
        backBufferLength: 60,
        maxBufferLength: 30,
        maxMaxBufferLength: 90,
        maxBufferSize: 60 * 1000 * 1000, // 60 MB
        maxBufferHole: 0.5,
        highBufferWatchdogPeriod: 2,
        nudgeMaxRetry: 10,
        // Faster, more reliable startup
        startLevel: -1, // auto
        testBandwidth: true,
        abrEwmaDefaultEstimate: 1_000_000,
        abrBandWidthFactor: 0.9,
        abrBandWidthUpFactor: 0.7,
        // Aggressive retries before surfacing an error
        manifestLoadingTimeOut: 15000,
        manifestLoadingMaxRetry: 4,
        manifestLoadingRetryDelay: 500,
        levelLoadingTimeOut: 15000,
        levelLoadingMaxRetry: 6,
        levelLoadingRetryDelay: 500,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 8,
        fragLoadingRetryDelay: 500,
        capLevelToPlayerSize: true,
        capLevelOnFPSDrop: true,
        progressive: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
        setLoading(false);
        const levels: Level[] = data.levels || [];
        const opts: QualityOption[] = levels
          .map((l, i) => ({
            id: i,
            height: l.height || 0,
            bitrate: l.bitrate || 0,
            label: l.height ? qualityLabel(l.height) : formatBitrate(l.bitrate || 0),
          }))
          .sort((a, b) => b.height - a.height || b.bitrate - a.bitrate);
        setQualities(opts);
        hls!.currentLevel = -1;
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
        const lvl = hls!.levels?.[data.level];
        if (lvl?.height) setAutoActiveHeight(lvl.height);
      });

      // Auto-nudge past stalls during live playback
      let stallRecoverTimer: number | null = null;
      const onWaiting = () => {
        if (stallRecoverTimer) window.clearTimeout(stallRecoverTimer);
        stallRecoverTimer = window.setTimeout(() => {
          // If still stalled, seek to live edge
          try {
            if (video.readyState < 3 && hls) {
              const seekable = video.seekable;
              if (seekable.length > 0) {
                const live = seekable.end(seekable.length - 1) - 2;
                if (live > video.currentTime + 5) video.currentTime = live;
              }
              video.play().catch(() => {});
            }
          } catch {}
        }, 4000);
      };
      const onPlaying = () => {
        if (stallRecoverTimer) {
          window.clearTimeout(stallRecoverTimer);
          stallRecoverTimer = null;
        }
      };
      video.addEventListener("waiting", onWaiting);
      video.addEventListener("playing", onPlaying);

      let networkRetries = 0;
      let mediaRetries = 0;
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            if (networkRetries++ < 3) {
              setTimeout(() => hls!.startLoad(), 800);
            } else {
              setError("Stream is currently offline. Try another server.");
              setLoading(false);
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            if (mediaRetries++ < 2) {
              hls!.recoverMediaError();
            } else {
              setError("Playback error. Try another server.");
              setLoading(false);
            }
            break;
          default:
            setError("Stream is currently offline. Try another server.");
            setLoading(false);
        }
      });
    } else {
      video.src = src;
      video.addEventListener("loadeddata", onLoaded);
      video.addEventListener("error", () => {
        setError("Stream is currently offline. Try another server.");
        setLoading(false);
      });
      video.play().catch(() => {});
    }

    return () => {
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
      video.removeEventListener("loadeddata", onLoaded);
    };
  }, [src, retryKey, isIframe]);

  // Iframe loading
  useEffect(() => {
    if (!isIframe) return;
    setLoading(true);
    setError(null);
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, [src, retryKey, isIframe]);

  // Video event listeners
  useEffect(() => {
    const v = videoRef.current;
    if (!v || isIframe) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVol = () => {
      setMuted(v.muted);
      setVolume(v.volume);
    };
    const onEnterPip = () => setPipActive(true);
    const onLeavePip = () => setPipActive(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("volumechange", onVol);
    v.addEventListener("enterpictureinpicture", onEnterPip);
    v.addEventListener("leavepictureinpicture", onLeavePip);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("volumechange", onVol);
      v.removeEventListener("enterpictureinpicture", onEnterPip);
      v.removeEventListener("leavepictureinpicture", onLeavePip);
    };
  }, [isIframe, retryKey]);

  // Fullscreen tracking
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Auto-hide controls
  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      if (playing) {
        setShowControls(false);
        setSettingsOpen(false);
      }
    }, 2800);
  }, [playing]);

  const handleMouseMove = () => {
    setShowControls(true);
    scheduleHide();
  };

  useEffect(() => {
    scheduleHide();
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [playing, scheduleHide]);

  // Controls
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted && v.volume === 0) v.volume = 1;
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    v.muted = val === 0;
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const togglePip = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v.requestPictureInPicture();
    } catch {}
  };

  const selectQuality = (levelId: number) => {
    setCurrentLevel(levelId);
    if (hlsRef.current) hlsRef.current.currentLevel = levelId;
    setSettingsOpen(false);
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const currentQualityLabel =
    currentLevel === -1
      ? autoActiveHeight
        ? `Auto · ${qualityLabel(autoActiveHeight)}`
        : "Auto"
      : qualities.find((q) => q.id === currentLevel)?.label ?? "Auto";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={(e) => {
        if (isIframe) return;
        if ((e.target as HTMLElement).closest("[data-controls]")) return;
        togglePlay();
      }}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_20px_70px_-20px_rgba(139,92,246,0.55)] ring-1 ring-white/5"
    >
      {isIframe ? (
        <iframe
          key={`${src}-${retryKey}`}
          src={src}
          className="h-full w-full border-0"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
          onLoad={() => setLoading(false)}
        />
      ) : (
        <video
          key={retryKey}
          ref={videoRef}
          className="h-full w-full bg-black"
          playsInline
          muted
          autoPlay
          poster={poster}
        />
      )}

      {/* LIVE badge */}
      {!isIframe && !loading && !error && (
        <div
          data-controls
          className={`pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 backdrop-blur-md transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white">Live</span>
          {(autoActiveHeight || currentLevel !== -1) && (
            <span className="ml-1 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white/90">
              {currentLevel === -1
                ? qualityLabel(autoActiveHeight!)
                : qualities.find((q) => q.id === currentLevel)?.label}
            </span>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-[oklch(0.75_0.18_280)]" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black/85 px-6 text-center backdrop-blur-md">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRetryKey((k) => k + 1);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[oklch(0.65_0.2_290)] to-[oklch(0.7_0.15_220)] px-5 py-2 text-sm font-medium text-white transition hover:brightness-110"
          >
            <RotateCw className="h-4 w-4" /> Retry
          </button>
        </div>
      )}

      {/* Custom controls overlay (HLS only) */}
      {!isIframe && !error && (
        <>
          {/* Gradient backdrop */}
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Center play overlay when paused */}
          {!playing && !loading && (
            <button
              data-controls
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="absolute inset-0 z-20 flex items-center justify-center"
              aria-label="Play"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 transition hover:scale-105 hover:bg-white/20">
                <Play className="h-9 w-9 translate-x-0.5 fill-white text-white" />
              </span>
            </button>
          )}

          {/* Bottom control bar */}
          <div
            data-controls
            onClick={(e) => e.stopPropagation()}
            className={`absolute inset-x-0 bottom-0 z-20 flex items-center gap-2 px-4 pb-3 pt-2 transition-all duration-300 ${
              showControls ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            <button
              onClick={togglePlay}
              className="rounded-full p-2 text-white transition hover:bg-white/15"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white" />}
            </button>

            <div className="group/vol flex items-center gap-1">
              <button
                onClick={toggleMute}
                className="rounded-full p-2 text-white transition hover:bg-white/15"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                <VolumeIcon className="h-5 w-5" />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={onVolumeChange}
                className="h-1 w-0 cursor-pointer appearance-none rounded-full bg-white/30 opacity-0 transition-all duration-300 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white group-hover/vol:w-20 group-hover/vol:opacity-100"
                style={{
                  background: `linear-gradient(to right, white ${
                    (muted ? 0 : volume) * 100
                  }%, rgba(255,255,255,0.3) ${(muted ? 0 : volume) * 100}%)`,
                }}
              />
            </div>

            <div className="ml-2 hidden items-center gap-1.5 text-xs font-medium text-white/90 sm:flex">
              <Radio className="h-3.5 w-3.5 text-red-500" />
              <span>LIVE</span>
            </div>

            <div className="ml-auto flex items-center gap-1">
              {/* Settings / Quality */}
              <div className="relative">
                <button
                  onClick={() => setSettingsOpen((o) => !o)}
                  className={`rounded-full p-2 text-white transition hover:bg-white/15 ${
                    settingsOpen ? "bg-white/15" : ""
                  }`}
                  aria-label="Quality settings"
                >
                  <Settings className={`h-5 w-5 ${settingsOpen ? "rotate-45" : ""} transition-transform`} />
                </button>
                {settingsOpen && (
                  <div className="absolute bottom-12 right-0 w-52 overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl">
                    <div className="border-b border-white/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/60">
                      Quality
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1">
                      <button
                        onClick={() => selectQuality(-1)}
                        className="flex w-full items-center justify-between px-4 py-2 text-sm text-white transition hover:bg-white/10"
                      >
                        <span className="flex items-center gap-2">
                          {currentLevel === -1 && <Check className="h-4 w-4 text-[oklch(0.75_0.18_280)]" />}
                          <span className={currentLevel !== -1 ? "ml-6" : ""}>Auto</span>
                        </span>
                        {currentLevel === -1 && autoActiveHeight && (
                          <span className="text-xs text-white/50">{qualityLabel(autoActiveHeight)}</span>
                        )}
                      </button>
                      {qualities.length === 0 && (
                        <div className="px-4 py-3 text-xs text-white/50">No alternate qualities</div>
                      )}
                      {qualities.map((q) => (
                        <button
                          key={q.id}
                          onClick={() => selectQuality(q.id)}
                          className="flex w-full items-center justify-between px-4 py-2 text-sm text-white transition hover:bg-white/10"
                        >
                          <span className="flex items-center gap-2">
                            {currentLevel === q.id && (
                              <Check className="h-4 w-4 text-[oklch(0.75_0.18_280)]" />
                            )}
                            <span className={currentLevel !== q.id ? "ml-6" : ""}>{q.label}</span>
                          </span>
                          {q.bitrate > 0 && (
                            <span className="text-[10px] text-white/40">{formatBitrate(q.bitrate)}</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-white/10 px-4 py-2 text-[10px] text-white/40">
                      Current: {currentQualityLabel}
                    </div>
                  </div>
                )}
              </div>

              {mounted && typeof document !== "undefined" && document.pictureInPictureEnabled && (
                <button
                  onClick={togglePip}
                  className={`rounded-full p-2 text-white transition hover:bg-white/15 ${
                    pipActive ? "bg-white/15" : ""
                  }`}
                  aria-label="Picture in picture"
                >
                  <PictureInPicture2 className="h-5 w-5" />
                </button>
              )}

              <button
                onClick={toggleFullscreen}
                className="rounded-full p-2 text-white transition hover:bg-white/15"
                aria-label="Fullscreen"
              >
                {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
