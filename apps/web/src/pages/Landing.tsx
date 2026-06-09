import { Link } from "react-router-dom";
import PublicLayout from "@/components/PublicLayout";
import { Reveal } from "@/components/Reveal";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TemplateClusterPreview } from "./Templates";

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
  "200 Undangan Terkirim",
  "120+ Template Pilihan",
  "RSVP Otomatis",
  "Amplop Digital",
  "QR Check-in",
  "Dukungan 24/7",
];

const TESTIMONIALS = [
  { q: "Banyak tamu kami bertanya, undangan ini dibuat di mana? Padahal kami mengisi seluruh datanya sendiri melalui dasbor, bahkan ketika sedang santai di akhir pekan.", a: "Arini & Bagas Pradipta", m: "Yogyakarta · Paket Eksklusif" },
  { q: "Fitur RSVP otomatis sangat membantu. Kami tidak perlu lagi menghitung tamu satu per satu. Dasbornya mudah dioperasikan tanpa pengetahuan teknis.", a: "Maharani & Dirga Wisesa", m: "Surabaya · Paket Pro" },
  { q: "Tim weddQ membantu mendesain undangan dari awal sesuai moodboard yang kami berikan. Hasilnya benar-benar mencerminkan kepribadian kami berdua.", a: "Larasati & Wirajaya Putra", m: "Bali · Paket Eksklusif" },
  { q: "Undangannya elegan dan terbuka cepat. Tamu dari luar kota pun mudah membukanya lewat WhatsApp tanpa perlu mengunduh apa pun.", a: "Nadia & Rizky Ananta", m: "Bandung · Paket Pro" },
  { q: "Amplop digitalnya sangat praktis, banyak kerabat langsung mengirim tanda kasih lewat undangan. Buku tamunya pun tertata rapi.", a: "Salsabila & Fajar Nugraha", m: "Jakarta · Paket Eksklusif" },
  { q: "Prosesnya cepat, kurang dari sehari undangan kami siap dibagikan. Tim pendukungnya juga responsif menjawab setiap pertanyaan.", a: "Gita & Aldo Pranata", m: "Semarang · Paket Pro" },
];

/* ───────────────────────── Phone preview ───────────────────────── */

/** Clean white iPhone-style frame. Children render full-bleed inside. */
function PhoneFrame({ children, rotate = 0, className = "" }: { children: React.ReactNode; rotate?: number; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
      <div className="absolute left-[-2px] top-[88px] w-[3px] h-[22px] rounded-l-sm" style={{ background: "linear-gradient(90deg, #b4b2af, #d9d7d4)" }} />
      <div className="absolute left-[-2px] top-[124px] w-[3px] h-[44px] rounded-l-sm" style={{ background: "linear-gradient(90deg, #b4b2af, #d9d7d4)" }} />
      <div className="absolute left-[-2px] top-[180px] w-[3px] h-[44px] rounded-l-sm" style={{ background: "linear-gradient(90deg, #b4b2af, #d9d7d4)" }} />
      <div className="absolute right-[-2px] top-[148px] w-[3px] h-[68px] rounded-r-sm" style={{ background: "linear-gradient(270deg, #b4b2af, #d9d7d4)" }} />
      <div
        className="w-[246px] h-[506px] rounded-[44px] p-[3px]"
        style={{
          background: "linear-gradient(135deg, #e8e6e3 0%, #fafaf9 30%, #fafaf9 70%, #d4d2cf 100%)",
          boxShadow: "0 40px 110px -28px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(0,0,0,0.05)",
        }}
      >
        <div className="w-full h-full rounded-[41px] bg-black p-[4px]">
          <div className="w-full h-full rounded-[37px] overflow-hidden bg-paper relative">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center gap-1.5"
              style={{ width: 88, height: 22, background: "#000", borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }}
            >
              <div className="w-[22px] h-[3px] rounded-full" style={{ background: "#15171b" }} />
              <div className="w-[6px] h-[6px] rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #243042, #060a14)" }} />
            </div>
            <div
              className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between pointer-events-none"
              style={{ height: 30, paddingLeft: 26, paddingRight: 24, color: "#fff", mixBlendMode: "difference" }}
            >
              <div className="text-[11px] font-semibold tabular-nums" style={{ letterSpacing: "-0.01em" }}>11.00</div>
              <div className="flex items-center gap-1.5">
                <svg width="12" height="8" viewBox="0 0 16 10" fill="currentColor" aria-hidden>
                  <rect x="0" y="6" width="3" height="4" rx="0.5" />
                  <rect x="4.3" y="4.5" width="3" height="5.5" rx="0.5" />
                  <rect x="8.6" y="2.5" width="3" height="7.5" rx="0.5" />
                  <rect x="12.9" y="0" width="3" height="10" rx="0.5" />
                </svg>
                <svg width="18" height="9" viewBox="0 0 26 12" fill="none" aria-hidden>
                  <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
                  <rect x="2" y="2" width="19" height="8" rx="1.5" fill="currentColor" />
                  <rect x="23.5" y="3.5" width="2" height="5" rx="0.8" fill="currentColor" />
                </svg>
              </div>
            </div>
            <div className="absolute left-0 right-0 bottom-0 overflow-hidden" style={{ top: 30 }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Phone preview that looks like a real wedding invitation cover. */
function TemplatePhoneCard({
  photo, bride, groom, date, eyebrow, accent = "#C9A961",
}: {
  photo: string; bride: string; groom: string; date: string; eyebrow: string; accent?: string;
}) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.85) 100%)" }} />
      <div className="relative h-full flex flex-col items-center justify-end text-center px-5 pb-7 pt-10">
        <div className="absolute top-7 left-0 right-0 px-6 text-center">
          <div className="text-[8px] tracking-[0.35em] uppercase" style={{ color: accent }}>{eyebrow}</div>
        </div>
        <div className="text-cream-soft">
          <div className="font-serif text-[26px] leading-[1.05]">{bride}</div>
          <div className="font-serif text-base my-0.5" style={{ color: accent }}>&amp;</div>
          <div className="font-serif text-[26px] leading-[1.05]">{groom}</div>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[9px] tracking-[0.25em] uppercase" style={{ borderColor: accent, color: "#FAF4E6" }}>
          <span>{date}</span>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[8px] tracking-[0.3em] uppercase" style={{ background: accent, color: "#1A0F08" }}>
          Buka Undangan →
        </div>
      </div>
    </div>
  );
}

