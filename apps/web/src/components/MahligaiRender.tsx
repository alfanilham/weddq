import { FormEvent, useEffect, useState } from "react";
import { api, extractError } from "@/lib/api";
import { InvitationData } from "./InvitationRender";
import { StoryChapters } from "./StoryChapters";

/* Mahligai — Modern Editorial layout.
   Distinct from Sekar Kencana: split-cover, alternating asymmetric blocks,
   vertical timeline events, horizontal-scroll gallery, oversized typography. */

const TONE = {
  bg: "#FCF7EB",        // paper
  ink: "#1F1A14",       // darker ink for editorial contrast
  inkSoft: "#6B5A48",
  rule: "#1F1A14",
  accent: "#B57341",    // warm copper
  paper: "#F4EAD5",
  whisper: "#E8DAB8",
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

export function MahligaiRender({ data, interactive = false }: { data: InvitationData; interactive?: boolean }) {
  const [opened, setOpened] = useState(false);
  const primary = data.events[0]?.date ?? new Date().toISOString();

  return (
    <div style={{ background: TONE.bg, color: TONE.ink }} className="font-sans">
      {!opened ? (
        <Cover data={data} onOpen={() => setOpened(true)} />
      ) : (
        <>
          <Masthead data={data} primary={primary} />
          <Opening data={data} />
          <Couple data={data} />
          <DateMoment primary={primary} />
          <Timeline events={data.events} />
          {((data.storyChapters && data.storyChapters.length > 0) || data.story) && (
            <StoryChapters
              chapters={data.storyChapters}
              story={data.story}
              gallery={data.gallery}
              theme={{
                bg: TONE.bg,
                fg: TONE.ink,
                fgSoft: TONE.inkSoft,
                accent: TONE.accent,
                rule: TONE.accent,
                card: TONE.paper,
                variant: "light",
              }}
            />
          )}
          {data.gallery.length > 0 && <Filmstrip gallery={data.gallery} />}
          <Rsvp data={data} interactive={interactive} />
          <Wishes slug={data.slug} initial={data.wishes ?? []} interactive={interactive} />
          {data.gifts.length > 0 && <Gifts gifts={data.gifts} />}
          <Closing data={data} />
        </>
      )}
    </div>
  );
}

/* ---------- COVER (split editorial) ---------- */

function Cover({ data, onOpen }: { data: InvitationData; onOpen: () => void }) {
  const cover = data.coverImage || data.couple.bridePhoto || "https://images.unsplash.com/photo-1606490194859-07c18c9f0968?w=1600";
  const dp = parts(data.events[0]?.date ?? new Date().toISOString());
  const guestName = data.guestName ?? null;

  return (
    <section className="min-h-[100svh] flex items-center justify-center px-5 py-10" style={{ background: TONE.bg }}>
      <div className="w-full max-w-xl mx-auto text-center">
        {/* Photo card */}
        <div
          className="relative mx-auto overflow-hidden"
          style={{
            width: "100%",
            maxWidth: 360,
            aspectRatio: "4 / 5",
            borderRadius: 16,
            boxShadow: `0 30px 60px -28px ${TONE.ink}66`,
          }}
        >
          <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, transparent 55%, ${TONE.ink}55 100%)` }}
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[9px] tracking-[0.35em] uppercase" style={{ color: TONE.bg }}>
            <span>{dp.weekday}</span>
            <span>{dp.year}</span>
          </div>
        </div>

        {/* Eyebrow */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <span className="w-8 h-px" style={{ background: TONE.accent }} />
          <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.accent }}>{data.eyebrow}</span>
          <span className="w-8 h-px" style={{ background: TONE.accent }} />
        </div>

        {/* Names */}
        <h1 className="font-serif mt-6" style={{ color: TONE.ink, fontSize: "clamp(40px, 9vw, 64px)", lineHeight: 1, letterSpacing: "-0.01em" }}>
          {data.couple.brideShort}
        </h1>
        <div className="font-serif italic my-1" style={{ color: TONE.accent, fontSize: "clamp(22px, 4vw, 30px)" }}>&amp;</div>
        <h1 className="font-serif" style={{ color: TONE.ink, fontSize: "clamp(40px, 9vw, 64px)", lineHeight: 1, letterSpacing: "-0.01em" }}>
          {data.couple.groomShort}
        </h1>

        {/* Date */}
        <div className="mt-8 flex items-center justify-center gap-3 text-[11px] tracking-[0.32em] uppercase" style={{ color: TONE.inkSoft }}>
          <span>{dp.day}</span>
          <span style={{ color: TONE.accent }}>·</span>
          <span>{dp.month}</span>
          <span style={{ color: TONE.accent }}>·</span>
          <span>{dp.year}</span>
        </div>

        {/* Guest box */}
        {guestName && (
          <div className="mt-10 flex justify-center">
            <div className="px-6 py-4 border" style={{ borderColor: TONE.rule + "55", background: TONE.paper, borderRadius: 12 }}>
              <div className="text-[10px] tracking-[0.32em] uppercase" style={{ color: TONE.accent }}>Kepada Yang Terhormat</div>
              <div className="font-serif text-xl mt-1.5" style={{ color: TONE.ink }}>{guestName}</div>
            </div>
          </div>
        )}

        {/* Open button */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={onOpen}
            className="group inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-[11px] tracking-[0.3em] uppercase transition hover:scale-105"
            style={{ background: TONE.ink, color: TONE.bg }}
          >
            Buka Undangan
            <span className="transition group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- MASTHEAD (newspaper banner) ---------- */

function Masthead({ data, primary }: { data: InvitationData; primary: string }) {
  const dp = parts(primary);
  return (
    <div className="border-b border-t" style={{ borderColor: TONE.rule }}>
      <div className="max-w-3xl mx-auto px-5 flex items-center justify-between py-3 text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.inkSoft }}>
        <span>{data.eyebrow}</span>
        <span className="font-serif text-base tracking-normal normal-case" style={{ color: TONE.ink }}>
          {data.couple.brideShort} &amp; {data.couple.groomShort}
        </span>
        <span>{dp.day} {dp.monthShort} {dp.year}</span>
      </div>
    </div>
  );
}

/* ---------- OPENING (oversized pull-quote) ---------- */

function Opening({ data }: { data: InvitationData }) {
  if (!data.quote) return null;
  return (
    <section className="max-w-3xl mx-auto px-5 py-24 grid md:grid-cols-[1fr_3fr] gap-10 items-start">
      <div>
        <div className="text-[10px] tracking-[0.35em] uppercase" style={{ color: TONE.accent }}>Pembuka</div>
        <div className="mt-3 text-xs leading-relaxed" style={{ color: TONE.inkSoft }}>
          Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan pernikahan putra-putri kami.
        </div>
      </div>
      <blockquote className="relative">
        <span className="absolute -top-8 -left-2 font-serif text-[120px] leading-none opacity-20" style={{ color: TONE.accent }}>“</span>
        <p className="font-serif text-2xl md:text-4xl leading-[1.25] relative" style={{ color: TONE.ink }}>
          {data.quote}
        </p>
      </blockquote>
    </section>
  );
}

/* ---------- COUPLE (alternating large blocks) ---------- */

function Couple({ data }: { data: InvitationData }) {
  return (
    <section className="border-y py-20" style={{ borderColor: TONE.rule + "22" }}>
      <div className="max-w-3xl mx-auto px-5 space-y-16">
        <CoupleBlock side="bride" data={data} />
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-12" style={{ background: TONE.accent, opacity: 0.4 }} />
          <span className="font-serif italic text-2xl" style={{ color: TONE.accent }}>&amp;</span>
          <span className="h-px w-12" style={{ background: TONE.accent, opacity: 0.4 }} />
        </div>
        <CoupleBlock side="groom" data={data} />
      </div>
    </section>
  );
}

function CoupleBlock({ side, data }: { side: "bride" | "groom"; data: InvitationData }) {
  const isBride = side === "bride";
  const name = isBride ? data.couple.brideName : data.couple.groomName;
  const short = isBride ? data.couple.brideShort : data.couple.groomShort;
  const parents = isBride ? data.couple.brideParents : data.couple.groomParents;
  const ig = isBride ? data.couple.brideInstagram : data.couple.groomInstagram;
  const photo = isBride ? data.couple.bridePhoto : data.couple.groomPhoto;

  const photoBlock = (
    <div className="relative overflow-hidden mx-auto" style={{ background: TONE.whisper, width: "100%", maxWidth: 240, aspectRatio: "3 / 4", borderRadius: 12 }}>
      {photo ? (
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-serif text-7xl" style={{ color: TONE.accent }}>
          {short[0]}
        </div>
      )}
    </div>
  );

  const textBlock = (
    <div className={`flex flex-col justify-center ${isBride ? "md:text-left" : "md:text-right md:items-end"} text-center`}>
      <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.accent }}>
        {isBride ? "Calon Mempelai Putri" : "Calon Mempelai Putra"}
      </span>
      <h2 className="font-serif text-4xl md:text-5xl leading-[0.95] mt-3" style={{ color: TONE.ink }}>{short}</h2>
      <div className="font-serif text-base md:text-lg italic mt-2" style={{ color: TONE.inkSoft }}>{name}</div>
      {parents && (
        <p className="mt-5 text-sm leading-relaxed max-w-sm" style={{ color: TONE.inkSoft }}>{parents}</p>
      )}
      {ig && (
        <a
          href={`https://instagram.com/${ig.replace(/^@/, "")}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-mono"
          style={{ color: TONE.accent }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
          </svg>
          {ig}
        </a>
      )}
    </div>
  );

  return (
    <div className={`grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-center ${isBride ? "" : "md:[direction:rtl]"}`}>
      <div className={isBride ? "" : "md:[direction:ltr]"}>{photoBlock}</div>
      <div className={isBride ? "" : "md:[direction:ltr]"}>{textBlock}</div>
    </div>
  );
}

