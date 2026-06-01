import { FormEvent, useEffect, useMemo, useState } from "react";
import { Corner, Divider, Inline, Mark, OrnamentRow } from "./Ornaments";
import { api, extractError } from "@/lib/api";
import { Palette, getPalette, isDarkPalette } from "@/lib/palette";
import { StoryChapters } from "./StoryChapters";

export type InvitationData = {
  slug: string;
  eyebrow: string;
  quote?: string | null;
  story?: string | null;
  coverImage?: string | null;
  couple: {
    brideName: string;
    brideShort: string;
    brideParents?: string | null;
    bridePhoto?: string | null;
    brideInstagram?: string | null;
    groomName: string;
    groomShort: string;
    groomParents?: string | null;
    groomPhoto?: string | null;
    groomInstagram?: string | null;
  };
  events: Array<{
    id?: string;
    kind: string;
    title: string;
    date: string;
    endTime?: string | null;
    venueName: string;
    address: string;
    mapUrl?: string | null;
    dressCode?: string | null;
  }>;
  gallery: Array<{ id?: string; url: string; caption?: string | null }>;
  gifts: Array<{ id?: string; kind: string; bankName: string; number: string; holder: string }>;
  wishes?: Array<{ id?: string; name: string; message: string; createdAt?: string }>;
  storyChapters?: Array<{ id?: string; title: string; body: string; photo?: string | null; order?: number }>;
  openingSalutation?: string | null;
  closingSalutation?: string | null;
  guestName?: string | null;
  guestSlug?: string | null;
  guestInvitedTo?: string | null;
};

/* palette resolved via shared module */

const DEMO_COVER = "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600";
const DEMO_BRIDE_PHOTO = "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=600";
const DEMO_GROOM_PHOTO = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600";

