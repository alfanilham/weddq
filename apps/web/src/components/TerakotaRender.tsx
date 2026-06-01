import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { api, extractError } from "@/lib/api";
import { InvitationData } from "./InvitationRender";
import { StoryChapters } from "./StoryChapters";

/* Terakota Senja — Rustic warm sunset template.
   Earthy palette of clay, sand, and dusty rose. Hand-drawn sun, tile-pattern
   borders, layered gradient skies, and woven texture motifs that evoke a
   joglo veranda at dusk. */

const TONE = {
  sky:      "#F4D9BC",
  sand:     "#E8C49E",
  clay:     "#B85A36",
  clayDark: "#7A3520",
  ink:      "#3C1E12",
  inkSoft:  "#7A4A38",
  cream:    "#FBEFDD",
  rose:     "#D9806A",
  ember:    "#E8642A",
  paper:    "#F8E6CE",
  rule:     "#B85A36",
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

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSeen(true)),
      { threshold: 0.18 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return { ref, seen };
}

/* ---------- ORNAMENTS ---------- */

/** Hand-drawn sun with radiating rays — the signature motif */
function SunDisc({ size = 220, color = TONE.clay, rays = 16, className = "", spinning = false }: { size?: number; color?: string; rays?: number; className?: string; spinning?: boolean }) {
  const r = 30;
  const cx = 50, cy = 50;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden style={{ animation: spinning ? "tk-spin 90s linear infinite" : undefined }}>
      <defs>
        <radialGradient id="tk-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={TONE.ember} stopOpacity="0.5" />
          <stop offset="60%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r + 8} fill="url(#tk-sun)" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="0.8" />
      <circle cx={cx} cy={cy} r={r - 6} fill="none" stroke={color} strokeWidth="0.4" opacity="0.6" />
      {Array.from({ length: rays }).map((_, i) => {
        const angle = (i * 360) / rays;
        const a = (angle * Math.PI) / 180;
        const x1 = cx + Math.cos(a) * (r + 4);
        const y1 = cy + Math.sin(a) * (r + 4);
        const x2 = cx + Math.cos(a) * (r + 14);
        const y2 = cy + Math.sin(a) * (r + 14);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.7" strokeLinecap="round" />;
      })}
    </svg>
  );
}

