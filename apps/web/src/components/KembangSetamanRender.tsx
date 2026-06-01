import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { api, extractError } from "@/lib/api";
import { InvitationData } from "./InvitationRender";
import { StoryChapters } from "./StoryChapters";

/* Kembang Setaman — Watercolor floral template.
   Soft dusty rose & cream palette with hand-drawn kantil, melati, and mawar
   illustrations. Organic curves, scalloped frames, gentle petal-fall, and
   wash-style backgrounds. */

const TONE = {
  bg:       "#FBF0EC",
  blush:    "#F4D9D1",
  rose:     "#D5847E",
  roseDeep: "#A24D55",
  mauve:    "#7C4252",
  ink:      "#3D2530",
  inkSoft:  "#6B4853",
  cream:    "#FDF7F2",
  leaf:     "#7A8A6B",
  gold:     "#B8915D",
  rule:     "#C9999A",
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

/* ---------- WATERCOLOR FLORAL ORNAMENTS ---------- */

/** Hand-drawn rose with watercolor wash backdrop */
function Rose({ size = 120, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id="ks-rose-wash" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor={TONE.rose} stopOpacity="0.6" />
          <stop offset="60%" stopColor={TONE.rose} stopOpacity="0.18" />
          <stop offset="100%" stopColor={TONE.rose} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ks-rose-petals" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={TONE.roseDeep} stopOpacity="0.45" />
          <stop offset="100%" stopColor={TONE.rose} stopOpacity="0.05" />
        </radialGradient>
      </defs>
      {/* watercolor wash */}
      <circle cx="60" cy="60" r="55" fill="url(#ks-rose-wash)" />
      {/* outer petals */}
      <g stroke={TONE.roseDeep} strokeWidth="0.6" fill="url(#ks-rose-petals)" opacity="0.85">
        <path d="M60 18 C 80 24, 92 42, 88 58 C 78 50, 66 46, 60 50 Z" />
        <path d="M102 60 C 96 78, 78 90, 62 86 C 70 76, 74 64, 70 58 Z" />
        <path d="M60 102 C 40 96, 28 78, 32 62 C 42 70, 54 74, 60 70 Z" />
        <path d="M18 60 C 24 42, 42 30, 58 34 C 50 44, 46 56, 50 62 Z" />
      </g>
      {/* inner whorl */}
      <g stroke={TONE.roseDeep} strokeWidth="0.6" fill="none" opacity="0.9">
        <path d="M60 44 C 70 46, 74 56, 70 64 C 66 70, 56 70, 52 64 C 48 56, 52 46, 60 44 Z" fill={TONE.roseDeep} fillOpacity="0.35" />
        <path d="M60 52 C 64 52, 66 56, 64 60 C 62 64, 58 64, 56 60 C 54 56, 56 52, 60 52 Z" fill={TONE.mauve} fillOpacity="0.5" />
        <circle cx="60" cy="58" r="2" fill={TONE.mauve} />
      </g>
    </svg>
  );
}

/** Kantil — five-petal stylized flower */
function Kantil({ size = 80, color = TONE.cream, accent = TONE.gold, className = "", style }: { size?: number; color?: string; accent?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className={className} style={style} aria-hidden>
      <g transform="translate(40 40)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse key={deg} cx="0" cy="-18" rx="11" ry="22" fill={color} stroke={TONE.gold} strokeWidth="0.5" opacity="0.85" transform={`rotate(${deg})`} />
        ))}
        <circle r="6" fill={accent} opacity="0.85" />
        <circle r="2.5" fill={TONE.roseDeep} />
      </g>
    </svg>
  );
}

/** Melati — small white jasmine cluster */
function Melati({ size = 60, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} className={className} style={style} aria-hidden>
      {[{ cx: 20, cy: 20, r: 8 }, { cx: 40, cy: 18, r: 6 }, { cx: 32, cy: 36, r: 7 }, { cx: 14, cy: 38, r: 5 }, { cx: 44, cy: 40, r: 5.5 }].map((c, i) => (
        <g key={i} transform={`translate(${c.cx} ${c.cy})`}>
          {[0, 72, 144, 216, 288].map((deg) => (
            <circle key={deg} cx={0} cy={-c.r} r={c.r * 0.7} fill={TONE.cream} stroke={TONE.gold} strokeWidth="0.4" opacity="0.9" transform={`rotate(${deg})`} />
          ))}
          <circle r={c.r * 0.35} fill={TONE.gold} opacity="0.8" />
        </g>
      ))}
    </svg>
  );
}

