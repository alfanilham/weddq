import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { InvitationRender, demoData } from "@/components/InvitationRender";
import { MahligaiRender } from "@/components/MahligaiRender";
import { PurnamaRender } from "@/components/PurnamaRender";
import { KasmaranRender } from "@/components/KasmaranRender";
import { TerakotaRender } from "@/components/TerakotaRender";
import { KembangSetamanRender } from "@/components/KembangSetamanRender";

type Template = { id: string; slug: string; name: string; palette: string };

export default function PreviewFrame() {
  const { slug } = useParams();
  const [tpl, setTpl] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get<Template>(`/templates/${slug}`).then((r) => setTpl(r.data)).finally(() => setLoading(false));
  }, [slug]);

  const data = useMemo(() => demoData(tpl?.palette ?? "cream", tpl?.name ?? "Sekar Kencana"), [tpl]);

  if (loading || !tpl) return <div className="p-6 text-sm text-sepia-soft">Memuat preview…</div>;

  if (tpl.slug === "mahligai") return <MahligaiRender data={data} />;
  if (tpl.slug === "purnama") return <PurnamaRender data={data} />;
  if (tpl.slug === "kasmaran") return <KasmaranRender data={data} />;
  if (tpl.slug === "terakota-senja") return <TerakotaRender data={data} />;
  if (tpl.slug === "kembang-setaman") return <KembangSetamanRender data={data} />;
  return <InvitationRender data={data} palette={tpl.palette} />;
}
