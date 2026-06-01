import { Link } from "react-router-dom";
import PublicLayout from "@/components/PublicLayout";
import { BatikBg, Corner, Divider, Inline } from "@/components/Ornaments";
import { Reveal } from "@/components/Reveal";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getPalette, isDarkPalette } from "@/lib/palette";

type Template = {
  id: string;
  slug: string;
  name: string;
  style: string;
  priceIdr: number;
  badge?: string | null;
  palette: string;
};

const HERO_BADGES = [
  "4.200+ Undangan Terkirim",
  "120+ Template Pilihan",
  "RSVP Otomatis",
  "Amplop Digital",
  "QR Check-in",
  "Dukungan 24/7",
];

function MiniInvite({
  palette,
  names,
  date,
  eyebrow,
}: {
  palette: string;
  names: string;
  date: string;
  eyebrow: string;
}) {
  const p = getPalette(palette);
  const isDark = isDarkPalette(palette);
  const [a, b] = names.split("&");
  return (
    <div
      className="relative rounded-sm py-8 px-6 flex flex-col items-center text-center bracketed"
      style={{ background: isDark ? p.card : p.bg, color: p.fg }}
    >
      <span className="text-[10px] uppercase tracking-[0.3em] font-medium" style={{ color: p.accent }}>{eyebrow}</span>
      <Inline color={p.accent} className="my-3" />
      <div className="font-serif leading-tight text-3xl md:text-4xl" style={{ color: p.fg }}>
        {a.trim()}
        <div className="text-2xl my-1" style={{ color: p.accent }}>&amp;</div>
        {b.trim()}
      </div>
      <Inline color={p.accent} className="my-3" />
      <span className="text-[11px] font-mono tracking-wider" style={{ color: p.fg, opacity: 0.7 }}>{date}</span>
    </div>
  );
}

