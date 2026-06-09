import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";

type Template = {
  id: string;
  slug: string;
  name: string;
  style: string;
  category: string;
  priceIdr: number;
  palette: string;
  description?: string | null;
  features: string[];
  badge?: string | null;
};

export default function TemplatePreviewPage() {
  const { slug } = useParams();
  const [tpl, setTpl] = useState<Template | null>(null);
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">("mobile");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get<Template>(`/templates/${slug}`).then((r) => setTpl(r.data)).finally(() => setLoading(false));
  }, [slug]);

  const frameSpec = useMemo(() => {
    switch (device) {
      case "tablet":  return { w: 768,  h: 1024, label: "Tablet" };
      case "desktop": return { w: 1280, h: 820,  label: "Desktop" };
      default:        return { w: 390,  h: 780,  label: "Mobile" };
    }
  }, [device]);

  if (loading) return <div className="container-narrow py-32 text-sepia-soft">Memuat preview…</div>;
  if (!tpl) return <div className="container-narrow py-32 text-sepia-soft">Template tidak ditemukan.</div>;

  /* Mobile-only header info (rendered at top, before preview) */
  const mobileHeader = (
    <div className="lg:hidden bg-brown text-cream-soft px-6 py-7">
      <Link to="/templates" className="text-xs uppercase tracking-[0.22em] text-cream-soft/60 inline-flex items-center gap-2 hover:text-cream-soft">
        ← Pustaka template
      </Link>
      <div className="mt-5"><Logo size={30} invert /></div>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl leading-tight text-cream-soft">{tpl.name}</h1>
          <div className="text-[11px] uppercase tracking-[0.18em] text-gold-soft mt-1">{tpl.style}</div>
        </div>
        {tpl.badge && (
          <span className="rounded-full bg-cream-soft text-brown text-[10px] uppercase tracking-wider px-2.5 py-1 whitespace-nowrap">{tpl.badge}</span>
        )}
      </div>
      <div className="mt-4 h-px w-20 bg-gold-soft/40" />
      {tpl.description && <p className="mt-4 text-sm text-cream-soft/80 leading-relaxed">{tpl.description}</p>}
      {tpl.features && tpl.features.length > 0 && (
        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-[0.22em] text-gold-soft mb-2">Fitur Termasuk</div>
          <ul className="grid grid-cols-1 gap-2 text-sm">
            {tpl.features.slice(0, 6).map((f) => (
              <li key={f} className="flex gap-2.5 text-cream-soft/85">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  /* Mobile-only price + CTA (rendered at bottom, after preview) */
  const mobileFooter = (
    <div className="lg:hidden bg-brown text-cream-soft px-6 py-8 border-t border-white/10">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold-soft">Harga</div>
          <div className="font-serif text-3xl">Rp {(tpl.priceIdr / 1000).toFixed(0)}rb</div>
        </div>
      </div>
      <Link
        to="/register"
        state={{ templateSlug: tpl.slug }}
        className="btn-gold w-full justify-center mt-5"
      >
        Pakai Template Ini →
      </Link>
      <Link to="/templates" className="block text-center text-xs text-cream-soft/60 mt-3 hover:text-cream-soft">
        Bandingkan dengan template lain
      </Link>
    </div>
  );

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[1fr_360px]">
      {/* MOBILE: header info first */}
      {mobileHeader}

      {/* PREVIEW STAGE */}
      <div className="relative bg-cream-deep doodle-tx py-8 lg:py-10 px-4 flex items-start justify-center overflow-auto" style={{ minHeight: "min(720px, 80vh)" }}>
        <div className="flex flex-col items-center transition-all w-full">
          <div
            className="rounded-2xl overflow-hidden border border-line shadow-soft bg-paper transition-all"
            style={{ width: "100%", maxWidth: frameSpec.w }}
          >
            <iframe
              key={`${tpl.slug}-${device}`}
              src={`/preview-frame/${tpl.slug}`}
              title={`Pratinjau ${tpl.name}`}
              className="block w-full"
              style={{ height: frameSpec.h, border: 0 }}
            />
          </div>
          {/* Device label — desktop only */}
          <div className="hidden lg:block text-center text-xs text-sepia-mute mt-3 font-mono">
            Pratinjau {frameSpec.label} · {frameSpec.w}×{frameSpec.h} · template "{tpl.name}"
          </div>
        </div>
      </div>

      {/* MOBILE: price footer */}
      {mobileFooter}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex bg-brown text-cream-soft p-8 lg:p-10 flex-col sticky top-0 h-screen overflow-y-auto">
        <Link to="/templates" className="text-xs uppercase tracking-[0.22em] text-cream-soft/60 mb-6 inline-flex items-center gap-2 hover:text-cream-soft">
          ← Pustaka template
        </Link>

        <Logo size={36} invert />

        <h1 className="font-serif text-4xl mt-6 text-cream-soft">{tpl.name}</h1>
        <div className="text-xs uppercase tracking-[0.18em] text-gold-soft mt-1">{tpl.style}</div>
        <div className="mt-4 h-px w-28 bg-gold-soft/40" />

        {tpl.description && <p className="mt-5 text-sm text-cream-soft/80 leading-relaxed">{tpl.description}</p>}

        <div className="mt-7">
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold-soft mb-3">Pratinjau Perangkat</div>
          <div className="flex gap-2">
            {(["mobile", "tablet", "desktop"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={`flex-1 text-xs uppercase tracking-wider py-2.5 border rounded-full transition ${
                  device === d ? "bg-cream-soft text-brown border-cream-soft" : "border-cream-soft/30 text-cream-soft/70 hover:border-cream-soft"
                }`}
              >
                {d === "mobile" ? "Mobile" : d === "tablet" ? "Tablet" : "Desktop"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7">
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold-soft mb-3">Fitur Termasuk</div>
          <ul className="space-y-2.5 text-sm">
            {(tpl.features ?? []).map((f) => (
              <li key={f} className="flex gap-2.5 text-cream-soft/85">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
                {f}
              </li>
            ))}
            {tpl.features?.length === 0 && <li className="text-cream-soft/60 text-sm">RSVP, buku tamu, galeri foto, hitung mundur.</li>}
          </ul>
        </div>

        <div className="mt-auto pt-8 border-t border-white/10">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold-soft">Harga</div>
              <div className="font-serif text-3xl">Rp {(tpl.priceIdr / 1000).toFixed(0)}rb</div>
            </div>
            {tpl.badge && (
              <span className="rounded-full bg-cream-soft text-brown text-[10px] uppercase tracking-wider px-2.5 py-1">{tpl.badge}</span>
            )}
          </div>
          <Link
            to="/register"
            state={{ templateSlug: tpl.slug }}
            className="btn-gold w-full justify-center mt-5"
          >
            Pakai Template Ini →
          </Link>
          <Link to="/templates" className="block text-center text-xs text-cream-soft/60 mt-3 hover:text-cream-soft">
            Bandingkan dengan template lain
          </Link>
        </div>
      </aside>
    </div>
  );
}
