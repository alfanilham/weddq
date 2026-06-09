import { FormEvent, useEffect, useState, ReactNode } from "react";
import { api, extractError } from "@/lib/api";
import { InvitationData } from "./InvitationRender";
import { StoryChapters } from "./StoryChapters";

/* Sekar Kencana — Modern Javanese Classic.
   Cream-gold-sepia palette, alternating section backgrounds with subtle
   batik motif hints, monogram, gentle dividers. Clean modern feel that
   still nods to classic Javanese sensibility. */

const TONE = {
  bg:        "#F4EAD5",  // cream paper (Javanese batik base)
  cream:     "#FAF4E6",  // lightest cream
  whisper:   "#EBDFBD",  // subtle warm tint
  gold:      "#A88339",
  goldDeep:  "#8B6A2E",
  warmGold:  "#C9A961",
  sepia:     "#3A2A1C",
  sepiaSoft: "#5C463A",
  panel:     "#4A3522",
};

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

/* ---------- ORNAMENTS ---------- */

function Monogram({ a, b, color = TONE.gold, size = 48 }: { a: string; b: string; color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 100 60" width={size * 1.7} height={size} className="mx-auto">
      <line x1="2" y1="30" x2="22" y2="30" stroke={color} strokeOpacity="0.6" strokeWidth="0.7" />
      <line x1="78" y1="30" x2="98" y2="30" stroke={color} strokeOpacity="0.6" strokeWidth="0.7" />
      <text x="38" y="40" textAnchor="middle" fill={color} fontFamily="Quattrocento, Georgia, serif" fontSize="32" fontStyle="italic">
        {a[0]}
      </text>
      <text x="50" y="38" textAnchor="middle" fill={color} fontFamily="Quattrocento, Georgia, serif" fontSize="20" opacity="0.7">
        &amp;
      </text>
      <text x="62" y="40" textAnchor="middle" fill={color} fontFamily="Quattrocento, Georgia, serif" fontSize="32" fontStyle="italic">
        {b[0]}
      </text>
    </svg>
  );
}

function KawungDot({ color = TONE.gold, size = 14 }: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden>
      <g fill="none" stroke={color} strokeWidth="1.1">
        <circle cx="10" cy="4" r="3" />
        <circle cx="16" cy="10" r="3" />
        <circle cx="10" cy="16" r="3" />
        <circle cx="4" cy="10" r="3" />
        <circle cx="10" cy="10" r="1.5" fill={color} />
      </g>
    </svg>
  );
}

/* ---------- ATOMS ---------- */

function Eyebrow({ children, color = TONE.gold }: { children: ReactNode; color?: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="h-px w-8" style={{ background: color, opacity: 0.5 }} />
      <KawungDot color={color} size={12} />
      <span className="text-[10px] tracking-[0.4em] uppercase font-medium" style={{ color }}>{children}</span>
      <KawungDot color={color} size={12} />
      <span className="h-px w-8" style={{ background: color, opacity: 0.5 }} />
    </div>
  );
}

function SectionTitle({ children, color = TONE.sepia, italic = true }: { children: ReactNode; color?: string; italic?: boolean }) {
  return (
    <h2
      className={`font-serif mt-4 ${italic ? "italic" : ""}`}
      style={{ color, fontSize: "clamp(32px, 6vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.01em" }}
    >
      {children}
    </h2>
  );
}

function Section({ bg = TONE.bg, children, className = "" }: { bg?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`relative px-5 py-14 ${className}`} style={{ background: bg }}>
      <div className="max-w-3xl mx-auto">{children}</div>
    </section>
  );
}

/* ---------- MAIN ---------- */

