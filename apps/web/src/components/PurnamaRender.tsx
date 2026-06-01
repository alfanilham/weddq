import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { api, extractError } from "@/lib/api";
import { InvitationData } from "./InvitationRender";
import { StoryChapters } from "./StoryChapters";

/* Purnama — Cinematic, scroll-driven, zoom-in "Buka Undangan" transition.
   Dark palette, parallax photo panels, full-bleed sections, progressive reveal. */

const CINEMA = {
  bg: "#0B0908",
  panel: "#161210",
  ink: "#F5E8D2",
  inkSoft: "#8E7E68",
  accent: "#D4A05E",
  accentSoft: "#A57B40",
  rule: "rgba(245, 232, 210, 0.12)",
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

/* Hook: trigger 'in' class via IntersectionObserver */
function useReveal<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (setShown(true), io.disconnect())),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, shown };
}

/* Parallax: translate Y based on scroll */
function useParallax<T extends HTMLElement>(strength = 0.25) {
  const ref = useRef<T>(null);
  const [off, setOff] = useState(0);
  useEffect(() => {
    function onScroll() {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const center = window.innerHeight / 2;
      setOff((mid - center) * -strength);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [strength]);
  return { ref, off };
}

/* Reveal wrapper */
function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(48px) scale(0.97)",
        transition: `opacity 1100ms cubic-bezier(0.2,0.7,0.2,1) ${delay}ms, transform 1300ms cubic-bezier(0.2,0.7,0.2,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* ---------- MAIN ---------- */

export function PurnamaRender({ data, interactive = false }: { data: InvitationData; interactive?: boolean }) {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const primary = data.events[0]?.date ?? new Date().toISOString();

  function handleOpen() {
    setOpening(true);
    setTimeout(() => setOpened(true), 1100);
  }

  return (
    <div style={{ background: CINEMA.bg, color: CINEMA.ink, fontFamily: "inherit" }} className="relative">
      {!opened && <Cover data={data} primary={primary} onOpen={handleOpen} opening={opening} />}
      {opened && (
        <div className="cine-content">
          <QuoteSection quote={data.quote} />
          <CoupleHero side="bride" data={data} />
          <CoupleHero side="groom" data={data} />
          <DateMoment primary={primary} couple={data.couple} />
          <CountdownStrip primary={primary} />
          {data.events.map((e, i) => <EventVignette key={e.id ?? i} event={e} index={i} />)}
          {((data.storyChapters && data.storyChapters.length > 0) || data.story) && (
            <StoryChapters
              chapters={data.storyChapters}
              story={data.story}
              gallery={data.gallery}
              theme={{
                bg: CINEMA.bg,
                fg: CINEMA.ink,
                fgSoft: CINEMA.inkSoft,
                accent: CINEMA.accent,
                rule: CINEMA.accent,
                card: CINEMA.panel,
                variant: "dark",
              }}
            />
          )}
          {data.gallery.length > 0 && <GallerySlideshow gallery={data.gallery} />}
          <RsvpScene data={data} interactive={interactive} />
          <WishesScene slug={data.slug} initial={data.wishes ?? []} interactive={interactive} />
          {data.gifts.length > 0 && <GiftsScene gifts={data.gifts} />}
          <Closing data={data} />
        </div>
      )}

      <style>{`
        .cine-content {
          animation: cineEnter 1400ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }
        @keyframes cineEnter {
          0%   { opacity: 0; transform: scale(0.92); filter: blur(8px); }
          60%  { opacity: 1; filter: blur(0); }
          100% { opacity: 1; transform: none; }
        }
        @keyframes kenBurns {
          from { transform: scale(1.0); }
          to   { transform: scale(1.12); }
        }
        @keyframes coverZoomOut {
          to { transform: scale(2.4); opacity: 0; filter: blur(12px); }
        }
        .ken-burns { animation: kenBurns 20s ease-in-out infinite alternate; }
        .cine-input {
          width: 100%;
          padding: 14px 0;
          border: 0;
          border-bottom: 1px solid ${CINEMA.rule};
          background: transparent;
          color: ${CINEMA.ink};
          font-family: inherit;
          font-size: 16px;
        }
        .cine-input:focus { outline: none; border-bottom-color: ${CINEMA.accent}; }
        .cine-input::placeholder { color: ${CINEMA.inkSoft}; opacity: 0.7; }
      `}</style>
    </div>
  );
}

/* ---------- COVER ---------- */

function Cover({
  data,
  primary,
  onOpen,
  opening,
}: {
  data: InvitationData;
  primary: string;
  onOpen: () => void;
  opening: boolean;
}) {
  const cover = data.coverImage || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1800&q=80";
  const dp = parts(primary);
  const guestName = data.guestName ?? null;

  return (
    <section
      className="fixed inset-0 z-50 overflow-hidden flex flex-col items-center justify-center text-center"
      style={{
        animation: opening ? "coverZoomOut 1100ms cubic-bezier(0.7,0,0.3,1) forwards" : undefined,
      }}
    >
      <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover ken-burns" />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 40%, transparent 0%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.95) 100%)`,
        }}
      />

      <div className="relative z-10 px-6 max-w-md">
        <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: CINEMA.accent }}>
          {data.eyebrow}
        </div>
        <h1
          className="font-serif mt-6"
          style={{
            color: CINEMA.ink,
            fontSize: "clamp(48px, 10vw, 96px)",
            lineHeight: 1,
            letterSpacing: "-0.01em",
          }}
        >
          {data.couple.brideShort}
          <div className="my-3" style={{ color: CINEMA.accent, fontSize: "0.5em" }}>&amp;</div>
          {data.couple.groomShort}
        </h1>
        <div className="mt-8 flex items-center justify-center gap-5 text-[10px] tracking-[0.35em] uppercase" style={{ color: CINEMA.ink, opacity: 0.85 }}>
          <span>{dp.day}</span>
          <span style={{ color: CINEMA.accent }}>·</span>
          <span>{dp.monthShort}</span>
          <span style={{ color: CINEMA.accent }}>·</span>
          <span>{dp.year}</span>
        </div>

        {guestName && (
          <div className="mt-9 flex justify-center">
            <div
              className="px-6 py-4 rounded-md"
              style={{
                border: `1px solid ${CINEMA.accent}88`,
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: CINEMA.accent }}>Kepada Yang Terhormat</div>
              <div className="font-serif text-xl mt-1.5" style={{ color: CINEMA.ink }}>{guestName}</div>
            </div>
          </div>
        )}

        <div className="mt-9 flex justify-center">
          <button
            onClick={onOpen}
            className="group inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-[11px] tracking-[0.3em] uppercase transition border"
            style={{
              color: CINEMA.bg,
              background: CINEMA.accent,
              borderColor: CINEMA.accent,
            }}
          >
            <span>Buka Undangan</span>
            <span className="transition group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center text-[10px] tracking-[0.4em] uppercase" style={{ color: CINEMA.inkSoft }}>
        Geser ke bawah untuk membuka
      </div>
    </section>
  );
}

