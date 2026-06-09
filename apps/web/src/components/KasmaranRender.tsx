import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { api, extractError } from "@/lib/api";
import { InvitationData } from "./InvitationRender";
import { StoryChapters } from "./StoryChapters";

/* Kasmaran — Luxe Burgundy, hand-drawn floral, vintage stamp, letter reveal.
   Premium dark-romantic template with ornate organic ornaments. */

const TONE = {
  bg: "#2A0E11",          // deep burgundy near-black
  bgDark: "#1A0709",
  panel: "#3D161B",        // burgundy panel
  panelSoft: "#4C1D24",
  ink: "#F5E5C8",          // warm cream
  inkSoft: "#D4B98E",      // antique gold
  inkMute: "#A38A66",
  gold: "#D4B26B",
  goldDeep: "#A57B40",
  rose: "#E8A89A",
  rule: "rgba(245, 229, 200, 0.18)",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
}
function parts(iso: string) {
  const d = new Date(iso);
  return {
    weekday: d.toLocaleDateString("id-ID", { weekday: "long" }),
    day: d.toLocaleDateString("id-ID", { day: "numeric" }),
    month: d.toLocaleDateString("id-ID", { month: "long" }),
    monthShort: d.toLocaleDateString("id-ID", { month: "short" }).toUpperCase(),
    year: d.toLocaleDateString("id-ID", { year: "numeric" }),
  };
}

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

