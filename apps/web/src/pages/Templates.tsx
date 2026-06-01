import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/PublicLayout";
import { BatikBg, Divider } from "@/components/Ornaments";
import { Reveal } from "@/components/Reveal";
import { api } from "@/lib/api";
import { getPalette, isDarkPalette } from "@/lib/palette";

type Template = {
  id: string;
  slug: string;
  name: string;
  style: string;
  category: string;
  priceIdr: number;
  badge?: string | null;
  palette: string;
  description?: string | null;
};

const CATEGORIES = [
  { id: "all", label: "Semua" },
  { id: "klasik", label: "Klasik · Jawa" },
  { id: "modern", label: "Modern · Minimalis" },
  { id: "islami", label: "Islami" },
  { id: "rustic", label: "Rustik" },
  { id: "floral", label: "Floral" },
  { id: "mewah", label: "Mewah · Royal" },
];

const PACKAGE_BUCKETS = [
  { id: "all", label: "Semua paket", match: () => true },
  { id: "pro", label: "Paket Pro", match: (p: number) => p <= 60000 },
  { id: "cinematic", label: "Paket Cinematic", match: (p: number) => p > 60000 && p <= 90000 },
  { id: "signature", label: "Paket Signature", match: (p: number) => p > 90000 },
];

function packageTier(idr: number) {
  if (idr <= 60000) return { tier: "Pro", color: "#A88339" };
  if (idr <= 90000) return { tier: "Cinematic", color: "#C9A961" };
  return { tier: "Signature", color: "#8E544E" };
}

function paletteSwatch(palette: string): [string, string] {
  const p = getPalette(palette);
  return [isDarkPalette(palette) ? p.card : p.bg, p.accent];
}