/* ---------- DATE MOMENT (typographic hero) ---------- */

function DateMoment({ primary }: { primary: string }) {
  const cd = useCountdown(primary);
  const dp = parts(primary);
  return (
    <section className="max-w-3xl mx-auto px-5 py-20 text-center">
      <div className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: TONE.accent }}>Menuju Hari Bahagia</div>
      <div className="font-serif leading-none" style={{ color: TONE.ink, fontSize: "clamp(72px, 14vw, 144px)" }}>{dp.day}</div>
      <div className="font-serif text-xl md:text-2xl mt-3" style={{ color: TONE.inkSoft }}>
        {dp.month} {dp.year}
      </div>
      <div className="text-[11px] tracking-[0.32em] uppercase mt-2" style={{ color: TONE.inkSoft }}>{dp.weekday}</div>

      <div className="mt-10 grid grid-cols-4 gap-3 max-w-md mx-auto">
        {[
          ["Hari", cd.d],
          ["Jam", cd.h],
          ["Menit", cd.m],
          ["Detik", cd.s],
        ].map(([l, v]) => (
          <div key={l as string} className="text-center py-4 px-2" style={{ background: TONE.paper, borderRadius: 10 }}>
            <div className="font-serif text-2xl md:text-3xl tabular-nums" style={{ color: TONE.ink }}>
              {String(v).padStart(2, "0")}
            </div>
            <div className="text-[10px] tracking-[0.25em] uppercase mt-1" style={{ color: TONE.inkSoft }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- EVENTS TIMELINE ---------- */

function Timeline({ events }: { events: InvitationData["events"] }) {
  return (
    <section className="max-w-3xl mx-auto px-5 py-20">
      <div className="grid md:grid-cols-[1fr_3fr] gap-10">
        <div>
          <div className="text-[10px] tracking-[0.35em] uppercase" style={{ color: TONE.accent }}>Susunan Acara</div>
          <h2 className="font-serif text-4xl md:text-5xl leading-[1.05] mt-3" style={{ color: TONE.ink }}>
            Detail Pelaksanaan
          </h2>
        </div>
        <div className="relative">
          <div className="absolute left-[28px] md:left-[40px] top-2 bottom-2 w-px" style={{ background: TONE.rule, opacity: 0.3 }} />
          {events.map((e, i) => {
            const dp = parts(e.date);
            return (
              <div key={e.id ?? i} className="relative pl-16 md:pl-24 py-7">
                <div
                  className="absolute left-0 top-7 w-14 md:w-20 text-center"
                  style={{ color: TONE.ink }}
                >
                  <div className="font-serif text-3xl md:text-4xl leading-none">{dp.day}</div>
                  <div className="text-[9px] tracking-[0.3em] uppercase mt-1" style={{ color: TONE.inkSoft }}>{dp.monthShort}</div>
                  <div className="absolute right-[-7px] md:right-[-7px] top-3 w-3 h-3 rounded-full border-2" style={{ borderColor: TONE.accent, background: TONE.bg }} />
                </div>
                <div>
                  <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.accent }}>
                    {e.kind === "AKAD" ? "Akad Nikah" : e.kind === "RESEPSI" ? "Resepsi" : e.title}
                  </div>
                  <h3 className="font-serif text-3xl md:text-4xl mt-2 leading-tight" style={{ color: TONE.ink }}>{e.venueName}</h3>
                  <div className="mt-2 text-sm leading-relaxed" style={{ color: TONE.inkSoft }}>{e.address}</div>
                  <div className="mt-4 flex flex-wrap items-center gap-5 text-xs tracking-[0.2em] uppercase">
                    <span style={{ color: TONE.ink }}>
                      {fmtTime(e.date)} {e.endTime ? `– ${fmtTime(e.endTime)}` : ""} WIB
                    </span>
                    {e.dressCode && <span style={{ color: TONE.inkSoft }}>Dress code: {e.dressCode}</span>}
                  </div>
                  {e.mapUrl && (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={e.mapUrl}
                      className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase border-b pb-1"
                      style={{ color: TONE.ink, borderColor: TONE.ink }}
                    >
                      Lihat Lokasi
                      <span>→</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- GALLERY (horizontal scroll filmstrip) ---------- */

function Filmstrip({ gallery }: { gallery: InvitationData["gallery"] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  return (
    <section className="py-20 border-t" style={{ borderColor: TONE.rule }}>
      <div className="max-w-3xl mx-auto px-5 grid md:grid-cols-[1fr_3fr] gap-10 mb-8">
        <div>
          <div className="text-[10px] tracking-[0.35em] uppercase" style={{ color: TONE.accent }}>Galeri</div>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight mt-3" style={{ color: TONE.ink }}>
            Momen-Momen Kami
          </h2>
        </div>
        <p className="text-sm leading-relaxed self-end max-w-md" style={{ color: TONE.inkSoft }}>
          Geser ke samping untuk melihat seluruh foto. Klik foto untuk memperbesar.
        </p>
      </div>

      <div className="overflow-x-auto pb-4" style={{ scrollSnapType: "x mandatory" }}>
        <div className="flex gap-3 px-4 md:px-8 w-max">
          {gallery.map((g, i) => (
            <button
              key={g.id ?? i}
              onClick={() => setLightbox(g.url)}
              className="relative shrink-0 w-[78vw] sm:w-[420px] md:w-[520px] h-[60vh] md:h-[640px] overflow-hidden group"
              style={{ scrollSnapAlign: "center", background: TONE.whisper }}
            >
              <img src={g.url} alt={g.caption ?? ""} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.3em]" style={{ color: TONE.bg, mixBlendMode: "difference" }}>
                {String(i + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
              </div>
              {g.caption && (
                <div className="absolute bottom-4 left-4 right-4 text-sm" style={{ color: TONE.bg, mixBlendMode: "difference" }}>
                  {g.caption}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 cursor-zoom-out"
          style={{ background: "rgba(0,0,0,0.92)" }}
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

  return (
    <section className="border-t" style={{ borderColor: TONE.rule }}>
      <div className="max-w-3xl mx-auto px-5 py-20 grid md:grid-cols-[1fr_2fr] gap-10">
        <div>
          <div className="text-[10px] tracking-[0.35em] uppercase" style={{ color: TONE.accent }}>Konfirmasi</div>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight mt-3" style={{ color: TONE.ink }}>RSVP</h2>
          {known ? (
            <p className="text-sm mt-5 leading-relaxed max-w-xs" style={{ color: TONE.inkSoft }}>
              Halo <span className="font-serif italic" style={{ color: TONE.ink }}>{data.guestName}</span>, mohon konfirmasikan kehadiran Anda di samping.
            </p>
          ) : (
            <p className="text-sm mt-5 leading-relaxed max-w-xs" style={{ color: TONE.inkSoft }}>
              Mohon konfirmasikan kehadiran Anda agar kami dapat menyiapkan tempat dengan sebaik-baiknya.
            </p>
          )}
        </div>

        {done ? (
          <div className="border-t pt-10" style={{ borderColor: TONE.rule }}>
            <h3 className="font-serif text-3xl" style={{ color: TONE.ink }}>Terima kasih atas konfirmasi Anda.</h3>
            <p className="mt-3 text-sm" style={{ color: TONE.inkSoft }}>Sampai bertemu di hari bahagia kami.</p>
          </div>
        ) : known ? (
          <form onSubmit={submit} className="grid gap-7">
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: TONE.accent }}>Kehadiran Anda</div>
              <div className="grid grid-cols-3 gap-3">
                {STATUS.map((s) => {
                  const active = form.status === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setForm({ ...form, status: s.id })}
                      className="text-xs py-4 transition"
                      style={{
                        border: `1px solid ${TONE.ink}`,
                        background: active ? TONE.ink : "transparent",
                        color: active ? TONE.bg : TONE.ink,
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <EditField label="Pesan untuk mempelai (opsional)">
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="m-input" />
            </EditField>
            {err && <div className="text-sm text-red-700">{err}</div>}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-3 self-start text-xs tracking-[0.3em] uppercase border-b pb-1 transition"
              style={{ color: TONE.ink, borderColor: TONE.ink }}
            >
              {busy ? "Mengirim…" : "Kirim Konfirmasi"} <span>→</span>
            </button>
          </form>
        ) : (
          <form onSubmit={submit} className="grid gap-5">
            <EditField label="Nama lengkap">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="m-input" />
            </EditField>
            <div className="grid grid-cols-2 gap-5">
              <EditField label="Kehadiran">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="m-input">
                  <option value="HADIR">Hadir</option>
                  <option value="TIDAK">Tidak Hadir</option>
                  <option value="RAGU">Masih Ragu</option>
                </select>
              </EditField>
              <EditField label="Jumlah tamu">
                <input type="number" min={1} max={6} value={form.pax} onChange={(e) => setForm({ ...form, pax: Number(e.target.value) })} className="m-input" />
              </EditField>
            </div>
            <EditField label="Sesi (opsional)">
              <input value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} className="m-input" />
            </EditField>
            <EditField label="Pesan untuk mempelai (opsional)">
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="m-input" />
            </EditField>
            {err && <div className="text-sm text-red-700">{err}</div>}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-3 self-start text-xs tracking-[0.3em] uppercase border-b pb-1 transition"
              style={{ color: TONE.ink, borderColor: TONE.ink }}
            >
              {busy ? "Mengirim…" : "Kirim Konfirmasi"} <span>→</span>
            </button>
          </form>
        )}
      </div>
      <style>{`.m-input{width:100%;border:0;border-bottom:1px solid ${TONE.rule}33;background:transparent;padding:10px 0;font-size:16px;font-family:inherit;color:${TONE.ink}}.m-input:focus{outline:none;border-bottom-color:${TONE.accent}}`}</style>
    </section>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: TONE.accent }}>{label}</div>
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
    <section className="border-t" style={{ borderColor: TONE.rule }}>
      <div className="max-w-3xl mx-auto px-5 py-20">
        <div className="grid md:grid-cols-[1fr_2fr] gap-10 mb-10">
          <div>
            <div className="text-[10px] tracking-[0.35em] uppercase" style={{ color: TONE.accent }}>Buku Tamu</div>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight mt-3" style={{ color: TONE.ink }}>
              Doa &amp; Ucapan
            </h2>
          </div>
          <form onSubmit={submit} className="grid gap-4">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama Anda" className="m-input" />
            <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Tuliskan doa & ucapan terbaik Anda…" className="m-input" />
            <button disabled={busy} className="inline-flex items-center gap-3 self-start text-xs tracking-[0.3em] uppercase border-b pb-1" style={{ color: TONE.ink, borderColor: TONE.ink }}>
              {busy ? "Mengirim…" : "Kirim Ucapan"} <span>→</span>
            </button>
          </form>
        </div>

        <div className="border-t" style={{ borderColor: TONE.rule }}>
          {list.length === 0 && (
            <div className="text-center py-10 text-sm" style={{ color: TONE.inkSoft }}>Belum ada ucapan. Jadilah yang pertama menulis.</div>
          )}
          <div className="grid md:grid-cols-2 gap-px" style={{ background: TONE.rule, opacity: 0.15 }}>
            {list.map((w, i) => (
              <article key={w.id ?? i} className="p-7" style={{ background: TONE.bg }}>
                <div className="flex items-baseline justify-between">
                  <div className="font-serif text-xl" style={{ color: TONE.ink }}>{w.name}</div>
                  {w.createdAt && (
                    <div className="text-[10px] font-mono tracking-wider" style={{ color: TONE.inkSoft }}>
                      {new Date(w.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: TONE.inkSoft }}>{w.message}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
      <style>{`.m-input{width:100%;border:0;border-bottom:1px solid ${TONE.rule}33;background:transparent;padding:10px 0;font-size:16px;font-family:inherit;color:${TONE.ink}}.m-input:focus{outline:none;border-bottom-color:${TONE.accent}}`}</style>
    </section>
  );
}

/* ---------- GIFTS ---------- */

function Gifts({ gifts }: { gifts: InvitationData["gifts"] }) {
  return (
    <section className="border-t" style={{ borderColor: TONE.rule }}>
      <div className="max-w-3xl mx-auto px-5 py-20">
        <div className="grid md:grid-cols-[1fr_2fr] gap-10">
          <div>
            <div className="text-[10px] tracking-[0.35em] uppercase" style={{ color: TONE.accent }}>Tanda Kasih</div>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight mt-3" style={{ color: TONE.ink }}>
              Amplop Digital
            </h2>
            <p className="mt-5 max-w-xs text-sm leading-relaxed" style={{ color: TONE.inkSoft }}>
              Tanpa mengurangi rasa hormat, doa restu Anda adalah hadiah paling berarti. Bila berkenan menambahkan tanda kasih, dapat melalui:
            </p>
          </div>
          <div className="grid gap-px" style={{ background: TONE.rule, opacity: 0.2 }}>
            {gifts.map((g, i) => <GiftRow key={g.id ?? i} g={g} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function GiftRow({ g }: { g: { kind: string; bankName: string; number: string; holder: string } }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(g.number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-6" style={{ background: TONE.bg }}>
      <div className="flex items-center gap-5">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: TONE.accent }}>{g.kind}</div>
        <div>
          <div className="font-serif text-2xl" style={{ color: TONE.ink }}>{g.bankName}</div>
          <div className="text-xs mt-0.5" style={{ color: TONE.inkSoft }}>a.n. {g.holder}</div>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="font-mono text-lg tracking-[0.1em]" style={{ color: TONE.ink }}>{g.number}</div>
        <button onClick={copy} className="text-[10px] tracking-[0.25em] uppercase border-b pb-0.5" style={{ color: TONE.ink, borderColor: TONE.ink }}>
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
    <section className="border-t" style={{ borderColor: TONE.rule }}>
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: TONE.accent }}>Salam Penutup</div>
        <p className="font-serif text-3xl md:text-5xl leading-[1.15] mt-6 max-w-3xl mx-auto" style={{ color: TONE.ink }}>
          Merupakan suatu kehormatan dan kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
        </p>
        {closing && (
          <div className="mt-12 text-sm" style={{ color: TONE.inkSoft }}>{closing}</div>
        )}
        <div className="mt-2 text-sm" style={{ color: TONE.inkSoft }}>Hormat kami,</div>
        <div className="font-serif text-4xl md:text-6xl mt-3" style={{ color: TONE.ink }}>
          {data.couple.brideShort} &amp; {data.couple.groomShort}
        </div>
        <div className="text-[10px] tracking-[0.3em] uppercase mt-3" style={{ color: TONE.accent }}>Beserta Keluarga</div>

        <div className="mt-16 inline-flex items-center gap-2 text-xs" style={{ color: TONE.inkSoft }}>
          <img src="/logo.png" alt="weddQ" style={{ height: 22, width: "auto", objectFit: "contain" }} />
          Dibuat dengan weddQ
        </div>
      </div>
    </section>
  );
}
