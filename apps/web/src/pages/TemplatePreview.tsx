import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Divider, OrnamentRow } from "@/components/Ornaments";
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

  return (
    <div className="min-h-full grid lg:grid-cols-[1fr_360px]">
      {/* PREVIEW STAGE */}
      <div className="relative bg-cream-deep py-10 px-4 flex items-start justify-center overflow-auto" style={{ minHeight: "100vh" }}>
        <div className="flex flex-col items-center transition-all w-full">
          <div
            className="rounded-md overflow-hidden border border-line shadow-soft bg-paper transition-all"
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
          <div className="text-center text-xs text-sepia-mute mt-3 font-mono">
            Pratinjau {frameSpec.label} · {frameSpec.w}×{frameSpec.h} · template "{tpl.name}"
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <aside className="bg-sepia text-cream-soft p-8 lg:p-10 flex flex-col sticky top-0 h-screen overflow-y-auto">
        <Link to="/templates" className="text-xs uppercase tracking-[0.22em] text-cream-soft/60 mb-6 inline-flex items-center gap-2 hover:text-cream-soft">
          ← Pustaka template
        </Link>

        <Logo size={36} />

        <h1 className="font-serif text-4xl mt-6">{tpl.name}</h1>
        <div className="text-xs uppercase tracking-[0.18em] text-gold-soft mt-1">{tpl.style}</div>
        <Divider width={180} color="#C9A961" className="mt-4" />

        {tpl.description && <p className="mt-5 text-sm text-cream-soft/80 leading-relaxed">{tpl.description}</p>}

        <div className="mt-7">
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold-soft mb-3">Pratinjau Perangkat</div>
          <div className="flex gap-2">
            {(["mobile", "tablet", "desktop"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={`flex-1 text-xs uppercase tracking-wider py-2.5 border rounded-full transition ${
                  device === d ? "bg-cream-soft text-sepia border-cream-soft" : "border-cream-soft/30 text-cream-soft/70 hover:border-cream-soft"
                }`}
              >
                {d === "mobile" ? "Mobile" : d === "tablet" ? "Tablet" : "Desktop"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7">
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold-soft mb-3">Fitur Termasuk</div>
          <ul className="space-y-2 text-sm">
            {(tpl.features ?? []).map((f) => (
              <li key={f} className="flex gap-2 text-cream-soft/85">
                <span className="text-gold-soft">◆</span> {f}
              </li>
            ))}
            {tpl.features?.length === 0 && <li className="text-cream-soft/60 text-sm">RSVP, buku tamu, galeri foto, hitung mundur.</li>}
          </ul>
        </div>

        <div className="mt-auto pt-8">
          <OrnamentRow />
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold-soft">Harga</div>
              <div className="font-serif text-3xl">Rp {(tpl.priceIdr / 1000).toFixed(0)}rb</div>
              <div className="text-xs text-cream-soft/60">Sekali bayar · 1 tahun aktif</div>
            </div>
            {tpl.badge && (
              <span className="rounded-full bg-cream-soft text-sepia text-[10px] uppercase tracking-wider px-2.5 py-1">{tpl.badge}</span>
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
