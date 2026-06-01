import { FormEvent, useEffect, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { CmsShell } from "@/components/CmsShell";
import { api, extractError } from "@/lib/api";
import { Divider, OrnamentRow } from "@/components/Ornaments";

type Wedding = {
  id: string;
  slug: string;
  status: string;
  eyebrow: string;
  story?: string | null;
  quote?: string | null;
  openingSalutation?: string | null;
  closingSalutation?: string | null;
  waMessageTemplate?: string | null;
  primaryColor?: string | null;
  templateId?: string | null;
  couple: {
    brideName: string;
    brideShort: string;
    brideParents?: string | null;
    brideInstagram?: string | null;
    groomName: string;
    groomShort: string;
    groomParents?: string | null;
    groomInstagram?: string | null;
  };
  template?: { name: string; slug: string; palette: string } | null;
  events: Array<any>;
  gallery: Array<any>;
  gifts: Array<any>;
  storyChapters: Array<{ id: string; title: string; body: string; photo?: string | null; order: number }>;
  _count: { guests: number; rsvps: number; wishes: number };
};

function useActiveWedding() {
  const [list, setList] = useState<Wedding[] | null>(null);
  const [active, setActive] = useState<Wedding | null>(null);

  async function reload() {
    const r = await api.get<Wedding[]>("/weddings");
    setList(r.data);
    if (r.data.length > 0) {
      const f = await api.get<Wedding>(`/weddings/by-id/${r.data[0].id}`);
      setActive(f.data);
    } else {
      setActive(null);
    }
  }

  useEffect(() => { reload().catch(() => {}); }, []);

  return { list, active, reload, setActive };
}

export default function DashboardPage() {
  const { list, active, reload } = useActiveWedding();

  if (list === null) return <div className="p-10 text-sepia-soft">Memuat dasbor…</div>;
  if (list.length === 0) return <EmptyState onCreated={reload} />;
  if (!active) return <div className="p-10 text-sepia-soft">Memuat undangan…</div>;

  const titleMap: Record<string, string> = {
    "/dashboard": "Ringkasan",
    "/dashboard/content": "Editor Konten",
    "/dashboard/journey": "Perjalanan Kami",
    "/dashboard/events": "Acara",
    "/dashboard/gallery": "Galeri Foto",
    "/dashboard/guests": "Daftar Tamu",
    "/dashboard/rsvp": "RSVP",
    "/dashboard/wishes": "Ucapan & Doa",
    "/dashboard/gift": "Amplop Digital",
    "/dashboard/settings": "Pengaturan",
  };

  return (
    <CmsShellWithLinks active={active} titleMap={titleMap}>
      <Routes>
        <Route index element={<OverviewView w={active} onChanged={reload} />} />
        <Route path="content" element={<ContentView w={active} onChanged={reload} />} />
        <Route path="journey" element={<JourneyView w={active} onChanged={reload} />} />
        <Route path="events" element={<EventsView w={active} onChanged={reload} />} />
        <Route path="gallery" element={<GalleryView w={active} onChanged={reload} />} />
        <Route path="guests" element={<GuestsView w={active} onChanged={reload} />} />
        <Route path="rsvp" element={<RsvpView w={active} />} />
        <Route path="wishes" element={<WishesView w={active} />} />
        <Route path="gift" element={<GiftView w={active} onChanged={reload} />} />
        <Route path="settings" element={<SettingsView w={active} onChanged={reload} />} />
      </Routes>
    </CmsShellWithLinks>
  );
}

function CmsShellWithLinks({
  active,
  children,
  titleMap,
}: {
  active: Wedding;
  children: React.ReactNode;
  titleMap: Record<string, string>;
}) {
  const loc = useLocation();
  const title = titleMap[loc.pathname] ?? "Dasbor";
  return (
    <CmsShell
      title={title}
      links={[
        { to: "/dashboard", label: "Dasbor", icon: "◆", group: "Undangan" },
        { to: "/dashboard/content", label: "Editor Konten", icon: "✎", group: "Undangan" },
        { to: "/dashboard/journey", label: "Perjalanan Kami", icon: "❦", group: "Undangan", count: active.storyChapters.length },
        { to: "/dashboard/events", label: "Acara", icon: "✦", group: "Undangan" },
        { to: "/dashboard/gallery", label: "Galeri Foto", icon: "▦", group: "Undangan", count: active.gallery.length },
        { to: "/dashboard/guests", label: "Daftar Tamu", icon: "☷", group: "Tamu", count: active._count.guests },
        { to: "/dashboard/rsvp", label: "RSVP", icon: "✓", group: "Tamu", count: active._count.rsvps },
        { to: "/dashboard/wishes", label: "Ucapan & Doa", icon: '"', group: "Tamu", count: active._count.wishes },
        { to: "/dashboard/gift", label: "Amplop Digital", icon: "⌘", group: "Lainnya" },
        { to: "/dashboard/settings", label: "Pengaturan", icon: "⚙", group: "Lainnya" },
      ]}
      topbar={
        <>
          <div className="hidden md:flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-mono">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            {window.location.host}/{active.slug}
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${active.slug}`)}
              className="text-sepia-mute hover:text-sepia ml-1"
              title="Salin"
            >
              ⎘
            </button>
          </div>
          <Link to={`/${active.slug}`} target="_blank" className="btn-sm btn-ghost">Lihat Undangan ↗</Link>
        </>
      }
    >
      {children}
    </CmsShell>
  );
}

/* -------- VIEWS -------- */

function OverviewView({ w, onChanged }: { w: Wedding; onChanged: () => void }) {
  const ready = computeReadiness(w);
  const primary = w.events[0];
  const days = primary ? Math.max(0, Math.floor((new Date(primary.date).getTime() - Date.now()) / 86400000)) : null;

  return (
    <div className="space-y-8">
      <div className="rounded-sm bg-paper border border-line p-8 grid lg:grid-cols-[1.4fr_1fr] gap-8 bracketed">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">SELAMAT DATANG KEMBALI</div>
          <h2 className="font-serif text-3xl md:text-4xl mt-2">
            Mari rangkai kisah pernikahan Anda
          </h2>
          <p className="mt-4 text-sepia-soft max-w-lg">
            Undangan Anda sudah <b>{ready.percent}%</b> siap. {ready.percent < 100 ? `Lengkapi ${ready.missing.slice(0, 2).join(" dan ")} agar undangan terasa utuh sebelum tanggal akad.` : "Seluruh data telah lengkap. Undangan siap dibagikan."}
          </p>
          <div className="mt-6">
            <div className="flex justify-between text-sm">
              <span className="text-sepia-soft">Kelengkapan Undangan</span>
              <b className="font-mono text-gold-deep">{ready.percent}%</b>
            </div>
            <div className="h-1.5 bg-cream-deep rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gold-deep" style={{ width: `${ready.percent}%` }} />
            </div>
            <div className="flex justify-between text-xs text-sepia-mute mt-2">
              <span>{ready.done} dari {ready.total} tahap selesai</span>
              {ready.missing.length > 0 && <span>Sisa: {ready.missing.join(", ")}</span>}
            </div>
          </div>
        </div>
        <div className="rounded-sm border border-line bg-cream-soft p-6 flex flex-col justify-between bracketed">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">HARI BAHAGIA</div>
            <div className="font-serif text-2xl mt-2">
              {primary ? new Date(primary.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Belum ada acara"}
            </div>
            {primary && <div className="text-xs text-sepia-mute mt-1">{primary.title} · {primary.venueName}</div>}
          </div>
          {days !== null && (
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[["Hari", days], ["Jam", 14], ["Menit", 22], ["Detik", 8]].map(([l, v]) => (
                <div key={l as string} className="bg-paper border border-line rounded-sm py-3">
                  <div className="font-serif text-2xl">{String(v).padStart(2, "0")}</div>
                  <div className="text-[10px] uppercase tracking-wider text-sepia-mute">{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Tamu" value={w._count.guests} delta="+12" desc="undangan terkirim" color="#B8736D" />
        <StatCard label="Konfirmasi Hadir" value={w._count.rsvps} delta="+8" desc="dari yang membuka" color="#4F9F6B" />
        <StatCard label="Ucapan Tamu" value={w._count.wishes} delta="+24" desc="doa & ucapan masuk" color="#6E3A38" />
        <StatCard label="Status Undangan" value={w.status === "PUBLISHED" ? "Aktif" : "Draft"} delta="" desc={`Template: ${w.template?.name ?? "Belum dipilih"}`} color="#A88339" />
      </div>

      <div className="grid xl:grid-cols-[1.4fr_1fr] gap-6">
        <div className="bg-paper border border-line rounded-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl">Langkah Berikutnya</h3>
            <Link to="/dashboard/content" className="btn-ghost btn-sm">Mulai →</Link>
          </div>
          <ul className="mt-5 divide-y divide-line">
            {ready.checklist.map((s) => (
              <li key={s.label} className="flex items-center gap-3 py-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${s.done ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "border-line text-sepia-mute"}`}>
                  {s.done ? "✓" : "○"}
                </span>
                <Link to={s.to} className="flex-1 text-sm hover:underline">{s.label}</Link>
                <span className="text-xs text-sepia-mute">{s.done ? "Selesai" : "Belum"}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-paper border border-line rounded-sm p-6 bracketed">
          <h3 className="font-serif text-xl">Bagikan ke Tamu</h3>
          <p className="text-sm text-sepia-soft mt-2">
            Salin tautan publik undangan dan kirim ke tamu Anda melalui WhatsApp atau email.
          </p>
          <OrnamentRow className="my-3" />
          <div className="text-xs font-mono break-all p-3 rounded bg-cream-deep border border-line">
            {window.location.origin}/{w.slug}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${w.slug}`)}
              className="btn-sm btn-ghost"
            >
              Salin Tautan
            </button>
            <a target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`Undangan Pernikahan Kami: ${window.location.origin}/${w.slug}`)}`} className="btn-sm btn">
              Bagikan via WhatsApp →
            </a>
          </div>
          <p className="text-[11px] text-sepia-mute mt-4">
            Tip: gunakan menu <b>Daftar Tamu</b> untuk membuat tautan khusus bagi setiap tamu, dengan nama yang tertera secara otomatis.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, desc, color }: { label: string; value: any; delta?: string; desc?: string; color?: string }) {
  return (
    <div className="bg-paper border border-line rounded-sm p-5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-sepia-mute uppercase tracking-[0.15em]">{label}</span>
        {delta && <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 text-[10px]">{delta}</span>}
      </div>
      <div className="font-serif text-4xl mt-2">{value}</div>
      <div className="text-xs text-sepia-mute mt-1">{desc}</div>
      <div className="h-1 mt-3 rounded" style={{ background: `${color ?? "#A88339"}22` }}>
        <div className="h-full rounded" style={{ width: "70%", background: color ?? "#A88339" }} />
      </div>
    </div>
  );
}

function computeReadiness(w: Wedding) {
  const items = [
    { label: "Profil mempelai", done: !!w.couple?.brideParents && !!w.couple?.groomParents, to: "/dashboard/content" },
    { label: "Kalimat pembuka", done: !!w.quote, to: "/dashboard/content" },
    { label: "Perjalanan kami (≥ 1 bab)", done: w.storyChapters.length > 0, to: "/dashboard/journey" },
    { label: "Acara akad/resepsi", done: w.events.length > 0, to: "/dashboard/events" },
    { label: "Galeri foto (≥ 4)", done: w.gallery.length >= 4, to: "/dashboard/gallery" },
    { label: "Amplop digital", done: w.gifts.length > 0, to: "/dashboard/gift" },
    { label: "Tamu terdaftar (≥ 1)", done: w._count.guests > 0, to: "/dashboard/guests" },
    { label: "Status: Published", done: w.status === "PUBLISHED", to: "/dashboard/settings" },
  ];
  const done = items.filter((i) => i.done).length;
  const percent = Math.round((done / items.length) * 100);
  const missing = items.filter((i) => !i.done).map((i) => i.label.toLowerCase());
  return { checklist: items, done, total: items.length, percent, missing };
}

/* CONTENT EDITOR */
const SALUTATION_PRESETS = [
  { id: "islam", label: "Islam", opening: "Bismillahirrahmanirrahim", closing: "Wassalamu'alaikum Warahmatullahi Wabarakatuh" },
  { id: "kristen", label: "Kristen / Katolik", opening: "Salam Damai Kristus", closing: "Tuhan Yesus memberkati" },
  { id: "hindu", label: "Hindu", opening: "Om Swastiastu", closing: "Om Santi Santi Santi Om" },
  { id: "buddha", label: "Buddha", opening: "Namo Buddhaya", closing: "Sabbe Satta Bhavantu Sukhitatta" },
  { id: "konghucu", label: "Konghucu", opening: "Wei De Dong Tian", closing: "Xian You Yi De" },
  { id: "umum", label: "Umum (Tanpa Agama)", opening: "Salam sejahtera bagi kita semua", closing: "Salam hangat dari kami" },
  { id: "kosong", label: "Kosongkan", opening: "", closing: "" },
];

function ContentView({ w, onChanged }: { w: Wedding; onChanged: () => void }) {
  const [form, setForm] = useState({
    eyebrow: w.eyebrow,
    quote: w.quote ?? "",
    openingSalutation: w.openingSalutation ?? "",
    closingSalutation: w.closingSalutation ?? "",
    couple: {
      brideName: w.couple.brideName,
      brideShort: w.couple.brideShort,
      brideParents: w.couple.brideParents ?? "",
      brideInstagram: w.couple.brideInstagram ?? "",
      groomName: w.couple.groomName,
      groomShort: w.couple.groomShort,
      groomParents: w.couple.groomParents ?? "",
      groomInstagram: w.couple.groomInstagram ?? "",
    },
  });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await api.put(`/weddings/by-id/${w.id}`, form);
      setSaved(true);
      onChanged();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setErr(extractError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-7 max-w-4xl">
      <Card title="Pembuka Undangan" hint="Eyebrow dan kutipan pembuka yang muncul di bagian atas undangan.">
        <FormRow label="Eyebrow">
          <input className="cms-input" value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} />
        </FormRow>
        <FormRow label="Ayat / Kutipan pembuka">
          <textarea rows={3} className="cms-input" value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
        </FormRow>
        <p className="text-xs text-sepia-mute">
          Cerita perjalanan kalian (Pertemuan, Lamaran, dll.) kini dikelola di menu <Link to="/dashboard/journey" className="underline text-gold-deep">Perjalanan Kami</Link>.
        </p>
      </Card>

      <Card title="Salam Pembuka & Penutup" hint="Sesuaikan dengan agama atau preferensi Anda. Kosongkan kolom mana pun untuk menyembunyikan salam tersebut.">
        <div className="flex flex-wrap gap-2 mb-4">
          {SALUTATION_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setForm({ ...form, openingSalutation: p.opening, closingSalutation: p.closing })}
              className="text-[11px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border border-line text-sepia-soft hover:bg-cream-deep"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <FormRow label="Salam pembuka">
            <input className="cms-input" placeholder="mis. Bismillahirrahmanirrahim" value={form.openingSalutation} onChange={(e) => setForm({ ...form, openingSalutation: e.target.value })} />
          </FormRow>
          <FormRow label="Salam penutup">
            <input className="cms-input" placeholder="mis. Wassalamu'alaikum Warahmatullahi Wabarakatuh" value={form.closingSalutation} onChange={(e) => setForm({ ...form, closingSalutation: e.target.value })} />
          </FormRow>
        </div>
      </Card>

      <Card title="Mempelai Putri">
        <div className="grid md:grid-cols-2 gap-4">
          <FormRow label="Nama lengkap">
            <input className="cms-input" value={form.couple.brideName} onChange={(e) => setForm({ ...form, couple: { ...form.couple, brideName: e.target.value } })} />
          </FormRow>
          <FormRow label="Nama panggilan">
            <input className="cms-input" value={form.couple.brideShort} onChange={(e) => setForm({ ...form, couple: { ...form.couple, brideShort: e.target.value } })} />
          </FormRow>
          <FormRow label="Orang tua" full>
            <input className="cms-input" placeholder="Putri pertama dari Bapak … & Ibu …" value={form.couple.brideParents} onChange={(e) => setForm({ ...form, couple: { ...form.couple, brideParents: e.target.value } })} />
          </FormRow>
          <FormRow label="Instagram">
            <input className="cms-input" placeholder="@username" value={form.couple.brideInstagram} onChange={(e) => setForm({ ...form, couple: { ...form.couple, brideInstagram: e.target.value } })} />
          </FormRow>
        </div>
      </Card>

      <Card title="Mempelai Putra">
        <div className="grid md:grid-cols-2 gap-4">
          <FormRow label="Nama lengkap">
            <input className="cms-input" value={form.couple.groomName} onChange={(e) => setForm({ ...form, couple: { ...form.couple, groomName: e.target.value } })} />
          </FormRow>
          <FormRow label="Nama panggilan">
            <input className="cms-input" value={form.couple.groomShort} onChange={(e) => setForm({ ...form, couple: { ...form.couple, groomShort: e.target.value } })} />
          </FormRow>
          <FormRow label="Orang tua" full>
            <input className="cms-input" value={form.couple.groomParents} onChange={(e) => setForm({ ...form, couple: { ...form.couple, groomParents: e.target.value } })} />
          </FormRow>
          <FormRow label="Instagram">
            <input className="cms-input" value={form.couple.groomInstagram} onChange={(e) => setForm({ ...form, couple: { ...form.couple, groomInstagram: e.target.value } })} />
          </FormRow>
        </div>
      </Card>

      {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">{err}</div>}
      <div className="flex items-center gap-3">
        <button disabled={busy} className="btn">{busy ? "Menyimpan…" : "Simpan Perubahan"}</button>
        {saved && <span className="text-sm text-emerald-700">✓ Tersimpan</span>}
      </div>

      <style>{`.cms-input{width:100%;border:1px solid rgba(58,42,28,0.18);background:#FCF7EB;padding:11px 14px;border-radius:6px;font-size:14px;font-family:inherit}.cms-input:focus{outline:none;border-color:#A88339;background:#F4EAD5}`}</style>
    </form>
  );
}

/* JOURNEY (PERJALANAN KAMI) CHAPTERS */
function JourneyView({ w, onChanged }: { w: Wedding; onChanged: () => void }) {
  const SUGGESTED = ["Pertemuan", "Menjalin Hubungan", "Lamaran", "Pernikahan"];
  const [form, setForm] = useState({ title: "", body: "", photo: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const chapters = [...w.storyChapters].sort((a, b) => a.order - b.order);

  function resetForm() {
    setForm({ title: "", body: "", photo: "" });
    setEditingId(null);
    setErr(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        photo: form.photo.trim() || null,
      };
      if (editingId) {
        await api.put(`/weddings/by-id/${w.id}/chapters/${editingId}`, payload);
      } else {
        await api.post(`/weddings/by-id/${w.id}/chapters`, payload);
      }
      onChanged();
      resetForm();
    } catch (e) {
      setErr(extractError(e));
    } finally {
      setBusy(false);
    }
  }

  function startEdit(ch: typeof chapters[number]) {
    setEditingId(ch.id);
    setForm({ title: ch.title, body: ch.body, photo: ch.photo ?? "" });
    setErr(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string) {
    if (!confirm("Hapus bab perjalanan ini?")) return;
    await api.delete(`/weddings/by-id/${w.id}/chapters/${id}`);
    if (editingId === id) resetForm();
    onChanged();
  }

  async function move(id: string, dir: -1 | 1) {
    const ids = chapters.map((c) => c.id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    await api.put(`/weddings/by-id/${w.id}/chapters-reorder`, { ids });
    onChanged();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <Card
        title={editingId ? "Ubah Bab Perjalanan" : "Tambah Bab Perjalanan"}
        hint="Setiap bab muncul sebagai blok foto + cerita di section ‘Perjalanan Kami’ pada undangan."
      >
        <form onSubmit={submit} className="grid md:grid-cols-[1fr_1.4fr] gap-5">
          <div className="space-y-4">
            <FormRow label="Judul bab">
              <input
                required
                maxLength={120}
                className="cms-input"
                placeholder="mis. Pertemuan"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, title: s })}
                    className="text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded-full border border-line text-sepia-soft hover:bg-cream-deep"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FormRow>
            <FormRow label="Foto pendukung (opsional)">
              <input
                className="cms-input"
                placeholder="https://… atau biarkan kosong"
                value={form.photo}
                onChange={(e) => setForm({ ...form, photo: e.target.value })}
              />
              {form.photo && (
                <div className="mt-3 aspect-[3/4] w-full max-w-[180px] overflow-hidden rounded border border-line bg-cream-deep">
                  <img src={form.photo} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </FormRow>
          </div>
          <div className="space-y-4">
            <FormRow label="Isi cerita">
              <textarea
                required
                rows={9}
                className="cms-input"
                placeholder="Tuliskan cerita perjalanan kalian pada bab ini…"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
              <div className="text-[11px] text-sepia-mute mt-1">{form.body.length} karakter</div>
            </FormRow>
            {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">{err}</div>}
            <div className="flex items-center gap-3">
              <button disabled={busy} className="btn">
                {busy ? "Menyimpan…" : editingId ? "Simpan Perubahan" : "Tambah Bab"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-sm btn-ghost">Batal</button>
              )}
            </div>
          </div>
        </form>
      </Card>

      <Card title={`Bab Perjalanan (${chapters.length})`} hint="Urutan bab dapat diatur dengan tombol ↑ ↓.">
        {chapters.length === 0 ? (
          <div className="py-10 text-center text-sepia-soft">
            Belum ada bab perjalanan. Tambahkan bab pertama Anda di atas, biasanya dimulai dari ‘Pertemuan’.
          </div>
        ) : (
          <ol className="space-y-3">
            {chapters.map((ch, i) => (
              <li
                key={ch.id}
                className="rounded border border-line bg-paper p-4 flex flex-wrap md:flex-nowrap gap-4 items-start"
              >
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(ch.id, -1)}
                    disabled={i === 0}
                    className="text-sepia-mute hover:text-sepia disabled:opacity-30"
                    title="Naikkan urutan"
                  >
                    ↑
                  </button>
                  <span className="text-[10px] font-mono text-sepia-mute">{String(i + 1).padStart(2, "0")}</span>
                  <button
                    type="button"
                    onClick={() => move(ch.id, 1)}
                    disabled={i === chapters.length - 1}
                    className="text-sepia-mute hover:text-sepia disabled:opacity-30"
                    title="Turunkan urutan"
                  >
                    ↓
                  </button>
                </div>
                {ch.photo ? (
                  <img
                    src={ch.photo}
                    alt={ch.title}
                    className="w-20 h-24 object-cover rounded border border-line shrink-0"
                  />
                ) : (
                  <div className="w-20 h-24 rounded border border-dashed border-line bg-cream-deep flex items-center justify-center text-[10px] text-sepia-mute shrink-0">
                    Tanpa foto
                  </div>
                )}
                <div className="flex-1 min-w-[200px]">
                  <div className="text-xs tracking-[0.2em] uppercase text-gold-deep font-semibold">{ch.title}</div>
                  <p className="text-sm text-sepia-soft mt-2 leading-relaxed whitespace-pre-wrap line-clamp-4">{ch.body}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => startEdit(ch)} className="btn-sm btn-ghost">Ubah</button>
                  <button onClick={() => remove(ch.id)} className="btn-sm btn-ghost">Hapus</button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
      <style>{`.cms-input{width:100%;border:1px solid rgba(58,42,28,0.18);background:#FCF7EB;padding:11px 14px;border-radius:6px;font-size:14px;font-family:inherit}.cms-input:focus{outline:none;border-color:#A88339;background:#F4EAD5}.line-clamp-4{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}`}</style>
    </div>
  );
}

function EventsView({ w, onChanged }: { w: Wedding; onChanged: () => void }) {
  const [form, setForm] = useState({
    kind: "RESEPSI",
    title: "Resepsi Pernikahan",
    date: "",
    venueName: "",
    address: "",
    mapUrl: "",
    dressCode: "",
  });
  const [busy, setBusy] = useState(false);

  async function add(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post(`/weddings/by-id/${w.id}/events`, form);
      onChanged();
      setForm({ ...form, title: "", date: "", venueName: "", address: "", mapUrl: "", dressCode: "" });
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (!confirm("Hapus acara ini?")) return;
    await api.delete(`/weddings/by-id/${w.id}/events/${id}`);
    onChanged();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Card title="Tambah Acara">
        <form onSubmit={add} className="grid md:grid-cols-2 gap-4">
          <FormRow label="Jenis">
            <select className="cms-input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              <option value="AKAD">Akad Nikah</option>
              <option value="RESEPSI">Resepsi</option>
              <option value="NGUNDUH_MANTU">Ngunduh Mantu</option>
              <option value="TASYAKURAN">Tasyakuran</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </FormRow>
          <FormRow label="Judul">
            <input required className="cms-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </FormRow>
          <FormRow label="Tanggal & jam">
            <input type="datetime-local" required className="cms-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </FormRow>
          <FormRow label="Dress code">
            <input className="cms-input" value={form.dressCode} onChange={(e) => setForm({ ...form, dressCode: e.target.value })} />
          </FormRow>
          <FormRow label="Nama tempat" full>
            <input required className="cms-input" value={form.venueName} onChange={(e) => setForm({ ...form, venueName: e.target.value })} />
          </FormRow>
          <FormRow label="Alamat" full>
            <input required className="cms-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </FormRow>
          <FormRow label="URL Google Maps" full>
            <input className="cms-input" value={form.mapUrl} onChange={(e) => setForm({ ...form, mapUrl: e.target.value })} />
          </FormRow>
          <div className="md:col-span-2">
            <button disabled={busy} className="btn">{busy ? "Menyimpan…" : "Tambah Acara"}</button>
          </div>
        </form>
      </Card>

      <Card title={`Daftar Acara (${w.events.length})`}>
        <div className="divide-y divide-line">
          {w.events.length === 0 && <div className="py-8 text-center text-sepia-soft">Belum ada acara. Tambahkan acara pertama Anda di atas.</div>}
          {w.events.map((e) => (
            <div key={e.id} className="py-4 flex flex-wrap items-center gap-3">
              <div className="text-[10px] uppercase tracking-wider bg-gold-deep text-cream-soft rounded-full px-2 py-0.5">{e.kind}</div>
              <div className="flex-1 min-w-[200px]">
                <div className="font-serif text-lg">{e.title}</div>
                <div className="text-xs text-sepia-mute">{new Date(e.date).toLocaleString("id-ID")} · {e.venueName}</div>
              </div>
              <button onClick={() => remove(e.id)} className="btn-ghost btn-sm">Hapus</button>
            </div>
          ))}
        </div>
      </Card>
      <style>{`.cms-input{width:100%;border:1px solid rgba(58,42,28,0.18);background:#FCF7EB;padding:11px 14px;border-radius:6px;font-size:14px;font-family:inherit}.cms-input:focus{outline:none;border-color:#A88339;background:#F4EAD5}`}</style>
    </div>
  );
}

function GalleryView({ w, onChanged }: { w: Wedding; onChanged: () => void }) {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  async function add(e: FormEvent) {
    e.preventDefault();
    await api.post(`/weddings/by-id/${w.id}/gallery`, { url, caption: caption || null });
    setUrl(""); setCaption("");
    onChanged();
  }
  async function remove(id: string) {
    if (!confirm("Hapus foto ini?")) return;
    await api.delete(`/weddings/by-id/${w.id}/gallery/${id}`);
    onChanged();
  }
  return (
    <div className="space-y-6">
      <Card title="Tambah Foto" hint="Tempel URL foto (bisa dari Unsplash, Google Drive yang dipublik, atau hosting Anda).">
        <form onSubmit={add} className="grid md:grid-cols-[2fr_1.2fr_auto] gap-3">
          <input required className="cms-input" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
          <input className="cms-input" placeholder="Caption (opsional)" value={caption} onChange={(e) => setCaption(e.target.value)} />
          <button className="btn">Tambahkan</button>
        </form>
      </Card>
      <Card title={`Galeri (${w.gallery.length})`}>
        {w.gallery.length === 0 ? (
          <div className="py-10 text-center text-sepia-soft">Belum ada foto. Galeri minimal 4 foto direkomendasikan.</div>
        ) : (
          <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {w.gallery.map((g: any) => (
              <div key={g.id} className="relative group rounded overflow-hidden border border-line">
                <img src={g.url} alt={g.caption ?? ""} className="aspect-square object-cover w-full" />
                <button onClick={() => remove(g.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-sepia text-cream-soft text-xs rounded-full px-2 py-1 transition">Hapus</button>
                {g.caption && <div className="text-xs text-sepia-soft px-2 py-1 bg-paper">{g.caption}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>
      <style>{`.cms-input{width:100%;border:1px solid rgba(58,42,28,0.18);background:#FCF7EB;padding:11px 14px;border-radius:6px;font-size:14px;font-family:inherit}.cms-input:focus{outline:none;border-color:#A88339;background:#F4EAD5}`}</style>
    </div>
  );
}

const DEFAULT_WA_TEMPLATE = `Assalamu'alaikum Wr. Wb.

Kepada Yth. *{nama}*

Tanpa mengurangi rasa hormat, dengan penuh kebahagiaan kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara pernikahan kami:

*{brideShort} & {groomShort}*
🗓 {tanggal}
📍 {venue}

Detail acara dan konfirmasi kehadiran dapat dibuka melalui tautan undangan digital berikut:
{link}

Merupakan suatu kehormatan bagi kami atas kehadiran dan doa restu Anda.

Hormat kami,
{brideShort} & {groomShort}`;

function GuestsView({ w, onChanged }: { w: Wedding; onChanged: () => void }) {
  const [list, setList] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");
  const [form, setForm] = useState({ name: "", phone: "", group: "Teman", invitedTo: "Resepsi" });
  const [template, setTemplate] = useState(w.waMessageTemplate || DEFAULT_WA_TEMPLATE);
  const [tplSaved, setTplSaved] = useState(false);
  const [tplBusy, setTplBusy] = useState(false);
  const [waStatus, setWaStatus] = useState<{ status: string; connectedNumber?: string } | null>(null);
  const [busyRows, setBusyRows] = useState<Record<string, boolean>>({});
  const [bulkBusy, setBulkBusy] = useState(false);

  async function reload() {
    const r = await api.get(`/guests/${w.id}`, { params: { q: q || undefined, group } });
    setList(r.data);
  }
  useEffect(() => { reload().catch(() => {}); }, [w.id, group]);
  useEffect(() => {
    api.get("/whatsapp/status").then((r) => setWaStatus(r.data)).catch(() => setWaStatus(null));
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    await api.post(`/guests/${w.id}`, form);
    setForm({ name: "", phone: "", group: "Teman", invitedTo: "Resepsi" });
    reload();
  }
  async function remove(id: string) {
    if (!confirm("Hapus tamu ini?")) return;
    await api.delete(`/guests/${w.id}/${id}`);
    reload();
  }
  async function saveTemplate() {
    setTplBusy(true);
    try {
      await api.put(`/weddings/by-id/${w.id}`, { waMessageTemplate: template });
      onChanged();
      setTplSaved(true);
      setTimeout(() => setTplSaved(false), 2000);
    } finally {
      setTplBusy(false);
    }
  }
  async function sendOne(guestId: string) {
    setBusyRows((b) => ({ ...b, [guestId]: true }));
    try {
      await api.post(`/guests/${w.id}/${guestId}/send-wa`);
      await reload();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Gagal mengirim WA.");
      await reload();
    } finally {
      setBusyRows((b) => ({ ...b, [guestId]: false }));
    }
  }
  async function sendAll() {
    if (!confirm("Kirim undangan ke semua tamu yang belum dikirim?")) return;
    setBulkBusy(true);
    try {
      const r = await api.post(`/guests/${w.id}/send-wa-all`);
      alert(`Selesai: ${r.data.sent} terkirim, ${r.data.failed} gagal.`);
      await reload();
    } finally {
      setBulkBusy(false);
    }
  }
  function linkFor(g: any) {
    const param = g.slug || g.token;
    return `${window.location.origin}/${w.slug}?to=${param}`;
  }
  function openWaWeb(g: any) {
    // Fallback: open wa.me with pre-filled message (uses user's WA, not bot)
    const phone = (g.phone || "").replace(/[^0-9]/g, "").replace(/^0/, "62");
    if (!phone) { alert("Tamu belum memiliki nomor WA."); return; }
    const text = template
      .replace(/\{nama\}/g, g.name)
      .replace(/\{link\}/g, linkFor(g))
      .replace(/\{brideShort\}/g, "")
      .replace(/\{groomShort\}/g, "")
      .replace(/\{tanggal\}/g, "")
      .replace(/\{venue\}/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  }

  const VARS = [
    { key: "{nama}", desc: "Nama tamu" },
    { key: "{link}", desc: "Tautan undangan (sudah dengan ?to=slug)" },
    { key: "{tanggal}", desc: "Tanggal acara utama" },
    { key: "{venue}", desc: "Nama tempat acara utama" },
    { key: "{brideShort}", desc: "Nama panggilan mempelai putri" },
    { key: "{groomShort}", desc: "Nama panggilan mempelai putra" },
  ];

  const botConnected = waStatus?.status === "CONNECTED";
  const botStatusLabel: Record<string, { text: string; tone: string }> = {
    CONNECTED: { text: `Bot weddQ aktif${waStatus?.connectedNumber ? ` (${waStatus.connectedNumber})` : ""}`, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    AWAITING_QR: { text: "Bot weddQ menunggu QR. Buka panel Admin → WhatsApp.", tone: "bg-amber-50 text-amber-700 border-amber-200" },
    CONNECTING: { text: "Bot weddQ sedang menghubungkan…", tone: "bg-amber-50 text-amber-700 border-amber-200" },
    DISCONNECTED: { text: "Bot weddQ belum terhubung. Hanya mode WA pribadi yang tersedia.", tone: "bg-cream-deep text-sepia-mute border-line" },
    DISABLED: { text: "Bot weddQ dinonaktifkan via env (WA_DISABLED=true).", tone: "bg-cream-deep text-sepia-mute border-line" },
    FAILED: { text: `Bot weddQ error.`, tone: "bg-red-50 text-red-700 border-red-200" },
  };
  const statusInfo = waStatus ? botStatusLabel[waStatus.status] ?? botStatusLabel.DISCONNECTED : null;

  return (
    <div className="space-y-6">
      <Card title="Tambah Tamu">
        <form onSubmit={add} className="grid md:grid-cols-[2fr_1.4fr_1fr_1fr_auto] gap-3">
          <input required className="cms-input" placeholder="Nama tamu" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="cms-input" placeholder="Nomor WA" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <select className="cms-input" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
            <option>Keluarga</option><option>Teman</option><option>Kantor</option><option>VIP</option>
          </select>
          <select className="cms-input" value={form.invitedTo} onChange={(e) => setForm({ ...form, invitedTo: e.target.value })}>
            <option>Akad + Resepsi</option><option>Resepsi</option><option>Akad</option>
          </select>
          <button className="btn">Tambah</button>
        </form>
      </Card>

      <Card
        title="Template Pesan WhatsApp"
        hint="Pesan ini dikirim ke setiap tamu lewat bot weddQ atau WA pribadi. Gunakan variabel untuk personalisasi."
      >
        {statusInfo && (
          <div className={`text-xs px-3 py-2 rounded border mb-4 ${statusInfo.tone}`}>{statusInfo.text}</div>
        )}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {VARS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setTemplate((t) => `${t}${v.key}`)}
              title={v.desc}
              className="text-[11px] font-mono px-2 py-1 rounded-full border border-line text-gold-deep hover:bg-cream-deep"
            >
              {v.key}
            </button>
          ))}
        </div>
        <textarea
          rows={11}
          className="cms-input font-mono text-[13px]"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        />
        <div className="flex items-center gap-3 mt-3">
          <button onClick={saveTemplate} disabled={tplBusy} className="btn">{tplBusy ? "Menyimpan…" : "Simpan Template"}</button>
          {tplSaved && <span className="text-sm text-emerald-700">✓ Tersimpan</span>}
          <button
            type="button"
            onClick={() => setTemplate(DEFAULT_WA_TEMPLATE)}
            className="btn-sm btn-ghost"
          >
            Pulihkan Bawaan
          </button>
        </div>
      </Card>

      <Card title="Daftar Tamu" topRight={
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={sendAll}
            disabled={bulkBusy || !botConnected}
            title={!botConnected ? "Hubungkan bot weddQ di Admin untuk bulk send" : ""}
            className="btn-sm btn"
          >
            {bulkBusy ? "Mengirim semua…" : "Kirim ke Semua (Bot)"}
          </button>
          {["all", "VIP", "Keluarga", "Teman", "Kantor"].map((g) => (
            <button key={g} onClick={() => setGroup(g)} className={`text-xs px-3 py-1.5 rounded-full border ${group === g ? "bg-sepia text-cream-soft border-sepia" : "border-line text-sepia-soft hover:bg-cream-deep"}`}>
              {g === "all" ? "Semua" : g}
            </button>
          ))}
          <input
            className="cms-input"
            style={{ width: 220 }}
            placeholder="Cari nama…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={reload}
            onKeyDown={(e) => e.key === "Enter" && reload()}
          />
        </div>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="border-b border-line text-xs uppercase tracking-wider text-sepia-mute">
                <th className="py-2">Tamu</th>
                <th>Grup</th>
                <th>Diundang ke</th>
                <th>WA</th>
                <th>Dibuka</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((g) => (
                <tr key={g.id} className="border-b border-line/60 hover:bg-cream-deep/40 align-top">
                  <td className="py-3">
                    <div className="font-medium">{g.name}</div>
                    <div className="text-xs text-sepia-mute">{g.phone ?? "Tanpa nomor"}</div>
                    {g.slug && <div className="text-[10px] font-mono text-sepia-mute mt-0.5">?to={g.slug}</div>}
                  </td>
                  <td className="text-xs">{g.group ?? ""}</td>
                  <td className="text-xs">{g.invitedTo ?? ""}</td>
                  <td className="text-xs">
                    {g.waStatus === "SENT" && (
                      <span className="status-pill hadir">Terkirim</span>
                    )}
                    {g.waStatus === "FAILED" && (
                      <span className="status-pill tidak" title={g.waError ?? ""}>Gagal</span>
                    )}
                    {!g.waStatus && <span className="text-sepia-mute">Belum kirim</span>}
                    {g.waSentAt && <div className="text-[10px] text-sepia-mute mt-0.5">{new Date(g.waSentAt).toLocaleString("id-ID")}</div>}
                  </td>
                  <td>
                    {g.opened ? <span className="status-pill hadir">Dibuka</span> : <span className="status-pill ragu">Belum</span>}
                  </td>
                  <td className="text-xs">
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      <button
                        onClick={() => sendOne(g.id)}
                        disabled={busyRows[g.id] || !botConnected || !g.phone}
                        title={!g.phone ? "Tamu belum memiliki nomor WA" : !botConnected ? "Bot belum terhubung" : "Kirim lewat bot weddQ"}
                        className="btn-sm btn"
                      >
                        {busyRows[g.id] ? "…" : "Bot WA"}
                      </button>
                      <button
                        onClick={() => openWaWeb(g)}
                        disabled={!g.phone}
                        title="Buka WhatsApp di nomor saya"
                        className="btn-sm btn-ghost"
                      >
                        WA Saya
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(linkFor(g))}
                        className="btn-sm btn-ghost"
                        title="Salin tautan undangan"
                      >
                        Salin URL
                      </button>
                      <button onClick={() => remove(g.id)} className="btn-sm btn-ghost">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-sepia-soft">Belum ada tamu. Tambahkan tamu pertama Anda di atas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <style>{`.cms-input{width:100%;border:1px solid rgba(58,42,28,0.18);background:#FCF7EB;padding:11px 14px;border-radius:6px;font-size:14px;font-family:inherit}.cms-input:focus{outline:none;border-color:#A88339;background:#F4EAD5}`}</style>
    </div>
  );
}

function RsvpView({ w }: { w: Wedding }) {
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    api.get(`/rsvp/${w.id}`, { params: { status: filter } }).then((r) => setList(r.data));
  }, [w.id, filter]);
  return (
    <Card title="Daftar RSVP" topRight={
      <div className="flex gap-2">
        {[["all", "Semua"], ["HADIR", "Hadir"], ["TIDAK", "Tidak"], ["RAGU", "Ragu"]].map(([id, lbl]) => (
          <button key={id} onClick={() => setFilter(id)} className={`text-xs px-3 py-1.5 rounded-full border ${filter === id ? "bg-sepia text-cream-soft border-sepia" : "border-line text-sepia-soft hover:bg-cream-deep"}`}>{lbl}</button>
        ))}
      </div>
    }>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-sepia-mute">
            <tr className="border-b border-line">
              <th className="py-2">Nama</th><th>Status</th><th>Sesi</th><th>Tamu+</th><th>Pesan</th><th>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-b border-line/60">
                <td className="py-3 font-medium">{r.name}</td>
                <td><span className={`status-pill ${r.status.toLowerCase()}`}>{r.status}</span></td>
                <td className="text-xs">{r.session ?? ""}</td>
                <td>{r.pax}</td>
                <td className="max-w-[300px] text-xs text-sepia-soft">{r.message ?? ""}</td>
                <td className="text-xs text-sepia-mute">{new Date(r.createdAt).toLocaleString("id-ID")}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-sepia-soft">Belum ada konfirmasi RSVP.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function WishesView({ w }: { w: Wedding }) {
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  async function reload() {
    const r = await api.get(`/wishes/${w.id}`, { params: { status: filter } });
    setList(r.data);
  }
  useEffect(() => { reload(); }, [w.id, filter]);

  async function toggle(id: string, status: string) {
    await api.put(`/wishes/${w.id}/${id}`, { status });
    reload();
  }
  async function remove(id: string) {
    if (!confirm("Hapus ucapan ini?")) return;
    await api.delete(`/wishes/${w.id}/${id}`);
    reload();
  }

  return (
    <Card title="Ucapan & Doa Tamu" topRight={
      <div className="flex gap-2">
        {[["all", "Semua"], ["PUBLISHED", "Ditampilkan"], ["HIDDEN", "Disembunyikan"]].map(([id, lbl]) => (
          <button key={id} onClick={() => setFilter(id)} className={`text-xs px-3 py-1.5 rounded-full border ${filter === id ? "bg-sepia text-cream-soft border-sepia" : "border-line text-sepia-soft hover:bg-cream-deep"}`}>{lbl}</button>
        ))}
      </div>
    }>
      <div className="space-y-3">
        {list.map((w) => (
          <div key={w.id} className="rounded border border-line p-4 bg-paper flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-deep text-cream-soft font-serif flex items-center justify-center">{w.name[0]}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-serif">{w.name}</div>
                <div className="text-xs text-sepia-mute">{new Date(w.createdAt).toLocaleString("id-ID")}</div>
              </div>
              <p className="text-sm mt-1 text-sepia-soft">{w.message}</p>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => toggle(w.id, w.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED")} className="btn-sm btn-ghost">
                {w.status === "PUBLISHED" ? "Sembunyikan" : "Tampilkan"}
              </button>
              <button onClick={() => remove(w.id)} className="btn-sm btn-ghost">Hapus</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="py-10 text-center text-sepia-soft">Belum ada ucapan.</div>}
      </div>
    </Card>
  );
}

function GiftView({ w, onChanged }: { w: Wedding; onChanged: () => void }) {
  const [form, setForm] = useState({ kind: "BANK", bankName: "BCA", number: "", holder: "" });
  async function add(e: FormEvent) {
    e.preventDefault();
    await api.post(`/weddings/by-id/${w.id}/gifts`, form);
    setForm({ ...form, number: "", holder: "" });
    onChanged();
  }
  async function remove(id: string) {
    if (!confirm("Hapus rekening ini?")) return;
    await api.delete(`/weddings/by-id/${w.id}/gifts/${id}`);
    onChanged();
  }
  return (
    <div className="space-y-6 max-w-3xl">
      <Card title="Tambah Rekening Amplop Digital">
        <form onSubmit={add} className="grid md:grid-cols-2 gap-3">
          <select className="cms-input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
            <option value="BANK">Bank</option>
            <option value="EWALLET">E-Wallet</option>
            <option value="QRIS">QRIS</option>
          </select>
          <input required className="cms-input" placeholder="Nama bank / e-wallet" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
          <input required className="cms-input" placeholder="Nomor rekening / nomor HP" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
          <input required className="cms-input" placeholder="Atas nama" value={form.holder} onChange={(e) => setForm({ ...form, holder: e.target.value })} />
          <div className="md:col-span-2"><button className="btn">Tambah Rekening</button></div>
        </form>
      </Card>
      <Card title={`Rekening (${w.gifts.length})`}>
        {w.gifts.length === 0 ? (
          <div className="py-10 text-center text-sepia-soft">Belum ada rekening amplop digital.</div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            {w.gifts.map((g: any) => (
              <div key={g.id} className="w-full md:w-[calc(50%-0.375rem)] rounded border border-line p-4 bg-paper flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-gold-deep">{g.kind}</div>
                  <div className="font-serif text-xl">{g.bankName}</div>
                  <div className="font-mono text-sm mt-1">{g.number}</div>
                  <div className="text-xs text-sepia-mute">a.n. {g.holder}</div>
                </div>
                <button onClick={() => remove(g.id)} className="btn-sm btn-ghost">Hapus</button>
              </div>
            ))}
          </div>
        )}
      </Card>
      <style>{`.cms-input{width:100%;border:1px solid rgba(58,42,28,0.18);background:#FCF7EB;padding:11px 14px;border-radius:6px;font-size:14px;font-family:inherit}.cms-input:focus{outline:none;border-color:#A88339;background:#F4EAD5}`}</style>
    </div>
  );
}

function SettingsView({ w, onChanged }: { w: Wedding; onChanged: () => void }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateId, setTemplateId] = useState(w.templateId ?? "");
  const [status, setStatus] = useState(w.status);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get("/templates").then((r) => setTemplates(r.data)); }, []);

  async function save() {
    setBusy(true);
    try {
      await api.put(`/weddings/by-id/${w.id}`, { templateId: templateId || null, status });
      onChanged();
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card title="Status Undangan">
        <div className="flex gap-2">
          {[["DRAFT", "Draft (hanya Anda yang bisa melihat)"], ["PUBLISHED", "Publish (tamu bisa membuka)"]].map(([v, lbl]) => (
            <button key={v} onClick={() => setStatus(v)} className={`flex-1 rounded border p-4 text-left ${status === v ? "border-sepia bg-sepia text-cream-soft" : "border-line bg-paper"}`}>
              <div className="text-xs uppercase tracking-wider">{v === "PUBLISHED" ? "Aktif" : "Draft"}</div>
              <div className="text-sm mt-1">{lbl}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Template Aktif">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-2">
          {templates.map((t) => (
            <button key={t.id} onClick={() => setTemplateId(t.id)} className={`rounded border p-4 text-left ${templateId === t.id ? "border-sepia bg-sepia text-cream-soft" : "border-line bg-paper hover:bg-cream-deep"}`}>
              <div className="font-serif text-lg">{t.name}</div>
              <div className="text-xs opacity-70 mt-1">{t.style}</div>
              <div className="text-xs font-mono mt-2">Rp {(t.priceIdr / 1000).toFixed(0)}rb</div>
            </button>
          ))}
        </div>
      </Card>

      <button disabled={busy} onClick={save} className="btn">{busy ? "Menyimpan…" : "Simpan Pengaturan"}</button>
    </div>
  );
}

/* SHARED */
function Card({ title, hint, topRight, children }: { title: string; hint?: string; topRight?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-paper border border-line rounded-sm p-6">
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h3 className="font-serif text-xl">{title}</h3>
          {hint && <p className="text-xs text-sepia-mute mt-1">{hint}</p>}
        </div>
        <div>{topRight}</div>
      </div>
      {children}
    </div>
  );
}
function FormRow({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <div className="text-[11px] uppercase tracking-[0.18em] text-sepia-mute mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function EmptyState({ onCreated }: { onCreated: () => void }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ brideShort: "", brideName: "", groomShort: "", groomName: "" });
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get("/templates").then((r) => { setTemplates(r.data); setTemplateId(r.data[0]?.id ?? ""); }); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/weddings", { ...form, templateId });
      onCreated();
      nav("/dashboard/content");
    } finally { setBusy(false); }
  }

  return (
    <CmsShell title="Buat Undangan Baru" links={[{ to: "/dashboard", label: "Dasbor", icon: "◆" }]}>
      <div className="max-w-2xl">
        <div className="card-paper bracketed p-8">
          <span className="sec-num">MULAI</span>
          <h2 className="font-serif text-3xl md:text-4xl mt-2">Mari buat undangan pertama Anda</h2>
          <Divider width={200} className="mt-4" />
          <p className="text-sepia-soft mt-4">Isi nama pasangan dan pilih template untuk memulai. Anda bisa menyesuaikan semuanya nanti.</p>
          <form onSubmit={submit} className="mt-7 grid md:grid-cols-2 gap-4">
            <FormRow label="Nama panggilan mempelai putri">
              <input required className="cms-input" value={form.brideShort} onChange={(e) => setForm({ ...form, brideShort: e.target.value })} />
            </FormRow>
            <FormRow label="Nama lengkap mempelai putri">
              <input required className="cms-input" value={form.brideName} onChange={(e) => setForm({ ...form, brideName: e.target.value })} />
            </FormRow>
            <FormRow label="Nama panggilan mempelai putra">
              <input required className="cms-input" value={form.groomShort} onChange={(e) => setForm({ ...form, groomShort: e.target.value })} />
            </FormRow>
            <FormRow label="Nama lengkap mempelai putra">
              <input required className="cms-input" value={form.groomName} onChange={(e) => setForm({ ...form, groomName: e.target.value })} />
            </FormRow>
            <FormRow label="Template" full>
              <select className="cms-input" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.style}</option>)}
              </select>
            </FormRow>
            <div className="md:col-span-2">
              <button disabled={busy} className="btn">{busy ? "Membuat…" : "Buat Undangan"}</button>
            </div>
          </form>
        </div>
      </div>
      <style>{`.cms-input{width:100%;border:1px solid rgba(58,42,28,0.18);background:#FCF7EB;padding:11px 14px;border-radius:6px;font-size:14px;font-family:inherit}.cms-input:focus{outline:none;border-color:#A88339;background:#F4EAD5}`}</style>
    </CmsShell>
  );
}
