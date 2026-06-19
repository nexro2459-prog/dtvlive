import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Loader2, AlertTriangle, RotateCw } from "lucide-react";

interface Props {
  src: string;
  poster?: string;
  type?: "hls" | "iframe";
}

export function VideoPlayer({ src, poster, type = "hls" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const isIframe = type === "iframe";

  useEffect(() => {
    if (isIframe) return;
    const video = videoRef.current;
    if (!video) return;
    setLoading(true);
    setError(null);
    let hls: Hls | null = null;

    const onReady = () => setLoading(false);

    if (Hls.isSupported() && src.includes(".m3u8")) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        onReady();
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          setError("Stream is currently offline. Please try another channel or server.");
          setLoading(false);
        }
      });
    } else {
      video.src = src;
      video.addEventListener("loadeddata", onReady);
      video.addEventListener("error", () => {
        setError("Stream is currently offline. Please try another channel or server.");
        setLoading(false);
      });
      video.play().catch(() => {});
    }

    return () => {
      if (hls) hls.destroy();
      video.removeEventListener("loadeddata", onReady);
    };
  }, [src, retryKey, isIframe]);

  // Iframe mode: reset loading on src change
  useEffect(() => {
    if (!isIframe) return;
    setLoading(true);
    setError(null);
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, [src, retryKey, isIframe]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow-[0_0_60px_-15px_rgba(139,92,246,0.5)]">
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
          className="h-full w-full"
          controls
          playsInline
          muted
          autoPlay
          poster={poster}
        />
      )}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-[oklch(0.7_0.18_280)]" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 px-6 text-center backdrop-blur-md">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[oklch(0.65_0.2_290)] to-[oklch(0.7_0.15_220)] px-5 py-2 text-sm font-medium text-white transition hover:brightness-110"
          >
            <RotateCw className="h-4 w-4" /> Retry
          </button>
        </div>
      )}
    </div>
  );
}
