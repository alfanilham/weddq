import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/PublicLayout";
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
  { id: "pro", label: "Paket Pro", match: (p: number) => p <= 100000 },
  { id: "eksklusif", label: "Paket Eksklusif", match: (p: number) => p > 100000 },
];

function packageTier(idr: number) {
  if (idr <= 100000) return { tier: "Pro", color: "#A88339" };
  return { tier: "Eksklusif", color: "#8E544E" };
}

function paletteSwatch(palette: string): [string, string] {
  const p = getPalette(palette);
  return [isDarkPalette(palette) ? p.card : p.bg, p.accent];
}

/** Phone mockup that visually echoes the actual template's renderer */
type PhoneScene = "cover" | "couple" | "journey";

function TemplatePhoneMock({ slug, palette, names = "Arini & Bagas", date = "07 · 09 · 2026", eyebrow = "The Wedding Of", scene = "cover" }: {
  slug: string;
  palette: string;
  names?: string;
  date?: string;
  eyebrow?: string;
  scene?: PhoneScene;
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

            {/* iOS status bar — signal + battery only */}
            <div
              className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between pointer-events-none"
              style={{ height: 24, paddingLeft: 18, paddingRight: 16, color: "#fff", mixBlendMode: "difference" }}
            >
              <div className="text-[9px] font-semibold tabular-nums" style={{ letterSpacing: "-0.01em" }}>11.00</div>
              <div className="flex items-center gap-1">
                <svg width="9" height="6" viewBox="0 0 12 8" fill="currentColor" aria-hidden>
                  <rect x="0" y="5" width="2" height="3" rx="0.4" />
                  <rect x="3" y="3.5" width="2" height="4.5" rx="0.4" />
                  <rect x="6" y="1.5" width="2" height="6.5" rx="0.4" />
                  <rect x="9" y="0" width="2" height="8" rx="0.4" />
                </svg>
                <svg width="14" height="7" viewBox="0 0 26 12" fill="none" aria-hidden>
                  <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
                  <rect x="2" y="2" width="19" height="8" rx="1.5" fill="currentColor" />
                  <rect x="23.5" y="3.5" width="2" height="5" rx="0.8" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Template canvas — pushed below status bar */}
            <div className="absolute left-0 right-0 bottom-0 overflow-hidden" style={{ top: 24 }}>
              {inside}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* COUPLE scene — bride & groom side-by-side (palette-aware) */
  if (scene === "couple") {
    const accentColor = isDark ? p.accent : p.accent;
    return shell(
      <div className="relative w-full h-full" style={{ background: p.bg, color: p.fg }}>
        <div className="absolute inset-0 px-3 pt-4 pb-5 flex flex-col items-center text-center">
          <div className="text-[6.5px] tracking-[0.35em] uppercase" style={{ color: accentColor }}>Mempelai Berbahagia</div>
          <div className="font-serif text-[12px] mt-1" style={{ color: p.fg }}>Dua Hati Bersatu</div>

          <div className="mt-3 grid grid-cols-2 gap-2 w-full">
            {[
              { name: bride, label: "Putri", img: photo },
              { name: groom, label: "Putra", img: photo },
            ].map((person, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="relative" style={{ width: "100%", aspectRatio: "3/4", borderRadius: 6, overflow: "hidden", border: `1px solid ${accentColor}55`, background: isDark ? p.card : p.bg }}>
                  <img src={person.img} alt="" className="w-full h-full object-cover" style={{ filter: isDark ? "brightness(0.8)" : undefined }} />
                </div>
                <div className="text-[5.5px] tracking-[0.3em] uppercase mt-1.5" style={{ color: accentColor }}>{person.label}</div>
                <div className="font-serif text-[10px] mt-0.5" style={{ color: p.fg }}>{person.name}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <span className="h-px w-6" style={{ background: accentColor, opacity: 0.5 }} />
            <span className="w-1.5 h-1.5 rotate-45 border" style={{ borderColor: accentColor }} />
            <span className="h-px w-6" style={{ background: accentColor, opacity: 0.5 }} />
          </div>
        </div>
      </div>
    );
  }

  /* JOURNEY scene — Perjalanan Kami chapter card */
  if (scene === "journey") {
    const accentColor = p.accent;
    return shell(
      <div className="relative w-full h-full" style={{ background: p.bg, color: p.fg }}>
        <div className="absolute inset-0 px-3 pt-4 pb-5 flex flex-col items-center text-center">
          <div className="text-[6.5px] tracking-[0.35em] uppercase" style={{ color: accentColor }}>Cerita Kami</div>
          <div className="font-serif italic text-[14px] mt-1" style={{ color: p.fg }}>Perjalanan Kami</div>
          {/* Heart divider */}
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-px w-6" style={{ background: accentColor, opacity: 0.5 }} />
            <svg width="9" height="8" viewBox="0 0 14 12" fill="none" aria-hidden>
              <path d="M7 11.5S0.5 7.5 0.5 3.8C0.5 2 2 0.5 3.8 0.5c1 0 2.4 0.7 3.2 1.8C7.8 1.2 9.2 0.5 10.2 0.5c1.8 0 3.3 1.5 3.3 3.3 0 3.7-6.5 7.7-6.5 7.7z" stroke={accentColor} strokeWidth="0.8" strokeLinejoin="round"/>
            </svg>
            <span className="h-px w-6" style={{ background: accentColor, opacity: 0.5 }} />
          </div>

          {/* Chapter card */}
          <div className="mt-3 w-full p-1.5 flex flex-col gap-1.5" style={{
            background: isDark ? p.card : p.bg,
            border: `1px solid ${accentColor}55`,
            borderRadius: 6,
          }}>
            <div className="w-full overflow-hidden" style={{ aspectRatio: "4/3", borderRadius: 4 }}>
              <img src={photo} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="px-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[6.5px]" style={{ color: accentColor }}>01</span>
                <span className="h-px w-3" style={{ background: accentColor, opacity: 0.5 }} />
                <span className="text-[7px] font-bold tracking-[0.2em] uppercase" style={{ color: accentColor }}>Pertemuan</span>
              </div>
              <p className="text-[6px] leading-[1.5] mt-1 text-left" style={{ color: isDark ? p.soft : p.soft }}>
                Tidak ada yang kebetulan di dunia ini, semua sudah tersusun rapi oleh Sang Maha Kuasa…
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* LUMINA — modern minimalist luxe (light/champagne) */
  if (slug === "lumina") {
    return shell(
      <div className="relative w-full h-full overflow-hidden">
        <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1B1A16b3 0%, #1B1A1680 45%, #1B1A16e6 100%)" }} />
        {/* rotating champagne aura */}
        <div className="absolute top-[16%] left-1/2 -translate-x-1/2 w-24 h-24 rounded-full lum-mini-aura" style={{ background: "conic-gradient(from 0deg, transparent, #CDB08988, transparent 35%, #B08D5766, transparent 70%, #CDB08988, transparent)", filter: "blur(8px)", opacity: 0.7 }} />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ border: "1px solid #CDB08988" }}>
            <span className="font-serif italic text-[11px]" style={{ color: "#CDB089" }}>{bride[0]}{groom[0]}</span>
          </span>
          <div className="mt-2 text-[6.5px] tracking-[0.4em] uppercase" style={{ color: "#CDB089" }}>{eb}</div>
          <div className="font-serif mt-2" style={{ color: "#FFFFFF", fontSize: 26, lineHeight: 1 }}>
            {bride}<div className="my-0.5 italic text-xs" style={{ color: "#CDB089" }}>&amp;</div>{groom}
          </div>
          <div className="mt-2 text-[6.5px] tracking-[0.32em] uppercase" style={{ color: "#FFFFFFcc" }}>{dt}</div>
          <div className="mt-3 px-3 py-1 rounded-full text-[6.5px] tracking-[0.3em] uppercase" style={{ background: "#CDB089", color: "#1B1A16" }}>Buka Undangan →</div>
        </div>
        <style>{`@keyframes lum-mini { to { transform: translateX(-50%) rotate(360deg); } } .lum-mini-aura{ animation: lum-mini 14s linear infinite; }`}</style>
      </div>
    );
  }

  /* NOCTURA — modern dark luxe (gold shimmer) */
  if (slug === "noctura") {
    return shell(
      <div className="relative w-full h-full overflow-hidden">
        <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 40%, #0E0E1166 0%, #0E0E11cc 55%, #0E0E11f7 100%)" }} />
        {/* gold particles */}
        {[["12%", "24%"], ["80%", "30%"], ["28%", "70%"], ["66%", "66%"]].map(([l, t], i) => (
          <span key={i} className="absolute w-[3px] h-[3px] rounded-full noc-mini-p" style={{ left: l, top: t, background: "#E6CD8B", animationDelay: `${i * 0.6}s` }} />
        ))}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <span className="inline-flex items-center justify-center w-9 h-9" style={{ border: "1px solid #C9A24B66", borderRadius: 3, transform: "rotate(45deg)" }}>
            <span className="font-serif italic text-[9px]" style={{ color: "#E6CD8B", transform: "rotate(-45deg)" }}>{bride[0]}&amp;{groom[0]}</span>
          </span>
          <div className="mt-2 text-[6.5px] tracking-[0.4em] uppercase" style={{ color: "#E6CD8B" }}>{eb}</div>
          <div className="font-serif mt-2 noc-mini-shine" style={{ fontSize: 26, lineHeight: 1 }}>
            {bride}<div className="my-0.5 italic text-xs">&amp;</div>{groom}
          </div>
          <div className="mt-2 text-[6.5px] tracking-[0.32em] uppercase" style={{ color: "#F1EEE7cc" }}>{dt}</div>
          <div className="mt-3 px-3 py-1 rounded-full text-[6.5px] tracking-[0.3em] uppercase" style={{ background: "linear-gradient(100deg, #C9A24B, #E6CD8B)", color: "#0E0E11" }}>Buka Undangan →</div>
        </div>
        <style>{`
          @keyframes noc-mini-shine { to { background-position: 200% center; } }
          @keyframes noc-mini-drift { 0%,100%{ transform: translateY(0); opacity:.5 } 50%{ transform: translateY(-8px); opacity:1 } }
          .noc-mini-shine{ background:linear-gradient(100deg,#E6CD8B,#FFF6DC 20%,#C9A24B 40%,#E6CD8B 60%,#FFF6DC 80%,#C9A24B); background-size:200% auto; -webkit-background-clip:text; background-clip:text; color:transparent; animation:noc-mini-shine 6s linear infinite; }
          .noc-mini-p{ animation: noc-mini-drift 6s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

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
      <div className="relative w-full h-full overflow-hidden">
        <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1F1A14cc 0%, #1F1A1499 45%, #1F1A14ee 100%)" }} />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <div className="text-[7px] tracking-[0.4em] uppercase" style={{ color: "#C39449" }}>{eb}</div>
          <div className="font-serif mt-3" style={{ color: "#FAF4E6", fontSize: 28, lineHeight: 0.95 }}>
            {bride}
            <div className="my-0.5 italic text-base" style={{ color: "#C39449" }}>&amp;</div>
            {groom}
          </div>
          <div className="mt-3 text-[7px] tracking-[0.3em] uppercase" style={{ color: "#FAF4E6cc" }}>{dt}</div>
          <div className="mt-3 px-3 py-1 rounded-full text-[6.5px] tracking-[0.3em] uppercase" style={{ background: "#C39449", color: "#1F1A14" }}>Buka Undangan →</div>
        </div>
      </div>
    );
  }

  /* RUSTIC SUNSET variant — Terakota Senja */
  if (slug === "terakota-senja") {
    return shell(
      <div className="relative w-full h-full overflow-hidden">
        <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #7A3520aa 0%, #D9806A55 42%, #7A3520ec 100%)" }} />
        {/* sun disc */}
        <div className="absolute" style={{ top: "15%", left: "50%", transform: "translateX(-50%)" }}>
          <div className="w-12 h-12 rounded-full" style={{ background: "radial-gradient(circle at 50% 50%, #FBEFDD, #E8642A 70%, transparent)", boxShadow: "0 0 20px #E8642A88" }} />
        </div>

        <div className="relative h-full flex flex-col items-center justify-end text-center px-4 pb-6">
          <div className="text-[7px] tracking-[0.4em] uppercase" style={{ color: "#FBEFDD" }}>{eb}</div>
          <div className="font-serif mt-2" style={{ color: "#FBEFDD", fontSize: 26, lineHeight: 0.95 }}>
            {bride}
            <div className="my-0.5 text-sm italic" style={{ color: "#F4D9BC" }}>&amp;</div>
            {groom}
          </div>
          <div className="mt-2 px-2 py-0.5 text-[7px] tracking-[0.3em] uppercase" style={{ background: "#FBEFDD22", color: "#FBEFDD", border: "1px solid #FBEFDD55" }}>
            {dt}
          </div>
          <div className="mt-3 px-3 py-1 rounded-full text-[6.5px] tracking-[0.3em] uppercase" style={{ background: "#FBEFDD", color: "#7A3520" }}>Buka Undangan →</div>
        </div>
      </div>
    );
  }

  /* WATERCOLOR FLORAL variant — Kembang Setaman */
  if (slug === "kembang-setaman") {
    return shell(
      <div className="relative w-full h-full overflow-hidden">
        <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #A24D55bf 0%, #D5847E66 42%, #A24D55ec 100%)" }} />
        {/* leaf accents */}
        <svg className="absolute top-3 right-3 opacity-70" width="34" height="34" viewBox="0 0 40 40">
          <g stroke="#FDF7F2" strokeWidth="0.7" fill="#FDF7F2" fillOpacity="0.4">
            <ellipse cx="20" cy="10" rx="8" ry="3" transform="rotate(-30 20 10)" />
            <ellipse cx="14" cy="22" rx="7" ry="2.5" transform="rotate(20 14 22)" />
            <ellipse cx="26" cy="22" rx="7" ry="2.5" transform="rotate(-20 26 22)" />
          </g>
        </svg>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <div className="text-[7px] tracking-[0.4em] uppercase" style={{ color: "#FDF7F2" }}>{eb}</div>
          <div className="font-serif mt-1.5" style={{ color: "#FDF7F2", fontSize: 24, lineHeight: 0.95 }}>
            {bride}
            <div className="font-serif italic my-0.5" style={{ color: "#F4D9D1", fontSize: 12 }}>&amp;</div>
            {groom}
          </div>
          <svg viewBox="0 0 120 8" className="mt-1.5 mx-auto" width="80" height="6">
            <path d="M0 6 Q6 0 12 6 T24 6 T36 6 T48 6 T60 6 T72 6 T84 6 T96 6 T108 6 T120 6" stroke="#FDF7F2" strokeWidth="0.7" fill="none" />
          </svg>
          <div className="mt-1.5 inline-block px-2 py-0.5 text-[7px] tracking-[0.3em] uppercase font-serif italic" style={{ background: "rgba(255,255,255,0.15)", color: "#FDF7F2", border: "1px solid #FDF7F266", borderRadius: 999 }}>
            {dt}
          </div>
          <div className="mt-3 px-3 py-1 rounded-full text-[6.5px] tracking-[0.3em] uppercase" style={{ background: "#FDF7F2", color: "#A24D55" }}>Buka Undangan ✿</div>
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

  /* DEFAULT (Sekar/Larasati/etc): full cover photo + palette overlay + names */
  return shell(
    <div className="relative w-full h-full overflow-hidden" style={{ color: p.fg }}>
      <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: isDark ? "brightness(0.85)" : undefined }} />
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${p.bg}26 0%, ${p.bg}80 50%, ${p.bg}f5 100%)` }} />
      <div className="absolute inset-0 pointer-events-none" style={{ border: `1px solid ${p.accent}`, margin: 6, opacity: 0.5 }} />
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

/** Cluster of 3 white iPhone mockups showing different scenes: couple (left), cover (center), journey (right). */
export function TemplateClusterPreview({ slug, palette }: { slug: string; palette: string }) {
  return (
    <div className="relative h-[340px] flex items-center justify-center" style={{ perspective: "1200px" }}>
      {/* Left phone — Couple */}
      <div
        className="absolute"
        style={{
          transform: "translateX(-80px) translateY(18px) rotate(-9deg) scale(0.7)",
          transformOrigin: "center",
          zIndex: 1,
          filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.18))",
        }}
      >
        <TemplatePhoneMock slug={slug} palette={palette} scene="couple" />
      </div>
      {/* Right phone — Journey */}
      <div
        className="absolute"
        style={{
          transform: "translateX(80px) translateY(18px) rotate(9deg) scale(0.7)",
          transformOrigin: "center",
          zIndex: 1,
          filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.18))",
        }}
      >
        <TemplatePhoneMock slug={slug} palette={palette} scene="journey" />
      </div>
      {/* Center phone — Cover, main, on top */}
      <div
        className="relative"
        style={{
          transform: "scale(0.82)",
          zIndex: 2,
          filter: "drop-shadow(0 28px 40px rgba(0,0,0,0.22))",
        }}
      >
        <TemplatePhoneMock slug={slug} palette={palette} scene="cover" />
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
  "lumina":          { photo: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=70", bride: "Aleyda",    groom: "Reyhan",    eyebrow: "The Wedding Of",   date: "11 · 11 · 2026" },
  "noctura":         { photo: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=70", bride: "Sierra",    groom: "Damar",     eyebrow: "The Wedding Of",   date: "20 · 12 · 2026" },
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
      <section className="bg-brown text-cream-soft">
        <div className="container-narrow pt-32 md:pt-40 pb-20 md:pb-24">
          <div className="max-w-3xl">
            <span className="label-soft text-rose-soft">Pustaka Template</span>
            <h1 className="mt-4 text-4xl md:text-6xl font-serif leading-[1.1] text-cream-soft">
              Setiap kisah, <span className="text-rose-soft">berbeda baitnya</span>
            </h1>
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
              className="w-full border border-line bg-paper px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-gold-deep transition"
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
            <div className="card-soft p-12 text-center text-sepia-soft">
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
                      <div className="mt-4 flex items-end justify-between gap-3 px-1">
                        <div>
                          <div className="font-serif text-xl text-sepia">{t.name}</div>
                          <div className="text-xs text-sepia-mute uppercase tracking-[0.14em] mt-0.5">{t.style}</div>
                          <div className="flex gap-1 mt-2">
                            <span className="w-3 h-3 rounded-full border border-line" style={{ background: bg }} />
                            <span className="w-3 h-3 rounded-full border border-line" style={{ background: ac }} />
                          </div>
                        </div>
                        <div
                          className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] font-medium whitespace-nowrap"
                          style={{ borderColor: tier.color, color: tier.color }}
                        >
                          {tier.tier}
                        </div>
                      </div>
                      {t.description && <p className="text-sm text-sepia-soft mt-3 px-1">{t.description}</p>}
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
      className={`w-full flex items-center text-left rounded-lg px-3 py-2 text-sm transition border ${
        active ? "border-sepia bg-sepia text-cream-soft" : "border-transparent text-sepia-soft hover:bg-cream-deep hover:border-line"
      }`}
    >
      {children}
    </button>
  );
}