/** Tile-pattern border — repeating rhombus/diamond row like Indonesian floor tiles */
function TileBorder({ color = TONE.clay, height = 22, className = "" }: { color?: string; height?: number; className?: string }) {
  return (
    <svg viewBox="0 0 200 22" preserveAspectRatio="none" height={height} className={className} aria-hidden style={{ width: "100%", display: "block" }}>
      <g stroke={color} strokeWidth="0.6" fill="none" opacity="0.85">
        <line x1="0" y1="11" x2="200" y2="11" />
        {Array.from({ length: 14 }).map((_, i) => {
          const x = 7 + i * 14;
          return (
            <g key={i}>
              <path d={`M ${x} 3 L ${x + 5} 11 L ${x} 19 L ${x - 5} 11 Z`} fill={color} fillOpacity="0.15" />
              <circle cx={x} cy={11} r="1" fill={color} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** Mountain silhouette layered horizon */
function HorizonLayers({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden style={{ display: "block", width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="tk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={TONE.sky} />
          <stop offset="55%" stopColor={TONE.rose} stopOpacity="0.6" />
          <stop offset="100%" stopColor={TONE.clay} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect width="1440" height="300" fill="url(#tk-sky)" />
      <path d="M0 220 L120 180 L240 210 L360 160 L520 200 L680 150 L860 210 L1000 170 L1180 200 L1320 165 L1440 200 L1440 300 L0 300 Z" fill={TONE.clay} opacity="0.65" />
      <path d="M0 250 L160 220 L320 245 L480 210 L640 240 L820 215 L1000 245 L1160 220 L1320 240 L1440 215 L1440 300 L0 300 Z" fill={TONE.clayDark} opacity="0.85" />
    </svg>
  );
}

/** Hand-drawn palm/coconut leaf cluster */
function PalmLeaves({ size = 180, color = TONE.clayDark, className = "" }: { size?: number; color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} className={className} aria-hidden>
      <g stroke={color} strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.78">
        <path d="M50 120 L50 70" />
        <g>
          <path d="M50 75 Q30 60 18 30" />
          <path d="M50 75 Q22 65 10 50" opacity="0.7" />
          <path d="M50 75 Q35 50 28 18" />
        </g>
        <g>
          <path d="M50 75 Q70 60 82 30" />
          <path d="M50 75 Q78 65 90 50" opacity="0.7" />
          <path d="M50 75 Q65 50 72 18" />
        </g>
        <path d="M50 75 Q48 50 50 22" />
      </g>
    </svg>
  );
}

/** Weave divider — looks like rattan/anyaman */
function WeaveDivider({ color = TONE.clay, className = "" }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 240 16" height="16" className={className} aria-hidden>
      <g stroke={color} strokeWidth="0.8" fill="none" strokeLinecap="round">
        <path d="M0 8 Q15 0 30 8 T60 8 T90 8 T120 8 T150 8 T180 8 T210 8 T240 8" />
        <path d="M0 8 Q15 16 30 8 T60 8 T90 8 T120 8 T150 8 T180 8 T210 8 T240 8" opacity="0.6" />
        <circle cx="120" cy="8" r="2.4" fill={color} />
      </g>
    </svg>
  );
}

/* ---------- MAIN ---------- */

export function TerakotaRender({ data, interactive = false }: { data: InvitationData; interactive?: boolean }) {
  const [opened, setOpened] = useState(false);
  const primary = data.events[0]?.date ?? new Date().toISOString();

  return (
    <div style={{ background: TONE.paper, color: TONE.ink }} className="font-sans">
      <style>{`
        @keyframes tk-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
        @keyframes tk-rise { 0% { transform: translateY(60px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes tk-glow { 0%, 100% { filter: drop-shadow(0 0 18px ${TONE.ember}55); } 50% { filter: drop-shadow(0 0 36px ${TONE.ember}88); } }
        @keyframes tk-fade { from { opacity: 0; } to { opacity: 1; } }
        .tk-reveal { opacity: 0; transform: translateY(40px); transition: opacity .9s ease, transform .9s ease; }
        .tk-reveal.in { opacity: 1; transform: none; }
        .tk-input { width: 100%; background: ${TONE.cream}; border: 1px solid ${TONE.clay}33; padding: 12px 14px; font-size: 15px; color: ${TONE.ink}; border-radius: 4px; font-family: inherit; }
        .tk-input:focus { outline: none; border-color: ${TONE.clay}; box-shadow: 0 0 0 3px ${TONE.clay}1a; }
      `}</style>
      {!opened ? (
        <Cover data={data} onOpen={() => setOpened(true)} />
      ) : (
        <>
          <Opening data={data} primary={primary} />
          <Couple data={data} />
          <DateBlock primary={primary} />
          <Events events={data.events} />
          {((data.storyChapters && data.storyChapters.length > 0) || data.story) && (
            <StoryChapters
              chapters={data.storyChapters}
              story={data.story}
              gallery={data.gallery}
              theme={{
                bg: TONE.clayDark,
                fg: TONE.cream,
                fgSoft: TONE.sky,
                accent: TONE.sky,
                rule: TONE.cream,
                card: TONE.clay,
                variant: "dark",
              }}
            />
          )}
          {data.gallery.length > 0 && <Gallery gallery={data.gallery} />}
          <Rsvp data={data} interactive={interactive} />
          <Wishes slug={data.slug} initial={data.wishes ?? []} interactive={interactive} />
          {data.gifts.length > 0 && <Gifts gifts={data.gifts} />}
          <Closing data={data} />
        </>
      )}
    </div>
  );
}

/* ---------- COVER ---------- */

function Cover({ data, onOpen }: { data: InvitationData; onOpen: () => void }) {
  const cover = data.coverImage;
  const p = data.events[0] ? parts(data.events[0].date) : null;
  const guestName = data.guestName ?? null;

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-between overflow-hidden">
      <div className="absolute inset-0">
        <HorizonLayers />
      </div>
      {cover && (
        <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-50" />
      )}
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${TONE.sky}88 0%, ${TONE.rose}44 45%, ${TONE.clayDark}cc 100%)` }} />

      {/* Sun rising */}
      <div className="absolute" style={{ top: "16%", left: "50%", transform: "translateX(-50%)", animation: "tk-glow 4s ease-in-out infinite" }}>
        <SunDisc size={280} color={TONE.cream} spinning />
      </div>

      {/* Palm leaves at sides */}
      <PalmLeaves size={200} className="absolute -left-6 bottom-20 opacity-60" color={TONE.clayDark} />
      <PalmLeaves size={200} className="absolute -right-6 bottom-20 opacity-60" color={TONE.clayDark} />

      <div className="relative pt-10 z-10">
        <div className="text-[11px] tracking-[0.45em] uppercase" style={{ color: TONE.cream }}>{data.eyebrow}</div>
      </div>

      <div className="relative z-10 text-center px-6 pb-16" style={{ animation: "tk-rise 1.2s ease both" }}>
        <div className="font-serif text-cream" style={{ color: TONE.cream, fontSize: "clamp(46px, 11vw, 96px)", lineHeight: 1, letterSpacing: "-0.02em" }}>
          {data.couple.brideShort}
        </div>
        <div className="my-1 font-serif italic" style={{ color: TONE.sky, fontSize: "clamp(26px, 5vw, 40px)" }}>&amp;</div>
        <div className="font-serif" style={{ color: TONE.cream, fontSize: "clamp(46px, 11vw, 96px)", lineHeight: 1, letterSpacing: "-0.02em" }}>
          {data.couple.groomShort}
        </div>

        {p && (
          <div className="mt-8 inline-flex items-stretch gap-4 px-6 py-3" style={{ background: TONE.cream + "22", backdropFilter: "blur(6px)", border: `1px solid ${TONE.cream}55` }}>
            <div className="text-center">
              <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.sky }}>Hari</div>
              <div className="font-serif text-lg mt-0.5" style={{ color: TONE.cream }}>{p.weekday}</div>
            </div>
            <div className="w-px" style={{ background: TONE.cream, opacity: 0.4 }} />
            <div className="text-center">
              <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.sky }}>Tanggal</div>
              <div className="font-serif text-lg mt-0.5" style={{ color: TONE.cream }}>{p.day} {p.monthShort} {p.year}</div>
            </div>
          </div>
        )}

        {guestName && (
          <div className="mt-8" style={{ color: TONE.cream }}>
            <div className="text-[10px] tracking-[0.4em] uppercase opacity-70">Kepada Yth.</div>
            <div className="font-serif text-2xl italic mt-1">{guestName}</div>
          </div>
        )}

        <button
          onClick={onOpen}
          className="mt-10 inline-flex items-center gap-3 px-8 py-3 transition hover:scale-105"
          style={{
            background: TONE.cream,
            color: TONE.clayDark,
            border: `1px solid ${TONE.clayDark}`,
            borderRadius: 999,
            boxShadow: `0 10px 30px -10px ${TONE.clayDark}88`,
          }}
        >
          <span className="text-[11px] tracking-[0.35em] uppercase font-semibold">Buka Undangan</span>
          <span>→</span>
        </button>
      </div>

      {/* Tile border at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <TileBorder color={TONE.cream} height={20} />
      </div>
    </section>
  );
}

/* ---------- OPENING ---------- */

function Opening({ data, primary }: { data: InvitationData; primary: string }) {
  const { ref, seen } = useReveal<HTMLDivElement>();
  const p = parts(primary);
  const opening = data.openingSalutation ?? "Bismillahirrahmanirrahim";
  return (
    <section className="relative py-24 px-6" style={{ background: TONE.paper }}>
      <TileBorder color={TONE.clay} className="absolute top-0 left-0 right-0 opacity-50" />
      <div ref={ref} className={`max-w-3xl mx-auto text-center tk-reveal ${seen ? "in" : ""}`}>
        <div className="inline-block mb-6">
          <SunDisc size={92} color={TONE.clay} rays={12} />
        </div>
        {opening && (
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.clay }}>{opening}</div>
        )}
        <p className="mt-6 font-serif italic text-xl md:text-2xl leading-[1.6]" style={{ color: TONE.inkSoft }}>
          {data.quote ?? "Dan di antara tanda-tanda kekuasaan-Nya, Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya."}
        </p>
        <div className="mt-6 text-xs tracking-[0.3em] uppercase" style={{ color: TONE.clay }}>QS. Ar-Rum: 21</div>
        <WeaveDivider color={TONE.clay} className="mt-10 mx-auto" />
        <p className="mt-10 text-[15px] leading-relaxed max-w-xl mx-auto" style={{ color: TONE.inkSoft }}>
          Dengan memohon rahmat dan ridho Allah Subhanahu wa Ta'ala, kami bermaksud menyelenggarakan pernikahan putra-putri kami pada <span className="font-serif italic" style={{ color: TONE.ink }}>{p.day} {p.month} {p.year}</span>.
        </p>
      </div>
      <TileBorder color={TONE.clay} className="absolute bottom-0 left-0 right-0 opacity-50" />
    </section>
  );
}

/* ---------- COUPLE ---------- */

function Couple({ data }: { data: InvitationData }) {
  const { ref, seen } = useReveal<HTMLDivElement>();
  return (
    <section className="relative py-24 px-6" style={{ background: TONE.sand }}>
      {/* Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `radial-gradient(${TONE.clayDark}33 1px, transparent 1px)`,
        backgroundSize: "8px 8px",
      }} />
      <div ref={ref} className={`max-w-5xl mx-auto tk-reveal ${seen ? "in" : ""}`}>
        <div className="text-center mb-12">
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.clayDark }}>Mempelai Berbahagia</div>
          <h2 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(34px, 6vw, 56px)" }}>
            Dengan Penuh Cinta
          </h2>
        </div>
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
          <CouplePerson photo={data.couple.bridePhoto} name={data.couple.brideName} parents={data.couple.brideParents} ig={data.couple.brideInstagram} role="Mempelai Wanita" />
          <div className="hidden md:flex flex-col items-center justify-center" aria-hidden>
            <SunDisc size={120} color={TONE.clayDark} rays={14} />
            <div className="font-serif italic text-3xl mt-4" style={{ color: TONE.clayDark }}>&amp;</div>
          </div>
          <div className="md:hidden flex flex-col items-center justify-center my-4">
            <SunDisc size={90} color={TONE.clayDark} rays={12} />
            <div className="font-serif italic text-2xl mt-2" style={{ color: TONE.clayDark }}>&amp;</div>
          </div>
          <CouplePerson photo={data.couple.groomPhoto} name={data.couple.groomName} parents={data.couple.groomParents} ig={data.couple.groomInstagram} role="Mempelai Pria" />
        </div>
      </div>
    </section>
  );
}

function CouplePerson({ photo, name, parents, ig, role }: { photo?: string | null; name: string; parents?: string | null; ig?: string | null; role: string }) {
  return (
    <article className="relative text-center">
      <div className="relative mx-auto" style={{ width: 240, height: 280 }}>
        {/* Arched photo frame */}
        <div className="absolute inset-0" style={{
          background: TONE.cream,
          borderRadius: "120px 120px 8px 8px",
          padding: 8,
          boxShadow: `0 16px 40px -16px ${TONE.clayDark}66, inset 0 0 0 1px ${TONE.clay}33`,
        }}>
          <div className="w-full h-full overflow-hidden" style={{ borderRadius: "112px 112px 4px 4px", background: TONE.sand }}>
            {photo ? (
              <img src={photo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl font-serif" style={{ color: TONE.clay }}>
                {name.split(" ")[0]?.[0]}
              </div>
            )}
          </div>
        </div>
        {/* Tile chip */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 text-[9px] tracking-[0.35em] uppercase" style={{ background: TONE.clayDark, color: TONE.cream, borderRadius: 4 }}>
          {role}
        </div>
      </div>
      <h3 className="font-serif mt-10" style={{ color: TONE.ink, fontSize: 28, lineHeight: 1.2 }}>{name}</h3>
      {parents && <p className="mt-3 text-sm leading-relaxed max-w-xs mx-auto" style={{ color: TONE.inkSoft }}>{parents}</p>}
      {ig && (
        <a href={`https://instagram.com/${ig.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs tracking-[0.25em] uppercase border-b pb-0.5" style={{ color: TONE.clay, borderColor: TONE.clay }}>
          {ig}
        </a>
      )}
    </article>
  );
}

/* ---------- DATE BLOCK with countdown ---------- */

function DateBlock({ primary }: { primary: string }) {
  const cd = useCountdown(primary);
  const p = parts(primary);
  const { ref, seen } = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className={`relative py-24 px-6 text-center tk-reveal ${seen ? "in" : ""}`} style={{ background: `linear-gradient(180deg, ${TONE.sand} 0%, ${TONE.paper} 100%)` }}>
      <div className="absolute inset-x-0 top-0">
        <TileBorder color={TONE.clay} />
      </div>
      <div className="max-w-3xl mx-auto">
        <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.clay }}>Hari Bersejarah</div>
        <h2 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(36px, 7vw, 64px)" }}>
          Menuju Hari Bahagia
        </h2>
        <div className="mt-10 inline-grid grid-cols-3 gap-6 px-10 py-8" style={{ background: TONE.cream, border: `1px solid ${TONE.clay}44`, borderRadius: 8, boxShadow: `0 20px 50px -20px ${TONE.clayDark}55` }}>
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.clay }}>Hari</div>
            <div className="font-serif mt-1" style={{ color: TONE.ink, fontSize: 22 }}>{p.weekday}</div>
          </div>
          <div className="border-l border-r px-6" style={{ borderColor: TONE.clay + "33" }}>
            <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.clay }}>Tanggal</div>
            <div className="font-serif mt-1" style={{ color: TONE.ink, fontSize: 56, lineHeight: 1 }}>{p.day}</div>
            <div className="font-serif text-sm mt-1" style={{ color: TONE.inkSoft }}>{p.month} {p.year}</div>
          </div>
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.clay }}>Waktu</div>
            <div className="font-serif mt-1" style={{ color: TONE.ink, fontSize: 22 }}>{fmtTime(primary)} WIB</div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-4 max-w-xl mx-auto gap-3">
          {[
            { v: cd.d, l: "Hari" },
            { v: cd.h, l: "Jam" },
            { v: cd.m, l: "Menit" },
            { v: cd.s, l: "Detik" },
          ].map((x) => (
            <div key={x.l} className="py-5 px-2" style={{ background: TONE.clayDark, color: TONE.cream, borderRadius: 6 }}>
              <div className="font-serif text-3xl md:text-4xl">{String(x.v).padStart(2, "0")}</div>
              <div className="text-[10px] tracking-[0.3em] uppercase mt-1 opacity-80">{x.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- EVENTS ---------- */

function Events({ events }: { events: InvitationData["events"] }) {
  const { ref, seen } = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className={`relative py-24 px-6 tk-reveal ${seen ? "in" : ""}`} style={{ background: TONE.paper }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.clay }}>Rangkaian Acara</div>
          <h2 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(36px, 7vw, 64px)" }}>
            Susunan Acara
          </h2>
          <WeaveDivider color={TONE.clay} className="mt-6 mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {events.map((e, i) => {
            const p = parts(e.date);
            return (
              <article key={e.id ?? i} className="relative overflow-hidden" style={{ background: TONE.cream, border: `1px solid ${TONE.clay}33`, borderRadius: 10, boxShadow: `0 16px 40px -20px ${TONE.clayDark}55` }}>
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${TONE.ember} 0%, ${TONE.clay} 50%, ${TONE.clayDark} 100%)` }} />
                <div className="p-7 grid grid-cols-[auto_1fr] gap-5 items-start">
                  <div className="text-center px-3 py-3" style={{ background: TONE.clayDark, color: TONE.cream, borderRadius: 8, minWidth: 76 }}>
                    <div className="text-[9px] tracking-[0.3em] uppercase opacity-80">{p.monthShort}</div>
                    <div className="font-serif text-3xl leading-none mt-1">{p.day}</div>
                    <div className="text-[10px] mt-1 opacity-80">{p.year}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.35em] uppercase" style={{ color: TONE.clay }}>{e.kind}</div>
                    <h3 className="font-serif mt-1 text-2xl" style={{ color: TONE.ink }}>{e.title}</h3>
                    <p className="mt-2 text-sm" style={{ color: TONE.inkSoft }}>
                      {p.weekday}, {fmtTime(e.date)}{e.endTime ? ` – ${fmtTime(e.endTime)}` : ""} WIB
                    </p>
                    <p className="mt-3 text-sm font-medium" style={{ color: TONE.ink }}>{e.venueName}</p>
                    <p className="text-sm mt-1" style={{ color: TONE.inkSoft }}>{e.address}</p>
                    {e.dressCode && (
                      <div className="mt-3 inline-block text-[10px] tracking-[0.25em] uppercase px-2 py-1" style={{ background: TONE.sand, color: TONE.clayDark, borderRadius: 3 }}>
                        Dresscode: {e.dressCode}
                      </div>
                    )}
                    {e.mapUrl && (
                      <a href={e.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase" style={{ color: TONE.clay }}>
                        Lihat Peta <span>↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- GALLERY ---------- */

function Gallery({ gallery }: { gallery: InvitationData["gallery"] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { ref, seen } = useReveal<HTMLDivElement>();
  const layout = useMemo(() => {
    const spans = ["col-span-2 row-span-2", "col-span-1 row-span-1", "col-span-1 row-span-1", "col-span-1 row-span-2", "col-span-1 row-span-1", "col-span-2 row-span-1"];
    return gallery.map((g, i) => ({ ...g, span: spans[i % spans.length] }));
  }, [gallery]);

  return (
    <section ref={ref} className={`relative py-24 px-6 tk-reveal ${seen ? "in" : ""}`} style={{ background: TONE.paper }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.clay }}>Album Kenangan</div>
          <h2 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(36px, 7vw, 64px)" }}>
            Momen Terindah
          </h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 auto-rows-[120px] md:auto-rows-[160px]">
          {layout.map((g, i) => (
            <button key={g.id ?? i} onClick={() => setLightbox(g.url)} className={`${g.span} relative overflow-hidden group`} style={{ borderRadius: 8, background: TONE.sand, border: `1px solid ${TONE.clay}33` }}>
              <img src={g.url} alt={g.caption ?? ""} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition" style={{ background: `linear-gradient(180deg, transparent 50%, ${TONE.clayDark}cc 100%)` }} />
              {g.caption && (
                <div className="absolute bottom-2 left-2 right-2 text-[10px] tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition" style={{ color: TONE.cream }}>
                  {g.caption}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      {lightbox && (
        <div onClick={() => setLightbox(null)} className="fixed inset-0 z-50 flex items-center justify-center p-6 cursor-zoom-out" style={{ background: "rgba(60,30,18,0.94)" }}>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain" style={{ borderRadius: 8, boxShadow: `0 30px 60px -30px ${TONE.clayDark}` }} />
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

  return (
    <section className="relative py-24 px-6" style={{ background: TONE.sand }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.clayDark }}>Konfirmasi Kehadiran</div>
          <h2 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(34px, 6vw, 52px)" }}>RSVP</h2>
          <WeaveDivider color={TONE.clayDark} className="mt-6 mx-auto" />
          {known ? (
            <p className="mt-6 text-sm leading-relaxed max-w-md mx-auto" style={{ color: TONE.inkSoft }}>
              Halo <span className="font-serif italic" style={{ color: TONE.ink }}>{data.guestName}</span>, mohon konfirmasikan kehadiran Anda di bawah ini.
            </p>
          ) : (
            <p className="mt-6 text-sm leading-relaxed max-w-md mx-auto" style={{ color: TONE.inkSoft }}>
              Mohon kesediaan Bapak/Ibu/Saudara/i untuk mengkonfirmasi kehadiran agar kami dapat menyiapkan tempat dengan sebaik-baiknya.
            </p>
          )}
        </div>

        {done ? (
          <div className="text-center p-10" style={{ background: TONE.cream, border: `1px solid ${TONE.clay}44`, borderRadius: 10 }}>
            <SunDisc size={80} color={TONE.clay} rays={14} className="mx-auto" />
            <h3 className="font-serif text-3xl mt-4" style={{ color: TONE.ink }}>Terima Kasih</h3>
            <p className="mt-3 text-sm" style={{ color: TONE.inkSoft }}>Konfirmasi Anda telah kami terima. Sampai bertemu di hari bahagia kami.</p>
          </div>
        ) : known ? (
          <form onSubmit={submit} className="grid gap-6 p-7 md:p-10" style={{ background: TONE.cream, border: `1px solid ${TONE.clay}33`, borderRadius: 10, boxShadow: `0 20px 50px -25px ${TONE.clayDark}66` }}>
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase mb-3 text-center" style={{ color: TONE.clay }}>Kehadiran Anda</div>
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
                        border: `1px solid ${TONE.clayDark}`,
                        background: active ? TONE.clayDark : "transparent",
                        color: active ? TONE.cream : TONE.ink,
                        borderRadius: 6,
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <Field label="Pesan untuk Mempelai (opsional)">
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="tk-input" />
            </Field>
            {err && <div className="text-sm" style={{ color: "#7a1f1f" }}>{err}</div>}
            <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-3 py-3 transition hover:opacity-90" style={{ background: TONE.clayDark, color: TONE.cream, borderRadius: 6 }}>
              <span className="text-[11px] tracking-[0.35em] uppercase">{busy ? "Mengirim…" : "Kirim Konfirmasi"}</span>
              <span>→</span>
            </button>
          </form>
        ) : (
          <form onSubmit={submit} className="grid gap-5 p-7 md:p-10" style={{ background: TONE.cream, border: `1px solid ${TONE.clay}33`, borderRadius: 10, boxShadow: `0 20px 50px -25px ${TONE.clayDark}66` }}>
            <Field label="Nama Lengkap">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="tk-input" />
            </Field>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Kehadiran">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="tk-input">
                  <option value="HADIR">Hadir</option>
                  <option value="TIDAK">Tidak Hadir</option>
                  <option value="RAGU">Masih Ragu</option>
                </select>
              </Field>
              <Field label="Jumlah Tamu">
                <input type="number" min={1} max={6} value={form.pax} onChange={(e) => setForm({ ...form, pax: Number(e.target.value) })} className="tk-input" />
              </Field>
            </div>
            <Field label="Sesi (opsional)">
              <input value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} className="tk-input" />
            </Field>
            <Field label="Pesan untuk Mempelai (opsional)">
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="tk-input" />
            </Field>
            {err && <div className="text-sm" style={{ color: "#7a1f1f" }}>{err}</div>}
            <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-3 py-3 transition hover:opacity-90" style={{ background: TONE.clayDark, color: TONE.cream, borderRadius: 6 }}>
              <span className="text-[11px] tracking-[0.35em] uppercase">{busy ? "Mengirim…" : "Kirim Konfirmasi"}</span>
              <span>→</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: TONE.clay }}>{label}</div>
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
    if (!interactive) {
      setList([{ name: form.name, message: form.message }, ...list]);
      setForm({ name: "", message: "" });
      return;
    }
    setBusy(true);
    try {
      const res = await api.post(`/wishes/public/${slug}`, form);
      setList([res.data, ...list]);
      setForm({ name: "", message: "" });
    } catch {} finally { setBusy(false); }
  }

  return (
    <section className="relative py-24 px-6" style={{ background: TONE.paper }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.clay }}>Buku Tamu</div>
          <h2 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(34px, 6vw, 52px)" }}>Doa &amp; Ucapan</h2>
          <WeaveDivider color={TONE.clay} className="mt-6 mx-auto" />
        </div>

        <form onSubmit={submit} className="grid gap-4 mb-12 p-6" style={{ background: TONE.cream, border: `1px solid ${TONE.clay}33`, borderRadius: 10 }}>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama Anda" className="tk-input" />
          <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Tuliskan doa & ucapan terbaik Anda…" className="tk-input" />
          <button disabled={busy} className="inline-flex items-center justify-center gap-3 py-3" style={{ background: TONE.clayDark, color: TONE.cream, borderRadius: 6 }}>
            <span className="text-[11px] tracking-[0.35em] uppercase">{busy ? "Mengirim…" : "Kirim Ucapan"}</span>
            <span>→</span>
          </button>
        </form>

        {list.length === 0 ? (
          <div className="text-center text-sm py-10" style={{ color: TONE.inkSoft }}>Belum ada ucapan. Jadilah yang pertama menulis.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {list.map((w, i) => (
              <article key={w.id ?? i} className="p-6" style={{ background: TONE.cream, border: `1px solid ${TONE.clay}33`, borderRadius: 10 }}>
                <div className="flex items-baseline justify-between">
                  <div className="font-serif text-xl" style={{ color: TONE.ink }}>{w.name}</div>
                  {w.createdAt && (
                    <div className="text-[10px] tracking-wider" style={{ color: TONE.inkSoft }}>
                      {new Date(w.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: TONE.inkSoft }}>{w.message}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- GIFTS ---------- */

function Gifts({ gifts }: { gifts: InvitationData["gifts"] }) {
  return (
    <section className="relative py-24 px-6" style={{ background: TONE.sand }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.clayDark }}>Tanda Kasih</div>
          <h2 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(34px, 6vw, 52px)" }}>Amplop Digital</h2>
          <p className="mt-6 max-w-lg mx-auto text-sm leading-relaxed" style={{ color: TONE.inkSoft }}>
            Tanpa mengurangi rasa hormat, doa restu Anda adalah hadiah paling berarti. Bila berkenan menambahkan tanda kasih, dapat melalui:
          </p>
        </div>
        <div className="grid gap-4">
          {gifts.map((g, i) => <GiftCard key={g.id ?? i} g={g} />)}
        </div>
      </div>
    </section>
  );
}

function GiftCard({ g }: { g: { kind: string; bankName: string; number: string; holder: string } }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(g.number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-6" style={{ background: TONE.cream, border: `1px solid ${TONE.clay}33`, borderRadius: 10, boxShadow: `0 14px 30px -20px ${TONE.clayDark}55` }}>
      <div>
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.clay }}>{g.kind}</div>
        <div className="font-serif text-2xl mt-1" style={{ color: TONE.ink }}>{g.bankName}</div>
        <div className="text-xs mt-1" style={{ color: TONE.inkSoft }}>a.n. {g.holder}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="font-mono text-lg tracking-[0.1em]" style={{ color: TONE.ink }}>{g.number}</div>
        <button onClick={copy} className="text-[10px] tracking-[0.25em] uppercase px-3 py-2" style={{ background: TONE.clayDark, color: TONE.cream, borderRadius: 4 }}>
          {copied ? "Tersalin ✓" : "Salin"}
        </button>
      </div>
    </div>
  );
}

/* ---------- CLOSING ---------- */

function Closing({ data }: { data: InvitationData }) {
  const closing = data.closingSalutation ?? "Wassalamu'alaikum Warahmatullahi Wabarakatuh";
  return (
    <section className="relative pt-24 pb-12 px-6 overflow-hidden text-center" style={{ background: TONE.clayDark, color: TONE.cream }}>
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <HorizonLayers />
      </div>
      <div className="relative max-w-2xl mx-auto">
        <SunDisc size={120} color={TONE.cream} rays={16} className="mx-auto" spinning />
        <div className="text-[10px] tracking-[0.4em] uppercase mt-6" style={{ color: TONE.sky }}>Salam Penutup</div>
        <p className="mt-6 font-serif italic text-xl md:text-2xl leading-[1.55]" style={{ color: TONE.cream }}>
          Merupakan suatu kehormatan dan kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.
        </p>
        {closing && (<div className="mt-10 text-sm" style={{ color: TONE.sky }}>{closing}</div>)}
        <div className="mt-2 text-sm" style={{ color: TONE.sky }}>Hormat kami,</div>
        <div className="font-serif mt-3" style={{ color: TONE.cream, fontSize: "clamp(40px, 8vw, 72px)", lineHeight: 1 }}>
          {data.couple.brideShort} <span style={{ color: TONE.sky }}>&amp;</span> {data.couple.groomShort}
        </div>
        <div className="text-[10px] tracking-[0.3em] uppercase mt-4" style={{ color: TONE.sky }}>Beserta Keluarga</div>

        <div className="mt-14 inline-flex items-center gap-2 text-xs opacity-70">
          <img src="/logo.png" alt="weddQ" style={{ height: 22, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          Dibuat dengan weddQ
        </div>
      </div>
    </section>
  );
}
