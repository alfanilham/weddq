import { FormEvent, useEffect, useRef, useState, ReactNode } from "react";
import { api, extractError } from "@/lib/api";
import { InvitationData } from "./InvitationRender";
import { StoryChapters } from "./StoryChapters";

/* Lumina — Modern minimalist luxe.
   Ivory + charcoal + champagne-gold. Generous whitespace, thin gold hairlines,
   a slowly rotating aura accent, and gentle scroll reveals. Exclusive tier. */

const TONE = {
  bg: "#FBFAF7",
  paper: "#FFFFFF",
  whisper: "#F1EEE7",
  ink: "#1B1A16",
  inkSoft: "#6A655B",
  gold: "#B08D57",
  goldSoft: "#CDB089",
  goldDeep: "#967641",
  line: "#E7E2D7",
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
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  return { d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) };
}

/* Scroll reveal */
function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (setShown(true), io.disconnect())), { threshold: 0.16 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(26px)", transition: `opacity 1s ease ${delay}ms, transform 1.1s cubic-bezier(0.2,0.7,0.2,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

/* Rotating champagne aura accent */
function Aura({ size = 220, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`} style={{ width: size, height: size }} aria-hidden>
      <div className="lum-aura w-full h-full rounded-full" style={{
        background: `conic-gradient(from 0deg, transparent, ${TONE.goldSoft}88, transparent 35%, ${TONE.gold}66, transparent 70%, ${TONE.goldSoft}88, transparent)`,
        filter: "blur(14px)", opacity: 0.7,
      }} />
    </div>
  );
}

function Mark({ a, b, color = TONE.gold, size = 64 }: { a: string; b: string; color?: string; size?: number }) {
  return (
    <div className="inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="relative flex items-center justify-center w-full h-full">
        <span className="absolute inset-0 rounded-full" style={{ border: `1px solid ${color}55` }} />
        <span className="absolute" style={{ width: 6, height: 6, top: -3, left: "50%", transform: "translateX(-50%) rotate(45deg)", border: `1px solid ${color}`, background: TONE.bg }} />
        <span className="font-serif italic" style={{ color, fontSize: size * 0.42, lineHeight: 1 }}>{a[0]}{b[0]}</span>
      </div>
    </div>
  );
}

function Eyebrow({ children, color = TONE.gold }: { children: ReactNode; color?: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="h-px w-10" style={{ background: color, opacity: 0.5 }} />
      <span className="text-[10px] tracking-[0.45em] uppercase font-medium" style={{ color }}>{children}</span>
      <span className="h-px w-10" style={{ background: color, opacity: 0.5 }} />
    </div>
  );
}
function Title({ children, color = TONE.ink }: { children: ReactNode; color?: string }) {
  return <h2 className="font-serif mt-4" style={{ color, fontSize: "clamp(32px, 6vw, 50px)", lineHeight: 1.08, letterSpacing: "-0.015em" }}>{children}</h2>;
}
function Section({ bg = TONE.bg, children, className = "" }: { bg?: string; children: ReactNode; className?: string }) {
  return <section className={`relative px-5 py-16 md:py-20 ${className}`} style={{ background: bg }}><div className="max-w-3xl mx-auto">{children}</div></section>;
}

/* ---------- MAIN ---------- */

export function LuminaRender({ data, interactive = false }: { data: InvitationData; interactive?: boolean }) {
  const [opened, setOpened] = useState(false);
  const primary = data.events[0]?.date ?? new Date().toISOString();
  return (
    <div style={{ background: TONE.bg, color: TONE.ink }} className="font-sans">
      <style>{`
        @keyframes lum-spin { to { transform: rotate(360deg); } }
        @keyframes lum-float { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-9px) } }
        .lum-aura { animation: lum-spin 22s linear infinite; }
        .lum-float { animation: lum-float 6s ease-in-out infinite; }
        .lum-input{ width:100%; border:1px solid ${TONE.line}; background:${TONE.paper}; padding:12px 14px; font-size:14px; color:${TONE.ink}; border-radius:10px; font-family:inherit }
        .lum-input:focus{ outline:none; border-color:${TONE.gold} }
      `}</style>
      {!opened ? (
        <Cover data={data} onOpen={() => setOpened(true)} />
      ) : (
        <div className="weddq-reveal">
          {data.quote && <Opening data={data} />}
          <Couple data={data} />
          <DateMoment primary={primary} couple={data.couple} />
          <Events events={data.events} />
          {((data.storyChapters && data.storyChapters.length > 0) || data.story) && (
            <StoryChapters chapters={data.storyChapters} story={data.story} gallery={data.gallery}
              theme={{ bg: TONE.whisper, fg: TONE.ink, fgSoft: TONE.inkSoft, accent: TONE.gold, rule: TONE.gold, card: TONE.paper, variant: "light" }} />
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
  const cover = data.coverImage || data.couple.bridePhoto || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80";
  const dp = parts(data.events[0]?.date ?? new Date().toISOString());
  const guestName = data.guestName ?? null;
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center px-5 py-12 overflow-hidden">
      <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${TONE.ink}b3 0%, ${TONE.ink}80 45%, ${TONE.ink}e6 100%)` }} />
      <Aura size={300} className="absolute top-[14%] left-1/2 -translate-x-1/2 opacity-60" />
      <div className="relative w-full max-w-xl mx-auto text-center" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.55)" }}>
        <div className="lum-float inline-block"><Mark a={data.couple.brideShort} b={data.couple.groomShort} color={TONE.goldSoft} size={70} /></div>
        <div className="mt-7"><Eyebrow color={TONE.goldSoft}>{data.eyebrow}</Eyebrow></div>
        <h1 className="font-serif mt-7" style={{ color: TONE.paper, fontSize: "clamp(42px, 9vw, 70px)", lineHeight: 1.02, letterSpacing: "0.01em" }}>
          {data.couple.brideShort}
          <span className="block font-serif italic my-1" style={{ color: TONE.goldSoft, fontSize: "0.42em" }}>&amp;</span>
          {data.couple.groomShort}
        </h1>
        <div className="mt-7 flex items-center justify-center gap-3 text-[11px] tracking-[0.4em] uppercase" style={{ color: `${TONE.paper}cc` }}>
          <span>{dp.day}</span><span style={{ color: TONE.goldSoft }}>·</span><span>{dp.month}</span><span style={{ color: TONE.goldSoft }}>·</span><span>{dp.year}</span>
        </div>
        {guestName && (
          <div className="mt-8 flex justify-center">
            <div className="px-6 py-3.5 rounded-xl" style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${TONE.goldSoft}66`, backdropFilter: "blur(6px)" }}>
              <div className="text-[10px] tracking-[0.32em] uppercase" style={{ color: TONE.goldSoft }}>Kepada Yang Terhormat</div>
              <div className="font-serif text-xl mt-1" style={{ color: TONE.paper }}>{guestName}</div>
            </div>
          </div>
        )}
        <div className="mt-9 flex justify-center">
          <button onClick={onOpen} className="group inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-[11px] tracking-[0.35em] uppercase transition hover:scale-105" style={{ background: TONE.goldSoft, color: TONE.ink }}>
            Buka Undangan <span className="transition group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- OPENING ---------- */
function Opening({ data }: { data: InvitationData }) {
  return (
    <Section bg={TONE.paper} className="text-center">
      <Reveal>
        <Eyebrow>Pembuka</Eyebrow>
        <p className="font-serif italic mt-7 max-w-2xl mx-auto" style={{ color: TONE.ink, fontSize: "clamp(20px, 3vw, 30px)", lineHeight: 1.55 }}>“{data.quote}”</p>
      </Reveal>
    </Section>
  );
}

/* ---------- COUPLE ---------- */
function Couple({ data }: { data: InvitationData }) {
  return (
    <Section bg={TONE.bg}>
      <Reveal className="text-center mb-12"><Eyebrow>Mempelai</Eyebrow><Title>Dua menjadi satu</Title></Reveal>
      <div className="grid md:grid-cols-2 gap-6">
        <Reveal><CoupleCard role="Mempelai Putri" person={{ name: data.couple.brideName, short: data.couple.brideShort, parents: data.couple.brideParents, ig: data.couple.brideInstagram, photo: data.couple.bridePhoto }} /></Reveal>
        <Reveal delay={120}><CoupleCard role="Mempelai Putra" person={{ name: data.couple.groomName, short: data.couple.groomShort, parents: data.couple.groomParents, ig: data.couple.groomInstagram, photo: data.couple.groomPhoto }} /></Reveal>
      </div>
    </Section>
  );
}
function CoupleCard({ role, person }: { role: string; person: { name: string; short: string; parents?: string | null; ig?: string | null; photo?: string | null } }) {
  return (
    <article className="p-8 text-center" style={{ background: TONE.paper, borderRadius: 20, border: `1px solid ${TONE.line}`, boxShadow: `0 18px 44px -28px ${TONE.ink}26` }}>
      <div className="relative mx-auto" style={{ width: 150, height: 150 }}>
        <Aura size={188} className="absolute -inset-[19px] opacity-50" />
        <div className="relative w-full h-full overflow-hidden rounded-full" style={{ border: `1px solid ${TONE.gold}55` }}>
          {person.photo ? <img src={person.photo} alt={person.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-serif text-5xl" style={{ background: TONE.whisper, color: TONE.gold }}>{person.short[0]}</div>}
        </div>
      </div>
      <div className="mt-6 text-[10px] tracking-[0.4em] uppercase font-medium" style={{ color: TONE.gold }}>{role}</div>
      <h3 className="font-serif mt-2" style={{ color: TONE.ink, fontSize: 30, lineHeight: 1.1 }}>{person.short}</h3>
      <p className="text-sm italic mt-1" style={{ color: TONE.inkSoft }}>{person.name}</p>
      {person.parents && <p className="mt-4 text-xs leading-relaxed" style={{ color: TONE.inkSoft }}>{person.parents}</p>}
      {person.ig && (
        <a href={`https://instagram.com/${person.ig.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase" style={{ color: TONE.gold }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>
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
    <Section bg={TONE.ink} className="text-center overflow-hidden">
      <Aura size={360} className="absolute -top-24 left-1/2 -translate-x-1/2 opacity-40" />
      <Reveal className="relative">
        <div className="lum-float inline-block"><Mark a={couple.brideShort} b={couple.groomShort} color={TONE.goldSoft} size={56} /></div>
        <div className="mt-5"><Eyebrow color={TONE.goldSoft}>Menuju Hari Bahagia</Eyebrow></div>
        <div className="font-serif mt-6" style={{ color: TONE.paper, fontSize: "clamp(76px, 14vw, 132px)", lineHeight: 1 }}>{dp.day}</div>
        <div className="font-serif italic mt-2" style={{ color: TONE.paper, fontSize: 22 }}>{dp.month} {dp.year}</div>
        <div className="text-[11px] tracking-[0.35em] uppercase mt-2" style={{ color: TONE.goldSoft }}>{dp.weekday}</div>
        <div className="mt-10 grid grid-cols-4 gap-3 max-w-md mx-auto">
          {[["Hari", cd.d], ["Jam", cd.h], ["Menit", cd.m], ["Detik", cd.s]].map(([l, v]) => (
            <div key={l as string} className="text-center py-4 px-2 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${TONE.goldSoft}33` }}>
              <div className="font-serif text-2xl md:text-3xl tabular-nums" style={{ color: TONE.paper }}>{String(v).padStart(2, "0")}</div>
              <div className="text-[10px] tracking-[0.25em] uppercase mt-1" style={{ color: TONE.goldSoft }}>{l}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- EVENTS ---------- */
function Events({ events }: { events: InvitationData["events"] }) {
  return (
    <Section bg={TONE.bg}>
      <Reveal className="text-center mb-12"><Eyebrow>Rangkaian Acara</Eyebrow><Title>Susunan acara</Title></Reveal>
      <div className="space-y-5">
        {events.map((e, i) => {
          const dp = parts(e.date);
          return (
            <Reveal key={e.id ?? i} delay={i * 80}>
              <article className="p-7 grid md:grid-cols-[auto_1fr] gap-6 items-start" style={{ background: TONE.paper, borderRadius: 18, border: `1px solid ${TONE.line}`, boxShadow: `0 16px 38px -28px ${TONE.ink}22` }}>
                <div className="text-center px-5 py-4 self-center rounded-xl" style={{ background: TONE.ink, color: TONE.paper }}>
                  <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.goldSoft }}>{dp.monthShort}</div>
                  <div className="font-serif text-4xl leading-none mt-1">{dp.day}</div>
                  <div className="text-[10px] opacity-70 mt-1">{dp.year}</div>
                </div>
                <div>
                  <div className="text-[10px] tracking-[0.35em] uppercase" style={{ color: TONE.gold }}>{e.kind}</div>
                  <h3 className="font-serif mt-1" style={{ color: TONE.ink, fontSize: 26 }}>{e.title}</h3>
                  <p className="text-sm mt-2" style={{ color: TONE.inkSoft }}>{dp.weekday} · {fmtTime(e.date)}{e.endTime ? `–${fmtTime(e.endTime)}` : ""} WIB</p>
                  <p className="text-sm font-medium mt-3" style={{ color: TONE.ink }}>{e.venueName}</p>
                  <p className="text-sm" style={{ color: TONE.inkSoft }}>{e.address}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {e.dressCode && <span className="text-[10px] tracking-[0.22em] uppercase px-3 py-1 rounded-full" style={{ background: TONE.whisper, color: TONE.inkSoft }}>Dresscode: {e.dressCode}</span>}
                    {e.mapUrl && <a href={e.mapUrl} target="_blank" rel="noreferrer" className="text-[10px] tracking-[0.22em] uppercase px-4 py-1.5 inline-flex items-center gap-1.5 rounded-full" style={{ background: TONE.gold, color: TONE.paper }}>Lihat Peta <span>→</span></a>}
                  </div>
                </div>
              </article>
            </Reveal>
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
      <Reveal className="text-center mb-12"><Eyebrow>Galeri</Eyebrow><Title>Momen kami</Title></Reveal>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {gallery.map((g, i) => (
          <Reveal key={g.id ?? i} delay={(i % 3) * 70}>
            <button onClick={() => setLightbox(g.url)} className="relative overflow-hidden group aspect-[3/4] w-full rounded-xl" style={{ border: `1px solid ${TONE.line}`, background: TONE.paper }}>
              <img src={g.url} alt={g.caption ?? ""} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
            </button>
          </Reveal>
        ))}
      </div>
      {lightbox && <div onClick={() => setLightbox(null)} className="fixed inset-0 z-50 flex items-center justify-center p-6 cursor-zoom-out" style={{ background: "rgba(20,19,16,0.94)" }}><img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-xl" /></div>}
    </Section>
  );
}

/* ---------- RSVP ---------- */
function Rsvp({ data, interactive }: { data: InvitationData; interactive: boolean }) {
  const known = !!data.guestName && !!data.guestSlug;
  const [form, setForm] = useState({ name: data.guestName ?? "", status: "HADIR", pax: 1, session: data.guestInvitedTo ?? "", message: "" });
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!interactive) { setDone(true); return; }
    setBusy(true); setErr(null);
    try {
      const payload = known ? { guestSlug: data.guestSlug, status: form.status, message: form.message } : form;
      await api.post(`/rsvp/public/${data.slug}`, payload);
      setDone(true);
    } catch (e) { setErr(extractError(e)); } finally { setBusy(false); }
  }
  const STATUS = [{ id: "HADIR", label: "Hadir" }, { id: "TIDAK", label: "Tidak Hadir" }, { id: "RAGU", label: "Masih Ragu" }];
  return (
    <Section bg={TONE.ink} className="text-center">
      <Reveal>
        <Eyebrow color={TONE.goldSoft}>Konfirmasi Kehadiran</Eyebrow>
        <Title color={TONE.paper}>RSVP</Title>
        <p className="mt-5 text-sm leading-relaxed max-w-md mx-auto mb-8" style={{ color: TONE.goldSoft }}>
          {known ? <>Halo <span className="italic font-medium" style={{ color: TONE.paper }}>{data.guestName}</span>, mohon konfirmasikan kehadiran Anda.</> : "Mohon konfirmasikan kehadiran Anda agar kami dapat menyiapkan tempat sebaik-baiknya."}
        </p>
        {done ? (
          <div className="max-w-md mx-auto p-9 rounded-2xl" style={{ background: TONE.paper }}>
            <div className="font-serif text-2xl" style={{ color: TONE.ink }}>Terima kasih.</div>
            <p className="text-sm mt-2" style={{ color: TONE.inkSoft }}>Konfirmasi Anda telah kami terima.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4 max-w-md mx-auto p-7 text-left rounded-2xl" style={{ background: TONE.paper }}>
            {!known && <Field label="Nama lengkap"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="lum-input" /></Field>}
            {known ? (
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase mb-3 text-center" style={{ color: TONE.gold }}>Kehadiran Anda</div>
                <div className="grid grid-cols-3 gap-2">
                  {STATUS.map((s) => { const active = form.status === s.id; return (
                    <button key={s.id} type="button" onClick={() => setForm({ ...form, status: s.id })} className="text-xs py-3 rounded-lg transition" style={{ border: `1px solid ${TONE.ink}`, background: active ? TONE.ink : "transparent", color: active ? TONE.paper : TONE.ink }}>{s.label}</button>
                  ); })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Kehadiran"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="lum-input"><option value="HADIR">Hadir</option><option value="TIDAK">Tidak Hadir</option><option value="RAGU">Masih Ragu</option></select></Field>
                <Field label="Jumlah tamu"><input type="number" min={1} max={6} value={form.pax} onChange={(e) => setForm({ ...form, pax: Number(e.target.value) })} className="lum-input" /></Field>
              </div>
            )}
            <Field label="Pesan untuk Mempelai (opsional)"><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="lum-input" /></Field>
            {err && <div className="text-sm" style={{ color: "#9a3030" }}>{err}</div>}
            <button type="submit" disabled={busy} className="py-3 rounded-full text-[11px] tracking-[0.32em] uppercase mt-1" style={{ background: TONE.gold, color: TONE.paper }}>{busy ? "Mengirim…" : "Kirim Konfirmasi"}</button>
          </form>
        )}
      </Reveal>
    </Section>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><div className="text-[10px] tracking-[0.3em] uppercase mb-1.5" style={{ color: TONE.gold }}>{label}</div>{children}</label>;
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
    try { const res = await api.post(`/wishes/public/${slug}`, form); setList([res.data, ...list]); setForm({ name: "", message: "" }); } catch {} finally { setBusy(false); }
  }
  return (
    <Section bg={TONE.bg}>
      <Reveal className="text-center mb-8"><Eyebrow>Buku Tamu</Eyebrow><Title>Doa &amp; ucapan</Title></Reveal>
      <form onSubmit={submit} className="grid gap-3 mb-8 p-6 max-w-md mx-auto rounded-2xl" style={{ background: TONE.paper, border: `1px solid ${TONE.line}` }}>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama Anda" className="lum-input" />
        <textarea required rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tuliskan doa & ucapan terbaik Anda…" className="lum-input" />
        <button disabled={busy} className="py-3 rounded-full text-[11px] tracking-[0.32em] uppercase" style={{ background: TONE.ink, color: TONE.paper }}>{busy ? "Mengirim…" : "Kirim Ucapan"}</button>
      </form>
      {list.length === 0 ? (
        <div className="text-center text-sm py-6" style={{ color: TONE.inkSoft }}>Belum ada ucapan. Jadilah yang pertama menulis.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
          {list.map((w, i) => (
            <article key={w.id ?? i} className="p-5 rounded-xl" style={{ background: TONE.paper, border: `1px solid ${TONE.line}` }}>
              <div className="flex items-baseline justify-between">
                <div className="font-serif text-lg" style={{ color: TONE.ink }}>{w.name}</div>
                {w.createdAt && <div className="text-[10px]" style={{ color: TONE.inkSoft }}>{new Date(w.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}</div>}
              </div>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: TONE.inkSoft }}>{w.message}</p>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}

/* ---------- GIFTS ---------- */
function Gifts({ gifts }: { gifts: InvitationData["gifts"] }) {
  return (
    <Section bg={TONE.whisper}>
      <Reveal className="text-center mb-8">
        <Eyebrow>Tanda Kasih</Eyebrow><Title>Amplop digital</Title>
        <p className="mt-5 text-sm leading-relaxed max-w-md mx-auto" style={{ color: TONE.inkSoft }}>Tanpa mengurangi rasa hormat, bila berkenan menambahkan tanda kasih dapat melalui rekening di bawah ini.</p>
      </Reveal>
      <div className="flex flex-wrap justify-center gap-4">
        {gifts.map((g, i) => <Reveal key={g.id ?? i} delay={i * 90} className="w-full md:w-[320px]"><GiftCard g={g} /></Reveal>)}
      </div>
    </Section>
  );
}
function GiftCard({ g }: { g: { kind: string; bankName: string; number: string; holder: string } }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="p-6 rounded-2xl h-full" style={{ background: TONE.paper, border: `1px solid ${TONE.line}`, boxShadow: `0 12px 30px -20px ${TONE.ink}33` }}>
      <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.gold }}>{g.kind}</div>
      <div className="font-serif text-2xl mt-1" style={{ color: TONE.ink }}>{g.bankName}</div>
      <div className="text-xs mt-1" style={{ color: TONE.inkSoft }}>a.n. {g.holder}</div>
      <div className="mt-4 font-mono text-base tracking-[0.08em]" style={{ color: TONE.ink }}>{g.number}</div>
      <button onClick={() => navigator.clipboard.writeText(g.number).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })} className="mt-3 text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 rounded-full" style={{ background: TONE.ink, color: TONE.paper }}>{copied ? "Tersalin ✓" : "Salin Nomor"}</button>
    </div>
  );
}

/* ---------- CLOSING ---------- */
function Closing({ data }: { data: InvitationData }) {
  const closing = data.closingSalutation ?? "Wassalamu'alaikum Warahmatullahi Wabarakatuh";
  return (
    <Section bg={TONE.ink} className="text-center overflow-hidden">
      <Aura size={360} className="absolute -bottom-28 left-1/2 -translate-x-1/2 opacity-35" />
      <Reveal className="relative">
        <div className="lum-float inline-block"><Mark a={data.couple.brideShort} b={data.couple.groomShort} color={TONE.goldSoft} size={60} /></div>
        <div className="mt-5"><Eyebrow color={TONE.goldSoft}>Salam Penutup</Eyebrow></div>
        <p className="font-serif italic mt-6 max-w-2xl mx-auto" style={{ color: TONE.paper, fontSize: "clamp(20px, 3vw, 28px)", lineHeight: 1.55 }}>Merupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.</p>
        {closing && <div className="mt-9 text-sm" style={{ color: TONE.goldSoft }}>{closing}</div>}
        <div className="mt-1 text-sm" style={{ color: TONE.goldSoft }}>Hormat kami,</div>
        <div className="font-serif mt-4" style={{ color: TONE.paper, fontSize: "clamp(40px, 8vw, 72px)", lineHeight: 1 }}>{data.couple.brideShort} <span style={{ color: TONE.goldSoft }}>&amp;</span> {data.couple.groomShort}</div>
        <div className="text-[10px] tracking-[0.3em] uppercase mt-3" style={{ color: TONE.goldSoft }}>Beserta Keluarga</div>
        <a href="/" className="mt-12 inline-flex items-center gap-2 text-xs hover:opacity-100 transition" style={{ color: TONE.goldSoft, opacity: 0.7 }}>
          <img src="/logo.png" alt="weddQ" style={{ height: 22, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          Dibuat dengan weddQ
        </a>
      </Reveal>
    </Section>
  );
}