function priceLabel(idr: number) {
  if (idr <= 100000) return { tier: "Pro", color: "#A88339" };
  return { tier: "Eksklusif", color: "#8E544E" };
}

/* ───────────────────────── Page ───────────────────────── */

export default function LandingPage() {
  const [tpls, setTpls] = useState<Template[]>([]);
  useEffect(() => {
    api.get<Template[]>("/templates").then((r) => setTpls(r.data.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <PublicLayout>
      {/* ───── HERO (brown, sama seperti navbar) ───── */}
      <section className="bg-brown text-cream-soft">
        <div className="container-narrow pt-32 md:pt-44 pb-20 md:pb-28 grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-12 items-center">
          <div>
            <span className="label-soft text-rose-soft">Undangan Digital, Klasik &amp; Modern</span>
            <h1 className="mt-6 font-serif text-[30px] sm:text-[40px] lg:text-[50px] leading-[1.15] text-cream-soft">
              Undangan pernikahan <span className="text-rose-soft">digital</span>, dalam genggaman tamu Anda
            </h1>
            <p className="mt-6 max-w-xl text-[16px] md:text-[17px] leading-[1.75] text-cream-soft/80">
              weddQ adalah layanan undangan daring untuk pernikahan Anda. Susun dalam hitungan menit, bagikan kepada ratusan tamu melalui WhatsApp, serta kelola RSVP dan amplop digital melalui satu dasbor yang mudah dioperasikan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
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

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[11px] tracking-[0.16em] uppercase text-cream-soft/55">
              {HERO_BADGES.map((b, i) => (
                <span key={b} className="flex items-center gap-3">
                  {i > 0 && <span className="w-1 h-1 bg-rose-soft rounded-full" />}
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <PhoneFrame className="z-10">
              <TemplatePhoneCard
                photo="https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80"
                bride="Arini" groom="Bagas" date="07 · 09 · 2026" eyebrow="The Wedding Of" accent="#C9A961"
              />
            </PhoneFrame>
            <PhoneFrame rotate={6} className="hidden md:block -ml-14 mt-12 opacity-95">
              <TemplatePhoneCard
                photo="https://images.unsplash.com/photo-1606490194859-07c18c9f0968?w=900&q=80"
                bride="Wulan" groom="Iqbal" date="14 · 02 · 2027" eyebrow="Walimatul 'Urs" accent="#D9A39C"
              />
            </PhoneFrame>
          </div>
        </div>
      </section>

      {/* ───── TENTANG (brown, sama seperti navbar) ───── */}
      <section id="about" className="bg-cream-soft text-sepia py-20 md:py-28 scroll-mt-20">
        <div className="container-narrow grid md:grid-cols-[1fr_1.3fr] gap-14 items-center">
          <Reveal>
            <div className="aspect-square rounded-2xl overflow-hidden bg-cream-deep border border-line flex items-center justify-center p-12">
              <Logo size={180} />
            </div>
          </Reveal>

          <Reveal>
            <span className="label-soft">01 · Tentang weddQ</span>
            <h2 className="mt-4 font-serif text-3xl md:text-[40px] leading-tight text-sepia">
              Apa itu weddQ?
            </h2>
            <p className="mt-6 text-[16px] md:text-[17px] leading-loose text-sepia-soft">
              weddQ adalah platform undangan pernikahan digital buatan Indonesia. Kami percaya kabar bahagia layak disampaikan dengan cara yang elegan, modern, dan tetap mengakar pada tradisi.
            </p>
            <p className="mt-4 text-[16px] md:text-[17px] leading-loose text-sepia-soft">
              Cukup pilih template, isi data pasangan dan rangkaian acara, lalu bagikan tautan kepada tamu. Seluruh prosesnya berlangsung melalui satu dasbor sederhana, tanpa keahlian teknis dan tanpa biaya tersembunyi.
            </p>
            <p className="mt-4 text-[16px] md:text-[17px] leading-loose text-sepia-soft">
              Beragam fitur penting telah tersedia: hitung mundur acara, profil mempelai, perjalanan kisah, denah lokasi, formulir RSVP, galeri kenangan, buku tamu, amplop digital, hingga musik latar dari YouTube.
            </p>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { n: "200", l: "Pasangan terlayani" },
                { n: "15 mnt", l: "Waktu setup" },
                { n: "98%", l: "Undangan terbuka" },
                { n: "24/7", l: "Dukungan WhatsApp" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-paper border border-line p-5 text-center">
                  <div className="font-serif text-3xl md:text-4xl text-sepia">{s.n}</div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-sepia-mute leading-snug">{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───── CARA KERJA ───── */}
      <section className="py-20 md:py-28 bg-cream-soft border-y border-line doodle-tx">
        <div className="container-narrow">
          <Reveal className="max-w-2xl mx-auto text-center">
            <span className="label-soft">02 · Cara Kerja</span>
            <h2 className="mt-3 font-serif text-3xl md:text-[40px] leading-tight text-sepia">
              Tiga langkah singkat, kabar terkirim
            </h2>
            <p className="mt-4 text-sepia-soft">
              Mulai dari memilih tema hingga undangan diterima oleh tamu, seluruh prosesnya dapat diselesaikan dalam waktu singkat.
            </p>
          </Reveal>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { n: "01", t: "Pilih tema", d: "Telusuri pustaka berisi 120+ template, kemudian sesuaikan warna, font, serta tata letak agar selaras dengan suasana acara Anda." },
              { n: "02", t: "Isi cerita", d: "Lengkapi profil mempelai, tanggal, lokasi, foto kenangan, dan rekening amplop melalui dasbor yang dirancang agar mudah dipahami." },
              { n: "03", t: "Bagikan", d: "Salin tautan unik untuk setiap tamu, lalu kirim melalui WhatsApp. Pantau RSVP serta ucapan yang masuk secara langsung." },
            ].map((s) => (
              <Reveal key={s.n}>
                <div className="card-soft p-8 h-full">
                  <div className="font-serif text-4xl text-gold">{s.n}</div>
                  <h3 className="mt-4 font-serif text-xl text-sepia">{s.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-sepia-soft">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── TEMPLATES ───── */}
      <section id="templates" className="py-20 md:py-28 scroll-mt-20">
        <div className="container-narrow">
          <Reveal className="max-w-2xl mx-auto text-center">
            <span className="label-soft">03 · Pustaka Tema</span>
            <h2 className="mt-3 font-serif text-3xl md:text-[40px] leading-tight text-sepia">
              Setiap pasangan, kisahnya sendiri
            </h2>
            <p className="mt-4 text-sepia-soft">
              Pilih ragam tema yang sejalan dengan kepribadian Anda, mulai dari klasik Nusantara, modern minimalis, hingga mewah sinematik. Seluruh template dapat dikustomisasi tanpa batas.
            </p>
          </Reveal>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {(tpls.length
              ? tpls
              : Array.from({ length: 6 }).map((_, i) => ({
                  id: String(i),
                  slug: "demo",
                  name: ["Sekar Kencana", "Kasmaran", "Larasati", "Kalpataru", "Prada Emas", "Mekar Wangi"][i],
                  style: ["Klasik · Jawa", "Klasik · Maroon", "Modern · Minimalis", "Islami · Klasik", "Mewah · Dark Mode", "Floral · Pastel"][i],
                  priceIdr: [69000, 110000, 69000, 69000, 110000, 69000][i],
                  badge: i === 0 ? "Bestseller" : i === 1 ? "Baru" : null,
                  palette: ["cream", "maroon", "paper", "cream", "sepia", "paper"][i],
                }))
            ).map((t) => {
              const tier = priceLabel(t.priceIdr);
              return (
                <Reveal key={t.id}>
                  <Link to={`/templates/${t.slug}`} className="block group">
                    <div className="relative rounded-2xl overflow-hidden p-6 bg-cream-deep border border-line transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_24px_50px_-28px_rgba(58,42,28,0.4)]">
                      {t.badge && (
                        <span
                          className="absolute top-3 left-3 z-30 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.12em] font-semibold text-white"
                          style={{ background: tier.color }}
                        >
                          {t.badge}
                        </span>
                      )}
                      <TemplateClusterPreview slug={t.slug} palette={t.palette} />
                    </div>
                    <div className="flex items-end justify-between mt-4 px-1">
                      <div>
                        <div className="font-serif text-xl text-sepia">{t.name}</div>
                        <div className="text-xs text-sepia-mute uppercase tracking-[0.14em] mt-0.5">{t.style}</div>
                      </div>
                      <div
                        className="rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] border"
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

          <div className="text-center mt-12">
            <Link to="/templates" className="btn-ghost">Telusuri Semua Template <span>→</span></Link>
          </div>
        </div>
      </section>

      {/* ───── PRICING ───── */}
      <section id="pricing" className="py-20 md:py-28 scroll-mt-20 bg-cream-soft border-y border-line doodle-tx">
        <div className="container-narrow">
          <Reveal className="max-w-2xl mx-auto text-center">
            <span className="label-soft">04 · Pilihan Paket</span>
            <h2 className="mt-3 font-serif text-3xl md:text-[40px] leading-tight text-sepia">
              Harga yang jujur, fitur yang lengkap
            </h2>
            <p className="mt-4 text-sepia-soft">
              Dua pilihan paket sederhana untuk setiap skala pernikahan. Tanpa langganan, tanpa biaya tersembunyi.
            </p>
          </Reveal>

          <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Pro",
                desc: "Undangan digital lengkap untuk pernikahan Anda",
                price: "69", unit: "rb",
                features: [
                  "Akses seluruh template Pro",
                  "Sampai 400 tamu undangan",
                  "Galeri 20 foto dan cerita",
                  "RSVP dan buku tamu",
                  "Amplop digital (3 rekening)",
                  "Hitung mundur dan denah lokasi",
                  "Musik latar dari YouTube",
                  "Subdomain weddq.id/nama-anda",
                ],
                cta: "Pilih Paket Pro", featured: false,
              },
              {
                name: "Eksklusif",
                desc: "Seluruh fitur premium dengan domain pribadi",
                price: "110", unit: "rb",
                features: [
                  "Seluruh benefit Pro",
                  "Akses seluruh template Eksklusif",
                  "Tamu tak terbatas",
                  "Galeri foto dan video tak terbatas",
                  "Animasi transisi sinematik",
                  "QR check-in",
                  "Musik latar dari YouTube",
                  "Domain pribadi .my.id",
                ],
                cta: "Pilih Eksklusif", featured: true,
              },
            ].map((p) => (
              <Reveal key={p.name}>
                <div className={`relative rounded-2xl p-8 h-full flex flex-col border ${p.featured ? "bg-sepia text-cream-soft border-sepia" : "bg-paper border-line"}`}>
                  {p.featured && (
                    <span className="absolute -top-3 left-8 rounded-full bg-gold-deep text-cream-soft text-[10px] uppercase tracking-[0.18em] px-3 py-1 font-medium">
                      Paling Diminati
                    </span>
                  )}
                  <div className={`text-[11px] uppercase tracking-[0.2em] ${p.featured ? "text-gold-soft" : "text-gold-deep"}`}>Paket</div>
                  <div className={`font-serif text-3xl mt-1 ${p.featured ? "text-cream-soft" : "text-sepia"}`}>{p.name}</div>
                  <p className={`mt-1.5 text-sm ${p.featured ? "text-cream-soft/75" : "text-sepia-soft"}`}>{p.desc}</p>

                  <div className={`mt-6 flex items-baseline gap-1 font-serif ${p.featured ? "text-cream-soft" : "text-sepia"}`}>
                    <span className="text-lg">Rp</span>
                    <span className="text-5xl">{p.price}</span>
                    <span className={`text-xl ${p.featured ? "text-cream-soft/60" : "text-sepia-mute"}`}>{p.unit}</span>
                  </div>

                  <ul className="mt-6 space-y-2.5 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className={`flex gap-2.5 text-sm ${p.featured ? "text-cream-soft/90" : "text-sepia-soft"}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p.featured ? "#C9A961" : "#A88339"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link to="/register" className={`mt-8 ${p.featured ? "btn-gold" : "btn-ghost"} justify-center`}>
                    {p.cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="text-center mt-8 text-xs text-sepia-mute">
            Garansi uang kembali 7 hari. Pembayaran aman melalui QRIS, transfer, dan e-wallet.
          </p>
        </div>
      </section>

      {/* ───── TESTIMONIAL ───── */}
      <section id="testimoni" className="py-16 md:py-20 scroll-mt-20 overflow-hidden">
        <div className="container-narrow">
          <Reveal className="max-w-2xl mx-auto text-center">
            <span className="label-soft">05 · Cerita Pasangan</span>
            <h2 className="mt-3 font-serif text-3xl md:text-[40px] leading-tight text-sepia">
              Apa kata mereka
            </h2>
            <p className="mt-4 text-sepia-soft">200 pasangan telah memercayakan kabar bahagianya kepada weddQ.</p>
          </Reveal>
        </div>

        {/* Marquee slide */}
        <div
          className="mt-12 relative"
          style={{
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
            maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
          }}
        >
          <div className="flex gap-6 w-max marquee-track">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={i} className="card-soft p-7 w-[330px] shrink-0 flex flex-col">
                <div className="text-gold text-3xl font-serif leading-none">“</div>
                <p className="mt-3 font-serif text-[17px] text-sepia leading-snug flex-1">{t.q}</p>
                <div className="mt-6 flex items-center gap-3 pt-5 border-t border-line">
                  <div className="w-10 h-10 rounded-full bg-gold-deep text-cream-soft font-serif flex items-center justify-center text-lg shrink-0">{t.a[0]}</div>
                  <div>
                    <div className="font-serif text-base text-sepia">{t.a}</div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-sepia-mute mt-0.5">{t.m}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="pt-4 md:pt-6 pb-16 md:pb-20">
        <div className="container-narrow">
          <div className="relative overflow-hidden rounded-3xl bg-brown text-cream-soft px-8 py-16 md:px-16 md:py-20 text-center">
            <span className="label-soft text-rose-soft">Mulai Hari Ini</span>
            <h2 className="mt-5 font-serif text-3xl md:text-5xl text-cream-soft leading-tight">
              Siap berbagi <span className="text-rose-soft">kabar bahagia</span>?
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-cream-soft/80">
              Susun undangan digital Anda dalam waktu kurang dari 15 menit. Tanpa kartu kredit, dapat dicoba menggunakan template pilihan.
            </p>
            <div className="mt-8 flex gap-3 flex-wrap justify-center">
              <Link to="/register" className="btn-gold">Buat Undangan Sekarang →</Link>
              <Link
                to="/arini-bagas"
                className="inline-flex items-center gap-2.5 rounded-full border border-cream-soft/40 bg-transparent text-cream-soft px-7 py-3.5 text-sm font-medium tracking-wide transition hover:bg-cream-soft/10 hover:border-cream-soft"
              >
                Lihat Contoh Undangan
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
