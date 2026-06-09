import { useEffect, useRef, useState } from "react";

/* Fixed-position background music player using a hidden YouTube iframe.
 * Controlled via postMessage so we don't need the full YT IFrame API script.
 * Starts muted (browser autoplay policy) and shows a pulsing button to unmute. */

function extractVideoId(url: string): string | null {
  if (!url) return null;
  // Direct ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1, 12);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      // /shorts/ID or /embed/ID
      const parts = u.pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && /^[a-zA-Z0-9_-]{11}$/.test(last)) return last;
    }
  } catch {
    // not a URL — fall through
  }
  return null;
}

function postCmd(iframe: HTMLIFrameElement | null, func: string, args: unknown[] = []) {
  if (!iframe?.contentWindow) return;
  iframe.contentWindow.postMessage(
    JSON.stringify({ event: "command", func, args }),
    "*"
  );
}

export function MusicPlayer({ youtubeUrl }: { youtubeUrl: string | null | undefined }) {
  const videoId = youtubeUrl ? extractVideoId(youtubeUrl) : null;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  // Try to autoplay (muted) when the iframe is ready.
  useEffect(() => {
    if (!videoId) return;
    const id = setTimeout(() => {
      postCmd(iframeRef.current, "playVideo");
    }, 1200);
    return () => clearTimeout(id);
  }, [videoId]);

  if (!videoId) return null;

  const src =
    `https://www.youtube.com/embed/${videoId}` +
    `?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&playsinline=1&enablejsapi=1&rel=0&iv_load_policy=3`;

  function toggleMute() {
    if (muted) {
      postCmd(iframeRef.current, "unMute");
      postCmd(iframeRef.current, "setVolume", [60]);
    } else {
      postCmd(iframeRef.current, "mute");
    }
    setMuted(!muted);
  }

  function togglePlay() {
    if (playing) postCmd(iframeRef.current, "pauseVideo");
    else postCmd(iframeRef.current, "playVideo");
    setPlaying(!playing);
  }

  return (
    <>
      {/* Hidden iframe — audio only */}
      <iframe
        ref={iframeRef}
        src={src}
        title="Background music"
        aria-hidden="true"
        allow="autoplay; encrypted-media"
        style={{
          position: "fixed",
          left: -9999,
          top: -9999,
          width: 1,
          height: 1,
          border: 0,
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {/* Floating button */}
      <button
        onClick={muted ? toggleMute : togglePlay}
        onContextMenu={(e) => { e.preventDefault(); togglePlay(); }}
        className="fixed bottom-5 right-5 z-50 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        title={muted ? "Putar musik (klik untuk unmute)" : playing ? "Jeda musik" : "Putar musik"}
        aria-label={muted ? "Aktifkan suara" : playing ? "Jeda" : "Putar"}
        style={{
          width: 52,
          height: 52,
          background: "rgba(20,12,8,0.85)",
          backdropFilter: "blur(8px)",
          color: "#FAF4E6",
          border: "1px solid rgba(250,244,230,0.2)",
          animation: muted ? "ring-pulse 2s ease-out infinite" : undefined,
        }}
      >
        {muted ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : playing ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <polygon points="7,4 20,12 7,20" />
          </svg>
        )}
      </button>

      <style>{`
        @keyframes ring-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(168,131,57,0.55), 0 12px 28px -10px rgba(0,0,0,0.5); }
          70%  { box-shadow: 0 0 0 14px rgba(168,131,57,0), 0 12px 28px -10px rgba(0,0,0,0.5); }
          100% { box-shadow: 0 0 0 0 rgba(168,131,57,0), 0 12px 28px -10px rgba(0,0,0,0.5); }
        }
      `}</style>
    </>
  );
}