/* IntersectionObserver reveal */
function useReveal<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (setShown(true), io.disconnect())),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, shown };
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(40px)",
        transition: `opacity 1100ms cubic-bezier(0.2,0.7,0.2,1) ${delay}ms, transform 1300ms cubic-bezier(0.2,0.7,0.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- HAND-DRAWN ORNAMENTS ---------- */

function VineBorder({ side, color = TONE.gold, opacity = 0.7 }: { side: "left" | "right" | "top" | "bottom"; color?: string; opacity?: number }) {
  const flip = side === "right" || side === "bottom";
  const vertical = side === "left" || side === "right";
  return (
    <svg
      viewBox="0 0 80 400"
      preserveAspectRatio={vertical ? "xMidYMid meet" : "xMidYMid slice"}
      style={{
        position: "absolute",
        [side]: 0,
        ...(vertical ? { top: 0, bottom: 0, width: 80 } : { left: 0, right: 0, height: 80 }),
        opacity,
        transform: `${flip ? "scaleX(-1)" : ""} ${!vertical ? "rotate(90deg) translate(0, 50%)" : ""}`,
        pointerEvents: "none",
      } as React.CSSProperties}
    >
      <g stroke={color} strokeWidth="0.9" fill="none" strokeLinecap="round">
        {/* main vine */}
        <path d="M 30 0 C 28 50, 42 80, 32 130 S 24 200, 36 250 S 30 320, 34 400" />
        {/* leaves */}
        <path d="M 32 30 Q 50 22, 56 40 Q 48 50, 32 42 Z" fill={color} fillOpacity="0.35" />
        <path d="M 30 80 Q 12 70, 8 90 Q 18 100, 32 92 Z" fill={color} fillOpacity="0.35" />
        <path d="M 38 130 Q 58 122, 64 142 Q 54 152, 38 142 Z" fill={color} fillOpacity="0.35" />
        <path d="M 26 180 Q 8 172, 4 192 Q 14 200, 28 192 Z" fill={color} fillOpacity="0.35" />
        <path d="M 36 230 Q 56 222, 62 242 Q 52 252, 36 242 Z" fill={color} fillOpacity="0.35" />
        <path d="M 28 290 Q 10 282, 6 302 Q 16 310, 30 302 Z" fill={color} fillOpacity="0.35" />
        <path d="M 36 340 Q 56 332, 62 352 Q 52 362, 36 352 Z" fill={color} fillOpacity="0.35" />
        {/* tiny berries / flowers */}
        <circle cx="50" cy="58" r="2.4" fill={color} fillOpacity="0.85" />
        <circle cx="14" cy="108" r="2.2" fill={color} fillOpacity="0.85" />
        <circle cx="58" cy="162" r="2.4" fill={color} fillOpacity="0.85" />
        <circle cx="10" cy="212" r="2.2" fill={color} fillOpacity="0.85" />
        <circle cx="56" cy="270" r="2.4" fill={color} fillOpacity="0.85" />
        <circle cx="12" cy="320" r="2.2" fill={color} fillOpacity="0.85" />
      </g>
    </svg>
  );
}

function FloralCornerOrn({ color = TONE.gold, size = 200, className = "", style }: { color?: string; size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} style={style} aria-hidden>
      <g stroke={color} strokeWidth="0.9" fill="none" strokeLinecap="round">
        {/* curving main stem */}
        <path d="M 0 100 Q 30 95, 50 70 Q 70 45, 100 40 Q 130 35, 145 15 Q 155 5, 165 5" />
        <path d="M 0 110 Q 25 115, 50 105 Q 80 95, 95 75" opacity="0.6" />
        {/* large rose */}
        <g transform="translate(100, 40)">
          <circle r="6" fill={color} fillOpacity="0.85" />
          <circle r="10" fill="none" />
          <circle r="14" fill="none" opacity="0.6" />
          <path d="M 0 -7 Q 5 -3, 0 0 Q -5 -3, 0 -7 Z" fill={color} fillOpacity="0.65" />
          <path d="M 7 0 Q 3 5, 0 0 Q 3 -5, 7 0 Z" fill={color} fillOpacity="0.65" />
          <path d="M 0 7 Q -5 3, 0 0 Q 5 3, 0 7 Z" fill={color} fillOpacity="0.65" />
        </g>
        {/* small rose */}
        <g transform="translate(50, 70)">
          <circle r="4" fill={color} fillOpacity="0.85" />
          <circle r="7" fill="none" opacity="0.7" />
        </g>
        {/* leaves */}
        <path d="M 30 95 Q 45 80, 55 92 Q 50 105, 32 100 Z" fill={color} fillOpacity="0.4" />
        <path d="M 75 50 Q 90 35, 96 50 Q 90 62, 76 56 Z" fill={color} fillOpacity="0.4" />
        <path d="M 120 28 Q 132 14, 138 28 Q 132 38, 122 34 Z" fill={color} fillOpacity="0.4" />
        <path d="M 30 115 Q 18 120, 12 128 Q 22 132, 32 122 Z" fill={color} fillOpacity="0.4" />
        {/* small berries */}
        <circle cx="20" cy="100" r="1.6" fill={color} />
        <circle cx="65" cy="58" r="1.6" fill={color} />
        <circle cx="115" cy="30" r="1.6" fill={color} />
        <circle cx="155" cy="10" r="1.6" fill={color} />
        {/* tiny stem ends */}
        <path d="M 165 5 L 160 0 M 165 5 L 158 8" />
      </g>
    </svg>
  );
}

function OrnateDivider({ color = TONE.gold, width = 280 }: { color?: string; width?: number }) {
  return (
    <svg viewBox="0 0 280 40" width={width} height={width * 0.143} className="mx-auto" aria-hidden>
      <g stroke={color} fill="none" strokeWidth="0.8" strokeLinecap="round">
        <line x1="0" y1="20" x2="100" y2="20" opacity="0.6" />
        <line x1="180" y1="20" x2="280" y2="20" opacity="0.6" />
        {/* center floret */}
        <g transform="translate(140 20)">
          <circle r="4" fill={color} />
          <circle r="9" />
          <path d="M 0 -14 Q 4 -8, 0 -4 Q -4 -8, 0 -14 Z" fill={color} fillOpacity="0.55" />
          <path d="M 14 0 Q 8 4, 4 0 Q 8 -4, 14 0 Z" fill={color} fillOpacity="0.55" />
          <path d="M 0 14 Q -4 8, 0 4 Q 4 8, 0 14 Z" fill={color} fillOpacity="0.55" />
          <path d="M -14 0 Q -8 -4, -4 0 Q -8 4, -14 0 Z" fill={color} fillOpacity="0.55" />
          {/* leaves */}
          <path d="M 14 -10 Q 22 -10, 22 -4" />
          <path d="M -14 -10 Q -22 -10, -22 -4" />
          <path d="M 14 10 Q 22 10, 22 4" />
          <path d="M -14 10 Q -22 10, -22 4" />
        </g>
        {/* side accents */}
        <circle cx="100" cy="20" r="2" fill={color} />
        <circle cx="180" cy="20" r="2" fill={color} />
        <circle cx="80" cy="20" r="1.4" fill={color} fillOpacity="0.7" />
        <circle cx="200" cy="20" r="1.4" fill={color} fillOpacity="0.7" />
      </g>
    </svg>
  );
}

function WaxSeal({ size = 60, label = "K&K", color = TONE.gold }: { size?: number; label?: string; color?: string }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden>
      <defs>
        <radialGradient id="waxGrad" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#C1545A" />
          <stop offset="100%" stopColor="#7A1F2A" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="26" fill="url(#waxGrad)" />
      <circle cx="30" cy="30" r="22" fill="none" stroke={color} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.8" />
      <circle cx="30" cy="30" r="18" fill="none" stroke={color} strokeWidth="0.6" opacity="0.6" />
      <text x="30" y="34" textAnchor="middle" fontFamily="Quattrocento, serif" fontSize="11" fill={color} letterSpacing="0.5">
        {label}
      </text>
      {/* drip highlights */}
      <ellipse cx="22" cy="22" rx="6" ry="3" fill="#E8A89A" opacity="0.18" transform="rotate(-30 22 22)" />
    </svg>
  );
}

function PetalRain({ count = 14 }: { count?: number }) {
  // floating petals as decorative ambient layer
  const petals = Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 18,
    duration: 18 + Math.random() * 14,
    size: 8 + Math.random() * 10,
    rotate: Math.random() * 360,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p) => (
        <svg
          key={p.id}
          viewBox="0 0 20 20"
          width={p.size}
          height={p.size}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-40px",
            opacity: 0.5,
            animation: `petalFall ${p.duration}s linear ${p.delay}s infinite`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        >
          <path d="M 10 2 Q 16 8, 14 14 Q 10 18, 6 14 Q 4 8, 10 2 Z" fill={TONE.rose} fillOpacity="0.6" />
          <path d="M 10 5 Q 13 10, 10 13" stroke={TONE.goldDeep} strokeWidth="0.5" fill="none" opacity="0.5" />
        </svg>
      ))}
    </div>
  );
}

/* ---------- MAIN ---------- */

export function KasmaranRender({ data, interactive = false }: { data: InvitationData; interactive?: boolean }) {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const primary = data.events[0]?.date ?? new Date().toISOString();

  function handleOpen() {
    setOpening(true);
    setTimeout(() => setOpened(true), 1000);
  }

  return (
    <div style={{ background: TONE.bg, color: TONE.ink, fontFamily: "inherit" }}>
      {!opened && <Cover data={data} primary={primary} onOpen={handleOpen} opening={opening} />}
      {opened && (
        <div className="kas-content">
          <Opening data={data} />
          <Couple data={data} />
          <DateScene primary={primary} couple={data.couple} />
          {data.events.map((e, i) => <EventCard key={e.id ?? i} event={e} index={i} />)}
          {((data.storyChapters && data.storyChapters.length > 0) || data.story) && (
            <StoryChapters
              chapters={data.storyChapters}
              story={data.story}
              gallery={data.gallery}
              theme={{
                bg: TONE.bgDark,
                fg: TONE.ink,
                fgSoft: TONE.inkSoft,
                accent: TONE.gold,
                rule: TONE.gold,
                card: TONE.panel,
                variant: "dark",
              }}
            />
          )}
          {data.gallery.length > 0 && <Gallery gallery={data.gallery} />}
          <Rsvp data={data} interactive={interactive} />
          <Wishes slug={data.slug} initial={data.wishes ?? []} interactive={interactive} />
          {data.gifts.length > 0 && <Gifts gifts={data.gifts} />}
          <Closing data={data} />
        </div>
      )}

      <style>{`
        .kas-content { animation: kasEnter 1300ms cubic-bezier(0.2, 0.7, 0.2, 1) both; }
        @keyframes kasEnter {
          0%   { opacity: 0; transform: scale(0.94); filter: blur(6px); }
          70%  { opacity: 1; filter: blur(0); }
          100% { opacity: 1; transform: none; }
        }
        @keyframes coverFade {
          to { opacity: 0; transform: scale(1.15); filter: blur(8px); }
        }
        @keyframes petalFall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(110vh) translateX(40px) rotate(360deg); opacity: 0; }
        }
        @keyframes slowFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes letterIn {
          from { opacity: 0; transform: translateY(20px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .kas-letter {
          display: inline-block;
          animation: letterIn 800ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }
        .kas-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid ${TONE.rule};
          background: rgba(245, 229, 200, 0.05);
          color: ${TONE.ink};
          font-family: inherit;
          font-size: 15px;
          border-radius: 2px;
        }
        .kas-input:focus { outline: none; border-color: ${TONE.gold}; background: rgba(212, 178, 107, 0.08); }
        .kas-input::placeholder { color: ${TONE.inkMute}; opacity: 0.7; }
      `}</style>
    </div>
  );
}

/* ---------- COVER ---------- */

function LetterReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      {text.split("").map((ch, i) => (
        <span key={i} className="kas-letter" style={{ animationDelay: `${delay + i * 70}ms` }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </>
  );
}

function Cover({ data, primary, onOpen, opening }: { data: InvitationData; primary: string; onOpen: () => void; opening: boolean }) {
  const cover = data.coverImage || "https://images.unsplash.com/photo-1606490194859-07c18c9f0968?w=1800&q=80";
  const dp = parts(primary);
  const guestName = data.guestName ?? null;
  const initials = `${data.couple.brideShort[0]}&${data.couple.groomShort[0]}`;

  return (
    <section
      className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center"
      style={{ animation: opening ? "coverFade 1000ms cubic-bezier(0.7, 0, 0.3, 1) forwards" : undefined }}
    >
      <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ animation: "slowFloat 8s ease-in-out infinite" }} />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 40%, rgba(42,14,17,0.55) 0%, rgba(42,14,17,0.85) 60%, rgba(26,7,9,0.97) 100%)`,
        }}
      />
      <PetalRain count={18} />

      {/* corner ornaments */}
      <FloralCornerOrn size={200} className="absolute top-0 left-0 opacity-65" />
      <FloralCornerOrn size={200} className="absolute top-0 right-0 opacity-65" style={{ transform: "scaleX(-1)" }} />
      <FloralCornerOrn size={200} className="absolute bottom-0 left-0 opacity-65" style={{ transform: "scaleY(-1)" }} />
      <FloralCornerOrn size={200} className="absolute bottom-0 right-0 opacity-65" style={{ transform: "scale(-1, -1)" }} />

      <div className="relative z-10 text-center px-6 max-w-md" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.55)" }}>
        <div className="flex justify-center mb-6">
          <WaxSeal size={66} label={initials} />
        </div>

        <div className="text-[10px] tracking-[0.45em] uppercase" style={{ color: TONE.gold }}>
          <LetterReveal text={data.eyebrow} />
        </div>

        <h1
          className="font-serif mt-10"
          style={{ color: TONE.ink, fontSize: "clamp(46px, 10vw, 92px)", lineHeight: 1.0, letterSpacing: "-0.01em" }}
        >
          <LetterReveal text={data.couple.brideShort} delay={600} />
          <div className="my-3" style={{ color: TONE.gold, fontSize: "0.5em" }}>
            <LetterReveal text="&" delay={1500} />
          </div>
          <LetterReveal text={data.couple.groomShort} delay={1700} />
        </h1>

        <div className="mt-9">
          <OrnateDivider color={TONE.gold} width={260} />
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] tracking-[0.4em] uppercase" style={{ color: TONE.inkSoft }}>
          <span>{dp.day}</span>
          <span style={{ color: TONE.gold }}>·</span>
          <span>{dp.monthShort}</span>
          <span style={{ color: TONE.gold }}>·</span>
          <span>{dp.year}</span>
        </div>

        {guestName && (
          <div className="mt-9">
            <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.gold }}>Kepada Yang Terhormat</div>
            <div className="font-serif text-2xl mt-1.5" style={{ color: TONE.ink }}>{guestName}</div>
          </div>
        )}

        <button
          onClick={onOpen}
          className="group mt-11 inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-[11px] tracking-[0.35em] uppercase transition border"
          style={{
            color: TONE.bg,
            background: TONE.gold,
            borderColor: TONE.gold,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 7l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>Buka Undangan</span>
        </button>
      </div>
    </section>
  );
}