/** White iPhone-style frame with notch + iOS status bar. Children render full-bleed inside. */
function PhoneFrame({ children, rotate = 0, className = "" }: { children: React.ReactNode; rotate?: number; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
      {/* Side buttons (light gray on white) */}
      <div className="absolute left-[-2px] top-[88px] w-[3px] h-[22px] rounded-l-sm" style={{ background: "linear-gradient(90deg, #b4b2af, #d9d7d4)" }} />
      <div className="absolute left-[-2px] top-[124px] w-[3px] h-[44px] rounded-l-sm" style={{ background: "linear-gradient(90deg, #b4b2af, #d9d7d4)" }} />
      <div className="absolute left-[-2px] top-[180px] w-[3px] h-[44px] rounded-l-sm" style={{ background: "linear-gradient(90deg, #b4b2af, #d9d7d4)" }} />
      <div className="absolute right-[-2px] top-[148px] w-[3px] h-[68px] rounded-r-sm" style={{ background: "linear-gradient(270deg, #b4b2af, #d9d7d4)" }} />

      {/* White body with subtle silver gradient */}
      <div
        className="w-[246px] h-[506px] rounded-[44px] p-[3px]"
        style={{
          background: "linear-gradient(135deg, #e8e6e3 0%, #fafaf9 30%, #fafaf9 70%, #d4d2cf 100%)",
          boxShadow: "0 40px 110px -28px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(0,0,0,0.05)",
        }}
      >
        {/* Thin black bezel */}
        <div className="w-full h-full rounded-[41px] bg-black p-[4px]">
          {/* Screen */}
          <div className="w-full h-full rounded-[37px] overflow-hidden bg-paper relative">
            {/* Notch */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center gap-1.5"
              style={{
                width: 88,
                height: 22,
                background: "#000",
                borderBottomLeftRadius: 14,
                borderBottomRightRadius: 14,
              }}
            >
              <div className="w-[22px] h-[3px] rounded-full" style={{ background: "#15171b" }} />
              <div className="w-[6px] h-[6px] rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #243042, #060a14)" }} />
            </div>

            {/* iOS status bar — auto-contrast over any content */}
            <div
              className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between pointer-events-none"
              style={{ height: 28, paddingLeft: 18, paddingRight: 16, color: "#fff", mixBlendMode: "difference" }}
            >
              <div className="text-[11px] font-semibold tabular-nums" style={{ letterSpacing: "-0.01em" }}>11.00</div>
              <div className="flex items-center gap-1">
                <svg width="15" height="9" viewBox="0 0 16 10" fill="currentColor" aria-hidden>
                  <rect x="0" y="6" width="3" height="4" rx="0.5" />
                  <rect x="4.3" y="4.5" width="3" height="5.5" rx="0.5" />
                  <rect x="8.6" y="2.5" width="3" height="7.5" rx="0.5" />
                  <rect x="12.9" y="0" width="3" height="10" rx="0.5" />
                </svg>
                <svg width="13" height="9" viewBox="0 0 15 11" fill="currentColor" aria-hidden>
                  <path d="M7.5 1.5C4.4 1.5 1.7 2.7 0 4.5l1.7 1.7c1.5-1.4 3.6-2.2 5.8-2.2s4.3.8 5.8 2.2L15 4.5C13.3 2.7 10.6 1.5 7.5 1.5zM7.5 5C5.6 5 4 5.8 2.8 7L4.5 8.7c.8-.7 1.9-1.2 3-1.2s2.2.5 3 1.2L12.2 7C11 5.8 9.4 5 7.5 5zM7.5 8.4c-.7 0-1.3.6-1.3 1.3s.6 1.3 1.3 1.3 1.3-.6 1.3-1.3-.6-1.3-1.3-1.3z" />
                </svg>
                <svg width="22" height="10" viewBox="0 0 26 12" fill="none" aria-hidden>
                  <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
                  <rect x="2" y="2" width="19" height="8" rx="1.5" fill="currentColor" />
                  <rect x="23.5" y="3.5" width="2" height="5" rx="0.8" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Template canvas — fills screen, status bar overlays via mix-blend */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Phone preview that looks like a real wedding invitation cover. */
function TemplatePhoneCard({
  photo,
  bride,
  groom,
  date,
  eyebrow,
  accent = "#C9A961",
}: {
  photo: string;
  bride: string;
  groom: string;
  date: string;
  eyebrow: string;
  accent?: string;
}) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.85) 100%)" }} />
      <div className="relative h-full flex flex-col items-center justify-end text-center px-5 pb-7 pt-10">
        {/* Top eyebrow + ornament */}
        <div className="absolute top-7 left-0 right-0 px-6 text-center">
          <div className="text-[8px] tracking-[0.35em] uppercase" style={{ color: accent }}>
            {eyebrow}
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="w-6 h-px" style={{ background: accent, opacity: 0.7 }} />
            <span className="w-1.5 h-1.5 rotate-45 border" style={{ borderColor: accent }} />
            <span className="w-6 h-px" style={{ background: accent, opacity: 0.7 }} />
          </div>
        </div>

        {/* Names */}
        <div className="text-cream-soft">
          <div className="font-serif text-[26px] leading-[1.05]">{bride}</div>
          <div className="font-serif text-base my-0.5" style={{ color: accent }}>&amp;</div>
          <div className="font-serif text-[26px] leading-[1.05]">{groom}</div>
        </div>

        {/* Date pill */}
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[9px] tracking-[0.25em] uppercase" style={{ borderColor: accent, color: "#FAF4E6" }}>
          <span>{date}</span>
        </div>

        {/* CTA */}
        <div
          className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[8px] tracking-[0.3em] uppercase"
          style={{ background: accent, color: "#1A0F08" }}
        >
          Buka Undangan →
        </div>
      </div>
    </div>
  );
}

function priceLabel(idr: number) {
  if (idr <= 60000) return { tier: "Pro", color: "#A88339" };
  if (idr <= 90000) return { tier: "Cinematic", color: "#C9A961" };
  return { tier: "Signature", color: "#8E544E" };
}