/** Leafy vine — runs along edge */
function LeafVine({ width = 320, color = TONE.leaf, className = "", style }: { width?: number; color?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 320 60" width={width} height={(width / 320) * 60} className={className} style={style} aria-hidden>
      <g stroke={color} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.85">
        <path d="M0 30 Q 60 10 120 30 T 240 30 T 320 30" />
        {[20, 70, 120, 170, 220, 270, 310].map((x, i) => (
          <g key={i}>
            <path d={`M ${x} 30 Q ${x - 8} 18 ${x - 14} 10`} />
            <ellipse cx={x - 14} cy="8" rx="6" ry="3" fill={color} fillOpacity="0.35" transform={`rotate(-30 ${x - 14} 8)`} />
          </g>
        ))}
        {[40, 90, 140, 190, 240, 290].map((x, i) => (
          <g key={i}>
            <path d={`M ${x} 30 Q ${x + 8} 42 ${x + 14} 50`} />
            <ellipse cx={x + 14} cy="52" rx="6" ry="3" fill={color} fillOpacity="0.35" transform={`rotate(30 ${x + 14} 52)`} />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Corner floral arrangement (big composition) */
function FloralCorner({ size = 240, mirror = false, className = "", style }: { size?: number; mirror?: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={{ ...style, width: size, height: size, transform: mirror ? "scaleX(-1)" : undefined }}>
      <svg viewBox="0 0 240 240" width="100%" height="100%" aria-hidden>
        <defs>
          <radialGradient id="ks-corner-wash" cx="30%" cy="30%" r="60%">
            <stop offset="0%" stopColor={TONE.rose} stopOpacity="0.35" />
            <stop offset="100%" stopColor={TONE.rose} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="120" fill="url(#ks-corner-wash)" />
        {/* vine */}
        <g stroke={TONE.leaf} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.85">
          <path d="M0 80 Q 40 60 70 100 Q 100 140 60 180 Q 30 200 0 200" />
          <path d="M0 60 Q 50 70 80 50 Q 110 30 140 60" opacity="0.7" />
        </g>
        {/* leaves */}
        {[
          { cx: 30, cy: 70, r: 14, rot: -20 },
          { cx: 60, cy: 50, r: 12, rot: 30 },
          { cx: 90, cy: 80, r: 14, rot: 10 },
          { cx: 70, cy: 130, r: 13, rot: -40 },
          { cx: 30, cy: 170, r: 12, rot: 60 },
        ].map((l, i) => (
          <ellipse key={i} cx={l.cx} cy={l.cy} rx={l.r} ry={l.r * 0.45} fill={TONE.leaf} fillOpacity="0.5" stroke={TONE.leaf} strokeWidth="0.4" transform={`rotate(${l.rot} ${l.cx} ${l.cy})`} />
        ))}
      </svg>
      {/* layered flowers */}
      <div style={{ position: "absolute", top: 10, left: 10 }}>
        <Rose size={110} />
      </div>
      <div style={{ position: "absolute", top: 100, left: 80 }}>
        <Kantil size={66} />
      </div>
      <div style={{ position: "absolute", top: 70, left: 6 }}>
        <Melati size={50} />
      </div>
    </div>
  );
}

/** Decorative scallop divider */
function ScallopDivider({ width = 240, color = TONE.rose, className = "" }: { width?: number; color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 240 18" width={width} height="18" className={className} aria-hidden>
      <g stroke={color} strokeWidth="0.7" fill="none" opacity="0.85">
        <path d="M0 14 Q 12 4 24 14 T 48 14 T 72 14 T 96 14 T 120 14 T 144 14 T 168 14 T 192 14 T 216 14 T 240 14" />
        <g fill={color} fillOpacity="0.7">
          <circle cx="120" cy="9" r="2" />
          <circle cx="108" cy="13" r="1.4" />
          <circle cx="132" cy="13" r="1.4" />
        </g>
      </g>
    </svg>
  );
}

/** Falling petals overlay */
function PetalRain({ count = 14 }: { count?: number }) {
  const petals = useMemo(() => Array.from({ length: count }).map(() => ({
    left: Math.random() * 100,
    delay: -Math.random() * 18,
    duration: 12 + Math.random() * 10,
    size: 10 + Math.random() * 8,
    sway: Math.random() > 0.5 ? "ks-sway-a" : "ks-sway-b",
    color: Math.random() > 0.5 ? TONE.rose : TONE.blush,
  })), [count]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {petals.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "-5%",
            left: `${p.left}%`,
            animation: `ks-fall ${p.duration}s linear infinite, ${p.sway} ${p.duration / 2}s ease-in-out infinite`,
            animationDelay: `${p.delay}s, ${p.delay}s`,
          }}
        >
          <svg width={p.size} height={p.size * 1.3} viewBox="0 0 10 13">
            <path d="M5 0 C 8 3, 9 8, 5 13 C 1 8, 2 3, 5 0 Z" fill={p.color} opacity="0.7" />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ---------- MAIN ---------- */

export function KembangSetamanRender({ data, interactive = false }: { data: InvitationData; interactive?: boolean }) {
  const [opened, setOpened] = useState(false);
  const primary = data.events[0]?.date ?? new Date().toISOString();

  return (
    <div style={{ background: TONE.bg, color: TONE.ink }} className="font-sans relative">
      <style>{`
        @keyframes ks-fall { from { transform: translateY(0) rotate(0deg); } to { transform: translateY(120vh) rotate(420deg); } }
        @keyframes ks-sway-a { 0%, 100% { margin-left: 0; } 50% { margin-left: 30px; } }
        @keyframes ks-sway-b { 0%, 100% { margin-left: 0; } 50% { margin-left: -30px; } }
        @keyframes ks-bloom { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes ks-drift { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .ks-reveal { opacity: 0; transform: translateY(40px); transition: opacity 1s ease, transform 1s ease; }
        .ks-reveal.in { opacity: 1; transform: none; }
        .ks-input { width: 100%; background: ${TONE.cream}; border: 1px solid ${TONE.rule}88; padding: 12px 16px; font-size: 15px; color: ${TONE.ink}; border-radius: 999px; font-family: inherit; }
        .ks-input:focus { outline: none; border-color: ${TONE.rose}; box-shadow: 0 0 0 3px ${TONE.rose}22; }
        textarea.ks-input { border-radius: 18px; }
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
                bg: TONE.bg,
                fg: TONE.ink,
                fgSoft: TONE.inkSoft,
                accent: TONE.roseDeep,
                rule: TONE.rose,
                card: TONE.cream,
                variant: "light",
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
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden" style={{ background: `radial-gradient(ellipse at top, ${TONE.blush} 0%, ${TONE.bg} 60%, ${TONE.cream} 100%)` }}>
      <PetalRain count={18} />

      {/* Corner flourishes */}
      <FloralCorner size={260} className="absolute -top-6 -left-6 opacity-95" />
      <FloralCorner size={260} mirror className="absolute -top-6 -right-6 opacity-95" />
      <FloralCorner size={220} className="absolute -bottom-8 -left-8 opacity-85" style={{ transform: "rotate(180deg)" }} />
      <FloralCorner size={220} mirror className="absolute -bottom-8 -right-8 opacity-85" style={{ transform: "rotate(180deg) scaleX(-1)" }} />

      <div className="relative z-10 max-w-md w-full mx-auto text-center px-8">
        {/* photo medallion */}
        {cover && (
          <div className="relative mx-auto mb-6" style={{ width: 240, height: 320, animation: "ks-bloom 1.2s ease both" }}>
            <div className="absolute inset-0" style={{
              background: TONE.cream,
              borderRadius: "120px 120px 12px 12px",
              padding: 8,
              boxShadow: `0 24px 50px -20px ${TONE.roseDeep}44`,
            }}>
              <div className="w-full h-full overflow-hidden" style={{ borderRadius: "112px 112px 6px 6px" }}>
                <img src={cover} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            {/* Floating melati on top */}
            <Melati size={50} className="absolute -top-3 -left-2" style={{ animation: "ks-drift 6s ease-in-out infinite" }} />
            <Kantil size={56} className="absolute -bottom-3 -right-3" style={{ animation: "ks-drift 7s ease-in-out infinite reverse" }} />
          </div>
        )}

        <div className="text-[11px] tracking-[0.45em] uppercase" style={{ color: TONE.rose }}>{data.eyebrow}</div>
        <h1 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(40px, 9vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.01em" }}>
          {data.couple.brideShort}
          <div className="font-serif italic text-[0.55em] my-1" style={{ color: TONE.rose }}>&amp;</div>
          {data.couple.groomShort}
        </h1>

        <ScallopDivider width={180} color={TONE.rose} className="mx-auto mt-4" />

        {p && (
          <div className="mt-5 inline-block px-5 py-2 font-serif italic" style={{ color: TONE.mauve, background: TONE.cream + "cc", borderRadius: 999, border: `1px solid ${TONE.rule}` }}>
            {p.weekday}, {p.day} {p.month} {p.year}
          </div>
        )}

        {guestName && (
          <div className="mt-8">
            <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.rose }}>Kepada Yang Terhormat</div>
            <div className="font-serif italic text-2xl mt-1" style={{ color: TONE.ink }}>{guestName}</div>
          </div>
        )}

        <button
          onClick={onOpen}
          className="mt-8 inline-flex items-center gap-3 px-8 py-3 transition hover:scale-105"
          style={{
            background: TONE.roseDeep,
            color: TONE.cream,
            borderRadius: 999,
            boxShadow: `0 14px 36px -14px ${TONE.roseDeep}99`,
          }}
        >
          <span className="text-[11px] tracking-[0.35em] uppercase font-semibold">Buka Undangan</span>
          <span>✿</span>
        </button>
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
    <section className="relative py-24 px-6 overflow-hidden" style={{ background: TONE.bg }}>
      <Rose size={180} className="absolute -top-8 -right-8 opacity-50" />
      <Rose size={140} className="absolute -bottom-6 -left-6 opacity-40" />
      <div ref={ref} className={`max-w-3xl mx-auto text-center ks-reveal ${seen ? "in" : ""}`}>
        <Kantil size={70} className="mx-auto mb-4" accent={TONE.rose} />
        {opening && (
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.rose }}>{opening}</div>
        )}
        <p className="mt-6 font-serif italic text-xl md:text-2xl leading-[1.6]" style={{ color: TONE.inkSoft }}>
          {data.quote ?? "Dan di antara tanda-tanda kekuasaan-Nya, Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya."}
        </p>
        <div className="mt-6 text-xs tracking-[0.3em] uppercase" style={{ color: TONE.rose }}>QS. Ar-Rum: 21</div>
        <ScallopDivider color={TONE.rose} className="mt-10 mx-auto" />
        <p className="mt-10 text-[15px] leading-relaxed max-w-xl mx-auto" style={{ color: TONE.inkSoft }}>
          Dengan memohon rahmat dan ridho Allah Subhanahu wa Ta'ala, kami bermaksud menyelenggarakan akad nikah putra-putri kami pada <span className="font-serif italic" style={{ color: TONE.ink }}>{p.day} {p.month} {p.year}</span>.
        </p>
      </div>
    </section>
  );
}

/* ---------- COUPLE ---------- */

function Couple({ data }: { data: InvitationData }) {
  const { ref, seen } = useReveal<HTMLDivElement>();
  return (
    <section className="relative py-24 px-6 overflow-hidden" style={{ background: `linear-gradient(180deg, ${TONE.bg} 0%, ${TONE.blush} 100%)` }}>
      <LeafVine width={400} className="absolute top-0 left-1/2 -translate-x-1/2 opacity-50" />
      <div ref={ref} className={`max-w-5xl mx-auto ks-reveal ${seen ? "in" : ""}`}>
        <div className="text-center mb-14">
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.rose }}>Mempelai Berbahagia</div>
          <h2 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(34px, 6vw, 56px)" }}>
            Dua Hati Bersatu
          </h2>
          <ScallopDivider color={TONE.rose} className="mt-5 mx-auto" />
        </div>
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
          <CouplePerson photo={data.couple.bridePhoto} name={data.couple.brideName} parents={data.couple.brideParents} ig={data.couple.brideInstagram} role="Mempelai Wanita" />
          <div className="flex flex-col items-center justify-center my-4 md:my-0" aria-hidden>
            <div style={{ animation: "ks-drift 5s ease-in-out infinite" }}>
              <Rose size={110} />
            </div>
            <div className="font-serif italic mt-2" style={{ color: TONE.roseDeep, fontSize: 36 }}>&amp;</div>
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
      <div className="relative mx-auto" style={{ width: 220, height: 280 }}>
        <Kantil size={48} className="absolute -top-3 -left-3 z-10" accent={TONE.rose} />
        <Melati size={42} className="absolute -bottom-3 -right-3 z-10" />
        <div className="absolute inset-0" style={{
          background: TONE.cream,
          borderRadius: "110px 110px 14px 14px",
          padding: 7,
          boxShadow: `0 18px 40px -18px ${TONE.roseDeep}55`,
        }}>
          <div className="w-full h-full overflow-hidden" style={{ borderRadius: "104px 104px 8px 8px", background: TONE.blush }}>
            {photo ? (
              <img src={photo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl font-serif" style={{ color: TONE.rose }}>
                {name.split(" ")[0]?.[0]}
              </div>
            )}
          </div>
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[9px] tracking-[0.35em] uppercase z-20" style={{ background: TONE.cream, color: TONE.roseDeep, border: `1px solid ${TONE.rule}`, borderRadius: 999 }}>
          {role}
        </div>
      </div>
      <h3 className="font-serif mt-8" style={{ color: TONE.ink, fontSize: 26, lineHeight: 1.2 }}>{name}</h3>
      {parents && <p className="mt-3 text-sm italic leading-relaxed max-w-xs mx-auto" style={{ color: TONE.inkSoft }}>{parents}</p>}
      {ig && (
        <a href={`https://instagram.com/${ig.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs tracking-[0.25em] uppercase" style={{ color: TONE.rose }}>
          ✿ {ig}
        </a>
      )}
    </article>
  );
}

/* ---------- DATE BLOCK ---------- */

function DateBlock({ primary }: { primary: string }) {
  const cd = useCountdown(primary);
  const p = parts(primary);
  const { ref, seen } = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className={`relative py-24 px-6 text-center overflow-hidden ks-reveal ${seen ? "in" : ""}`} style={{ background: TONE.blush }}>
      <Rose size={180} className="absolute top-8 left-8 opacity-50" />
      <Rose size={180} className="absolute bottom-8 right-8 opacity-50" />
      <div className="relative max-w-3xl mx-auto">
        <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.roseDeep }}>Hari yang Dinantikan</div>
        <h2 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(36px, 7vw, 64px)" }}>
          Save The Date
        </h2>
        <ScallopDivider color={TONE.roseDeep} className="mt-5 mx-auto" />

        <div className="mt-12 relative mx-auto inline-block px-12 py-10" style={{ background: TONE.cream, borderRadius: 16, boxShadow: `0 24px 60px -25px ${TONE.roseDeep}66`, border: `1px solid ${TONE.rule}` }}>
          <Melati size={40} className="absolute -top-4 -left-4" />
          <Kantil size={44} className="absolute -bottom-4 -right-4" accent={TONE.rose} />
          <div className="text-[10px] tracking-[0.35em] uppercase" style={{ color: TONE.rose }}>{p.weekday}</div>
          <div className="font-serif my-3 flex items-center justify-center gap-4">
            <span style={{ color: TONE.ink, fontSize: 28 }}>{p.month}</span>
            <span style={{ color: TONE.roseDeep, fontSize: 72, lineHeight: 1 }}>{p.day}</span>
            <span style={{ color: TONE.ink, fontSize: 28 }}>{p.year}</span>
          </div>
          <div className="text-[10px] tracking-[0.35em] uppercase" style={{ color: TONE.rose }}>Pukul {fmtTime(primary)} WIB</div>
        </div>

        <div className="mt-10 grid grid-cols-4 max-w-md mx-auto gap-3">
          {[
            { v: cd.d, l: "Hari" },
            { v: cd.h, l: "Jam" },
            { v: cd.m, l: "Menit" },
            { v: cd.s, l: "Detik" },
          ].map((x) => (
            <div key={x.l} className="py-4 px-1" style={{ background: TONE.cream, color: TONE.ink, borderRadius: 999, border: `1px solid ${TONE.rule}` }}>
              <div className="font-serif text-3xl" style={{ color: TONE.roseDeep }}>{String(x.v).padStart(2, "0")}</div>
              <div className="text-[10px] tracking-[0.3em] uppercase mt-0.5" style={{ color: TONE.rose }}>{x.l}</div>
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
    <section ref={ref} className={`relative py-24 px-6 ks-reveal ${seen ? "in" : ""}`} style={{ background: TONE.bg }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.rose }}>Rangkaian Acara</div>
          <h2 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(36px, 7vw, 64px)" }}>
            Susunan Acara
          </h2>
          <ScallopDivider color={TONE.rose} className="mt-5 mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {events.map((e, i) => {
            const p = parts(e.date);
            return (
              <article key={e.id ?? i} className="relative p-7 pt-10" style={{ background: TONE.cream, borderRadius: 18, border: `1px solid ${TONE.rule}`, boxShadow: `0 18px 40px -22px ${TONE.roseDeep}55` }}>
                <Rose size={70} className="absolute -top-3 -right-3 opacity-80" />
                <div className="text-[10px] tracking-[0.35em] uppercase" style={{ color: TONE.rose }}>{e.kind}</div>
                <h3 className="font-serif mt-2 text-2xl" style={{ color: TONE.ink }}>{e.title}</h3>
                <ScallopDivider width={140} color={TONE.rose} className="mt-3" />
                <div className="mt-5 grid grid-cols-[auto_1fr] gap-5 items-start">
                  <div className="text-center px-4 py-3" style={{ background: TONE.blush, borderRadius: 14, border: `1px solid ${TONE.rule}` }}>
                    <div className="text-[9px] tracking-[0.3em] uppercase" style={{ color: TONE.roseDeep }}>{p.monthShort}</div>
                    <div className="font-serif text-3xl leading-none mt-1" style={{ color: TONE.ink }}>{p.day}</div>
                    <div className="text-[10px] mt-1" style={{ color: TONE.inkSoft }}>{p.year}</div>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: TONE.inkSoft }}>
                      {p.weekday}<br />
                      {fmtTime(e.date)}{e.endTime ? ` – ${fmtTime(e.endTime)}` : ""} WIB
                    </p>
                    <p className="mt-3 text-sm font-medium" style={{ color: TONE.ink }}>{e.venueName}</p>
                    <p className="text-sm mt-1" style={{ color: TONE.inkSoft }}>{e.address}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {e.dressCode && (
                    <div className="inline-block text-[10px] tracking-[0.25em] uppercase px-3 py-1" style={{ background: TONE.blush, color: TONE.mauve, borderRadius: 999 }}>
                      Dresscode: {e.dressCode}
                    </div>
                  )}
                  {e.mapUrl && (
                    <a href={e.mapUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] tracking-[0.25em] uppercase inline-flex items-center gap-1.5 px-3 py-1" style={{ background: TONE.rose, color: TONE.cream, borderRadius: 999 }}>
                      Lihat Peta <span>↗</span>
                    </a>
                  )}
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

  return (
    <section ref={ref} className={`relative py-24 px-6 ks-reveal ${seen ? "in" : ""}`} style={{ background: TONE.bg }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.rose }}>Album Kenangan</div>
          <h2 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(36px, 7vw, 64px)" }}>
            Kelopak Kenangan
          </h2>
          <ScallopDivider color={TONE.rose} className="mt-5 mx-auto" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {gallery.map((g, i) => {
            const isOval = i % 4 === 0;
            const isArch = i % 4 === 2;
            return (
              <button
                key={g.id ?? i}
                onClick={() => setLightbox(g.url)}
                className="relative overflow-hidden group aspect-[3/4]"
                style={{
                  background: TONE.blush,
                  border: `1px solid ${TONE.rule}`,
                  borderRadius: isOval ? "999px" : isArch ? "999px 999px 12px 12px" : "16px",
                  boxShadow: `0 14px 36px -20px ${TONE.roseDeep}55`,
                }}
              >
                <img src={g.url} alt={g.caption ?? ""} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition" style={{ background: `linear-gradient(180deg, transparent 55%, ${TONE.mauve}cc 100%)` }} />
                {g.caption && (
                  <div className="absolute bottom-3 left-3 right-3 text-[10px] tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition" style={{ color: TONE.cream }}>
                    {g.caption}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {lightbox && (
        <div onClick={() => setLightbox(null)} className="fixed inset-0 z-50 flex items-center justify-center p-6 cursor-zoom-out" style={{ background: "rgba(60,30,40,0.94)" }}>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain" style={{ borderRadius: 16, boxShadow: `0 30px 60px -30px ${TONE.roseDeep}` }} />
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
    <section className="relative py-24 px-6 overflow-hidden" style={{ background: TONE.blush }}>
      <Rose size={160} className="absolute -top-6 -left-6 opacity-50" />
      <Rose size={160} className="absolute -bottom-6 -right-6 opacity-50" />
      <div className="relative max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.roseDeep }}>Konfirmasi Kehadiran</div>
          <h2 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(34px, 6vw, 52px)" }}>RSVP</h2>
          <ScallopDivider color={TONE.roseDeep} className="mt-5 mx-auto" />
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
          <div className="text-center p-10" style={{ background: TONE.cream, border: `1px solid ${TONE.rule}`, borderRadius: 24 }}>
            <Rose size={100} className="mx-auto" />
            <h3 className="font-serif text-3xl mt-4" style={{ color: TONE.ink }}>Terima Kasih</h3>
            <p className="mt-3 text-sm" style={{ color: TONE.inkSoft }}>Konfirmasi Anda telah kami terima. Sampai bertemu di hari bahagia kami.</p>
          </div>
        ) : known ? (
          <form onSubmit={submit} className="grid gap-6 p-8 md:p-10" style={{ background: TONE.cream, borderRadius: 24, border: `1px solid ${TONE.rule}`, boxShadow: `0 22px 50px -25px ${TONE.roseDeep}66` }}>
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase mb-3 px-2 text-center" style={{ color: TONE.rose }}>Kehadiran Anda</div>
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
                        border: `1px solid ${TONE.roseDeep}`,
                        background: active ? TONE.roseDeep : "transparent",
                        color: active ? TONE.cream : TONE.ink,
                        borderRadius: 999,
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <Field label="Pesan untuk Mempelai (opsional)">
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="ks-input" />
            </Field>
            {err && <div className="text-sm" style={{ color: "#7a1f1f" }}>{err}</div>}
            <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-3 py-3" style={{ background: TONE.roseDeep, color: TONE.cream, borderRadius: 999 }}>
              <span className="text-[11px] tracking-[0.35em] uppercase">{busy ? "Mengirim…" : "Kirim Konfirmasi"}</span>
              <span>✿</span>
            </button>
          </form>
        ) : (
          <form onSubmit={submit} className="grid gap-5 p-8 md:p-10" style={{ background: TONE.cream, borderRadius: 24, border: `1px solid ${TONE.rule}`, boxShadow: `0 22px 50px -25px ${TONE.roseDeep}66` }}>
            <Field label="Nama Lengkap">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="ks-input" />
            </Field>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Kehadiran">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="ks-input">
                  <option value="HADIR">Hadir</option>
                  <option value="TIDAK">Tidak Hadir</option>
                  <option value="RAGU">Masih Ragu</option>
                </select>
              </Field>
              <Field label="Jumlah Tamu">
                <input type="number" min={1} max={6} value={form.pax} onChange={(e) => setForm({ ...form, pax: Number(e.target.value) })} className="ks-input" />
              </Field>
            </div>
            <Field label="Sesi (opsional)">
              <input value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} className="ks-input" />
            </Field>
            <Field label="Pesan untuk Mempelai (opsional)">
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="ks-input" />
            </Field>
            {err && <div className="text-sm" style={{ color: "#7a1f1f" }}>{err}</div>}
            <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-3 py-3" style={{ background: TONE.roseDeep, color: TONE.cream, borderRadius: 999 }}>
              <span className="text-[11px] tracking-[0.35em] uppercase">{busy ? "Mengirim…" : "Kirim Konfirmasi"}</span>
              <span>✿</span>
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
      <div className="text-[10px] tracking-[0.3em] uppercase mb-2 px-2" style={{ color: TONE.rose }}>{label}</div>
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
    <section className="relative py-24 px-6" style={{ background: TONE.bg }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.rose }}>Buku Tamu</div>
          <h2 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(34px, 6vw, 52px)" }}>Doa &amp; Ucapan</h2>
          <ScallopDivider color={TONE.rose} className="mt-5 mx-auto" />
        </div>

        <form onSubmit={submit} className="grid gap-4 mb-10 p-7" style={{ background: TONE.cream, border: `1px solid ${TONE.rule}`, borderRadius: 24, boxShadow: `0 16px 36px -22px ${TONE.roseDeep}55` }}>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama Anda" className="ks-input" />
          <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Tuliskan doa & ucapan terbaik Anda…" className="ks-input" />
          <button disabled={busy} className="inline-flex items-center justify-center gap-3 py-3" style={{ background: TONE.roseDeep, color: TONE.cream, borderRadius: 999 }}>
            <span className="text-[11px] tracking-[0.35em] uppercase">{busy ? "Mengirim…" : "Kirim Ucapan"}</span>
            <span>✿</span>
          </button>
        </form>

        {list.length === 0 ? (
          <div className="text-center text-sm py-10" style={{ color: TONE.inkSoft }}>Belum ada ucapan. Jadilah yang pertama menulis.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {list.map((w, i) => (
              <article key={w.id ?? i} className="relative p-6" style={{ background: TONE.cream, border: `1px solid ${TONE.rule}`, borderRadius: 18 }}>
                <Melati size={30} className="absolute -top-2 -left-2" />
                <div className="flex items-baseline justify-between">
                  <div className="font-serif text-xl" style={{ color: TONE.ink }}>{w.name}</div>
                  {w.createdAt && (
                    <div className="text-[10px] tracking-wider" style={{ color: TONE.inkSoft }}>
                      {new Date(w.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed italic" style={{ color: TONE.inkSoft }}>{w.message}</p>
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
    <section className="relative py-24 px-6" style={{ background: TONE.blush }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.roseDeep }}>Tanda Kasih</div>
          <h2 className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(34px, 6vw, 52px)" }}>Amplop Digital</h2>
          <ScallopDivider color={TONE.roseDeep} className="mt-5 mx-auto" />
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
    <div className="relative flex flex-wrap items-center justify-between gap-4 p-6" style={{ background: TONE.cream, borderRadius: 18, border: `1px solid ${TONE.rule}`, boxShadow: `0 14px 30px -20px ${TONE.roseDeep}55` }}>
      <Rose size={50} className="absolute -top-3 -left-3 opacity-90" />
      <div>
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.rose }}>{g.kind}</div>
        <div className="font-serif text-2xl mt-1" style={{ color: TONE.ink }}>{g.bankName}</div>
        <div className="text-xs mt-1" style={{ color: TONE.inkSoft }}>a.n. {g.holder}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="font-mono text-lg tracking-[0.1em]" style={{ color: TONE.ink }}>{g.number}</div>
        <button onClick={copy} className="text-[10px] tracking-[0.25em] uppercase px-4 py-2" style={{ background: TONE.roseDeep, color: TONE.cream, borderRadius: 999 }}>
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
    <section className="relative pt-24 pb-12 px-6 overflow-hidden text-center" style={{ background: `linear-gradient(180deg, ${TONE.bg} 0%, ${TONE.blush} 100%)` }}>
      <FloralCorner size={220} className="absolute -top-6 -left-6 opacity-90" />
      <FloralCorner size={220} mirror className="absolute -top-6 -right-6 opacity-90" />
      <PetalRain count={10} />
      <div className="relative max-w-2xl mx-auto">
        <Rose size={140} className="mx-auto" />
        <div className="text-[10px] tracking-[0.4em] uppercase mt-4" style={{ color: TONE.rose }}>Salam Penutup</div>
        <p className="mt-6 font-serif italic text-xl md:text-2xl leading-[1.55]" style={{ color: TONE.inkSoft }}>
          Merupakan suatu kehormatan dan kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.
        </p>
        {closing && (<div className="mt-10 text-sm" style={{ color: TONE.rose }}>{closing}</div>)}
        <div className="mt-2 text-sm" style={{ color: TONE.rose }}>Hormat kami,</div>
        <div className="font-serif mt-3" style={{ color: TONE.ink, fontSize: "clamp(40px, 8vw, 72px)", lineHeight: 1 }}>
          {data.couple.brideShort} <span style={{ color: TONE.rose }}>&amp;</span> {data.couple.groomShort}
        </div>
        <div className="text-[10px] tracking-[0.3em] uppercase mt-4" style={{ color: TONE.rose }}>Beserta Keluarga</div>

        <div className="mt-14 inline-flex items-center gap-2 text-xs" style={{ color: TONE.inkSoft }}>
          <img src="/logo.png" alt="weddQ" style={{ height: 22, width: "auto", objectFit: "contain" }} />
          Dibuat dengan weddQ
        </div>
      </div>
    </section>
  );
}