/* ---------- QUOTE ---------- */

function QuoteSection({ quote }: { quote?: string | null }) {
  if (!quote) return null;
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-6 py-24" style={{ background: CINEMA.bg }}>
      <Reveal>
        <div className="max-w-3xl text-center relative">
          <div className="font-serif leading-none opacity-15 absolute -top-12 left-1/2 -translate-x-1/2" style={{ color: CINEMA.accent, fontSize: "180px" }}>
            “
          </div>
          <p className="font-serif relative" style={{ color: CINEMA.ink, fontSize: "clamp(20px, 3vw, 36px)", lineHeight: 1.4 }}>
            {quote}
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className="w-12 h-px" style={{ background: CINEMA.accent }} />
            <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: CINEMA.accent }}>Pembuka</span>
            <span className="w-12 h-px" style={{ background: CINEMA.accent }} />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- COUPLE HERO (full-screen) ---------- */

function CoupleHero({ side, data }: { side: "bride" | "groom"; data: InvitationData }) {
  const isBride = side === "bride";
  const name = isBride ? data.couple.brideName : data.couple.groomName;
  const short = isBride ? data.couple.brideShort : data.couple.groomShort;
  const parents = isBride ? data.couple.brideParents : data.couple.groomParents;
  const ig = isBride ? data.couple.brideInstagram : data.couple.groomInstagram;
  const photo = isBride ? data.couple.bridePhoto : data.couple.groomPhoto;

  return (
    <section className="relative py-20 px-5" style={{ background: CINEMA.bg }}>
      <div className="max-w-md mx-auto text-center">
        <Reveal>
          {/* Photo card — contained, not full-bleed */}
          <div
            className="relative mx-auto overflow-hidden"
            style={{
              width: "100%",
              maxWidth: 320,
              aspectRatio: "3 / 4",
              borderRadius: 14,
              boxShadow: `0 30px 70px -30px rgba(0,0,0,0.9)`,
              border: `1px solid ${CINEMA.rule}`,
            }}
          >
            {photo ? (
              <img src={photo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-serif" style={{ background: CINEMA.panel, color: CINEMA.accent, fontSize: 96 }}>
                {short[0]}
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(180deg, transparent 60%, ${CINEMA.bg}aa 100%)` }} />
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-8 text-[10px] tracking-[0.4em] uppercase" style={{ color: CINEMA.accent }}>
            {isBride ? "Calon Mempelai Putri" : "Calon Mempelai Putra"}
          </div>
        </Reveal>
        <Reveal delay={250}>
          <h2
            className="font-serif mt-4"
            style={{
              color: CINEMA.ink,
              fontSize: "clamp(36px, 7vw, 56px)",
              lineHeight: 0.95,
              letterSpacing: "-0.01em",
            }}
          >
            {short}
          </h2>
          <div className="font-serif italic text-lg md:text-xl mt-2" style={{ color: CINEMA.inkSoft }}>{name}</div>
        </Reveal>
        {parents && (
          <Reveal delay={350}>
            <p className="mt-5 text-sm leading-relaxed" style={{ color: CINEMA.inkSoft }}>
              {parents}
            </p>
          </Reveal>
        )}
        {ig && (
          <Reveal delay={450}>
            <a
              href={`https://instagram.com/${ig.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase font-mono"
              style={{ color: CINEMA.accent }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
              {ig}
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ---------- DATE MOMENT ---------- */

function DateMoment({ primary, couple }: { primary: string; couple: InvitationData["couple"] }) {
  const dp = parts(primary);
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <section
      ref={ref}
      className="relative min-h-[100vh] flex items-center justify-center px-6 overflow-hidden"
      style={{ background: CINEMA.bg }}
    >
      {/* drifting names backdrop */}
      <div
        className="absolute inset-0 flex items-center overflow-hidden pointer-events-none"
        style={{ opacity: shown ? 0.06 : 0, transition: "opacity 1500ms ease" }}
      >
        <div
          className="whitespace-nowrap font-serif"
          style={{
            color: CINEMA.accent,
            fontSize: "26vw",
            transform: shown ? "translateX(-10%)" : "translateX(0%)",
            transition: "transform 20s linear",
          }}
        >
          {couple.brideShort} &amp; {couple.groomShort} · {couple.brideShort} &amp; {couple.groomShort}
        </div>
      </div>

      <div className="relative text-center">
        <Reveal>
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: CINEMA.accent }}>Hari Bahagia</div>
        </Reveal>
        <Reveal delay={120}>
          <div className="text-xs tracking-[0.35em] uppercase mt-6" style={{ color: CINEMA.inkSoft }}>{dp.weekday}</div>
        </Reveal>
        <Reveal delay={250}>
          <div
            className="font-serif mt-3"
            style={{
              color: CINEMA.ink,
              fontSize: "clamp(96px, 18vw, 180px)",
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
            }}
          >
            {dp.day}
          </div>
        </Reveal>
        <Reveal delay={400}>
          <div className="flex items-baseline justify-center gap-4 text-2xl md:text-3xl mt-4 font-serif" style={{ color: CINEMA.ink }}>
            <span>{dp.month}</span>
            <span style={{ color: CINEMA.accent }}>·</span>
            <span>{dp.year}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- COUNTDOWN STRIP ---------- */

function CountdownStrip({ primary }: { primary: string }) {
  const cd = useCountdown(primary);
  return (
    <section className="py-16 border-y" style={{ background: CINEMA.panel, borderColor: CINEMA.rule }}>
      <Reveal>
        <div className="max-w-3xl mx-auto px-5 grid grid-cols-4 gap-8 text-center">
          {[
            ["Hari", cd.d],
            ["Jam", cd.h],
            ["Menit", cd.m],
            ["Detik", cd.s],
          ].map(([l, v], i) => (
            <div key={l as string} className="relative">
              <div className="font-serif tabular-nums" style={{ color: CINEMA.ink, fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1 }}>
                {String(v).padStart(2, "0")}
              </div>
              <div className="mt-2 text-[10px] tracking-[0.3em] uppercase" style={{ color: CINEMA.accent }}>{l}</div>
              {i < 3 && (
                <span className="hidden md:block absolute right-[-1rem] top-1/2 -translate-y-1/2 w-px h-12" style={{ background: CINEMA.rule }} />
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- EVENT VIGNETTE ---------- */

function EventVignette({ event, index }: { event: InvitationData["events"][number]; index: number }) {
  const photos = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    "https://images.unsplash.com/photo-1606490194859-07c18c9f0968?w=1200&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80",
  ];
  const bg = photos[index % photos.length];
  const dp = parts(event.date);

  return (
    <section className="relative py-16 px-5" style={{ background: CINEMA.bg }}>
      <div className="max-w-md mx-auto">
        <Reveal>
          <div
            className="relative overflow-hidden mx-auto"
            style={{
              width: "100%",
              maxWidth: 380,
              aspectRatio: "16 / 11",
              borderRadius: 14,
              border: `1px solid ${CINEMA.rule}`,
              boxShadow: `0 24px 50px -28px rgba(0,0,0,0.9)`,
            }}
          >
            <img src={bg} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(11,9,8,0.92) 100%)" }} />
            <div className="absolute bottom-4 left-5 right-5 text-left">
              <div className="text-[9px] tracking-[0.4em] uppercase" style={{ color: CINEMA.accent }}>
                Acara {String(index + 1).padStart(2, "0")}
              </div>
              <h2 className="font-serif mt-1" style={{ color: CINEMA.ink, fontSize: "clamp(28px, 6vw, 40px)", lineHeight: 0.95 }}>
                {event.kind === "AKAD" ? "Akad Nikah" : event.kind === "RESEPSI" ? "Resepsi" : event.title}
              </h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-7 grid grid-cols-2 gap-5 text-sm">
            <DetailLine label="Tanggal" value={`${dp.day} ${dp.month}`} />
            <DetailLine label="Waktu" value={`${fmtTime(event.date)}${event.endTime ? `–${fmtTime(event.endTime)}` : ""} WIB`} />
            <div className="col-span-2">
              <DetailLine label="Tempat" value={event.venueName} />
            </div>
            <div className="col-span-2">
              <DetailLine label="Alamat" value={event.address} />
            </div>
          </div>
        </Reveal>
        {(event.dressCode || event.mapUrl) && (
          <Reveal delay={350}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {event.dressCode && (
                <div className="text-[10px] tracking-[0.25em] uppercase" style={{ color: CINEMA.inkSoft }}>
                  Dress code: <span style={{ color: CINEMA.accent }}>{event.dressCode}</span>
                </div>
              )}
              {event.mapUrl && (
                <a
                  href={event.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] tracking-[0.25em] uppercase border transition hover:bg-white/10"
                  style={{ borderColor: CINEMA.accent, color: CINEMA.accent }}
                >
                  Lihat Lokasi <span>→</span>
                </a>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.3em] uppercase mb-1.5" style={{ color: CINEMA.accent }}>{label}</div>
      <div style={{ color: CINEMA.ink }}>{value}</div>
    </div>
  );
}

/* ---------- GALLERY SLIDESHOW ---------- */

function GallerySlideshow({ gallery }: { gallery: InvitationData["gallery"] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (paused) return;
    const i = setInterval(() => setActive((a) => (a + 1) % gallery.length), 4500);
    return () => clearInterval(i);
  }, [gallery.length, paused]);

  return (
    <section
      className="relative py-20 px-5"
      style={{ background: CINEMA.bg }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-md mx-auto">
        <Reveal>
          <div className="text-center mb-8">
            <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: CINEMA.accent }}>Galeri</div>
            <h2 className="font-serif mt-3" style={{ color: CINEMA.ink, fontSize: "clamp(32px, 5vw, 48px)" }}>
              Momen Kami
            </h2>
          </div>
        </Reveal>

        <div
          className="relative overflow-hidden mx-auto"
          style={{
            width: "100%",
            maxWidth: 380,
            aspectRatio: "3 / 4",
            borderRadius: 14,
            border: `1px solid ${CINEMA.rule}`,
            boxShadow: `0 24px 60px -28px rgba(0,0,0,0.9)`,
          }}
        >
          {gallery.map((g, i) => (
            <button
              key={g.id ?? i}
              onClick={() => setLightbox(g.url)}
              className="absolute inset-0 cursor-zoom-in"
              style={{
                opacity: active === i ? 1 : 0,
                transform: active === i ? "scale(1)" : "scale(1.05)",
                transition: "opacity 1200ms ease, transform 6000ms ease",
                pointerEvents: active === i ? "auto" : "none",
              }}
            >
              <img src={g.url} alt={g.caption ?? ""} className="w-full h-full object-cover" />
              {g.caption && (
                <div className="absolute bottom-4 left-4 right-4 text-left" style={{ color: CINEMA.ink }}>
                  <div className="text-[9px] tracking-[0.3em] uppercase opacity-70">{String(i + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</div>
                  <div className="font-serif text-base md:text-lg mt-1">{g.caption}</div>
                </div>
              )}
            </button>
          ))}
          <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none" style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.7))" }} />
        </div>

        {/* dots */}
        <div className="flex justify-center gap-2 mt-5">
          {gallery.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="h-1 rounded-full transition-all"
              style={{
                width: active === i ? 28 : 8,
                background: active === i ? CINEMA.accent : CINEMA.rule,
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

/* ---------- RSVP SCENE ---------- */

function RsvpScene({ data, interactive }: { data: InvitationData; interactive: boolean }) {
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
    <section className="py-24 px-6" style={{ background: CINEMA.panel }}>
      <div className="max-w-3xl mx-auto px-5 grid lg:grid-cols-[1fr_2fr] gap-12">
        <Reveal>
          <div>
            <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: CINEMA.accent }}>Konfirmasi Kehadiran</div>
            <h2 className="font-serif mt-4" style={{ color: CINEMA.ink, fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1 }}>RSVP</h2>
            {known ? (
              <p className="mt-6 max-w-xs text-sm leading-relaxed" style={{ color: CINEMA.inkSoft }}>
                Halo <span className="font-serif italic" style={{ color: CINEMA.ink }}>{data.guestName}</span>, mohon konfirmasikan kehadiran Anda di samping.
              </p>
            ) : (
              <p className="mt-6 max-w-xs text-sm leading-relaxed" style={{ color: CINEMA.inkSoft }}>
                Mohon konfirmasikan kehadiran Anda agar kami dapat menyiapkan tempat dengan sebaik-baiknya.
              </p>
            )}
          </div>
        </Reveal>
        <Reveal delay={150}>
          {done ? (
            <div className="border-t pt-10" style={{ borderColor: CINEMA.rule }}>
              <h3 className="font-serif text-3xl" style={{ color: CINEMA.ink }}>Terima kasih atas konfirmasi Anda.</h3>
              <p className="mt-3 text-sm" style={{ color: CINEMA.inkSoft }}>Sampai bertemu di hari bahagia kami.</p>
            </div>
          ) : known ? (
            <form onSubmit={submit} className="grid gap-7">
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: CINEMA.accent }}>Kehadiran Anda</div>
                <div className="grid grid-cols-3 gap-3">
                  {STATUS.map((s) => {
                    const active = form.status === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setForm({ ...form, status: s.id })}
                        className="text-xs py-4 transition rounded-full"
                        style={{
                          border: `1px solid ${CINEMA.accent}`,
                          background: active ? CINEMA.accent : "transparent",
                          color: active ? CINEMA.bg : CINEMA.ink,
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <CineField label="Pesan untuk mempelai (opsional)">
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="cine-input" />
              </CineField>
              {err && <div className="text-sm" style={{ color: "#F58282" }}>{err}</div>}
              <button
                type="submit"
                disabled={busy}
                className="mt-3 self-start inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-[11px] tracking-[0.3em] uppercase"
                style={{ background: CINEMA.accent, color: CINEMA.bg }}
              >
                {busy ? "Mengirim…" : "Kirim Konfirmasi"} <span>→</span>
              </button>
            </form>
          ) : (
            <form onSubmit={submit} className="grid gap-4">
              <CineField label="Nama lengkap">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama Anda" className="cine-input" />
              </CineField>
              <div className="grid grid-cols-2 gap-6">
                <CineField label="Kehadiran">
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="cine-input">
                    <option value="HADIR">Hadir</option>
                    <option value="TIDAK">Tidak Hadir</option>
                    <option value="RAGU">Masih Ragu</option>
                  </select>
                </CineField>
                <CineField label="Jumlah tamu">
                  <input type="number" min={1} max={6} value={form.pax} onChange={(e) => setForm({ ...form, pax: Number(e.target.value) })} className="cine-input" />
                </CineField>
              </div>
              <CineField label="Sesi (opsional)">
                <input value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} placeholder="Akad / Resepsi / Keduanya" className="cine-input" />
              </CineField>
              <CineField label="Pesan untuk mempelai (opsional)">
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="cine-input" />
              </CineField>
              {err && <div className="text-sm" style={{ color: "#F58282" }}>{err}</div>}
              <button
                type="submit"
                disabled={busy}
                className="mt-3 self-start inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-[11px] tracking-[0.3em] uppercase"
                style={{ background: CINEMA.accent, color: CINEMA.bg }}
              >
                {busy ? "Mengirim…" : "Kirim Konfirmasi"} <span>→</span>
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function CineField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: CINEMA.accent }}>{label}</div>
      {children}
    </label>
  );
}

/* ---------- WISHES ---------- */

function WishesScene({ slug, initial, interactive }: { slug: string; initial: NonNullable<InvitationData["wishes"]>; interactive: boolean }) {
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
    <section className="py-24 px-6" style={{ background: CINEMA.bg }}>
      <div className="max-w-3xl mx-auto px-5">
        <Reveal>
          <div className="text-center">
            <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: CINEMA.accent }}>Buku Tamu</div>
            <h2 className="font-serif mt-4" style={{ color: CINEMA.ink, fontSize: "clamp(40px, 5vw, 64px)" }}>Doa &amp; Ucapan</h2>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <form onSubmit={submit} className="grid gap-4 max-w-2xl mx-auto mt-10">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama Anda" className="cine-input" />
            <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Tuliskan doa & ucapan terbaik Anda…" className="cine-input" />
            <button disabled={busy} className="self-end mt-2 inline-flex items-center gap-3 rounded-full px-6 py-2.5 text-[11px] tracking-[0.3em] uppercase" style={{ background: CINEMA.accent, color: CINEMA.bg }}>
              {busy ? "Mengirim…" : "Kirim Ucapan"} <span>→</span>
            </button>
          </form>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5 mt-12 max-w-4xl mx-auto">
          {list.length === 0 && (
            <div className="md:col-span-2 text-center text-sm py-10" style={{ color: CINEMA.inkSoft }}>
              Belum ada ucapan. Jadilah yang pertama menulis.
            </div>
          )}
          {list.map((w, i) => (
            <Reveal key={w.id ?? i} delay={i * 80}>
              <div className="rounded p-6 border" style={{ borderColor: CINEMA.rule, background: CINEMA.panel }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-serif" style={{ background: CINEMA.accent, color: CINEMA.bg }}>
                    {w.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="font-serif text-lg" style={{ color: CINEMA.ink }}>{w.name}</div>
                      {w.createdAt && <div className="text-[10px] font-mono" style={{ color: CINEMA.inkSoft }}>{new Date(w.createdAt).toLocaleDateString("id-ID")}</div>}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: CINEMA.inkSoft }}>{w.message}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- GIFTS ---------- */

function GiftsScene({ gifts }: { gifts: InvitationData["gifts"] }) {
  return (
    <section className="py-24 px-6" style={{ background: CINEMA.panel }}>
      <div className="max-w-3xl mx-auto px-5">
        <Reveal>
          <div className="text-center">
            <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: CINEMA.accent }}>Tanda Kasih</div>
            <h2 className="font-serif mt-4" style={{ color: CINEMA.ink, fontSize: "clamp(40px, 5vw, 64px)" }}>Amplop Digital</h2>
            <p className="mt-5 max-w-md mx-auto text-sm" style={{ color: CINEMA.inkSoft }}>
              Tanpa mengurangi rasa hormat, doa restu Anda adalah hadiah paling berarti.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 flex flex-wrap justify-center gap-5 max-w-5xl mx-auto">
          {gifts.map((g, i) => (
            <Reveal key={g.id ?? i} delay={i * 100}>
              <div className="w-full sm:w-[300px] md:w-[320px]">
                <CineGift g={g} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CineGift({ g }: { g: { kind: string; bankName: string; number: string; holder: string } }) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className="relative rounded-lg p-7 overflow-hidden border"
      style={{
        background: `linear-gradient(135deg, ${CINEMA.panel} 0%, ${CINEMA.bg} 100%)`,
        borderColor: CINEMA.accentSoft,
        color: CINEMA.ink,
      }}
    >
      <div className="absolute -top-12 -right-12 opacity-10 font-serif" style={{ color: CINEMA.accent, fontSize: "160px", lineHeight: 1 }}>
        ✦
      </div>
      <div className="relative flex justify-between items-start">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: CINEMA.accent }}>{g.kind}</div>
          <div className="font-serif text-2xl mt-1">{g.bankName}</div>
        </div>
        <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
          <rect x="2" y="2" width="32" height="22" rx="2" stroke={CINEMA.accentSoft} strokeWidth="0.8" />
          <rect x="6" y="8" width="10" height="8" fill={CINEMA.accent} fillOpacity="0.5" rx="1" />
          <line x1="19" y1="10" x2="30" y2="10" stroke={CINEMA.accentSoft} />
          <line x1="19" y1="14" x2="28" y2="14" stroke={CINEMA.accentSoft} />
        </svg>
      </div>
      <div className="relative mt-7 font-mono text-lg tracking-[0.15em]" style={{ color: CINEMA.ink }}>{g.number}</div>
      <div className="relative mt-1 text-xs" style={{ color: CINEMA.inkSoft }}>a.n. {g.holder}</div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(g.number).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="relative mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] tracking-[0.25em] uppercase border"
        style={{ borderColor: CINEMA.accent, color: CINEMA.accent }}
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
      className="relative min-h-[100vh] flex items-center justify-center px-6 text-center overflow-hidden"
      style={{
        background: `radial-gradient(circle at 50% 100%, ${CINEMA.panel}, ${CINEMA.bg} 70%)`,
      }}
    >
      <div className="relative max-w-3xl">
        <Reveal>
          <div className="text-[10px] tracking-[0.45em] uppercase" style={{ color: CINEMA.accent }}>Salam Penutup</div>
        </Reveal>
        <Reveal delay={150}>
          <p
            className="font-serif mt-8"
            style={{ color: CINEMA.ink, fontSize: "clamp(24px, 3vw, 38px)", lineHeight: 1.4 }}
          >
            Merupakan suatu kehormatan dan kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
          </p>
        </Reveal>
        <Reveal delay={350}>
          {closing && (
            <div className="mt-12 text-sm" style={{ color: CINEMA.inkSoft }}>{closing}</div>
          )}
          <div className="mt-1 text-sm" style={{ color: CINEMA.inkSoft }}>Hormat kami,</div>
        </Reveal>
        <Reveal delay={500}>
          <div className="font-serif mt-6" style={{ color: CINEMA.ink, fontSize: "clamp(56px, 9vw, 130px)", lineHeight: 0.95 }}>
            {data.couple.brideShort}
            <div style={{ color: CINEMA.accent, fontSize: "0.5em" }} className="my-2">&amp;</div>
            {data.couple.groomShort}
          </div>
          <div className="mt-4 text-[10px] tracking-[0.4em] uppercase" style={{ color: CINEMA.accent }}>Beserta Keluarga</div>
        </Reveal>
        <Reveal delay={700}>
          <div className="mt-16 inline-flex items-center gap-2 text-xs" style={{ color: CINEMA.inkSoft }}>
            <img src="/logo.png" alt="weddQ" style={{ height: 24, width: "auto", objectFit: "contain", filter: "brightness(1.2)" }} />
            Dibuat dengan weddQ
          </div>
        </Reveal>
      </div>
    </section>
  );
}