export default function LandingPage() {
  const [tpls, setTpls] = useState<Template[]>([]);
  useEffect(() => {
    api.get<Template[]>("/templates").then((r) => setTpls(r.data.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <PublicLayout>
      {/* HERO: 2 grid, latar coklat, ponsel di kanan */}
      <section className="relative overflow-hidden bg-brown text-cream-soft">
        <BatikBg className="absolute inset-0 opacity-20" color="#D9A39C" opacity={0.5} />
        <div className="absolute inset-x-0 top-0 h-[26px] opacity-70" style={{ backgroundImage: heroBandSvg(), backgroundRepeat: "repeat-x" }} />
        <div className="absolute inset-x-0 bottom-0 h-[26px] opacity-70" style={{ backgroundImage: heroBandSvg(), backgroundRepeat: "repeat-x", transform: "scaleY(-1)" }} />

        <div className="container-narrow relative py-20 md:py-28 grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          {/* LEFT */}
          <div>
            <span className="eyebrow" style={{ color: "#D9A39C" }}>Undangan Digital, Klasik &amp; Modern</span>
            <h1 className="mt-7 font-serif text-[30px] sm:text-[38px] lg:text-[46px] xl:text-[56px] leading-[1.18] font-normal text-cream-soft">
              Undangan pernikahan <span className="text-rose-soft">digital</span>, dalam genggaman tamu Anda
            </h1>
            <p className="mt-7 max-w-xl text-[16px] md:text-[17px] leading-[1.75] text-cream-soft/80">
              weddQ adalah layanan undangan daring untuk pernikahan Anda. Susun dalam hitungan menit, bagikan kepada ratusan tamu melalui WhatsApp, serta kelola RSVP dan amplop digital melalui satu dasbor yang mudah dioperasikan.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/templates"
                className="inline-flex items-center gap-2.5 rounded-full bg-cream-soft text-brown border border-cream-soft px-7 py-3.5 text-sm font-medium tracking-wide transition hover:bg-rose-soft hover:border-rose-soft hover:text-brown-deep"
              >
                Mulai Sekarang <span>→</span>
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2.5 rounded-full border border-cream-soft/40 bg-transparent text-cream-soft px-7 py-3.5 text-sm font-medium tracking-wide transition hover:bg-cream-soft/10 hover:border-cream-soft"
              >
                Lihat Paket Harga
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-9 gap-y-3 text-[11px] tracking-[0.18em] uppercase text-cream-soft/55">
              {HERO_BADGES.map((b, i) => (
                <span key={b} className="flex items-center gap-3">
                  {i > 0 && <span className="w-1 h-1 bg-rose-soft rotate-45" />}
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: phone preview */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute -top-6 -right-6 hidden lg:block opacity-60">
              <Corner size={120} color="#D9A39C" />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden lg:block opacity-60 rotate-180">
              <Corner size={120} color="#D9A39C" />
            </div>
            <PhoneFrame className="z-10">
              <TemplatePhoneCard
                photo="https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80"
                bride="Arini"
                groom="Bagas"
                date="07 · 09 · 2026"
                eyebrow="The Wedding Of"
                accent="#C9A961"
              />
            </PhoneFrame>
            <PhoneFrame rotate={6} className="hidden md:block -ml-14 mt-10 opacity-95">
              <TemplatePhoneCard
                photo="https://images.unsplash.com/photo-1606490194859-07c18c9f0968?w=900&q=80"
                bride="Wulan"
                groom="Iqbal"
                date="14 · 02 · 2027"
                eyebrow="Walimatul 'Urs"
                accent="#D9A39C"
              />
            </PhoneFrame>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24">
        <div className="container-narrow grid md:grid-cols-[1fr_1.2fr] gap-16 items-center">
          <Reveal className="relative">
            <span className="absolute -top-7 -left-7 hidden md:block">
              <Corner size={100} />
            </span>
            <div className="aspect-[4/5] rounded-sm overflow-hidden bracketed bg-cream-deep flex items-center justify-center text-sepia-mute text-sm font-mono">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800"
                alt="Sepasang mempelai"
                className="w-full h-full object-cover"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            </div>
            <span className="absolute -bottom-7 -right-7 hidden md:block">
              <Corner size={100} className="rotate-180" />
            </span>
          </Reveal>

          <Reveal>
            <span className="sec-num">01 · TENTANG WEDDQ</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-serif">
              <em>Sebuah cara baru</em> untuk berbagi kabar bahagia
            </h2>
            <p className="mt-6 text-[17px] leading-loose text-sepia-soft">
              weddQ merupakan platform undangan daring yang dirancang khusus untuk pernikahan modern. Anda cukup memilih template, melengkapi data pasangan, dan mengirim tautan undangan kepada tamu. Seluruh prosesnya berlangsung mudah tanpa memerlukan pengetahuan teknis maupun biaya tersembunyi.
            </p>
            <p className="mt-4 text-[17px] leading-loose text-sepia-soft">
              Beragam fitur penting telah tersedia, meliputi hitung mundur acara, profil mempelai, denah lokasi, formulir RSVP, galeri kenangan, buku tamu, hingga amplop digital. Seluruh pengelolaan dilakukan melalui satu dasbor yang dirancang agar mudah dipahami oleh siapa pun.
            </p>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
              {[
                ["4.2K+", "Pasangan terlayani"],
                ["15 mnt", "Rata-rata waktu setup"],
                ["98%", "Tingkat undangan terbuka"],
                ["24/7", "Dukungan WhatsApp"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="font-serif text-4xl md:text-5xl text-sepia">{n}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.15em] text-sepia-mute">{l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-cream-soft border-y border-line">
        <div className="container-narrow">
          <Reveal className="max-w-2xl mx-auto text-center">
            <span className="sec-num">02 · CARA KERJA</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-serif">
              <em>Tiga langkah</em> singkat, kabar terkirim
            </h2>
            <p className="mt-4 text-sepia-soft">
              Mulai dari memilih tema hingga undangan diterima oleh tamu, seluruh prosesnya dapat diselesaikan dalam waktu singkat.
            </p>
          </Reveal>
          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                t: "Pilih tema",
                d: "Telusuri pustaka berisi 120+ template, kemudian sesuaikan warna, font, serta tata letak agar selaras dengan suasana acara Anda.",
              },
              {
                n: "02",
                t: "Isi cerita",
                d: "Lengkapi profil mempelai, tanggal, lokasi, foto kenangan, dan rekening amplop melalui dasbor yang dirancang agar mudah dipahami.",
              },
              {
                n: "03",
                t: "Bagikan",
                d: "Salin tautan unik untuk setiap tamu, lalu kirim melalui WhatsApp. Pantau RSVP serta ucapan yang masuk secara langsung.",
              },
            ].map((s) => (
              <Reveal key={s.n}>
                <div className="card-paper bracketed p-9">
                  <div className="font-serif text-5xl text-gold mb-5">{s.n}</div>
                  <h3 className="text-2xl font-serif mb-2">{s.t}</h3>
                  <p className="text-[15px] leading-relaxed text-sepia-soft">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section id="templates" className="py-24">
        <div className="container-narrow">
          <Reveal className="max-w-2xl mx-auto text-center">
            <span className="sec-num">03 · PUSTAKA TEMA</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-serif">
              <em>Setiap pasangan</em>, kisahnya sendiri
            </h2>
            <p className="mt-4 text-sepia-soft">
              Pilih ragam tema yang sejalan dengan kepribadian Anda, mulai dari klasik Nusantara, modern minimalis, hingga mewah sinematik. Seluruh template dapat dikustomisasi tanpa batas.
            </p>
          </Reveal>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {(tpls.length
              ? tpls
              : Array.from({ length: 6 }).map((_, i) => ({
                  id: String(i),
                  slug: "demo",
                  name: ["Sekar Kencana", "Kasmaran", "Larasati", "Kalpataru", "Prada Emas", "Mekar Wangi"][i],
                  style: ["Klasik · Jawa", "Klasik · Maroon", "Modern · Minimalis", "Islami · Klasik", "Mewah · Dark Mode", "Floral · Pastel"][i],
                  priceIdr: [49000, 75000, 49000, 49000, 75000, 49000][i],
                  badge: i === 0 ? "Bestseller" : i === 1 ? "Baru" : null,
                  palette: ["cream", "maroon", "paper", "cream", "sepia", "paper"][i],
                }))
            ).map((t, i) => {
              const sample = ["Arini & Bagas", "Maharani & Dirga", "Larasati & Wirajaya", "Khadijah & Ibrahim", "Anindya & Tegar", "Kemala & Pradipta"];
              const date = ["Sabtu · 07 September 2026", "Minggu · 12 Desember 2026", "Jum'at · 21 Mei 2027", "Ahad · 14 Rajab 1447 H", "Sabtu · 03 Oktober 2026", "Sabtu · 19 Juni 2027"];
              const eyebrows = ["The Wedding Of", "Pawiwahan", "Save The Date", "Walimatul 'Urs", "Pernikahan", "The Wedding"];
              const tier = priceLabel(t.priceIdr);
              return (
                <Reveal key={t.id}>
                  <Link to={`/templates/${t.slug}`} className="block group">
                    <div className="relative rounded-sm overflow-hidden bracketed p-6 transition-transform group-hover:-translate-y-1 bg-cream-deep">
                      {t.badge && (
                        <span className="absolute top-3 right-3 z-10 rounded-full bg-paper text-sepia border border-line text-[10px] uppercase tracking-wider px-2 py-1">
                          {t.badge}
                        </span>
                      )}
                      <MiniInvite palette={t.palette} names={sample[i] ?? "Mempelai A & B"} date={date[i] ?? ""} eyebrow={eyebrows[i] ?? "The Wedding Of"} />
                    </div>
                    <div className="flex items-end justify-between mt-4">
                      <div>
                        <div className="font-serif text-2xl text-sepia">{t.name}</div>
                        <div className="text-xs text-sepia-mute uppercase tracking-[0.15em] mt-0.5">{t.style}</div>
                      </div>
                      <div
                        className="rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] border"
                        style={{ borderColor: tier.color, color: tier.color }}
                      >
                        Paket {tier.tier}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <div className="text-center mt-14">
            <Link to="/templates" className="btn-ghost">Telusuri Semua Template <span>→</span></Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 bg-cream-soft border-y border-line">
        <div className="container-narrow">
          <Reveal className="max-w-2xl mx-auto text-center">
            <span className="sec-num">04 · PILIHAN PAKET</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-serif">
              <em>Harga yang jujur</em>, fitur yang lengkap
            </h2>
            <p className="mt-4 text-sepia-soft">
              Tiga paket sederhana untuk setiap skala pernikahan. Pembayaran dilakukan sekali, tanpa langganan dan tanpa biaya tambahan.
            </p>
          </Reveal>

          <div className="mt-14 grid md:grid-cols-3 gap-7">
            {[
              {
                name: "Pro",
                desc: "Undangan digital standar dengan template pilihan",
                price: "49",
                unit: "rb",
                period: "Sekali bayar, aktif 1 tahun",
                features: [
                  "Akses 80+ template Pro",
                  "Sampai 400 tamu undangan",
                  "Galeri 20 foto dan cerita",
                  "RSVP dan buku tamu",
                  "Amplop digital (3 rekening)",
                  "Hitung mundur dan denah lokasi",
                  "Subdomain weddq.id",
                ],
                cta: "Pilih Paket Pro",
                featured: false,
              },
              {
                name: "Cinematic",
                desc: "Undangan storytelling dengan animasi sinematik",
                price: "75",
                unit: "rb",
                period: "Sekali bayar, aktif 2 tahun",
                features: [
                  "Seluruh benefit Pro",
                  "Mode scroll-driven",
                  "Animasi transisi sinematik",
                  "Hero video pembuka (15 detik)",
                  "Galeri foto dan video tak terbatas",
                  "QR check-in",
                  "Musik latar custom",
                  "Domain .my.id",
                ],
                cta: "Pilih Cinematic",
                featured: true,
              },
              {
                name: "Signature",
                desc: "Desain custom sepenuhnya oleh tim weddQ",
                price: "200",
                unit: "rb",
                period: "Konsultasi, hosting seumur hidup",
                features: [
                  "Seluruh benefit Cinematic",
                  "Desain dari nol (3× revisi)",
                  "Riset tema dan moodboard",
                  "Ilustrasi atau motif khusus",
                  "Multi-bahasa (ID/EN)",
                  "Cetak eksklusif 25 lembar",
                ],
                cta: "Mulai Konsultasi",
                featured: false,
                fromLabel: "Mulai dari",
              },
            ].map((p) => (
              <Reveal key={p.name}>
                <div className={`relative rounded-sm p-9 h-full flex flex-col bracketed ${p.featured ? "bg-sepia text-cream-soft" : "bg-paper"}`}>
                  {p.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-deep text-cream-soft text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 font-medium">
                      Paling Diminati
                    </span>
                  )}
                  <div className={`text-[11px] uppercase tracking-[0.2em] ${p.featured ? "text-gold-soft" : "text-gold-deep"}`}>Paket</div>
                  <div className={`font-serif text-4xl mt-1 ${p.featured ? "text-cream-soft" : "text-sepia"}`}>{p.name}</div>
                  <p className={`mt-2 text-sm ${p.featured ? "text-cream-soft/80" : "text-sepia-soft"}`}>{p.desc}</p>

                  {p.fromLabel && (
                    <div className={`mt-7 text-[11px] uppercase tracking-[0.2em] ${p.featured ? "text-gold-soft" : "text-gold-deep"}`}>{p.fromLabel}</div>
                  )}
                  <div className={`mt-1 flex items-baseline gap-1 font-serif ${p.featured ? "text-cream-soft" : "text-sepia"}`}>
                    <span className="text-xl">Rp</span>
                    <span className="text-6xl">{p.price}</span>
                    <span className={`text-2xl ${p.featured ? "text-cream-soft/60" : "text-sepia-mute"}`}>{p.unit}</span>
                  </div>
                  <div className={`text-xs uppercase tracking-[0.18em] mt-1 ${p.featured ? "text-cream-soft/60" : "text-sepia-mute"}`}>{p.period}</div>

                  <ul className="mt-7 space-y-3 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className={`flex gap-3 text-sm ${p.featured ? "text-cream-soft/90" : "text-sepia-soft"}`}>
                        <span className={p.featured ? "text-gold-soft" : "text-gold-deep"}>◆</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link to="/register" className={`mt-9 ${p.featured ? "btn-gold" : "btn-ghost"} justify-center`}>
                    {p.cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="text-center mt-10 text-xs text-sepia-mute">
            ✦ Garansi uang kembali 7 hari. Pembayaran aman melalui QRIS, transfer, dan e-wallet.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-28 bg-brown text-cream-soft">
        <BatikBg className="absolute inset-0 opacity-30" color="#D9A39C" opacity={0.4} />
        <div className="container-narrow relative text-center">
          <span className="eyebrow" style={{ color: "#D9A39C" }}>Mulai Hari Ini</span>
          <h2 className="mt-6 text-4xl md:text-6xl font-serif text-cream-soft">
            Siap berbagi <span className="text-rose-soft">kabar bahagia</span>?
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-cream-soft/80">
            Susun undangan digital Anda dalam waktu kurang dari 15 menit. Tanpa kartu kredit, dapat dicoba secara gratis menggunakan template pilihan.
          </p>
          <div className="mt-9 flex gap-3 flex-wrap justify-center">
            <Link to="/register" className="btn-gold">Buat Undangan Sekarang →</Link>
            <Link to="/arini-bagas" className="inline-flex items-center gap-2.5 rounded-full border border-cream-soft/40 bg-transparent text-cream-soft px-7 py-3.5 text-sm font-medium tracking-wide transition hover:bg-cream-soft/10 hover:border-cream-soft">
              Lihat Contoh Undangan
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section id="testimoni" className="py-24">
        <div className="container-narrow">
          <Reveal className="max-w-2xl mx-auto text-center">
            <span className="sec-num">05 · CERITA PASANGAN</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-serif">
              <em>Apa kata</em> mereka
            </h2>
            <p className="mt-4 text-sepia-soft">Lebih dari 4.000 pasangan telah memercayakan kabar bahagianya kepada weddQ.</p>
          </Reveal>

          <div className="mt-14 grid md:grid-cols-3 gap-7">
            {[
              {
                q: "Banyak tamu kami bertanya, undangan ini dibuat di mana? Padahal kami mengisi seluruh datanya sendiri melalui dasbor, bahkan ketika sedang santai di akhir pekan.",
                a: "Arini & Bagas Pradipta",
                m: "Yogyakarta · Paket Cinematic",
              },
              {
                q: "Fitur RSVP otomatis sangat membantu. Kami tidak perlu lagi menghitung tamu satu per satu. Dasbornya mudah dioperasikan tanpa memerlukan pengetahuan teknis.",
                a: "Maharani & Dirga Wisesa",
                m: "Surabaya · Paket Pro",
              },
              {
                q: "Tim weddQ membantu mendesain undangan dari awal sesuai moodboard yang kami berikan. Hasilnya benar-benar mencerminkan kepribadian kami berdua.",
                a: "Larasati & Wirajaya Putra",
                m: "Bali · Paket Signature",
              },
            ].map((t) => (
              <Reveal key={t.a}>
                <div className="card-paper bracketed p-9 h-full flex flex-col">
                  <div className="text-gold text-3xl font-serif leading-none">“</div>
                  <p className="mt-3 font-serif text-[19px] text-sepia leading-snug flex-1">{t.q}</p>
                  <div className="mt-7 flex items-center gap-3 pt-5 border-t border-line">
                    <div className="w-10 h-10 rounded-full bg-gold-deep text-cream-soft font-serif flex items-center justify-center text-lg">
                      {t.a[0]}
                    </div>
                    <div>
                      <div className="font-serif text-base">{t.a}</div>
                      <div className="text-[11px] uppercase tracking-[0.15em] text-sepia-mute mt-0.5">{t.m}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Divider width={300} className="mx-auto mt-14" />
        </div>
      </section>
    </PublicLayout>
  );
}

function heroBandSvg() {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='26' viewBox='0 0 80 26'><g fill='none' stroke='%23D9A39C' stroke-opacity='0.85'><line x1='0' y1='13' x2='80' y2='13' stroke-width='0.6' stroke-opacity='0.45'/><line x1='0' y1='4' x2='80' y2='4' stroke-width='0.5' stroke-opacity='0.25'/><line x1='0' y1='22' x2='80' y2='22' stroke-width='0.5' stroke-opacity='0.25'/><rect x='40' y='6' width='14' height='14' transform='rotate(45 40 6)' stroke-width='0.7'/><rect x='0' y='6' width='14' height='14' transform='rotate(45 0 6)' stroke-width='0.7'/><rect x='80' y='6' width='14' height='14' transform='rotate(45 80 6)' stroke-width='0.7'/></g><g fill='%23D9A39C' fill-opacity='0.7'><circle cx='40' cy='13' r='1.4'/><circle cx='0' cy='13' r='1.4'/><circle cx='80' cy='13' r='1.4'/><circle cx='20' cy='13' r='1'/><circle cx='60' cy='13' r='1'/></g></svg>`;
  return `url("data:image/svg+xml;utf8,${svg}")`;
}