export function SekarKencanaRender({ data, interactive = false }: { data: InvitationData; interactive?: boolean }) {
  const [opened, setOpened] = useState(false);
  const primary = data.events[0]?.date ?? new Date().toISOString();

  return (
    <div style={{ background: TONE.bg, color: TONE.sepia }} className="font-sans">
      {!opened ? (
        <Cover data={data} onOpen={() => setOpened(true)} />
      ) : (
        <div className="weddq-reveal">
          {data.quote && <Opening data={data} />}
          <Couple data={data} />
          <DateMoment primary={primary} couple={data.couple} />
          <Events events={data.events} />
          {((data.storyChapters && data.storyChapters.length > 0) || data.story) && (
            <StoryChapters
              chapters={data.storyChapters}
              story={data.story}
              gallery={data.gallery}
              theme={{
                bg: TONE.cream,
                fg: TONE.sepia,
                fgSoft: TONE.sepiaSoft,
                accent: TONE.gold,
                rule: TONE.gold,
                card: TONE.bg,
                variant: "light",
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
    </div>
  );
}

/* ---------- COVER ---------- */

function Cover({ data, onOpen }: { data: InvitationData; onOpen: () => void }) {
  const cover = data.coverImage || data.couple.bridePhoto || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600";
  const dp = parts(data.events[0]?.date ?? new Date().toISOString());
  const guestName = data.guestName ?? null;

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center px-5 py-12 overflow-hidden">
      <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${TONE.sepia}cc 0%, ${TONE.sepia}99 45%, ${TONE.sepia}e6 100%)` }} />
      <div className="relative w-full max-w-xl mx-auto text-center" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.55)" }}>
        <Monogram a={data.couple.brideShort} b={data.couple.groomShort} size={48} color={TONE.warmGold} />

        <div className="mt-6">
          <Eyebrow color={TONE.warmGold}>{data.eyebrow}</Eyebrow>
        </div>

        <h1 className="font-serif mt-6" style={{ color: TONE.cream, fontSize: "clamp(40px, 9vw, 64px)", lineHeight: 1, letterSpacing: "-0.01em" }}>
          {data.couple.brideShort}
        </h1>
        <div className="font-serif italic my-1" style={{ color: TONE.warmGold, fontSize: "clamp(22px, 4vw, 30px)" }}>&amp;</div>
        <h1 className="font-serif" style={{ color: TONE.cream, fontSize: "clamp(40px, 9vw, 64px)", lineHeight: 1, letterSpacing: "-0.01em" }}>
          {data.couple.groomShort}
        </h1>

        <div className="mt-7 flex items-center justify-center gap-3 text-[11px] tracking-[0.32em] uppercase" style={{ color: `${TONE.cream}cc` }}>
          <span>{dp.day}</span>
          <span style={{ color: TONE.warmGold }}>·</span>
          <span>{dp.month}</span>
          <span style={{ color: TONE.warmGold }}>·</span>
          <span>{dp.year}</span>
        </div>

        {guestName && (
          <div className="mt-8 flex justify-center">
            <div className="px-6 py-3.5" style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, border: `1px solid ${TONE.warmGold}66`, backdropFilter: "blur(6px)" }}>
              <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.warmGold }}>Kepada Yang Terhormat</div>
              <div className="font-serif text-xl mt-1" style={{ color: TONE.cream }}>{guestName}</div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={onOpen}
            className="group inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-[11px] tracking-[0.3em] uppercase transition hover:scale-105"
            style={{ background: TONE.warmGold, color: TONE.sepia }}
          >
            Buka Undangan
            <span className="transition group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- OPENING (Quote) ---------- */

function Opening({ data }: { data: InvitationData }) {
  return (
    <Section bg={TONE.whisper}>
      <div className="text-center">
        <Eyebrow>Pembuka</Eyebrow>
        <p className="font-serif italic mt-7" style={{ color: TONE.sepia, fontSize: "clamp(20px, 3vw, 28px)", lineHeight: 1.55 }}>
          “{data.quote}”
        </p>
      </div>
    </Section>
  );
}

/* ---------- COUPLE ---------- */

function Couple({ data }: { data: InvitationData }) {
  return (
    <Section bg={TONE.cream}>
      <div className="text-center mb-10">
        <Eyebrow>Mempelai Berbahagia</Eyebrow>
        <SectionTitle>Sepasang sejoli</SectionTitle>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CoupleCard role="Mempelai Putri" person={{
          name: data.couple.brideName,
          short: data.couple.brideShort,
          parents: data.couple.brideParents,
          ig: data.couple.brideInstagram,
          photo: data.couple.bridePhoto,
        }} />
        <CoupleCard role="Mempelai Putra" person={{
          name: data.couple.groomName,
          short: data.couple.groomShort,
          parents: data.couple.groomParents,
          ig: data.couple.groomInstagram,
          photo: data.couple.groomPhoto,
        }} />
      </div>
    </Section>
  );
}

function CoupleCard({ role, person }: {
  role: string;
  person: { name: string; short: string; parents?: string | null; ig?: string | null; photo?: string | null };
}) {
  return (
    <article
      className="p-7 text-center"
      style={{ background: TONE.bg, borderRadius: 18, border: `1px solid ${TONE.gold}33`, boxShadow: `0 14px 38px -22px ${TONE.sepia}44` }}
    >
      <div
        className="relative mx-auto overflow-hidden"
        style={{ width: 140, height: 140, borderRadius: 999, border: `2px solid ${TONE.gold}66` }}
      >
        {person.photo ? (
          <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-serif text-5xl" style={{ background: TONE.whisper, color: TONE.gold }}>
            {person.short[0]}
          </div>
        )}
      </div>
      <div className="mt-5 text-[10px] tracking-[0.35em] uppercase font-medium" style={{ color: TONE.gold }}>{role}</div>
      <h3 className="font-serif mt-2" style={{ color: TONE.sepia, fontSize: 28, lineHeight: 1.1 }}>{person.short}</h3>
      <p className="text-sm italic mt-1" style={{ color: TONE.sepiaSoft }}>{person.name}</p>
      {person.parents && (
        <p className="mt-4 text-xs leading-relaxed" style={{ color: TONE.sepiaSoft }}>{person.parents}</p>
      )}
      {person.ig && (
        <a
          href={`https://instagram.com/${person.ig.replace(/^@/, "")}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase"
          style={{ color: TONE.gold }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
          </svg>
          {person.ig}
        </a>
      )}
    </article>
  );
}

/* ---------- DATE MOMENT ---------- */

function DateMoment({ primary, couple }: { primary: string; couple: InvitationData["couple"] }) {
  const cd = useCountdown(primary);
  const dp = parts(primary);

  return (
    <Section bg={TONE.sepia} className="text-center">
      <Monogram a={couple.brideShort} b={couple.groomShort} color={TONE.warmGold} size={42} />
      <div className="mt-4">
        <Eyebrow color={TONE.warmGold}>Menuju Hari Bahagia</Eyebrow>
      </div>
      <div className="font-serif mt-6" style={{ color: TONE.cream, fontSize: "clamp(72px, 14vw, 128px)", lineHeight: 1 }}>
        {dp.day}
      </div>
      <div className="font-serif italic mt-2" style={{ color: TONE.cream, fontSize: 22 }}>
        {dp.month} {dp.year}
      </div>
      <div className="text-[11px] tracking-[0.32em] uppercase mt-2" style={{ color: TONE.warmGold }}>{dp.weekday}</div>

      <div className="mt-10 grid grid-cols-4 gap-3 max-w-md mx-auto">
        {[
          ["Hari", cd.d],
          ["Jam", cd.h],
          ["Menit", cd.m],
          ["Detik", cd.s],
        ].map(([l, v]) => (
          <div key={l as string} className="text-center py-4 px-2" style={{ background: TONE.panel, borderRadius: 10, border: `1px solid ${TONE.warmGold}33` }}>
            <div className="font-serif text-2xl md:text-3xl tabular-nums" style={{ color: TONE.cream }}>
              {String(v).padStart(2, "0")}
            </div>
            <div className="text-[10px] tracking-[0.25em] uppercase mt-1" style={{ color: TONE.warmGold }}>{l}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- EVENTS ---------- */

function Events({ events }: { events: InvitationData["events"] }) {
  return (
    <Section bg={TONE.bg}>
      <div className="text-center mb-10">
        <Eyebrow>Rangkaian Acara</Eyebrow>
        <SectionTitle>Susunan acara</SectionTitle>
      </div>

      <div className="space-y-5">
        {events.map((e, i) => {
          const dp = parts(e.date);
          return (
            <article
              key={e.id ?? i}
              className="p-7 grid md:grid-cols-[auto_1fr] gap-6 items-start"
              style={{ background: TONE.cream, borderRadius: 16, border: `1px solid ${TONE.gold}33`, boxShadow: `0 14px 34px -22px ${TONE.sepia}33` }}
            >
              <div className="text-center px-5 py-4 self-center" style={{ background: TONE.sepia, color: TONE.cream, borderRadius: 12 }}>
                <div className="text-[10px] tracking-[0.3em] uppercase opacity-80" style={{ color: TONE.warmGold }}>{dp.monthShort}</div>
                <div className="font-serif text-4xl leading-none mt-1">{dp.day}</div>
                <div className="text-[10px] opacity-70 mt-1">{dp.year}</div>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.32em] uppercase" style={{ color: TONE.gold }}>{e.kind}</div>
                <h3 className="font-serif mt-1" style={{ color: TONE.sepia, fontSize: 26 }}>{e.title}</h3>
                <p className="text-sm mt-2" style={{ color: TONE.sepiaSoft }}>
                  {dp.weekday} · {fmtTime(e.date)}{e.endTime ? `–${fmtTime(e.endTime)}` : ""} WIB
                </p>
                <p className="text-sm font-medium mt-3" style={{ color: TONE.sepia }}>{e.venueName}</p>
                <p className="text-sm" style={{ color: TONE.sepiaSoft }}>{e.address}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {e.dressCode && (
                    <span className="text-[10px] tracking-[0.22em] uppercase px-3 py-1" style={{ background: TONE.whisper, color: TONE.sepiaSoft, borderRadius: 999 }}>
                      Dresscode: {e.dressCode}
                    </span>
                  )}
                  {e.mapUrl && (
                    <a
                      href={e.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] tracking-[0.22em] uppercase px-4 py-1.5 inline-flex items-center gap-1.5"
                      style={{ background: TONE.gold, color: TONE.cream, borderRadius: 999 }}
                    >
                      Lihat Peta <span>→</span>
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}

/* ---------- GALLERY ---------- */

function Gallery({ gallery }: { gallery: InvitationData["gallery"] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <Section bg={TONE.whisper}>
      <div className="text-center mb-10">
        <Eyebrow>Galeri</Eyebrow>
        <SectionTitle>Momen kami</SectionTitle>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {gallery.map((g, i) => (
          <button
            key={g.id ?? i}
            onClick={() => setLightbox(g.url)}
            className="relative overflow-hidden group aspect-[3/4]"
            style={{ borderRadius: 12, border: `1px solid ${TONE.gold}33`, background: TONE.cream }}
          >
            <img src={g.url} alt={g.caption ?? ""} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
            {g.caption && (
              <div className="absolute inset-x-0 bottom-0 p-3 text-[10px] tracking-[0.18em] uppercase opacity-0 group-hover:opacity-100 transition" style={{ background: `linear-gradient(180deg, transparent, ${TONE.sepia}cc)`, color: TONE.cream }}>
                {g.caption}
              </div>
            )}
          </button>
        ))}
      </div>

      {lightbox && (
        <div onClick={() => setLightbox(null)} className="fixed inset-0 z-50 flex items-center justify-center p-6 cursor-zoom-out" style={{ background: "rgba(58,42,28,0.94)" }}>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain" style={{ borderRadius: 12, boxShadow: "0 30px 60px -30px rgba(0,0,0,0.9)" }} />
        </div>
      )}
    </Section>
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
    <Section bg={TONE.panel} className="text-center">
      <Eyebrow color={TONE.warmGold}>Konfirmasi Kehadiran</Eyebrow>
      <SectionTitle color={TONE.cream}>RSVP</SectionTitle>
      {known ? (
        <p className="mt-5 text-sm leading-relaxed max-w-md mx-auto mb-8" style={{ color: TONE.warmGold }}>
          Halo <span className="italic font-medium" style={{ color: TONE.cream }}>{data.guestName}</span>, mohon konfirmasikan kehadiran Anda di bawah ini.
        </p>
      ) : (
        <p className="mt-5 text-sm leading-relaxed max-w-md mx-auto mb-8" style={{ color: TONE.warmGold }}>
          Mohon konfirmasikan kehadiran Anda agar kami dapat menyiapkan tempat dengan sebaik-baiknya.
        </p>
      )}

      {done ? (
        <div className="text-center max-w-md mx-auto p-9" style={{ background: TONE.cream, borderRadius: 18, border: `1px solid ${TONE.gold}55` }}>
          <div className="font-serif text-2xl" style={{ color: TONE.sepia }}>Terima kasih.</div>
          <p className="text-sm mt-2" style={{ color: TONE.sepiaSoft }}>Konfirmasi Anda telah kami terima.</p>
        </div>
      ) : known ? (
        <form onSubmit={submit} className="grid gap-5 max-w-md mx-auto p-7 text-left" style={{ background: TONE.cream, borderRadius: 18, border: `1px solid ${TONE.gold}55`, boxShadow: `0 14px 36px -22px ${TONE.sepia}66` }}>
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
                    className="text-xs py-3 transition"
                    style={{
                      border: `1px solid ${TONE.sepia}`,
                      background: active ? TONE.sepia : "transparent",
                      color: active ? TONE.cream : TONE.sepia,
                      borderRadius: 8,
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
          <Field label="Pesan untuk Mempelai (opsional)">
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="m-input" />
          </Field>
          {err && <div className="text-sm" style={{ color: "#7a1f1f" }}>{err}</div>}
          <button type="submit" disabled={busy} className="py-3 rounded-full text-[11px] tracking-[0.32em] uppercase" style={{ background: TONE.sepia, color: TONE.cream }}>
            {busy ? "Mengirim…" : "Kirim Konfirmasi"}
          </button>
        </form>
      ) : (
        <form onSubmit={submit} className="grid gap-4 max-w-md mx-auto p-7 text-left" style={{ background: TONE.cream, borderRadius: 18, border: `1px solid ${TONE.gold}55`, boxShadow: `0 14px 36px -22px ${TONE.sepia}66` }}>
          <Field label="Nama lengkap">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="m-input" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Kehadiran">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="m-input">
                <option value="HADIR">Hadir</option>
                <option value="TIDAK">Tidak Hadir</option>
                <option value="RAGU">Masih Ragu</option>
              </select>
            </Field>
            <Field label="Jumlah tamu">
              <input type="number" min={1} max={6} value={form.pax} onChange={(e) => setForm({ ...form, pax: Number(e.target.value) })} className="m-input" />
            </Field>
          </div>
          <Field label="Pesan untuk Mempelai (opsional)">
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="m-input" />
          </Field>
          {err && <div className="text-sm" style={{ color: "#7a1f1f" }}>{err}</div>}
          <button type="submit" disabled={busy} className="py-3 rounded-full text-[11px] tracking-[0.32em] uppercase mt-1" style={{ background: TONE.sepia, color: TONE.cream }}>
            {busy ? "Mengirim…" : "Kirim Konfirmasi"}
          </button>
        </form>
      )}
      <style>{`.m-input{width:100%;border:1px solid ${TONE.gold}55;background:${TONE.bg};padding:11px 14px;font-size:14px;color:${TONE.sepia};border-radius:8px;font-family:inherit}.m-input:focus{outline:none;border-color:${TONE.gold}}`}</style>
    </Section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
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
    <Section bg={TONE.bg}>
      <div className="text-center mb-8">
        <Eyebrow>Buku Tamu</Eyebrow>
        <SectionTitle>Doa &amp; ucapan</SectionTitle>
      </div>

      <form onSubmit={submit} className="grid gap-3 mb-8 p-6 max-w-md mx-auto" style={{ background: TONE.cream, borderRadius: 14, border: `1px solid ${TONE.gold}55` }}>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama Anda" className="m-input" />
        <textarea required rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tuliskan doa & ucapan terbaik Anda…" className="m-input" />
        <button disabled={busy} className="py-3 rounded-full text-[11px] tracking-[0.32em] uppercase" style={{ background: TONE.sepia, color: TONE.cream }}>
          {busy ? "Mengirim…" : "Kirim Ucapan"}
        </button>
      </form>

      {list.length === 0 ? (
        <div className="text-center text-sm py-6" style={{ color: TONE.sepiaSoft }}>Belum ada ucapan. Jadilah yang pertama menulis.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
          {list.map((w, i) => (
            <article key={w.id ?? i} className="p-5" style={{ background: TONE.cream, borderRadius: 12, border: `1px solid ${TONE.gold}33` }}>
              <div className="flex items-baseline justify-between">
                <div className="font-serif text-lg" style={{ color: TONE.sepia }}>{w.name}</div>
                {w.createdAt && (
                  <div className="text-[10px]" style={{ color: TONE.sepiaSoft }}>
                    {new Date(w.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                  </div>
                )}
              </div>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: TONE.sepiaSoft }}>{w.message}</p>
            </article>
          ))}
        </div>
      )}
      <style>{`.m-input{width:100%;border:1px solid ${TONE.gold}55;background:${TONE.bg};padding:11px 14px;font-size:14px;color:${TONE.sepia};border-radius:8px;font-family:inherit}.m-input:focus{outline:none;border-color:${TONE.gold}}`}</style>
    </Section>
  );
}

/* ---------- GIFTS ---------- */

function Gifts({ gifts }: { gifts: InvitationData["gifts"] }) {
  return (
    <Section bg={TONE.whisper}>
      <div className="text-center mb-8">
        <Eyebrow>Tanda Kasih</Eyebrow>
        <SectionTitle>Amplop digital</SectionTitle>
        <p className="mt-5 text-sm leading-relaxed max-w-md mx-auto" style={{ color: TONE.sepiaSoft }}>
          Tanpa mengurangi rasa hormat, bila berkenan menambahkan tanda kasih dapat melalui rekening di bawah ini.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {gifts.map((g, i) => <GiftCard key={g.id ?? i} g={g} />)}
      </div>
    </Section>
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
    <div className="w-full md:w-[320px] p-6" style={{ background: TONE.cream, borderRadius: 14, border: `1px solid ${TONE.gold}55`, boxShadow: `0 10px 28px -18px ${TONE.sepia}44` }}>
      <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.gold }}>{g.kind}</div>
      <div className="font-serif text-2xl mt-1" style={{ color: TONE.sepia }}>{g.bankName}</div>
      <div className="text-xs mt-1" style={{ color: TONE.sepiaSoft }}>a.n. {g.holder}</div>
      <div className="mt-4 font-mono text-base tracking-[0.08em]" style={{ color: TONE.sepia }}>{g.number}</div>
      <button onClick={copy} className="mt-3 text-[10px] tracking-[0.25em] uppercase px-3 py-1.5" style={{ background: TONE.sepia, color: TONE.cream, borderRadius: 999 }}>
        {copied ? "Tersalin ✓" : "Salin Nomor"}
      </button>
    </div>
  );
}

/* ---------- CLOSING ---------- */

function Closing({ data }: { data: InvitationData }) {
  const closing = data.closingSalutation ?? "Wassalamu'alaikum Warahmatullahi Wabarakatuh";
  return (
    <Section bg={TONE.sepia} className="text-center">
      <Monogram a={data.couple.brideShort} b={data.couple.groomShort} color={TONE.warmGold} size={50} />
      <div className="mt-4">
        <Eyebrow color={TONE.warmGold}>Salam Penutup</Eyebrow>
      </div>
      <p className="font-serif italic mt-6 max-w-2xl mx-auto" style={{ color: TONE.cream, fontSize: "clamp(20px, 3vw, 28px)", lineHeight: 1.55 }}>
        Merupakan suatu kehormatan dan kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
      </p>
      {closing && (
        <div className="mt-9 text-sm" style={{ color: TONE.warmGold }}>{closing}</div>
      )}
      <div className="mt-1 text-sm" style={{ color: TONE.warmGold }}>Hormat kami,</div>
      <div className="font-serif mt-4" style={{ color: TONE.cream, fontSize: "clamp(40px, 8vw, 72px)", lineHeight: 1 }}>
        {data.couple.brideShort} <span style={{ color: TONE.warmGold }}>&amp;</span> {data.couple.groomShort}
      </div>
      <div className="text-[10px] tracking-[0.3em] uppercase mt-3" style={{ color: TONE.warmGold }}>Beserta Keluarga</div>

      <a href="/" className="mt-12 inline-flex items-center gap-2 text-xs hover:opacity-100 transition" style={{ color: TONE.warmGold, opacity: 0.7 }}>
        <img src="/logo.png" alt="weddQ" style={{ height: 22, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
        Dibuat dengan weddQ
      </a>
    </Section>
  );
}