/** Phone mockup that visually echoes the actual template's renderer */
function TemplatePhoneMock({ slug, palette, names = "Arini & Bagas", date = "07 · 09 · 2026", eyebrow = "The Wedding Of" }: {
  slug: string;
  palette: string;
  names?: string;
  date?: string;
  eyebrow?: string;
}) {
  const p = getPalette(palette);
  const isDark = isDarkPalette(palette);
  const [a, b] = names.split("&").map((s) => s.trim());

  // Per-slug demo photo + sample names
  const sample = templateSample(slug);
  const photo = sample.photo;
  const bride = sample.bride ?? a;
  const groom = sample.groom ?? b;
  const eb = sample.eyebrow ?? eyebrow;
  const dt = sample.date ?? date;

  // White iPhone-style mockup with notch + iOS status bar.
  const shell = (inside: React.ReactNode) => (
    <div className="relative mx-auto" style={{ width: 204, height: 420 }}>
      {/* Side buttons */}
      <div className="absolute left-[-2px] top-[68px] w-[2px] h-[16px] rounded-l-sm" style={{ background: "linear-gradient(90deg, #b4b2af, #d9d7d4)" }} />
      <div className="absolute left-[-2px] top-[96px] w-[2px] h-[32px] rounded-l-sm" style={{ background: "linear-gradient(90deg, #b4b2af, #d9d7d4)" }} />
      <div className="absolute left-[-2px] top-[140px] w-[2px] h-[32px] rounded-l-sm" style={{ background: "linear-gradient(90deg, #b4b2af, #d9d7d4)" }} />
      <div className="absolute right-[-2px] top-[112px] w-[2px] h-[52px] rounded-r-sm" style={{ background: "linear-gradient(270deg, #b4b2af, #d9d7d4)" }} />

      {/* White silver body */}
      <div
        className="absolute inset-0 rounded-[38px] p-[2px]"
        style={{
          background: "linear-gradient(135deg, #e8e6e3 0%, #fafaf9 30%, #fafaf9 70%, #d4d2cf 100%)",
          boxShadow: "0 22px 50px -18px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        {/* Inner bezel */}
        <div className="w-full h-full rounded-[36px] bg-black p-[3px]">
          {/* Screen canvas */}
          <div className="w-full h-full rounded-[33px] overflow-hidden relative" style={{ background: p.bg }}>
            {/* Notch */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center gap-1"
              style={{
                width: 70,
                height: 18,
                background: "#000",
                borderBottomLeftRadius: 11,
                borderBottomRightRadius: 11,
              }}
            >
              <div className="w-[16px] h-[2.5px] rounded-full" style={{ background: "#15171b" }} />
              <div className="w-[5px] h-[5px] rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #243042, #060a14)" }} />
            </div>

            {/* iOS status bar */}
            <div
              className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between pointer-events-none"
              style={{ height: 22, paddingLeft: 12, paddingRight: 11, color: "#fff", mixBlendMode: "difference" }}
            >
              <div className="text-[9px] font-semibold tabular-nums" style={{ letterSpacing: "-0.01em" }}>11.00</div>
              <div className="flex items-center gap-[3px]">
                <svg width="11" height="7" viewBox="0 0 12 8" fill="currentColor" aria-hidden>
                  <rect x="0" y="5" width="2" height="3" rx="0.4" />
                  <rect x="3" y="3.5" width="2" height="4.5" rx="0.4" />
                  <rect x="6" y="1.5" width="2" height="6.5" rx="0.4" />
                  <rect x="9" y="0" width="2" height="8" rx="0.4" />
                </svg>
                <svg width="10" height="7" viewBox="0 0 15 11" fill="currentColor" aria-hidden>
                  <path d="M7.5 1.5C4.4 1.5 1.7 2.7 0 4.5l1.7 1.7c1.5-1.4 3.6-2.2 5.8-2.2s4.3.8 5.8 2.2L15 4.5C13.3 2.7 10.6 1.5 7.5 1.5zM7.5 5C5.6 5 4 5.8 2.8 7L4.5 8.7c.8-.7 1.9-1.2 3-1.2s2.2.5 3 1.2L12.2 7C11 5.8 9.4 5 7.5 5zM7.5 8.4c-.7 0-1.3.6-1.3 1.3s.6 1.3 1.3 1.3 1.3-.6 1.3-1.3-.6-1.3-1.3-1.3z" />
                </svg>
                <svg width="17" height="8" viewBox="0 0 26 12" fill="none" aria-hidden>
                  <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
                  <rect x="2" y="2" width="19" height="8" rx="1.5" fill="currentColor" />
                  <rect x="23.5" y="3.5" width="2" height="5" rx="0.8" fill="currentColor" />
                </svg>
              </div>
            </div>

            {inside}
          </div>
        </div>
      </div>
    </div>
  );

  /* CINEMATIC variant — Purnama */
  if (slug === "purnama") {
    return shell(
      <div className="relative w-full h-full">
        <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 40%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.85) 75%)" }} />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <div className="text-[7px] tracking-[0.4em] uppercase" style={{ color: "#D4A05E" }}>{eb}</div>
          <div className="font-serif text-cream-soft mt-5 text-[28px] leading-[0.95]">
            {bride}
            <div className="my-1 text-base" style={{ color: "#D4A05E" }}>&amp;</div>
            {groom}
          </div>
          <div className="mt-6 flex items-center gap-2 text-[7px] tracking-[0.35em] uppercase text-cream-soft/80">
            <span>{dt}</span>
          </div>
        </div>
      </div>
    );
  }

  /* EDITORIAL variant — Mahligai (split layout) */
  if (slug === "mahligai") {
    return shell(
      <div className="relative w-full h-full" style={{ background: "#FCF7EB", color: "#1F1A14" }}>
        <img src={photo} alt="" className="absolute top-0 left-0 right-0 h-1/2 w-full object-cover" />
        <div className="absolute top-2 right-2 z-10 text-[6px] tracking-[0.35em] uppercase opacity-90" style={{ color: "#FCF7EB", mixBlendMode: "difference" }}>
          Vol. 01
        </div>
        <div className="absolute top-1/2 left-0 right-0 bottom-0 p-4 flex flex-col justify-center">
          <div className="text-[7px] tracking-[0.35em] uppercase" style={{ color: "#B57341" }}>The Wedding Of</div>
          <div className="font-serif mt-2" style={{ fontSize: 28, lineHeight: 0.95 }}>{bride}</div>
          <div className="font-serif my-0.5" style={{ color: "#B57341", fontSize: 18 }}>&amp;</div>
          <div className="font-serif pl-3" style={{ fontSize: 28, lineHeight: 0.95 }}>{groom}</div>
          <div className="mt-3 text-[7px] tracking-[0.35em] uppercase opacity-70">{dt}</div>
        </div>
      </div>
    );
  }

  /* RUSTIC SUNSET variant — Terakota Senja */
  if (slug === "terakota-senja") {
    return shell(
      <div className="relative w-full h-full overflow-hidden">
        {/* sunset gradient sky */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #F4D9BC 0%, #D9806A 45%, #7A3520 100%)` }} />
        {/* horizon silhouette */}
        <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="absolute bottom-0 w-full" style={{ height: "32%" }}>
          <path d="M0 30 L30 18 L60 26 L100 14 L140 24 L180 16 L200 22 L200 80 L0 80 Z" fill="#7A3520" opacity="0.95" />
        </svg>
        {/* sun disc */}
        <div className="absolute" style={{ top: "26%", left: "50%", transform: "translateX(-50%)" }}>
          <div className="w-14 h-14 rounded-full" style={{ background: "radial-gradient(circle at 50% 50%, #FBEFDD, #E8642A 70%, transparent)", boxShadow: "0 0 22px #E8642A88" }} />
        </div>
        {/* photo as mix-blend backdrop */}
        <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-30" />

        <div className="relative h-full flex flex-col items-center justify-end text-center px-4 pb-6">
          <div className="text-[7px] tracking-[0.4em] uppercase" style={{ color: "#FBEFDD" }}>{eb}</div>
          <div className="font-serif mt-3" style={{ color: "#FBEFDD", fontSize: 26, lineHeight: 0.95 }}>
            {bride}
            <div className="my-0.5 text-sm italic" style={{ color: "#F4D9BC" }}>&amp;</div>
            {groom}
          </div>
          <div className="mt-3 px-2 py-0.5 text-[7px] tracking-[0.3em] uppercase" style={{ background: "#FBEFDD22", color: "#FBEFDD", border: "1px solid #FBEFDD55" }}>
            {dt}
          </div>
          {/* tile border bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1.5 pb-1.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rotate-45 border" style={{ borderColor: "#FBEFDD", opacity: 0.7 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* WATERCOLOR FLORAL variant — Kembang Setaman */
  if (slug === "kembang-setaman") {
    return shell(
      <div className="relative w-full h-full overflow-hidden" style={{ background: "radial-gradient(ellipse at top, #F4D9D1 0%, #FBF0EC 60%, #FDF7F2 100%)" }}>
        {/* watercolor rose washes in corners */}
        <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full" style={{ background: "radial-gradient(circle, #D5847E66, transparent 70%)" }} />
        <div className="absolute -top-2 -right-4 w-16 h-16 rounded-full" style={{ background: "radial-gradient(circle, #A24D5566, transparent 70%)" }} />
        <div className="absolute -bottom-4 -left-2 w-20 h-20 rounded-full" style={{ background: "radial-gradient(circle, #D5847E66, transparent 70%)" }} />
        <div className="absolute -bottom-3 -right-4 w-16 h-16 rounded-full" style={{ background: "radial-gradient(circle, #A24D5566, transparent 70%)" }} />
        {/* leaf accents */}
        <svg className="absolute top-3 right-3 opacity-70" width="34" height="34" viewBox="0 0 40 40">
          <g stroke="#7A8A6B" strokeWidth="0.7" fill="#7A8A6B" fillOpacity="0.4">
            <ellipse cx="20" cy="10" rx="8" ry="3" transform="rotate(-30 20 10)" />
            <ellipse cx="14" cy="22" rx="7" ry="2.5" transform="rotate(20 14 22)" />
            <ellipse cx="26" cy="22" rx="7" ry="2.5" transform="rotate(-20 26 22)" />
          </g>
        </svg>
        {/* photo medallion (arched top) */}
        <div className="absolute top-7 left-1/2 -translate-x-1/2" style={{ width: 100, height: 130 }}>
          <div className="absolute inset-0 bg-white p-1" style={{ borderRadius: "50px 50px 6px 6px", boxShadow: "0 8px 18px -8px #A24D5566" }}>
            <div className="w-full h-full overflow-hidden" style={{ borderRadius: "46px 46px 4px 4px" }}>
              <img src={photo} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-3 pb-5 pt-2 text-center">
          <div className="text-[7px] tracking-[0.4em] uppercase" style={{ color: "#D5847E" }}>{eb}</div>
          <div className="font-serif mt-1" style={{ color: "#3D2530", fontSize: 22, lineHeight: 0.95 }}>
            {bride}
            <div className="font-serif italic my-0.5" style={{ color: "#A24D55", fontSize: 12 }}>&amp;</div>
            {groom}
          </div>
          {/* scallop */}
          <svg viewBox="0 0 120 8" className="mt-1.5 mx-auto" width="80" height="6">
            <path d="M0 6 Q6 0 12 6 T24 6 T36 6 T48 6 T60 6 T72 6 T84 6 T96 6 T108 6 T120 6" stroke="#D5847E" strokeWidth="0.6" fill="none" />
          </svg>
          <div className="mt-1.5 inline-block px-2 py-0.5 text-[7px] tracking-[0.3em] uppercase font-serif italic" style={{ background: "#FDF7F2", color: "#7C4252", border: "1px solid #C9999A", borderRadius: 999 }}>
            {dt}
          </div>
        </div>
      </div>
    );
  }

  /* LUXE BURGUNDY variant — Kasmaran */
  if (slug === "kasmaran") {
    return shell(
      <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-4" style={{ background: "#2A0E11", color: "#F5E5C8" }}>
        <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 40%, rgba(42,14,17,0.55) 0%, rgba(42,14,17,0.95) 70%)" }} />
        {/* gold corner brackets */}
        <span className="absolute top-2 left-2 w-4 h-4 border-l border-t" style={{ borderColor: "#D4B26B" }} />
        <span className="absolute top-2 right-2 w-4 h-4 border-r border-t" style={{ borderColor: "#D4B26B" }} />
        <span className="absolute bottom-2 left-2 w-4 h-4 border-l border-b" style={{ borderColor: "#D4B26B" }} />
        <span className="absolute bottom-2 right-2 w-4 h-4 border-r border-b" style={{ borderColor: "#D4B26B" }} />
        <div className="relative">
          {/* mini wax seal */}
          <div className="w-9 h-9 mx-auto mb-3 rounded-full flex items-center justify-center font-serif text-[10px]" style={{
            background: "radial-gradient(circle at 35% 35%, #C1545A, #7A1F2A)",
            color: "#D4B26B",
          }}>
            {bride[0]}&amp;{groom[0]}
          </div>
          <div className="text-[7px] tracking-[0.4em] uppercase" style={{ color: "#D4B26B" }}>{eb}</div>
          <div className="font-serif mt-3 text-[26px] leading-[0.95]">
            {bride}
            <div className="my-1 text-sm" style={{ color: "#D4B26B" }}>&amp;</div>
            {groom}
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <span className="h-px w-8" style={{ background: "#D4B26B", opacity: 0.5 }} />
            <span className="w-1.5 h-1.5 rotate-45 border" style={{ borderColor: "#D4B26B" }} />
            <span className="h-px w-8" style={{ background: "#D4B26B", opacity: 0.5 }} />
          </div>
          <div className="mt-2 text-[7px] tracking-[0.35em] uppercase opacity-70">{dt}</div>
        </div>
      </div>
    );
  }

  /* DEFAULT (Sekar/Larasati/etc): cover photo + colored frame + names */
  return shell(
    <div className="relative w-full h-full" style={{ background: p.bg, color: p.fg }}>
      <img src={photo} alt="" className="absolute top-2 left-2 right-2 h-[55%] object-cover w-[calc(100%-1rem)]" style={{ filter: isDark ? "brightness(0.85)" : undefined }} />
      <div className="absolute inset-0 pointer-events-none" style={{ border: `1px solid ${p.accent}`, margin: 6, opacity: 0.6 }} />
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 flex flex-col items-center text-center">
        <div className="text-[7px] tracking-[0.35em] uppercase" style={{ color: p.accent }}>{eb}</div>
        <div className="flex items-center gap-1.5 my-1.5">
          <span className="h-px w-6" style={{ background: p.accent, opacity: 0.5 }} />
          <span className="w-1.5 h-1.5 rotate-45 border" style={{ borderColor: p.accent }} />
          <span className="h-px w-6" style={{ background: p.accent, opacity: 0.5 }} />
        </div>
        <div className="font-serif text-[22px] leading-tight" style={{ color: p.fg }}>
          {bride}
          <div className="text-sm my-0.5" style={{ color: p.accent }}>&amp;</div>
          {groom}
        </div>
        <div className="mt-2 text-[7px] tracking-[0.35em] uppercase opacity-70">{dt}</div>
      </div>
    </div>
  );
}

/** Cluster of 3 white iPhone mockups spread casually, like flat-lay product shots. */
function TemplateClusterPreview({ slug, palette }: { slug: string; palette: string }) {
  return (
    <div className="relative h-[340px] flex items-center justify-center" style={{ perspective: "1200px" }}>
      {/* Left phone */}
      <div
        className="absolute"
        style={{
          transform: "translateX(-80px) translateY(18px) rotate(-9deg) scale(0.7)",
          transformOrigin: "center",
          zIndex: 1,
          filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.18))",
        }}
      >
        <TemplatePhoneMock slug={slug} palette={palette} />
      </div>
      {/* Right phone */}
      <div
        className="absolute"
        style={{
          transform: "translateX(80px) translateY(18px) rotate(9deg) scale(0.7)",
          transformOrigin: "center",
          zIndex: 1,
          filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.18))",
        }}
      >
        <TemplatePhoneMock slug={slug} palette={palette} />
      </div>
      {/* Center phone — main, on top */}
      <div
        className="relative"
        style={{
          transform: "scale(0.82)",
          zIndex: 2,
          filter: "drop-shadow(0 28px 40px rgba(0,0,0,0.22))",
        }}
      >
        <TemplatePhoneMock slug={slug} palette={palette} />
      </div>
    </div>
  );
}

