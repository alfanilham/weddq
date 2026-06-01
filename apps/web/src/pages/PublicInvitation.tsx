import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { InvitationData, InvitationRender } from "@/components/InvitationRender";
import { MahligaiRender } from "@/components/MahligaiRender";
import { PurnamaRender } from "@/components/PurnamaRender";
import { KasmaranRender } from "@/components/KasmaranRender";
import { TerakotaRender } from "@/components/TerakotaRender";
import { KembangSetamanRender } from "@/components/KembangSetamanRender";

export default function PublicInvitationPage() {
  const { slug } = useParams();
  const [data, setData] = useState<InvitationData | null>(null);
  const [tplPalette, setTplPalette] = useState("cream");
  const [tplSlug, setTplSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const url = new URL(window.location.href);
    const to = url.searchParams.get("to");
    const fallbackName = url.searchParams.get("name"); // legacy

    // Parallel: fetch wedding, optionally fetch guest by slug
    const guestPromise = to
      ? api
          .get(`/guests/public/${slug}/${to}`)
          .then((r) => r.data as { name: string; slug: string; invitedTo?: string | null })
          .catch(() => null)
      : Promise.resolve(null);

    Promise.all([api.get(`/weddings/public/${slug}`), guestPromise])
      .then(([weddingRes, guest]) => {
        const w = weddingRes.data;
        const mapped: InvitationData = {
          slug: w.slug,
          eyebrow: w.eyebrow,
          quote: w.quote,
          story: w.story,
          coverImage: w.coverImage,
          openingSalutation: w.openingSalutation ?? null,
          closingSalutation: w.closingSalutation ?? null,
          couple: w.couple,
          events: (w.events ?? []).map((e: any) => ({
            id: e.id,
            kind: e.kind,
            title: e.title,
            date: e.date,
            endTime: e.endTime,
            venueName: e.venueName,
            address: e.address,
            mapUrl: e.mapUrl,
            dressCode: e.dressCode,
          })),
          gallery: w.gallery ?? [],
          gifts: w.gifts ?? [],
          wishes: w.wishes ?? [],
          storyChapters: w.storyChapters ?? [],
          guestName: guest?.name ?? fallbackName ?? null,
          guestSlug: guest?.slug ?? null,
          guestInvitedTo: guest?.invitedTo ?? null,
        };
        setData(mapped);
        setTplPalette(w.template?.palette ?? "cream");
        setTplSlug(w.template?.slug ?? null);
      })
      .catch(() => setErr("Undangan tidak ditemukan"))
      .finally(() => setLoading(false));

    // Legacy token tracker (only when ?to= looks like a cuid token, not a slug)
    if (to && /^c[a-z0-9]{20,}$/i.test(to)) {
      api.post(`/guests/${slug}/track-open`, { token: to }).catch(() => {});
    }
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream">Memuat undangan…</div>;
  if (err || !data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-center px-6">
        <div>
          <h1 className="font-serif text-5xl">Undangan tidak ditemukan</h1>
          <p className="mt-3 text-sepia-soft">Tautan mungkin sudah berpindah atau salah ketik.</p>
        </div>
      </div>
    );

  if (tplSlug === "mahligai") return <MahligaiRender data={data} interactive />;
  if (tplSlug === "purnama") return <PurnamaRender data={data} interactive />;
  if (tplSlug === "kasmaran") return <KasmaranRender data={data} interactive />;
  if (tplSlug === "terakota-senja") return <TerakotaRender data={data} interactive />;
  if (tplSlug === "kembang-setaman") return <KembangSetamanRender data={data} interactive />;
  return <InvitationRender data={data} palette={tplPalette} interactive />;
}
