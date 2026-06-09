import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { InvitationData, InvitationRender } from "@/components/InvitationRender";
import { MahligaiRender } from "@/components/MahligaiRender";
import { PurnamaRender } from "@/components/PurnamaRender";
import { KasmaranRender } from "@/components/KasmaranRender";
import { TerakotaRender } from "@/components/TerakotaRender";
import { KembangSetamanRender } from "@/components/KembangSetamanRender";
import { SekarKencanaRender } from "@/components/SekarKencanaRender";
import { LuminaRender } from "@/components/LuminaRender";
import { NocturaRender } from "@/components/NocturaRender";
import { MusicPlayer } from "@/components/MusicPlayer";

export default function PublicInvitationPage({ domainHost }: { domainHost?: string } = {}) {
  const { slug: slugParam } = useParams();
  const slug = domainHost ?? slugParam;
  const [data, setData] = useState<InvitationData | null>(null);
  const [tplPalette, setTplPalette] = useState("cream");
  const [tplSlug, setTplSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const url = new URL(window.location.href);
    const to = url.searchParams.get("to");
    const fallbackName = url.searchParams.get("name"); // legacy

    // Endpoint berbeda: via custom domain (Eksklusif) vs via slug path
    const weddingReq = domainHost
      ? api.get(`/weddings/by-domain/${domainHost}`)
      : api.get(`/weddings/public/${slugParam}`);

    // Parallel: fetch wedding, optionally fetch guest by slug.
    // Guest lookup butuh slug undangan — pakai data undangan (dipetakan setelah resolve).
    const guestPromise =
      to && !domainHost
        ? api
            .get(`/guests/public/${slugParam}/${to}`)
            .then((r) => r.data as { name: string; slug: string; invitedTo?: string | null })
            .catch(() => null)
        : Promise.resolve(null);

    Promise.all([weddingReq, guestPromise])
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
        setMusicUrl(w.musicUrl ?? null);

        // Custom domain: slug undangan baru diketahui di sini → resolusi tamu (?to=) menyusul
        if (domainHost && to && w.slug) {
          api
            .get(`/guests/public/${w.slug}/${to}`)
            .then((r) => {
              const g = r.data as { name: string; slug: string; invitedTo?: string | null };
              setData((prev) => (prev ? { ...prev, guestName: g.name, guestSlug: g.slug, guestInvitedTo: g.invitedTo ?? null } : prev));
            })
            .catch(() => {});
        }
      })
      .catch(() => setErr("Undangan tidak ditemukan"))
      .finally(() => setLoading(false));

    // Legacy token tracker (only when ?to= looks like a cuid token, not a slug)
    if (!domainHost && to && /^c[a-z0-9]{20,}$/i.test(to)) {
      api.post(`/guests/${slugParam}/track-open`, { token: to }).catch(() => {});
    }
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream">Memuat undangan…</div>;
  // Slug bukan undangan yang valid → arahkan ke beranda (tanpa membocorkan keberadaan path)
  if (err || !data) return <Navigate to="/" replace />;

  const render =
    tplSlug === "lumina" ? <LuminaRender data={data} interactive /> :
    tplSlug === "noctura" ? <NocturaRender data={data} interactive /> :
    tplSlug === "sekar-kencana" ? <SekarKencanaRender data={data} interactive /> :
    tplSlug === "mahligai" ? <MahligaiRender data={data} interactive /> :
    tplSlug === "purnama" ? <PurnamaRender data={data} interactive /> :
    tplSlug === "kasmaran" ? <KasmaranRender data={data} interactive /> :
    tplSlug === "terakota-senja" ? <TerakotaRender data={data} interactive /> :
    tplSlug === "kembang-setaman" ? <KembangSetamanRender data={data} interactive /> :
    <InvitationRender data={data} palette={tplPalette} interactive />;

  return (
    <>
      {render}
      <MusicPlayer youtubeUrl={musicUrl} />
    </>
  );
}