const TEMPLATE_SAMPLES: Record<string, { photo: string; bride?: string; groom?: string; eyebrow?: string; date?: string }> = {
  "sekar-kencana":   { photo: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=70", bride: "Arini",     groom: "Bagas",     eyebrow: "The Wedding Of", date: "07 · 09 · 2026" },
  "kasmaran":        { photo: "https://images.unsplash.com/photo-1606490194859-07c18c9f0968?w=600&q=70", bride: "Mahar",     groom: "Dirga",     eyebrow: "Pawiwahan",       date: "12 · 12 · 2026" },
  "larasati":        { photo: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=70", bride: "Larasati",  groom: "Wirajaya",  eyebrow: "Save The Date",   date: "21 · 05 · 2027" },
  "kalpataru":       { photo: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=70", bride: "Khadijah",  groom: "Ibrahim",   eyebrow: "Walimatul 'Urs",  date: "14 · 06 · 2027" },
  "prada-emas":      { photo: "https://images.unsplash.com/photo-1525772764200-be829a350797?w=600&q=70", bride: "Anindya",   groom: "Tegar",     eyebrow: "Pernikahan",      date: "03 · 10 · 2026" },
  "mekar-wangi":     { photo: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&q=70", bride: "Kemala",    groom: "Pradipta",  eyebrow: "The Wedding",     date: "19 · 06 · 2027" },
  "rustik-jati":     { photo: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=70", bride: "Sekar",     groom: "Lintang",   eyebrow: "Save The Date",   date: "05 · 08 · 2027" },
  "anggun-navy":     { photo: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=70", bride: "Maharani",  groom: "Rangga",    eyebrow: "Royal Wedding",   date: "22 · 11 · 2026" },
  "saka-bumi":       { photo: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=70", bride: "Dewi",      groom: "Wayan",     eyebrow: "Pawiwahan",       date: "08 · 04 · 2027" },
  "purnama":         { photo: "https://images.unsplash.com/photo-1606490194859-07c18c9f0968?w=600&q=70", bride: "Naya",      groom: "Adira",     eyebrow: "Save The Date",   date: "30 · 01 · 2027" },
  "kembang-setaman": { photo: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=600&q=70", bride: "Melati",    groom: "Pradana",   eyebrow: "The Wedding Of",  date: "17 · 07 · 2027" },
  "terakota-senja":  { photo: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=70", bride: "Anggun",    groom: "Bagaskara", eyebrow: "Save The Date",   date: "23 · 09 · 2026" },
  "mahligai":        { photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=70", bride: "Wulan",     groom: "Iqbal",     eyebrow: "Walimatul 'Urs",  date: "14 · 02 · 2027" },
};

function templateSample(slug: string) {
  return TEMPLATE_SAMPLES[slug] ?? {
    photo: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=70",
    bride: "Arini",
    groom: "Bagas",
    eyebrow: "The Wedding Of",
    date: "07 · 09 · 2026",
  };
}

export default function TemplatesPage() {
  const [items, setItems] = useState<Template[]>([]);
  const [cat, setCat] = useState("all");
  const [pkg, setPkg] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<Template[]>("/templates").then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const bucket = PACKAGE_BUCKETS.find((b) => b.id === pkg)!;
    return items.filter((t) => {
      if (cat !== "all" && t.category !== cat) return false;
      if (!bucket.match(t.priceIdr)) return false;
      if (q && !`${t.name} ${t.style}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, cat, pkg, q]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    items.forEach((t) => (c[t.category] = (c[t.category] ?? 0) + 1));
    return c;
  }, [items]);

  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-brown text-cream-soft border-b border-line">
        <BatikBg className="absolute inset-0 opacity-20" color="#D9A39C" opacity={0.5} />
        <div className="container-narrow py-20 md:py-24 relative">
          <div className="max-w-3xl">
            <span className="sec-num" style={{ color: "#D9A39C" }}>PUSTAKA TEMPLATE</span>
            <h1 className="mt-4 text-4xl md:text-6xl font-serif text-cream-soft">
              Setiap kisah,<br /><em className="text-rose-soft">berbeda baitnya</em>
            </h1>
            <Divider width={240} color="#D9A39C" className="mt-6" />
            <p className="mt-6 text-cream-soft/80 text-[16px] md:text-[17px] leading-relaxed">
              Telusuri ragam tema undangan, mulai dari klasik Nusantara, modern minimalis, hingga sinematik mewah. Setiap template dapat disesuaikan secara menyeluruh, meliputi warna, font, hingga urutan blok cerita.
            </p>
          </div>
        </div>
      </section>

      <section className="container-narrow py-14 grid lg:grid-cols-[280px_1fr] gap-10">
        {/* FILTERS */}
        <aside className="space-y-8 self-start lg:sticky lg:top-24">
          <div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari template…"
              className="w-full border border-line bg-paper px-4 py-3 rounded text-sm"
            />
          </div>
          <FilterGroup title="Kategori">
            {CATEGORIES.map((c) => (
              <FilterItem key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
                {c.label}
                <span className="ml-auto text-xs text-sepia-mute">{counts[c.id] ?? 0}</span>
              </FilterItem>
            ))}
          </FilterGroup>
          <FilterGroup title="Pilihan Paket">
            {PACKAGE_BUCKETS.map((b) => (
              <FilterItem key={b.id} active={pkg === b.id} onClick={() => setPkg(b.id)}>
                {b.label}
              </FilterItem>
            ))}
          </FilterGroup>
          <FilterGroup title="Fitur populer">
            {["RSVP Online", "Live Streaming", "Galeri Video", "QR Check-in", "Amplop Digital"].map((f) => (
              <FilterItem key={f}>{f}</FilterItem>
            ))}
          </FilterGroup>
        </aside>

        {/* GRID */}
        <div>
          <div className="flex items-center justify-between mb-6 text-sm text-sepia-soft">
            <div>
              Menampilkan <b className="text-sepia">{filtered.length}</b> template
              {cat !== "all" && <> · kategori <b className="text-sepia">{CATEGORIES.find((c) => c.id === cat)?.label}</b></>}
            </div>
          </div>

          {loading ? (
            <div className="text-sepia-mute">Memuat template…</div>
          ) : filtered.length === 0 ? (
            <div className="card-paper bracketed p-12 text-center text-sepia-soft">
              Tidak ada template yang cocok dengan filter Anda.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-7">
              {filtered.map((t) => {
                const [bg, ac] = paletteSwatch(t.palette);
                const tier = packageTier(t.priceIdr);
                return (
                  <Reveal key={t.id}>
                    <Link to={`/templates/${t.slug}`} className="group block">
                      <div
                        className="relative rounded-xl overflow-hidden p-6 transition-transform group-hover:-translate-y-1 group-hover:shadow-soft"
                        style={{
                          background: "linear-gradient(135deg, #efebe5 0%, #e8e3db 60%, #ddd6cb 100%)",
                          border: "1px solid rgba(58,42,28,0.10)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
                        }}
                      >
                        {t.badge && (
                          <span
                            className="absolute top-3 left-3 z-30 rounded-r-full pl-2.5 pr-3.5 py-1 text-[10px] uppercase tracking-[0.15em] font-semibold text-white"
                            style={{ background: tier.color }}
                          >
                            {t.badge}
                          </span>
                        )}
                        <TemplateClusterPreview slug={t.slug} palette={t.palette} />
                      </div>
                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <div className="font-serif text-2xl">{t.name}</div>
                          <div className="text-xs text-sepia-mute uppercase tracking-[0.15em] mt-0.5">{t.style}</div>
                          <div className="flex gap-1 mt-2">
                            <span className="w-3 h-3 rounded-full border border-line" style={{ background: bg }} />
                            <span className="w-3 h-3 rounded-full border border-line" style={{ background: ac }} />
                          </div>
                        </div>
                        <div
                          className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-medium whitespace-nowrap"
                          style={{ borderColor: tier.color, color: tier.color }}
                        >
                          Paket {tier.tier}
                        </div>
                      </div>
                      {t.description && <p className="text-sm text-sepia-soft mt-3">{t.description}</p>}
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.22em] text-sepia-mute mb-3">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterItem({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center text-left rounded px-3 py-2 text-sm transition border ${
        active ? "border-sepia bg-sepia text-cream-soft" : "border-transparent text-sepia-soft hover:bg-cream-deep hover:border-line"
      }`}
    >
      {children}
    </button>
  );
}