/* ---------- OPENING ---------- */

function Opening({ data }: { data: InvitationData }) {
  return (
    <section className="relative py-16 px-6 overflow-hidden">
      <FloralCornerOrn className="absolute top-6 left-6 opacity-40" size={180} />
      <FloralCornerOrn className="absolute bottom-6 right-6 opacity-40" size={180} style={{ transform: "scale(-1, -1)" }} />

      <Reveal>
        <div className="container-narrow text-center max-w-3xl mx-auto">
          <div className="text-[10px] tracking-[0.45em] uppercase" style={{ color: TONE.gold }}>Bismillāhirrahmānirrahīm</div>
          <OrnateDivider color={TONE.gold} width={240} />
          {data.quote && (
            <p className="font-serif mt-8 px-4" style={{ color: TONE.ink, fontSize: "clamp(19px, 2.6vw, 28px)", lineHeight: 1.6 }}>
              <span className="font-serif text-6xl leading-none align-top" style={{ color: TONE.gold, opacity: 0.6 }}>“</span>
              {data.quote}
              <span className="font-serif text-6xl leading-none align-bottom" style={{ color: TONE.gold, opacity: 0.6 }}>”</span>
            </p>
          )}
          <div className="mt-9 text-sm leading-relaxed max-w-xl mx-auto" style={{ color: TONE.inkSoft }}>
            Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan pernikahan putra-putri kami:
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- COUPLE ---------- */

function Couple({ data }: { data: InvitationData }) {
  return (
    <section className="relative py-12 px-6">
      <VineBorder side="left" />
      <VineBorder side="right" />
      <div className="container-narrow grid md:grid-cols-[1fr_auto_1fr] gap-10 items-center">
        <CouplePerson side="bride" data={data} />
        <Reveal delay={400}>
          <div className="flex flex-col items-center gap-5 py-6">
            <div className="w-px h-12" style={{ background: `linear-gradient(180deg, transparent, ${TONE.gold}, transparent)` }} />
            <div className="font-serif" style={{ color: TONE.gold, fontSize: "72px", lineHeight: 1 }}>&amp;</div>
            <div className="w-px h-12" style={{ background: `linear-gradient(180deg, transparent, ${TONE.gold}, transparent)` }} />
          </div>
        </Reveal>
        <CouplePerson side="groom" data={data} />
      </div>
    </section>
  );
}

function CouplePerson({ side, data }: { side: "bride" | "groom"; data: InvitationData }) {
  const isBride = side === "bride";
  const name = isBride ? data.couple.brideName : data.couple.groomName;
  const short = isBride ? data.couple.brideShort : data.couple.groomShort;
  const parents = isBride ? data.couple.brideParents : data.couple.groomParents;
  const ig = isBride ? data.couple.brideInstagram : data.couple.groomInstagram;
  const photo = isBride ? data.couple.bridePhoto : data.couple.groomPhoto;

  return (
    <Reveal delay={isBride ? 0 : 200}>
      <div className="text-center">
        <div className="relative mx-auto w-56 h-56">
          {/* ornate frame around portrait */}
          <div className="absolute inset-0 rounded-[8px] overflow-hidden" style={{ background: TONE.panel }}>
            {photo ? (
              <img src={photo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-serif text-7xl" style={{ color: TONE.gold }}>
                {short[0]}
              </div>
            )}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(180deg, transparent 50%, rgba(42,14,17,0.55) 100%)" }}
            />
          </div>
          {/* gold frame outline */}
          <div className="absolute inset-0 rounded-[8px] border-2 pointer-events-none" style={{ borderColor: TONE.gold }} />
          <div className="absolute -inset-2 rounded-[10px] border pointer-events-none" style={{ borderColor: TONE.gold, opacity: 0.35 }} />
          {/* corner florets */}
          <span className="absolute -top-3 -left-3 w-6 h-6 rotate-45 border" style={{ borderColor: TONE.gold, background: TONE.bg }} />
          <span className="absolute -top-3 -right-3 w-6 h-6 rotate-45 border" style={{ borderColor: TONE.gold, background: TONE.bg }} />
          <span className="absolute -bottom-3 -left-3 w-6 h-6 rotate-45 border" style={{ borderColor: TONE.gold, background: TONE.bg }} />
          <span className="absolute -bottom-3 -right-3 w-6 h-6 rotate-45 border" style={{ borderColor: TONE.gold, background: TONE.bg }} />
        </div>
        <div className="text-[10px] tracking-[0.4em] uppercase mt-7" style={{ color: TONE.gold }}>
          {isBride ? "Calon Mempelai Putri" : "Calon Mempelai Putra"}
        </div>
        <h3 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(28px, 3.4vw, 38px)", lineHeight: 1.1 }}>
          {short}
        </h3>
        <div className="font-serif text-base mt-1" style={{ color: TONE.inkSoft }}>{name}</div>
        {parents && <p className="mt-4 text-sm leading-relaxed max-w-xs mx-auto" style={{ color: TONE.inkMute }}>{parents}</p>}
        {ig && (
          <a
            href={`https://instagram.com/${ig.replace(/^@/, "")}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase font-mono"
            style={{ color: TONE.gold }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
            </svg>
            {ig}
          </a>
        )}
      </div>
    </Reveal>
  );
}

/* ---------- DATE SCENE ---------- */

function DateScene({ primary, couple }: { primary: string; couple: InvitationData["couple"] }) {
  const cd = useCountdown(primary);
  const dp = parts(primary);

  return (
    <section className="relative py-14 px-6 overflow-hidden" style={{ background: TONE.bgDark }}>
      <FloralCornerOrn className="absolute top-4 left-4 opacity-45" size={180} />
      <FloralCornerOrn className="absolute top-4 right-4 opacity-45" size={180} style={{ transform: "scaleX(-1)" }} />

      <Reveal>
        <div className="container-narrow text-center">
          <div className="text-[10px] tracking-[0.45em] uppercase" style={{ color: TONE.gold }}>Hari Bahagia</div>
          <h2 className="font-serif mt-6" style={{ color: TONE.ink, fontSize: "clamp(34px, 5vw, 56px)" }}>
            {dp.weekday}
          </h2>
          <div className="mt-3 flex items-center justify-center gap-5 text-[11px] tracking-[0.4em] uppercase" style={{ color: TONE.gold }}>
            <span className="w-12 h-px" style={{ background: TONE.gold }} />
            <span style={{ color: TONE.ink, fontSize: "clamp(72px, 12vw, 132px)", lineHeight: 1, fontFamily: "Quattrocento, serif" }}>
              {dp.day}
            </span>
            <span className="w-12 h-px" style={{ background: TONE.gold }} />
          </div>
          <div className="mt-2 font-serif text-2xl md:text-3xl" style={{ color: TONE.inkSoft }}>
            {dp.month} {dp.year}
          </div>

          <div className="mt-12 inline-flex gap-3 md:gap-5">
            {[
              ["Hari", cd.d],
              ["Jam", cd.h],
              ["Menit", cd.m],
              ["Detik", cd.s],
            ].map(([l, v]) => (
              <div
                key={l as string}
                className="relative min-w-[64px] md:min-w-[88px] py-3 px-2 border"
                style={{ borderColor: TONE.gold, background: "rgba(245,229,200,0.03)" }}
              >
                <span className="absolute -top-1.5 -left-1.5 w-3 h-3 rotate-45 border-l border-t" style={{ borderColor: TONE.gold }} />
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rotate-45 border-r border-t" style={{ borderColor: TONE.gold }} />
                <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rotate-45 border-l border-b" style={{ borderColor: TONE.gold }} />
                <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rotate-45 border-r border-b" style={{ borderColor: TONE.gold }} />
                <div className="font-serif text-3xl md:text-4xl tabular-nums" style={{ color: TONE.ink }}>
                  {String(v).padStart(2, "0")}
                </div>
                <div className="text-[9px] tracking-[0.3em] uppercase mt-1" style={{ color: TONE.inkSoft }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- EVENT CARD ---------- */

function EventCard({ event, index }: { event: InvitationData["events"][number]; index: number }) {
  const dp = parts(event.date);

  return (
    <section className="relative py-16 px-6">
      <Reveal>
        <div className="container-narrow max-w-2xl mx-auto">
          <div className="relative p-10 md:p-14 text-center overflow-hidden" style={{ background: TONE.panel }}>
            {/* ornate corner stamps */}
            <FloralCornerOrn className="absolute top-2 left-2 opacity-50" size={120} />
            <FloralCornerOrn className="absolute top-2 right-2 opacity-50" size={120} style={{ transform: "scaleX(-1)" }} />
            <FloralCornerOrn className="absolute bottom-2 left-2 opacity-50" size={120} style={{ transform: "scaleY(-1)" }} />
            <FloralCornerOrn className="absolute bottom-2 right-2 opacity-50" size={120} style={{ transform: "scale(-1,-1)" }} />

            <div className="relative">
              <div className="text-[10px] tracking-[0.45em] uppercase" style={{ color: TONE.gold }}>
                Acara {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="font-serif mt-4" style={{ color: TONE.ink, fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.1 }}>
                {event.kind === "AKAD" ? "Akad Nikah" : event.kind === "RESEPSI" ? "Resepsi Pernikahan" : event.title}
              </h3>
              <OrnateDivider color={TONE.gold} width={220} />

              <div className="mt-3 flex items-baseline justify-center gap-4 font-serif text-xl" style={{ color: TONE.ink }}>
                <span>{dp.day}</span>
                <span className="text-base" style={{ color: TONE.gold }}>·</span>
                <span>{dp.month}</span>
                <span className="text-base" style={{ color: TONE.gold }}>·</span>
                <span>{dp.year}</span>
              </div>
              <div className="mt-2 text-xs tracking-[0.3em] uppercase" style={{ color: TONE.inkSoft }}>{dp.weekday}</div>

              <div className="mt-7 inline-flex items-center gap-3 px-5 py-2 border font-mono text-xs tracking-[0.2em]" style={{ borderColor: TONE.gold, color: TONE.ink }}>
                {fmtTime(event.date)} {event.endTime ? `– ${fmtTime(event.endTime)}` : ""} WIB
              </div>

              <div className="mt-8">
                <div className="font-serif text-2xl" style={{ color: TONE.ink }}>{event.venueName}</div>
                <div className="mt-1 text-sm max-w-md mx-auto" style={{ color: TONE.inkSoft }}>{event.address}</div>
              </div>

              {event.dressCode && (
                <div className="mt-5 inline-block px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.3em]" style={{ background: "rgba(212,178,107,0.15)", color: TONE.gold }}>
                  Dress Code · {event.dressCode}
                </div>
              )}
              {event.mapUrl && (
                <div className="mt-7">
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[11px] tracking-[0.3em] uppercase transition hover:scale-105"
                    style={{ background: TONE.gold, color: TONE.bg }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Lihat Peta Lokasi
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- GALLERY ---------- */

function Gallery({ gallery }: { gallery: InvitationData["gallery"] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (paused) return;
    const i = setInterval(() => setActive((a) => (a + 1) % gallery.length), 5000);
    return () => clearInterval(i);
  }, [gallery.length, paused]);

  return (
    <section className="relative py-12 overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Reveal>
        <div className="text-center px-6 mb-10">
          <div className="text-[10px] tracking-[0.45em] uppercase" style={{ color: TONE.gold }}>Galeri</div>
          <h2 className="font-serif mt-4" style={{ color: TONE.ink, fontSize: "clamp(34px, 5vw, 52px)" }}>Momen-Momen Kami</h2>
          <OrnateDivider color={TONE.gold} width={240} />
        </div>
      </Reveal>

      <div className="relative max-w-5xl mx-auto px-4">
        <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden">
          {/* gold frame */}
          <div className="absolute inset-2 border pointer-events-none z-10" style={{ borderColor: TONE.gold }} />
          <div className="absolute inset-0 pointer-events-none z-10">
            <span className="absolute top-0 left-0 w-10 h-10 border-l-2 border-t-2" style={{ borderColor: TONE.gold }} />
            <span className="absolute top-0 right-0 w-10 h-10 border-r-2 border-t-2" style={{ borderColor: TONE.gold }} />
            <span className="absolute bottom-0 left-0 w-10 h-10 border-l-2 border-b-2" style={{ borderColor: TONE.gold }} />
            <span className="absolute bottom-0 right-0 w-10 h-10 border-r-2 border-b-2" style={{ borderColor: TONE.gold }} />
          </div>

          {gallery.map((g, i) => (
            <button
              key={g.id ?? i}
              onClick={() => setLightbox(g.url)}
              className="absolute inset-0 cursor-zoom-in"
              style={{
                opacity: active === i ? 1 : 0,
                transform: active === i ? "scale(1)" : "scale(1.06)",
                transition: "opacity 1200ms ease, transform 6000ms ease",
                pointerEvents: active === i ? "auto" : "none",
              }}
            >
              <img src={g.url} alt={g.caption ?? ""} className="w-full h-full object-cover" />
              {g.caption && (
                <div className="absolute bottom-6 left-6 right-6 z-20 text-left">
                  <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.gold }}>
                    {String(i + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
                  </div>
                  <div className="font-serif text-2xl md:text-3xl mt-1" style={{ color: TONE.ink }}>{g.caption}</div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* thumbs */}
        <div className="flex justify-center gap-2 mt-7">
          {gallery.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="h-1 rounded-full transition-all"
              style={{
                width: active === i ? 32 : 10,
                background: active === i ? TONE.gold : TONE.rule,
              }}
              aria-label={`Foto ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 cursor-zoom-out"
          style={{ background: "rgba(0,0,0,0.95)" }}
        >
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </section>
  );
}

/* ---------- RSVP ---------- */

function Rsvp({ data, interactive }: { data: InvitationData; interactive: boolean }) {
  const known = !!data.guestName && !!data.guestSlug;
  const [form, setForm] = useState({
    name: data.guestName ?? "",
    status: "HADIR",
    pax: 1,
    session: data.guestInvitedTo ?? "",
    message: "",
  });
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!interactive) { setDone(true); return; }
    setBusy(true); setErr(null);
    try {
      const payload = known
        ? { guestSlug: data.guestSlug, status: form.status, message: form.message }
        : form;
      await api.post(`/rsvp/public/${data.slug}`, payload);
      setDone(true);
    } catch (e) { setErr(extractError(e)); }
    finally { setBusy(false); }
  }

  const STATUS = [
    { id: "HADIR", label: "Hadir" },
    { id: "TIDAK", label: "Tidak Hadir" },
    { id: "RAGU", label: "Masih Ragu" },
  ];

  const corners = (
    <>
      <span className="absolute -top-3 -left-3 w-6 h-6 rotate-45 border" style={{ borderColor: TONE.gold, background: TONE.bg }} />
      <span className="absolute -top-3 -right-3 w-6 h-6 rotate-45 border" style={{ borderColor: TONE.gold, background: TONE.bg }} />
      <span className="absolute -bottom-3 -left-3 w-6 h-6 rotate-45 border" style={{ borderColor: TONE.gold, background: TONE.bg }} />
      <span className="absolute -bottom-3 -right-3 w-6 h-6 rotate-45 border" style={{ borderColor: TONE.gold, background: TONE.bg }} />
    </>
  );

  return (
    <section className="relative py-14 px-6">
      <VineBorder side="left" />
      <VineBorder side="right" />
      <Reveal>
        <div className="text-center mb-10">
          <div className="text-[10px] tracking-[0.45em] uppercase" style={{ color: TONE.gold }}>Konfirmasi Kehadiran</div>
          <h2 className="font-serif mt-4" style={{ color: TONE.ink, fontSize: "clamp(34px, 5vw, 52px)" }}>RSVP</h2>
          <OrnateDivider color={TONE.gold} width={220} />
          {known ? (
            <p className="mt-5 max-w-md mx-auto text-sm" style={{ color: TONE.inkSoft }}>
              Halo <span className="font-serif italic" style={{ color: TONE.ink }}>{data.guestName}</span>, mohon konfirmasikan kehadiran Anda di bawah ini.
            </p>
          ) : (
            <p className="mt-5 max-w-md mx-auto text-sm" style={{ color: TONE.inkSoft }}>
              Mohon konfirmasikan kehadiran Anda agar kami dapat menyiapkan tempat dengan sebaik-baiknya.
            </p>
          )}
        </div>
      </Reveal>

      {done ? (
        <Reveal>
          <div className="max-w-xl mx-auto text-center p-10 border-2 relative" style={{ borderColor: TONE.gold, background: TONE.panel }}>
            {corners}
            <WaxSeal size={56} label="✓" />
            <div className="font-serif text-3xl mt-5" style={{ color: TONE.ink }}>Terima kasih atas konfirmasi Anda</div>
            <p className="mt-3 text-sm" style={{ color: TONE.inkSoft }}>Sampai bertemu di hari bahagia kami.</p>
          </div>
        </Reveal>
      ) : known ? (
        <Reveal delay={150}>
          <form
            onSubmit={submit}
            className="max-w-xl mx-auto grid gap-5 p-7 md:p-9 relative border-2"
            style={{ borderColor: TONE.gold, background: TONE.panel }}
          >
            {corners}
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase mb-3 text-center" style={{ color: TONE.gold }}>Kehadiran Anda</div>
              <div className="grid grid-cols-3 gap-2">
                {STATUS.map((s) => {
                  const active = form.status === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setForm({ ...form, status: s.id })}
                      className="text-xs py-4 transition"
                      style={{
                        border: `1px solid ${TONE.gold}`,
                        background: active ? TONE.gold : "transparent",
                        color: active ? TONE.bg : TONE.ink,
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <Field label="Pesan untuk mempelai (opsional)">
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="kas-input" />
            </Field>
            {err && <div className="text-sm" style={{ color: TONE.rose }}>{err}</div>}
            <button
              type="submit"
              disabled={busy}
              className="mt-2 rounded-full px-7 py-3.5 text-[11px] tracking-[0.35em] uppercase transition hover:scale-[1.02]"
              style={{ background: TONE.gold, color: TONE.bg }}
            >
              {busy ? "Mengirim…" : "Kirim Konfirmasi"}
            </button>
          </form>
        </Reveal>
      ) : (
        <Reveal delay={150}>
          <form
            onSubmit={submit}
            className="max-w-xl mx-auto grid gap-3 p-7 md:p-9 relative border-2"
            style={{ borderColor: TONE.gold, background: TONE.panel }}
          >
            {corners}
            <Field label="Nama Lengkap">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama Anda" className="kas-input" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Kehadiran">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="kas-input">
                  <option value="HADIR">Hadir</option>
                  <option value="TIDAK">Tidak Hadir</option>
                  <option value="RAGU">Masih Ragu</option>
                </select>
              </Field>
              <Field label="Jumlah Tamu">
                <input type="number" min={1} max={6} value={form.pax} onChange={(e) => setForm({ ...form, pax: Number(e.target.value) })} className="kas-input" />
              </Field>
            </div>
            <Field label="Sesi (opsional)">
              <input value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} placeholder="Akad / Resepsi / Keduanya" className="kas-input" />
            </Field>
            <Field label="Pesan untuk mempelai (opsional)">
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="kas-input" />
            </Field>
            {err && <div className="text-sm" style={{ color: TONE.rose }}>{err}</div>}
            <button
              type="submit"
              disabled={busy}
              className="mt-3 rounded-full px-7 py-3.5 text-[11px] tracking-[0.35em] uppercase transition hover:scale-[1.02]"
              style={{ background: TONE.gold, color: TONE.bg }}
            >
              {busy ? "Mengirim…" : "Kirim Konfirmasi"}
            </button>
          </form>
        </Reveal>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-left">
      <div className="text-[10px] tracking-[0.3em] uppercase mb-1.5" style={{ color: TONE.gold }}>{label}</div>
      {children}
    </label>
  );
}

/* ---------- WISHES ---------- */

function Wishes({ slug, initial, interactive }: { slug: string; initial: NonNullable<InvitationData["wishes"]>; interactive: boolean }) {
  const [list, setList] = useState(initial);
  const [form, setForm] = useState({ name: "", message: "" });
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!interactive) { setList([{ name: form.name, message: form.message }, ...list]); setForm({ name: "", message: "" }); return; }
    setBusy(true);
    try {
      const res = await api.post(`/wishes/public/${slug}`, form);
      setList([res.data, ...list]); setForm({ name: "", message: "" });
    } catch {} finally { setBusy(false); }
  }

  return (
    <section className="relative py-14 px-6" style={{ background: TONE.bgDark }}>
      <Reveal>
        <div className="text-center mb-10">
          <div className="text-[10px] tracking-[0.45em] uppercase" style={{ color: TONE.gold }}>Buku Tamu</div>
          <h2 className="font-serif mt-4" style={{ color: TONE.ink, fontSize: "clamp(34px, 5vw, 52px)" }}>Doa &amp; Ucapan</h2>
          <OrnateDivider color={TONE.gold} width={220} />
        </div>
      </Reveal>

      <Reveal delay={120}>
        <form
          onSubmit={submit}
          className="max-w-2xl mx-auto grid gap-3 p-6 mb-8 border"
          style={{ borderColor: TONE.gold, background: TONE.panel }}
        >
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama Anda" className="kas-input" />
          <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Tuliskan doa & ucapan terbaik Anda…" className="kas-input" />
          <button disabled={busy} className="mt-1 self-end rounded-full px-6 py-2.5 text-[11px] tracking-[0.3em] uppercase" style={{ background: TONE.gold, color: TONE.bg }}>
            {busy ? "Mengirim…" : "Kirim Ucapan"}
          </button>
        </form>
      </Reveal>

      <div className="max-w-2xl mx-auto space-y-3 max-h-[440px] overflow-y-auto pr-2">
        {list.length === 0 && (
          <div className="text-center text-sm py-10" style={{ color: TONE.inkSoft }}>Belum ada ucapan. Jadilah yang pertama menulis.</div>
        )}
        {list.map((w, i) => (
          <Reveal key={w.id ?? i} delay={i * 60}>
            <div className="flex gap-3 p-4 border" style={{ borderColor: TONE.rule, background: TONE.panel }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-serif shrink-0" style={{ background: TONE.gold, color: TONE.bg }}>
                {w.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-serif text-base" style={{ color: TONE.ink }}>{w.name}</div>
                  {w.createdAt && <div className="text-[10px] font-mono" style={{ color: TONE.inkMute }}>{new Date(w.createdAt).toLocaleDateString("id-ID")}</div>}
                </div>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: TONE.inkSoft }}>{w.message}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- GIFTS ---------- */

function Gifts({ gifts }: { gifts: InvitationData["gifts"] }) {
  return (
    <section className="relative py-14 px-6">
      <VineBorder side="left" opacity={0.5} />
      <VineBorder side="right" opacity={0.5} />
      <Reveal>
        <div className="text-center mb-10">
          <div className="text-[10px] tracking-[0.45em] uppercase" style={{ color: TONE.gold }}>Tanda Kasih</div>
          <h2 className="font-serif mt-4" style={{ color: TONE.ink, fontSize: "clamp(34px, 5vw, 52px)" }}>Amplop Digital</h2>
          <OrnateDivider color={TONE.gold} width={220} />
          <p className="mt-5 max-w-md mx-auto text-sm" style={{ color: TONE.inkSoft }}>
            Tanpa mengurangi rasa hormat, doa restu Anda adalah hadiah paling berarti.
          </p>
        </div>
      </Reveal>
      <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-5">
        {gifts.map((g, i) => (
          <Reveal key={g.id ?? i} delay={i * 100} className="w-full md:w-[320px]">
            <GiftEnvelope g={g} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function GiftEnvelope({ g }: { g: { kind: string; bankName: string; number: string; holder: string } }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative p-7 border-2 overflow-hidden" style={{ borderColor: TONE.gold, background: TONE.panel }}>
      {/* corner deco */}
      <span className="absolute -top-2 -left-2 w-5 h-5 rotate-45 border" style={{ borderColor: TONE.gold, background: TONE.bg }} />
      <span className="absolute -top-2 -right-2 w-5 h-5 rotate-45 border" style={{ borderColor: TONE.gold, background: TONE.bg }} />
      <span className="absolute -bottom-2 -left-2 w-5 h-5 rotate-45 border" style={{ borderColor: TONE.gold, background: TONE.bg }} />
      <span className="absolute -bottom-2 -right-2 w-5 h-5 rotate-45 border" style={{ borderColor: TONE.gold, background: TONE.bg }} />

      <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.gold }}>{g.kind}</div>
      <div className="font-serif text-2xl mt-1" style={{ color: TONE.ink }}>{g.bankName}</div>
      <div className="font-mono text-lg mt-3 tracking-[0.15em]" style={{ color: TONE.ink }}>{g.number}</div>
      <div className="text-xs mt-1" style={{ color: TONE.inkSoft }}>a.n. {g.holder}</div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(g.number).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] tracking-[0.3em] uppercase border"
        style={{ borderColor: TONE.gold, color: TONE.gold }}
      >
        {copied ? "Tersalin ✓" : "Salin Nomor"}
      </button>
    </div>
  );
}

/* ---------- CLOSING ---------- */

function Closing({ data }: { data: InvitationData }) {
  const closing = data.closingSalutation ?? "Wassalamu'alaikum Warahmatullahi Wabarakatuh";
  return (
    <section
      className="relative py-16 px-6 text-center overflow-hidden"
      style={{ background: `radial-gradient(circle at 50% 100%, ${TONE.panel}, ${TONE.bgDark} 70%)` }}
    >
      <FloralCornerOrn className="absolute top-4 left-1/2 -translate-x-1/2 opacity-35" size={200} />
      <PetalRain count={10} />

      <Reveal>
        <div className="relative max-w-3xl mx-auto">
          <div className="text-[10px] tracking-[0.5em] uppercase" style={{ color: TONE.gold }}>Salam Penutup</div>
          <p className="font-serif mt-8 leading-relaxed" style={{ color: TONE.ink, fontSize: "clamp(22px, 3vw, 32px)" }}>
            Merupakan suatu kehormatan dan kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
          </p>
          <OrnateDivider color={TONE.gold} width={240} />
          {closing && (<div className="mt-8 text-sm" style={{ color: TONE.inkSoft }}>{closing}</div>)}
          <div className="mt-1 text-sm" style={{ color: TONE.inkSoft }}>Hormat kami,</div>
          <div className="font-serif mt-6" style={{ color: TONE.ink, fontSize: "clamp(48px, 8vw, 100px)", lineHeight: 1 }}>
            {data.couple.brideShort}
            <div className="my-2" style={{ color: TONE.gold, fontSize: "0.5em" }}>&amp;</div>
            {data.couple.groomShort}
          </div>
          <div className="mt-4 text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.gold }}>Beserta Keluarga</div>

          <div className="mt-12 flex justify-center">
            <WaxSeal size={70} label={`${data.couple.brideShort[0]}&${data.couple.groomShort[0]}`} />
          </div>

          <a href="/" className="mt-10 inline-flex items-center gap-2 text-xs opacity-90 hover:opacity-100 transition" style={{ color: TONE.inkSoft }}>
            <img src="/logo.png" alt="weddQ" style={{ height: 22, width: "auto", objectFit: "contain", filter: "brightness(1.4)" }} />
            Dibuat dengan weddQ
          </a>
        </div>
      </Reveal>
    </section>
  );
}