export function demoData(_palette: string, _tplName: string): InvitationData {
  return {
    slug: "preview",
    eyebrow: "The Wedding Of",
    coverImage: DEMO_COVER,
    quote:
      "Dan di antara tanda-tanda kekuasaan-Nya, Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya. (QS. Ar-Rum: 21)",
    story:
      `## PERTEMUAN
Tidak ada yang kebetulan di dunia ini, semua sudah tersusun rapi oleh Sang Maha Kuasa. Kami pertama kali bertemu pada tahun 2016, di sebuah kedai kopi sederhana di sudut kota Yogyakarta. Pertemuan singkat yang ternyata menjadi awal dari segalanya.

## MENJALIN HUBUNGAN
Perjalanan kami dimulai dari sapa sederhana dan kehangatan yang tumbuh perlahan. Tepatnya di bulan September 2018, kami memutuskan untuk saling membuka hati. Waktu demi waktu kami jalani bersama, melewati jarak, perbedaan, dan ujian yang justru membuat hubungan kami semakin kuat.

## LAMARAN
Atas Kehendak-Nya dan restu kedua orang tua, kami melangsungkan acara lamaran pada Desember 2025 dengan penuh rasa syukur dan bahagia. Sebuah janji telah kami ucapkan untuk membangun rumah tangga yang sakinah, mawaddah, warahmah.

## PERNIKAHAN
Akhirnya, kami melangkah ke hari yang selama ini kami panjatkan dalam doa. Bukan karena waktu yang panjang, tapi karena keyakinan yang kuat bahwa cinta yang diridhoi Allah pasti akan menemukan jalannya. Hari ini, kami berjanji untuk mengarungi sisa hidup bersama.`,
    couple: {
      brideName: "Arini Salsabila, S.Ds.",
      brideShort: "Arini",
      brideParents: "Putri pertama dari Bapak Hidayat Surya & Ibu Nurhayati",
      bridePhoto: DEMO_BRIDE_PHOTO,
      brideInstagram: "@arinisalsabila",
      groomName: "Bagas Pradipta, S.T.",
      groomShort: "Bagas",
      groomParents: "Putra kedua dari Bapak Pramono Adi & Ibu Ratna Wulandari",
      groomPhoto: DEMO_GROOM_PHOTO,
      groomInstagram: "@bagaspradipta",
    },
    events: [
      {
        kind: "AKAD",
        title: "Akad Nikah",
        date: "2026-09-07T08:00:00+07:00",
        endTime: "2026-09-07T10:00:00+07:00",
        venueName: "Pendopo Sasana Bhakti",
        address: "Jl. Magelang KM 9, Sleman, Yogyakarta",
        mapUrl: "https://maps.google.com/?q=Pendopo+Sasana+Bhakti+Yogyakarta",
        dressCode: "Beskap & Kebaya Krem",
      },
      {
        kind: "RESEPSI",
        title: "Resepsi Pernikahan",
        date: "2026-09-07T18:00:00+07:00",
        endTime: "2026-09-07T21:30:00+07:00",
        venueName: "Royal Ambarrukmo Ballroom",
        address: "Jl. Laksda Adisucipto No.81, Yogyakarta",
        mapUrl: "https://maps.google.com/?q=Royal+Ambarrukmo+Yogyakarta",
        dressCode: "Formal · Sentuhan Emas",
      },
    ],
    gallery: [
      { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900", caption: "Prewedding · Borobudur" },
      { url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900", caption: "Sesi sore" },
      { url: "https://images.unsplash.com/photo-1525772764200-be829a350797?w=900", caption: "Cincin lamaran" },
      { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900", caption: "Halaman rumah" },
      { url: "https://images.unsplash.com/photo-1606490194859-07c18c9f0968?w=900", caption: "Bunga tujuh rupa" },
      { url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=900", caption: "Sore di Kotagede" },
    ],
    gifts: [
      { kind: "BANK", bankName: "BCA", number: "1234567890", holder: "Arini Salsabila" },
      { kind: "BANK", bankName: "Mandiri", number: "0987654321", holder: "Bagas Pradipta" },
    ],
    wishes: [
      { name: "Ratna Sari Dewi", message: "Selamat menempuh hidup baru. Semoga sakinah, mawaddah, warahmah!" },
      { name: "Dimas Aryanto", message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fi khair." },
    ],
    storyChapters: [
      {
        title: "PERTEMUAN",
        body: "Tidak ada yang kebetulan di dunia ini, semua sudah tersusun rapi oleh Sang Maha Kuasa. Kami pertama kali bertemu pada tahun 2016, di sebuah kedai kopi sederhana di sudut kota Yogyakarta. Pertemuan singkat yang ternyata menjadi awal dari segalanya.",
        photo: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=70",
      },
      {
        title: "MENJALIN HUBUNGAN",
        body: "Perjalanan kami dimulai dari sapa sederhana dan kehangatan yang tumbuh perlahan. Tepatnya di bulan September 2018, kami memutuskan untuk saling membuka hati. Waktu demi waktu kami jalani bersama, melewati jarak, perbedaan, dan ujian yang justru membuat hubungan kami semakin kuat.",
        photo: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&q=70",
      },
      {
        title: "LAMARAN",
        body: "Atas Kehendak-Nya dan restu kedua orang tua, kami melangsungkan acara lamaran pada Desember 2025 dengan penuh rasa syukur dan bahagia. Sebuah janji telah kami ucapkan untuk membangun rumah tangga yang sakinah, mawaddah, warahmah.",
        photo: "https://images.unsplash.com/photo-1525772764200-be829a350797?w=900&q=70",
      },
      {
        title: "PERNIKAHAN",
        body: "Akhirnya, kami melangkah ke hari yang selama ini kami panjatkan dalam doa. Bukan karena waktu yang panjang, tapi karena keyakinan yang kuat bahwa cinta yang diridhoi Allah pasti akan menemukan jalannya. Hari ini, kami berjanji untuk mengarungi sisa hidup bersama.",
        photo: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=70",
      },
    ],
  };
}

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

function formatDateID(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function formatTimeID(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
}
function formatDateParts(iso: string) {
  const d = new Date(iso);
  return {
    weekday: d.toLocaleDateString("id-ID", { weekday: "long" }),
    day: d.toLocaleDateString("id-ID", { day: "numeric" }),
    month: d.toLocaleDateString("id-ID", { month: "long" }),
    year: d.toLocaleDateString("id-ID", { year: "numeric" }),
  };
}

/* ---------- ORNAMENTS (local SVG flourishes) ---------- */

function FloralCorner({ color = "#A88339", size = 140, className = "", style }: { color?: string; size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 140 140" width={size} height={size} fill="none" className={className} style={style} aria-hidden>
      <g stroke={color} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.85">
        <path d="M0 70 Q40 70 70 40 Q70 0 70 0" />
        <path d="M10 70 Q40 60 55 45" opacity="0.7" />
        <circle cx="32" cy="58" r="3" fill={color} />
        <circle cx="50" cy="42" r="2.5" fill={color} />
        <path d="M22 68 Q26 60 18 56" />
        <path d="M40 50 Q44 42 36 38" />
        <path d="M58 32 Q62 24 54 20" />
        <path d="M70 8 L70 20 M68 12 L72 12" />
      </g>
    </svg>
  );
}

function Monogram({ a, b, color = "#A88339", size = 60 }: { a: string; b: string; color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 100 60" width={size * 1.6} height={size} className="mx-auto">
      <line x1="2" y1="30" x2="22" y2="30" stroke={color} strokeOpacity="0.5" strokeWidth="0.7" />
      <line x1="78" y1="30" x2="98" y2="30" stroke={color} strokeOpacity="0.5" strokeWidth="0.7" />
      <text x="50" y="38" textAnchor="middle" fill={color} fontFamily="Quattrocento, Georgia, serif" fontSize="28">
        {a[0]}
      </text>
      <text x="50" y="38" textAnchor="middle" fill={color} fontFamily="Quattrocento, Georgia, serif" fontSize="28" dx="-12" opacity="0.6">
        &amp;
      </text>
      <text x="50" y="38" textAnchor="middle" fill={color} fontFamily="Quattrocento, Georgia, serif" fontSize="28" dx="12">
        {b[0]}
      </text>
    </svg>
  );
}

function EventIcon({ kind, color }: { kind: string; color: string }) {
  if (kind === "AKAD") {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
        <circle cx="20" cy="20" r="18" stroke={color} strokeWidth="0.8" />
        <path d="M12 16 L20 22 L28 16 M12 24 L28 24" stroke={color} strokeWidth="1" strokeLinecap="round" />
        <circle cx="20" cy="12" r="1.5" fill={color} />
      </svg>
    );
  }
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="18" stroke={color} strokeWidth="0.8" />
      <path d="M10 22 Q20 14 30 22" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <circle cx="20" cy="14" r="2" stroke={color} strokeWidth="0.8" />
      <path d="M14 26 L26 26" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

/* ---------- MAIN ---------- */

export function InvitationRender({
  data,
  palette = "cream",
  interactive = false,
}: {
  data: InvitationData;
  palette?: string;
  interactive?: boolean;
}) {
  const c = getPalette(palette);
  const primary = data.events[0]?.date ?? new Date().toISOString();
  const cd = useCountdown(primary);
  const [opened, setOpened] = useState(false);

  return (
    <div style={{ background: c.bg, color: c.fg }} className="font-sans">
      {!opened ? (
        <Cover c={c} data={data} onOpen={() => setOpened(true)} />
      ) : (
        <>
          <Opening c={c} data={data} />
          <Couple c={c} couple={data.couple} />
          <Countdown c={c} primary={primary} cd={cd} couple={data.couple} />
          <Events c={c} events={data.events} />
          {((data.storyChapters && data.storyChapters.length > 0) || data.story) && (
            <StoryChapters
              chapters={data.storyChapters}
              story={data.story}
              gallery={data.gallery}
              theme={{
                bg: c.bg,
                fg: c.fg,
                fgSoft: c.soft,
                accent: c.accent,
                rule: c.accent,
                card: c.card,
                variant: isDarkPalette(palette) ? "dark" : "light",
              }}
            />
          )}
          {data.gallery.length > 0 && <Gallery c={c} gallery={data.gallery} />}
          <Rsvp c={c} data={data} interactive={interactive} />
          <Wishes c={c} slug={data.slug} initial={data.wishes ?? []} interactive={interactive} />
          {data.gifts.length > 0 && <Gifts c={c} gifts={data.gifts} />}
          <Closing c={c} data={data} />
        </>
      )}
    </div>
  );
}

/* ---------- COVER ---------- */

function Cover({ c, data, onOpen }: { c: Palette; data: InvitationData; onOpen: () => void }) {
  const cover = data.coverImage || DEMO_COVER;
  const date = data.events[0] ? formatDateParts(data.events[0].date) : null;
  const guestName = data.guestName ?? null;

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-end text-center overflow-hidden">
      {/* Photo backdrop */}
      <img
        src={cover}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${withAlpha(c.bg, 0.2)} 0%, ${withAlpha(c.bg, 0.5)} 50%, ${withAlpha(c.bg, 0.95)} 100%)`,
        }}
      />

      {/* Corner flourishes */}
      <FloralCorner color={c.accent} size={150} className="absolute top-4 left-4 opacity-80" />
      <FloralCorner color={c.accent} size={150} className="absolute top-4 right-4 opacity-80" style={{ transform: "scaleX(-1)" }} />
      <FloralCorner color={c.accent} size={150} className="absolute bottom-4 left-4 opacity-80" style={{ transform: "scaleY(-1)" }} />
      <FloralCorner color={c.accent} size={150} className="absolute bottom-4 right-4 opacity-80" style={{ transform: "scale(-1, -1)" }} />

      {/* Content */}
      <div className="relative z-10 pb-16 pt-32 px-6 w-full">
        <div className="max-w-md mx-auto">
          <Monogram a={data.couple.brideShort} b={data.couple.groomShort} color={c.accent} size={64} />
          <div className="mt-4 text-[11px] uppercase tracking-[0.4em]" style={{ color: c.accent }}>{data.eyebrow}</div>
          <h1 className="font-serif mt-6 text-[44px] sm:text-6xl leading-[1.05]" style={{ color: c.fg }}>
            {data.couple.brideShort}
            <div className="my-2 font-serif text-3xl" style={{ color: c.accent }}>&amp;</div>
            {data.couple.groomShort}
          </h1>
          <Divider width={220} color={c.accent} className="mx-auto mt-6" />
          {date && (
            <div className="mt-5 flex items-center justify-center gap-5">
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-[0.25em]" style={{ color: c.soft }}>{date.weekday}</div>
                <div className="font-serif text-lg" style={{ color: c.fg }}>{date.month}</div>
              </div>
              <div className="font-serif text-5xl px-3 py-1 border-y" style={{ color: c.fg, borderColor: c.accent }}>
                {date.day.padStart(2, "0")}
              </div>
              <div className="text-left">
                <div className="text-[11px] uppercase tracking-[0.25em]" style={{ color: c.soft }}>{date.year}</div>
                <div className="font-serif text-lg" style={{ color: c.fg }}>Akad &amp; Resepsi</div>
              </div>
            </div>
          )}

          {guestName && (
            <div className="mt-8 flex justify-center">
              <div className="px-5 py-3.5 rounded-sm border" style={{ borderColor: c.accent, background: withAlpha(c.card, 0.6) }}>
                <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: c.accent }}>Kepada Yang Terhormat</div>
                <div className="font-serif text-xl mt-1">{guestName}</div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button
              onClick={onOpen}
              className="rounded-full px-8 py-3.5 text-xs uppercase tracking-[0.25em] font-medium transition hover:scale-105"
              style={{ background: c.accent, color: c.bg }}
            >
              ✦ Buka Undangan ✦
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- OPENING ---------- */

function Opening({ c, data }: { c: Palette; data: InvitationData }) {
  return (
    <section className="relative text-center py-20 px-6 overflow-hidden">
      <div className="absolute top-6 left-6 opacity-30"><FloralCorner color={c.accent} size={120} /></div>
      <div className="absolute bottom-6 right-6 opacity-30"><FloralCorner color={c.accent} size={120} style={{ transform: "scale(-1, -1)" }} /></div>
      <div className="relative max-w-2xl mx-auto">
        <span className="text-[11px] uppercase tracking-[0.4em]" style={{ color: c.accent }}>Bismillāhirrahmānirrahīm</span>
        <Divider width={220} color={c.accent} className="mx-auto mt-4" />
        {data.quote && (
          <blockquote className="font-serif text-[17px] md:text-[22px] leading-relaxed mt-7 px-4" style={{ color: c.fg }}>
            <span className="font-serif text-5xl leading-none" style={{ color: c.accent }}>“</span>
            <p className="-mt-4">{data.quote}</p>
          </blockquote>
        )}
        <Divider width={120} color={c.accent} className="mx-auto mt-8" />
        <p className="mt-7 text-sm md:text-base" style={{ color: c.soft }}>
          Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan pernikahan putra-putri kami:
        </p>
      </div>
    </section>
  );
}

/* ---------- COUPLE ---------- */

function Couple({ c, couple }: { c: Palette; couple: InvitationData["couple"] }) {
  return (
    <section className="py-16 px-6">
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-10 max-w-5xl mx-auto items-center">
        <Person side="bride" person={couple} c={c} />
        <div className="flex flex-col items-center gap-3 py-6">
          <Mark size={36} color={c.accent} />
          <div className="font-serif text-6xl" style={{ color: c.accent }}>&amp;</div>
          <Mark size={36} color={c.accent} />
        </div>
        <Person side="groom" person={couple} c={c} />
      </div>
    </section>
  );
}

function Person({ side, person, c }: { side: "bride" | "groom"; person: InvitationData["couple"]; c: Palette }) {
  const isBride = side === "bride";
  const name = isBride ? person.brideName : person.groomName;
  const short = isBride ? person.brideShort : person.groomShort;
  const parents = isBride ? person.brideParents : person.groomParents;
  const ig = isBride ? person.brideInstagram : person.groomInstagram;
  const photo = isBride ? person.bridePhoto : person.groomPhoto;
  return (
    <div className="relative text-center">
      <div className="relative mx-auto w-56 h-56 md:w-64 md:h-64">
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: `1px dashed ${c.accent}`, transform: "scale(1.08)" }}
        />
        <div className="absolute inset-0 rounded-full overflow-hidden border-[3px]" style={{ borderColor: c.accent, background: c.card }}>
          {photo ? (
            <img src={photo} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-serif text-7xl" style={{ color: c.accent }}>
              {short[0]}
            </div>
          )}
        </div>
        <span
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] uppercase tracking-[0.25em] rounded-full"
          style={{ background: c.accent, color: c.bg }}
        >
          {isBride ? "The Bride" : "The Groom"}
        </span>
      </div>
      <h3 className="font-serif mt-9 text-[28px] md:text-[34px] leading-tight" style={{ color: c.fg }}>{name}</h3>
      {parents && <p className="mt-3 text-sm leading-relaxed max-w-xs mx-auto" style={{ color: c.soft }}>{parents}</p>}
      {ig && (
        <a
          href={`https://instagram.com/${ig.replace(/^@/, "")}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border"
          style={{ color: c.accent, borderColor: withAlpha(c.accent, 0.5) }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
          </svg>
          {ig}
        </a>
      )}
    </div>
  );
}

/* ---------- COUNTDOWN ---------- */

function Countdown({ c, primary, cd, couple }: { c: Palette; primary: string; cd: ReturnType<typeof useCountdown>; couple: InvitationData["couple"] }) {
  const parts = formatDateParts(primary);
  return (
    <section className="relative py-16 px-6 text-center overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)` }} />
      <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)` }} />
      <Monogram a={couple.brideShort} b={couple.groomShort} color={c.accent} size={56} />
      <span className="block mt-4 text-[11px] uppercase tracking-[0.35em]" style={{ color: c.accent }}>Menuju Hari Bahagia</span>
      <h2 className="font-serif mt-3 text-3xl md:text-5xl" style={{ color: c.fg }}>
        {parts.weekday}, {parts.day} {parts.month} {parts.year}
      </h2>
      <div className="mt-8 inline-flex gap-3 md:gap-4">
        {[
          ["Hari", cd.d],
          ["Jam", cd.h],
          ["Menit", cd.m],
          ["Detik", cd.s],
        ].map(([l, v]) => (
          <div
            key={l as string}
            className="relative rounded-sm border-2 min-w-[70px] md:min-w-[90px] py-4 px-2 bracketed"
            style={{ borderColor: c.accent, background: c.card }}
          >
            <div className="font-serif text-3xl md:text-5xl tabular-nums" style={{ color: c.fg }}>
              {String(v).padStart(2, "0")}
            </div>
            <div className="text-[10px] uppercase tracking-[0.25em] mt-1.5" style={{ color: c.soft }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- EVENTS ---------- */

function Events({ c, events }: { c: Palette; events: InvitationData["events"] }) {
  return (
    <section className="py-16 px-6">
      <SectionHeading c={c} eyebrow="Susunan Acara" title="Detail Pelaksanaan" />
      <div className="mt-10 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {events.map((e, i) => {
          const parts = formatDateParts(e.date);
          return (
            <article
              key={e.id ?? i}
              className="relative rounded-sm border-2 p-7 text-center overflow-hidden bracketed"
              style={{ borderColor: c.accent, background: c.card }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-[10px] uppercase tracking-[0.25em]" style={{ background: c.accent, color: c.bg }}>
                {e.kind === "AKAD" ? "Akad Nikah" : e.kind === "RESEPSI" ? "Resepsi" : e.title}
              </div>
              <div className="mt-5 flex justify-center">
                <EventIcon kind={e.kind} color={c.accent} />
              </div>
              <h3 className="font-serif text-2xl md:text-3xl mt-3" style={{ color: c.fg }}>{parts.weekday}</h3>
              <div className="mt-1 flex items-center justify-center gap-3 font-serif text-lg" style={{ color: c.fg }}>
                <span>{parts.day}</span>
                <span className="w-1 h-1 rounded-full" style={{ background: c.accent }} />
                <span>{parts.month}</span>
                <span className="w-1 h-1 rounded-full" style={{ background: c.accent }} />
                <span>{parts.year}</span>
              </div>
              <div className="mt-3 inline-block px-3 py-1 rounded-full border text-xs font-mono" style={{ borderColor: c.accent, color: c.soft }}>
                {formatTimeID(e.date)} {e.endTime ? `– ${formatTimeID(e.endTime)}` : ""} WIB
              </div>
              <Inline color={c.accent} className="mx-auto my-5" />
              <div className="font-serif text-lg" style={{ color: c.fg }}>{e.venueName}</div>
              <div className="text-sm mt-1.5" style={{ color: c.soft }}>{e.address}</div>
              {e.dressCode && (
                <div className="mt-4 inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.22em]" style={{ background: withAlpha(c.accent, 0.15), color: c.accent }}>
                  Dress code: {e.dressCode}
                </div>
              )}
              {e.mapUrl && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={e.mapUrl}
                  className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] font-medium transition hover:scale-105"
                  style={{ background: c.accent, color: c.bg }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Lihat Peta Lokasi
                </a>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- GALLERY ---------- */

function Gallery({ c, gallery }: { c: Palette; gallery: InvitationData["gallery"] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  // Tile pattern (mobile uses cols-4, desktop cols-12). Cycle through for variety.
  const pattern: Array<{ m: string; d: string }> = [
    { m: "col-span-4 row-span-2", d: "lg:col-span-6 lg:row-span-2" },
    { m: "col-span-2 row-span-1", d: "lg:col-span-3 lg:row-span-1" },
    { m: "col-span-2 row-span-1", d: "lg:col-span-3 lg:row-span-1" },
    { m: "col-span-2 row-span-2", d: "lg:col-span-4 lg:row-span-2" },
    { m: "col-span-2 row-span-1", d: "lg:col-span-4 lg:row-span-1" },
    { m: "col-span-4 row-span-1", d: "lg:col-span-4 lg:row-span-1" },
    { m: "col-span-2 row-span-1", d: "lg:col-span-5 lg:row-span-1" },
    { m: "col-span-2 row-span-1", d: "lg:col-span-3 lg:row-span-2" },
    { m: "col-span-4 row-span-1", d: "lg:col-span-4 lg:row-span-1" },
  ];

  return (
    <section className="py-16">
      <SectionHeading c={c} eyebrow="Galeri Kenangan" title="Momen-Momen Kami" />
      <div
        className="mt-10 w-full grid grid-cols-4 lg:grid-cols-12 auto-rows-[120px] sm:auto-rows-[150px] lg:auto-rows-[200px] gap-2 px-2 sm:px-3 lg:px-4"
        style={{ gridAutoFlow: "dense" }}
      >
        {gallery.map((g, i) => {
          const p = pattern[i % pattern.length];
          return (
            <button
              key={g.id ?? i}
              onClick={() => setLightbox(g.url)}
              className={`group relative overflow-hidden rounded-sm border ${p.m} ${p.d}`}
              style={{ borderColor: withAlpha(c.accent, 0.6) }}
            >
              <img
                src={g.url}
                alt={g.caption ?? ""}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition"
                style={{ background: `linear-gradient(to top, ${withAlpha(c.fg, 0.7)}, transparent 50%)` }}
              />
              {g.caption && (
                <div
                  className="absolute inset-x-0 bottom-0 px-3 py-2 text-left text-xs translate-y-full group-hover:translate-y-0 transition duration-500"
                  style={{ color: c.bg }}
                >
                  {g.caption}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 cursor-zoom-out"
          style={{ background: "rgba(0,0,0,0.9)" }}
        >
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded" />
        </div>
      )}
    </section>
  );
}

/* ---------- RSVP ---------- */

function Rsvp({ c, data, interactive }: { c: Palette; data: InvitationData; interactive: boolean }) {
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
    } catch (e) {
      setErr(extractError(e));
    } finally {
      setBusy(false);
    }
  }

  const STATUS = [
    { id: "HADIR", label: "Hadir" },
    { id: "TIDAK", label: "Tidak Hadir" },
    { id: "RAGU", label: "Masih Ragu" },
  ];

  return (
    <section className="py-16 px-6">
      <SectionHeading c={c} eyebrow="Konfirmasi Kehadiran" title="RSVP" />
      {known ? (
        <p className="mt-3 max-w-md mx-auto text-sm text-center" style={{ color: c.soft }}>
          Halo <span className="font-serif italic" style={{ color: c.fg }}>{data.guestName}</span>, mohon konfirmasikan kehadiran Anda di bawah ini.
        </p>
      ) : (
        <p className="mt-3 max-w-md mx-auto text-sm text-center" style={{ color: c.soft }}>
          Mohon konfirmasikan kehadiran Anda agar kami dapat menyiapkan tempat dengan sebaik-baiknya.
        </p>
      )}

      {done ? (
        <div className="max-w-xl mx-auto mt-8 text-center rounded-sm border-2 p-10 bracketed" style={{ borderColor: c.accent, background: c.card }}>
          <Mark size={42} color={c.accent} />
          <div className="font-serif text-2xl mt-4">Terima kasih atas konfirmasi Anda</div>
          <p className="mt-2 text-sm" style={{ color: c.soft }}>Sampai bertemu di hari bahagia kami.</p>
        </div>
      ) : known ? (
        <form
          onSubmit={submit}
          className="max-w-md mx-auto mt-8 grid gap-5 rounded-sm border-2 p-6 md:p-8 bracketed"
          style={{ borderColor: c.accent, background: c.card }}
        >
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] mb-3 text-center" style={{ color: c.accent }}>Kehadiran Anda</div>
            <div className="grid grid-cols-3 gap-2">
              {STATUS.map((s) => {
                const active = form.status === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setForm({ ...form, status: s.id })}
                    className="text-xs py-3 rounded-sm border transition"
                    style={{
                      borderColor: c.accent,
                      background: active ? c.accent : "transparent",
                      color: active ? c.bg : c.fg,
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
          <Field c={c} label="Pesan untuk mempelai (opsional)">
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="inv-input" style={inputStyle(c)} />
          </Field>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button type="submit" disabled={busy} className="mt-1 rounded-full px-6 py-3 text-xs uppercase tracking-[0.25em] transition hover:scale-105" style={{ background: c.accent, color: c.bg }}>
            {busy ? "Mengirim…" : "✦ Kirim Konfirmasi ✦"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={submit}
          className="max-w-xl mx-auto mt-8 grid gap-3 rounded-sm border-2 p-6 md:p-8 bracketed"
          style={{ borderColor: c.accent, background: c.card }}
        >
          <Field c={c} label="Nama lengkap">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama Anda" className="inv-input" style={inputStyle(c)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field c={c} label="Kehadiran">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="inv-input" style={inputStyle(c)}>
                <option value="HADIR">Hadir</option>
                <option value="TIDAK">Tidak Hadir</option>
                <option value="RAGU">Masih Ragu</option>
              </select>
            </Field>
            <Field c={c} label="Jumlah tamu">
              <input type="number" min={1} max={6} value={form.pax} onChange={(e) => setForm({ ...form, pax: Number(e.target.value) })} className="inv-input" style={inputStyle(c)} />
            </Field>
          </div>
          <Field c={c} label="Sesi yang dihadiri (opsional)">
            <input value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} placeholder="Akad / Resepsi / Keduanya" className="inv-input" style={inputStyle(c)} />
          </Field>
          <Field c={c} label="Pesan untuk mempelai (opsional)">
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="inv-input" style={inputStyle(c)} />
          </Field>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button type="submit" disabled={busy} className="mt-2 rounded-full px-6 py-3 text-xs uppercase tracking-[0.25em] transition hover:scale-105" style={{ background: c.accent, color: c.bg }}>
            {busy ? "Mengirim…" : "✦ Kirim Konfirmasi ✦"}
          </button>
        </form>
      )}
      <style>{`.inv-input{width:100%;padding:11px 14px;border-radius:6px;font-size:14px;font-family:inherit;border:1px solid;background:transparent}.inv-input:focus{outline:none}`}</style>
    </section>
  );
}

function Field({ c, label, children }: { c: Palette; label: string; children: React.ReactNode }) {
  return (
    <label className="block text-left">
      <div className="text-[10px] uppercase tracking-[0.22em] mb-1.5" style={{ color: c.accent }}>{label}</div>
      {children}
    </label>
  );
}

function inputStyle(c: Palette): React.CSSProperties {
  return { borderColor: withAlpha(c.accent, 0.6), color: c.fg, background: withAlpha(c.bg, 0.4) };
}

/* ---------- WISHES ---------- */

function Wishes({ c, slug, initial, interactive }: { c: Palette; slug: string; initial: NonNullable<InvitationData["wishes"]>; interactive: boolean }) {
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
    } catch {} finally {
      setBusy(false);
    }
  }

  return (
    <section className="py-16 px-6">
      <SectionHeading c={c} eyebrow="Buku Tamu" title="Doa & Ucapan" />
      <div className="max-w-2xl mx-auto mt-8">
        <form
          onSubmit={submit}
          className="grid gap-3 rounded-sm border-2 p-6 mb-6 bracketed"
          style={{ borderColor: c.accent, background: c.card }}
        >
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama Anda"
            className="inv-input"
            style={inputStyle(c)}
          />
          <textarea
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Tuliskan doa & ucapan terbaik Anda…"
            rows={3}
            className="inv-input"
            style={inputStyle(c)}
          />
          <button disabled={busy} className="mt-1 self-end rounded-full px-6 py-2.5 text-xs uppercase tracking-[0.25em] transition hover:scale-105" style={{ background: c.accent, color: c.bg }}>
            {busy ? "Mengirim…" : "Kirim Ucapan"}
          </button>
        </form>

        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {list.length === 0 && (
            <div className="text-center text-sm py-8" style={{ color: c.soft }}>
              Belum ada ucapan. Jadilah yang pertama menulis ✦
            </div>
          )}
          {list.map((w, i) => (
            <div key={w.id ?? i} className="flex gap-3 rounded-sm border p-4" style={{ borderColor: withAlpha(c.accent, 0.4), background: withAlpha(c.card, 0.7) }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-lg shrink-0" style={{ background: c.accent, color: c.bg }}>
                {w.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-serif text-base">{w.name}</div>
                  {w.createdAt && <div className="text-[10px] font-mono" style={{ color: c.soft }}>{new Date(w.createdAt).toLocaleDateString("id-ID")}</div>}
                </div>
                <p className="text-sm mt-0.5 leading-relaxed" style={{ color: c.soft }}>{w.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- GIFTS ---------- */

function Gifts({ c, gifts }: { c: Palette; gifts: InvitationData["gifts"] }) {
  return (
    <section className="py-16 px-6">
      <SectionHeading c={c} eyebrow="Tanda Kasih" title="Amplop Digital" />
      <p className="mt-3 max-w-md mx-auto text-sm text-center" style={{ color: c.soft }}>
        Tanpa mengurangi rasa hormat, doa restu Anda adalah hadiah paling berarti. Bila berkenan menambahkan tanda kasih, dapat melalui:
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-5 max-w-4xl mx-auto">
        {gifts.map((g, i) => (
          <div key={g.id ?? i} className="w-full sm:w-[300px] md:w-[320px]">
            <GiftCard c={c} g={g} />
          </div>
        ))}
      </div>
    </section>
  );
}

function GiftCard({ g, c }: { g: { kind: string; bankName: string; number: string; holder: string }; c: Palette }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(g.number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <div
      className="relative rounded-xl p-6 overflow-hidden shadow-soft"
      style={{
        background: `linear-gradient(135deg, ${c.accent} 0%, ${withAlpha(c.accent, 0.7)} 60%, ${c.fg} 100%)`,
        color: c.bg,
      }}
    >
      <div className="absolute -top-10 -right-10 opacity-15">
        <Mark size={140} color="#ffffff" />
      </div>
      <div className="relative flex justify-between items-start">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] opacity-80">{g.kind}</div>
          <div className="font-serif text-2xl mt-0.5">{g.bankName}</div>
        </div>
        <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
          <rect x="2" y="2" width="32" height="22" rx="2" stroke={c.bg} strokeOpacity="0.6" strokeWidth="0.8" />
          <rect x="6" y="8" width="10" height="8" fill={c.bg} fillOpacity="0.85" rx="1" />
          <line x1="19" y1="10" x2="30" y2="10" stroke={c.bg} strokeOpacity="0.6" />
          <line x1="19" y1="14" x2="28" y2="14" stroke={c.bg} strokeOpacity="0.6" />
          <line x1="6" y1="20" x2="30" y2="20" stroke={c.bg} strokeOpacity="0.4" />
        </svg>
      </div>
      <div className="relative mt-7 font-mono text-lg md:text-xl tracking-[0.18em]">{g.number}</div>
      <div className="relative mt-1 text-xs opacity-75">a.n. {g.holder}</div>
      <button
        onClick={copy}
        className="relative mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.22em] border transition hover:bg-white/10"
        style={{ borderColor: withAlpha(c.bg, 0.4), color: c.bg }}
      >
        {copied ? "Tersalin ✓" : "Salin Nomor"}
      </button>
    </div>
  );
}

/* ---------- CLOSING ---------- */

function Closing({ c, data }: { c: Palette; data: InvitationData }) {
  const couple = data.couple;
  const closing = data.closingSalutation ?? "Wassalamu'alaikum Warahmatullahi Wabarakatuh";
  return (
    <section className="relative py-20 px-6 text-center overflow-hidden">
      <div className="absolute inset-0 opacity-25" style={{
        backgroundImage: `radial-gradient(circle at 50% 0%, ${withAlpha(c.accent, 0.5)}, transparent 60%)`,
      }} />
      <div className="relative max-w-xl mx-auto">
        <Monogram a={couple.brideShort} b={couple.groomShort} color={c.accent} size={72} />
        <OrnamentRow className="mt-2" />
        <p className="font-serif text-xl md:text-2xl mt-5 leading-relaxed" style={{ color: c.fg }}>
          Merupakan suatu kehormatan dan kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
        </p>
        <p className="mt-7 text-sm" style={{ color: c.soft }}>
          {closing && (<>{closing}<br /></>)}
          Hormat kami,
        </p>
        <div className="font-serif text-3xl md:text-4xl mt-4" style={{ color: c.fg }}>
          {couple.brideShort} &amp; {couple.groomShort}
        </div>
        <div className="text-xs uppercase tracking-[0.3em] mt-2" style={{ color: c.accent }}>Beserta Keluarga</div>
        <Divider width={200} color={c.accent} className="mx-auto mt-10" />
        <a href="/" className="mt-6 inline-flex items-center gap-2 text-xs opacity-60 hover:opacity-100 transition">
          <img src="/logo.png" alt="weddQ" style={{ height: 26, width: "auto", objectFit: "contain" }} />
          <span style={{ color: c.soft }}>Dibuat dengan weddQ</span>
        </a>
      </div>
    </section>
  );
}

/* ---------- SHARED ---------- */

function SectionHeading({ c, eyebrow, title }: { c: Palette; eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <span className="text-[11px] uppercase tracking-[0.35em]" style={{ color: c.accent }}>{eyebrow}</span>
      <h2 className="font-serif mt-2 text-3xl md:text-[40px]" style={{ color: c.fg }}>{title}</h2>
      <Divider width={180} color={c.accent} className="mx-auto mt-3" />
    </div>
  );
}

function withAlpha(hex: string, alpha: number) {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, "0");
  if (hex.length === 7) return `${hex}${a}`;
  return hex;
}
