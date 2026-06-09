import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { CmsShell } from "@/components/CmsShell";
import { api, extractError } from "@/lib/api";
import { Divider, OrnamentRow } from "@/components/Ornaments";
import { useAuth } from "@/store/auth";

type Wedding = {
  id: string;
  slug: string;
  status: string;
  package?: "PRO" | "EKSKLUSIF";
  eyebrow: string;
  coverImage?: string | null;
  story?: string | null;
  quote?: string | null;
  openingSalutation?: string | null;
  closingSalutation?: string | null;
  musicUrl?: string | null;
  waMessageTemplate?: string | null;
  primaryColor?: string | null;
  templateId?: string | null;
  activeFrom?: string | null;
  activeUntil?: string | null;
  couple: {
    brideName: string;
    brideShort: string;
    brideParents?: string | null;
    brideInstagram?: string | null;
    bridePhoto?: string | null;
    groomName: string;
    groomShort: string;
    groomParents?: string | null;
    groomInstagram?: string | null;
    groomPhoto?: string | null;
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
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { list, active, reload } = useActiveWedding();

  if (list === null) return <div className="p-10 text-sepia-soft">Memuat dasbor…</div>;
  if (list.length > 0 && !active) return <div className="p-10 text-sepia-soft">Memuat undangan…</div>;

  const titleMap: Record<string, string> = {
    "/dashboard": active ? "Ringkasan" : "Paket Undangan",
    "/dashboard/content": "Editor Konten",
    "/dashboard/journey": "Perjalanan Kami",
    "/dashboard/events": "Acara",
    "/dashboard/gallery": "Galeri Foto",
    "/dashboard/guests": "Daftar Tamu",
    "/dashboard/rsvp": "RSVP",
    "/dashboard/wishes": "Ucapan & Doa",
    "/dashboard/gift": "Amplop Digital",
    "/dashboard/settings": "Pengaturan",
    "/dashboard/admin": "Ringkasan Platform",
    "/dashboard/admin/new": "Buat Undangan Klien",
    "/dashboard/admin/users": "Pengguna",
    "/dashboard/admin/weddings": "Semua Undangan",
    "/dashboard/admin/domains": "Domain Kustom",
    "/dashboard/admin/templates": "Template",
    "/dashboard/admin/whatsapp": "Bot WhatsApp",
    "/dashboard/admin/logs": "Log Aktivitas",
  };

  return (
    <CmsShellWithLinks active={active} isAdmin={isAdmin} titleMap={titleMap}>
      <Routes>
        {active ? (
          <>
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
          </>
        ) : (
          <Route index element={isAdmin ? <Navigate to="/dashboard/admin" replace /> : <PackagePlansView />} />
        )}
        {isAdmin && (
          <>
            <Route path="admin" element={<AdminOverview />} />
            <Route path="admin/new" element={<AdminCreateClient />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/weddings" element={<AdminWeddings />} />
            <Route path="admin/domains" element={<AdminDomains />} />
            <Route path="admin/templates" element={<AdminTemplates />} />
            <Route path="admin/whatsapp" element={<AdminWhatsApp />} />
            <Route path="admin/logs" element={<AdminLogs />} />
          </>
        )}
        {/* Unknown path (incl. /dashboard/admin/* for non-admin) → user dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </CmsShellWithLinks>
  );
}

function CmsShellWithLinks({
  active,
  isAdmin,
  children,
  titleMap,
}: {
  active: Wedding | null;
  isAdmin: boolean;
  children: React.ReactNode;
  titleMap: Record<string, string>;
}) {
  const loc = useLocation();
  const title = titleMap[loc.pathname] ?? "Dasbor";

  const weddingLinks = active
    ? [
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
      ]
    : isAdmin
      ? [] // admin tidak membuat undangan untuk dirinya sendiri; pakai "Buat Undangan" di grup Platform
      : [{ to: "/dashboard", label: "Paket Undangan", icon: "✦", group: "Undangan" }];

  const adminLinks = isAdmin
    ? [
        { to: "/dashboard/admin", label: "Ringkasan Platform", icon: "◆", group: "Platform" },
        { to: "/dashboard/admin/new", label: "Buat Undangan", icon: "✚", group: "Platform" },
        { to: "/dashboard/admin/users", label: "Pengguna", icon: "☷", group: "Platform" },
        { to: "/dashboard/admin/weddings", label: "Semua Undangan", icon: "✦", group: "Platform" },
        { to: "/dashboard/admin/domains", label: "Domain Kustom", icon: "🌐", group: "Platform" },
        { to: "/dashboard/admin/templates", label: "Template", icon: "◇", group: "Platform" },
        { to: "/dashboard/admin/whatsapp", label: "Bot WhatsApp", icon: "✆", group: "Platform" },
        { to: "/dashboard/admin/logs", label: "Log Aktivitas", icon: "≡", group: "Platform" },
      ]
    : [];

  return (
    <CmsShell
      title={title}
      links={[...weddingLinks, ...adminLinks]}
      topbar={
        active ? (
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
        ) : null
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
  const editLocked = w.activeUntil && Date.now() > new Date(w.activeUntil).getTime();

  return (
    <div className="space-y-8">
      {editLocked && (
        <div className="rounded-sm border border-amber-300 bg-amber-50 text-amber-900 p-5">
          <div className="font-serif text-lg">Masa edit undangan telah berakhir</div>
          <p className="text-sm mt-1">
            Undangan Anda tetap tayang dan dapat diakses tamu, namun penyuntingan kini terkunci
            {w.activeUntil ? ` (sejak ${new Date(w.activeUntil).toLocaleDateString("id-ID")})` : ""}. Hubungi admin untuk perpanjangan.
          </p>
        </div>
      )}
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
    musicUrl: w.musicUrl ?? "",
    couple: {
      brideName: w.couple.brideName,
      brideShort: w.couple.brideShort,
      brideParents: w.couple.brideParents ?? "",
      brideInstagram: w.couple.brideInstagram ?? "",
      bridePhoto: w.couple.bridePhoto ?? "",
      groomName: w.couple.groomName,
      groomShort: w.couple.groomShort,
      groomParents: w.couple.groomParents ?? "",
      groomInstagram: w.couple.groomInstagram ?? "",
      groomPhoto: w.couple.groomPhoto ?? "",
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

      <Card title="Musik Latar" hint="Tempel tautan YouTube. Lagu akan terputar otomatis (muted) dengan tombol mengambang untuk mengaktifkan suara.">
        <FormRow label="Tautan YouTube">
          <input
            className="cms-input"
            placeholder="https://www.youtube.com/watch?v=…"
            value={form.musicUrl}
            onChange={(e) => setForm({ ...form, musicUrl: e.target.value })}
          />
        </FormRow>
        {form.musicUrl && (
          <p className="text-xs text-sepia-mute mt-2">
            Tip: pastikan video YouTube dapat diembed (tidak dibatasi pemilik). Format yang didukung: <code className="font-mono">youtube.com/watch?v=ID</code>, <code className="font-mono">youtu.be/ID</code>, dan ID 11 karakter langsung.
          </p>
        )}
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
          <div className="md:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-sepia-mute mb-1.5">Foto mempelai putri</div>
            <ImageField value={form.couple.bridePhoto} onChange={(v) => setForm({ ...form, couple: { ...form.couple, bridePhoto: v } })} />
          </div>
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
          <div className="md:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-sepia-mute mb-1.5">Foto mempelai putra</div>
            <ImageField value={form.couple.groomPhoto} onChange={(v) => setForm({ ...form, couple: { ...form.couple, groomPhoto: v } })} />
          </div>
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
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-sepia-mute mb-1.5">Foto pendukung (opsional)</div>
              <ImageField square={false} value={form.photo} onChange={(v) => setForm({ ...form, photo: v })} />
            </div>
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
  const [photo, setPhoto] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const cover = w.coverImage ?? null;

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!photo) return;
    setBusy(true);
    try {
      await api.post(`/weddings/by-id/${w.id}/gallery`, { url: photo, caption: caption || null });
      setPhoto(""); setCaption("");
      onChanged();
    } finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!confirm("Hapus foto ini?")) return;
    await api.delete(`/weddings/by-id/${w.id}/gallery/${id}`);
    onChanged();
  }
  async function setCover(url: string | null) {
    await api.put(`/weddings/by-id/${w.id}`, { coverImage: url });
    onChanged();
  }

  return (
    <div className="space-y-6">
      <Card title="Tambah Foto" hint="Unggah dari perangkat atau tempel URL (Unsplash, Google Drive publik, dll.).">
        <form onSubmit={add} className="space-y-4">
          <ImageField square={false} value={photo} onChange={setPhoto} />
          <div className="grid md:grid-cols-[1fr_auto] gap-3">
            <input className="cms-input" placeholder="Caption (opsional)" value={caption} onChange={(e) => setCaption(e.target.value)} />
            <button disabled={busy || !photo} className="btn">{busy ? "Menambah…" : "Tambahkan ke Galeri"}</button>
          </div>
        </form>
      </Card>

      <Card title={`Galeri (${w.gallery.length})`} hint="Klik ✦ Jadikan Sampul untuk memakai foto sebagai latar belakang cover undangan (sebelum dibuka).">
        {w.gallery.length === 0 ? (
          <div className="py-10 text-center text-sepia-soft">Belum ada foto. Galeri minimal 4 foto direkomendasikan.</div>
        ) : (
          <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {w.gallery.map((g: any) => {
              const isCover = cover === g.url;
              return (
                <div key={g.id} className={`relative group rounded-lg overflow-hidden border ${isCover ? "border-gold-deep ring-2 ring-gold-deep/40" : "border-line"}`}>
                  <img src={g.url} alt={g.caption ?? ""} className="aspect-square object-cover w-full" />
                  {isCover && (
                    <span className="absolute top-2 left-2 bg-gold-deep text-cream-soft text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5">✦ Sampul</span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-2 flex items-center gap-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => setCover(isCover ? null : g.url)}
                      className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-1 ${isCover ? "bg-cream-soft text-sepia" : "bg-gold-deep text-cream-soft"}`}
                    >
                      {isCover ? "Batalkan" : "✦ Jadikan Sampul"}
                    </button>
                    <button type="button" onClick={() => remove(g.id)} className="ml-auto text-[10px] uppercase tracking-wider rounded-full px-2 py-1 bg-sepia text-cream-soft">Hapus</button>
                  </div>
                  {g.caption && <div className="text-xs text-sepia-soft px-2 py-1 bg-paper">{g.caption}</div>}
                </div>
              );
            })}
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
    CONNECTED: { text: "Bot WhatsApp weddQ aktif", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
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
  const pkg = w.package ?? "PRO";
  const isEksklusif = pkg === "EKSKLUSIF";
  useEffect(() => { api.get("/templates").then((r) => setTemplates(r.data)); }, []);

  // Paket PRO hanya boleh template ≤ 100rb; Eksklusif boleh semua. Template aktif tetap ditampilkan.
  const allowed = templates.filter((t) => isEksklusif || t.priceIdr <= 100000 || t.id === w.templateId);

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

      <Card title="Template Aktif" hint={isEksklusif ? "Paket Eksklusif: seluruh template tersedia." : "Paket Pro: menampilkan template Pro. Tingkatkan ke Eksklusif untuk template premium."} topRight={<span className={`status-pill ${isEksklusif ? "ragu" : "hadir"}`}>Paket {isEksklusif ? "Eksklusif" : "Pro"}</span>}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-2">
          {allowed.map((t) => {
            const eks = t.priceIdr > 100000;
            return (
              <button key={t.id} onClick={() => setTemplateId(t.id)} className={`rounded border p-4 text-left ${templateId === t.id ? "border-sepia bg-sepia text-cream-soft" : "border-line bg-paper hover:bg-cream-deep"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-serif text-lg">{t.name}</div>
                  {eks && <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${templateId === t.id ? "bg-cream-soft text-sepia" : "bg-maroon/10 text-maroon"}`}>Eksklusif</span>}
                </div>
                <div className="text-xs opacity-70 mt-1">{t.style}</div>
              </button>
            );
          })}
        </div>
        {!isEksklusif && (
          <p className="mt-4 text-xs text-sepia-mute">Ingin memakai template Eksklusif (mis. Lumina, Noctura)? Hubungi admin untuk meningkatkan ke paket Eksklusif.</p>
        )}
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

/** Perkecil gambar di browser → data URL JPEG (tanpa storage backend).
 *  square=true → center-crop 1:1; else jaga rasio asli. */
async function downscaleImage(file: File, opts: { square?: boolean; size?: number; quality?: number } = {}): Promise<string> {
  const { square = false, size = square ? 720 : 1280, quality = 0.82 } = opts;
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  if (square) {
    const side = Math.min(img.width, img.height);
    const out = Math.min(size, side);
    canvas.width = out; canvas.height = out;
    canvas.getContext("2d")!.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, out, out);
  } else {
    let { width, height } = img;
    const longest = Math.max(width, height);
    if (longest > size) { const s = size / longest; width = Math.round(width * s); height = Math.round(height * s); }
    canvas.width = width; canvas.height = height;
    canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
  }
  return canvas.toDataURL("image/jpeg", quality);
}

function ImageField({ value, onChange, square = true }: { value: string; onChange: (v: string) => void; square?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErr("Berkas harus berupa gambar."); return; }
    setBusy(true); setErr(null);
    try {
      onChange(await downscaleImage(file, { square }));
    } catch {
      setErr("Gagal memproses gambar.");
    } finally {
      setBusy(false);
    }
  }

  const isData = value.startsWith("data:");
  return (
    <div className="flex items-start gap-4">
      <div className={`${square ? "w-24 h-24" : "w-28 h-[84px]"} rounded-md overflow-hidden bg-cream-deep border border-line flex items-center justify-center shrink-0`}>
        {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] text-sepia-mute">{square ? "1 : 1" : "foto"}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="btn-ghost btn-sm cursor-pointer inline-flex">
            {busy ? "Memproses…" : value ? "Ganti Foto" : "Unggah Foto"}
            <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={busy} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange("")} className="text-xs text-maroon hover:underline">Hapus</button>
          )}
        </div>
        <input
          className="cms-input mt-2"
          placeholder="atau tempel URL foto…"
          value={isData ? "" : value}
          onChange={(e) => onChange(e.target.value)}
        />
        {err && <div className="text-xs text-red-700 mt-1">{err}</div>}
        <p className="text-[11px] text-sepia-mute mt-1">JPG/PNG, otomatis dikecilkan{square ? ". Rasio 1:1 (persegi) paling pas." : "."}</p>
      </div>
    </div>
  );
}

const WA_ADMIN = "6283197715855";

function PackagePlansView() {
  const { user } = useAuth();
  const plans = [
    {
      name: "Pro", price: "69", unit: "rb", featured: false,
      desc: "Undangan digital lengkap untuk pernikahan Anda",
      features: [
        "Akses seluruh template Pro",
        "Sampai 400 tamu undangan",
        "Galeri 20 foto dan cerita",
        "RSVP dan buku tamu",
        "Amplop digital (3 rekening)",
        "Subdomain weddq.id/nama-anda",
      ],
    },
    {
      name: "Eksklusif", price: "110", unit: "rb", featured: true,
      desc: "Seluruh fitur premium dengan domain pribadi",
      features: [
        "Seluruh benefit Pro",
        "Akses seluruh template Eksklusif",
        "Tamu tak terbatas",
        "Galeri foto & video tak terbatas",
        "Animasi transisi sinematik",
        "Domain pribadi .my.id (dikelola weddQ)",
      ],
    },
  ];

  function buyLink(plan: string) {
    const msg = `Halo weddQ, saya ingin membeli paket *${plan}* undangan pernikahan.\nEmail akun saya: ${user?.email ?? "-"}`;
    return `https://wa.me/${WA_ADMIN}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <span className="label-soft">Mulai</span>
        <h2 className="font-serif text-3xl md:text-4xl mt-2 text-sepia">Pilih paket undangan Anda</h2>
        <p className="mt-3 text-sepia-soft max-w-xl">
          Pilih paket yang sesuai, lalu lakukan pembayaran melalui admin. Setelah dikonfirmasi, undangan
          Anda akan diaktifkan dan Anda dapat langsung mengisi isinya dari dasbor ini.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((p) => (
          <div key={p.name} className={`relative rounded-2xl p-8 flex flex-col border ${p.featured ? "bg-sepia text-cream-soft border-sepia" : "bg-paper border-line"}`}>
            {p.featured && (
              <span className="absolute -top-3 left-8 rounded-full bg-gold-deep text-cream-soft text-[10px] uppercase tracking-[0.18em] px-3 py-1 font-medium">
                Paling Diminati
              </span>
            )}
            <div className={`font-serif text-3xl ${p.featured ? "text-cream-soft" : "text-sepia"}`}>{p.name}</div>
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
            <a href={buyLink(p.name)} target="_blank" rel="noreferrer" className={`mt-8 ${p.featured ? "btn-gold" : "btn"} justify-center`}>
              Beli Paket {p.name}
            </a>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-sepia-mute">
        Pembayaran dikonfirmasi manual oleh admin. Setelah aktif, masa edit undangan ditentukan sesuai paket.
      </p>
    </div>
  );
}

function CreateWeddingView({ onCreated }: { onCreated: () => void }) {
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
      <style>{`.cms-input{width:100%;border:1px solid rgba(58,42,28,0.18);background:#FCF7EB;padding:11px 14px;border-radius:6px;font-size:14px;font-family:inherit}.cms-input:focus{outline:none;border-color:#A88339;background:#F4EAD5}`}</style>
    </div>
  );
}

/* ============================ ADMIN / PLATFORM VIEWS ============================ */

function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { api.get("/admin/stats").then((r) => setStats(r.data)); }, []);
  if (!stats) return <div className="text-sepia-soft">Memuat…</div>;
  const t = stats.totals;
  return (
    <div className="space-y-8">
      <div className="rounded-sm bg-paper border border-line p-7 bracketed">
        <span className="sec-num">RINGKASAN PLATFORM</span>
        <h2 className="font-serif text-3xl mt-2">Panel Platform weddQ</h2>
        <p className="text-sepia-soft mt-3 max-w-xl">
          Pantau pertumbuhan platform, undangan terbaru yang diterbitkan, serta aktivitas pengguna dari satu tempat.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-6 gap-5">
        <Metric label="Pengguna" value={t.users} color="#A88339" />
        <Metric label="Undangan" value={t.weddings} color="#B8736D" />
        <Metric label="Aktif Publish" value={t.published} color="#4F9F6B" />
        <Metric label="Total RSVP" value={t.rsvps} color="#6E3A38" />
        <Metric label="Total Ucapan" value={t.wishes} color="#8E544E" />
        <Metric label="Template" value={t.templates} color="#A88339" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-paper border border-line rounded-sm p-6">
          <h3 className="font-serif text-xl">Pendaftar Terbaru</h3>
          <table className="w-full text-sm mt-3">
            <tbody>
              {stats.recentUsers.map((u: any) => (
                <tr key={u.id} className="border-b border-line/60">
                  <td className="py-3">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-sepia-mute">{u.email}</div>
                  </td>
                  <td className="text-xs">{u.role}</td>
                  <td className="text-right text-xs text-sepia-mute">{new Date(u.createdAt).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-paper border border-line rounded-sm p-6">
          <h3 className="font-serif text-xl">Undangan Terbaru</h3>
          <table className="w-full text-sm mt-3">
            <tbody>
              {stats.recentWeddings.map((w: any) => (
                <tr key={w.id} className="border-b border-line/60">
                  <td className="py-3">
                    <div className="font-medium">{w.couple?.brideShort} & {w.couple?.groomShort}</div>
                    <div className="text-xs text-sepia-mute">/{w.slug}</div>
                  </td>
                  <td className="text-xs">{w.status}</td>
                  <td className="text-right text-xs text-sepia-mute">{w.owner?.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: any; color?: string }) {
  return (
    <div className="bg-paper border border-line rounded-sm p-5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-sepia-mute">{label}</div>
      <div className="font-serif text-4xl mt-2">{value}</div>
      <div className="h-1 mt-3 rounded" style={{ background: `${color ?? "#A88339"}22` }}>
        <div className="h-full rounded" style={{ width: "65%", background: color ?? "#A88339" }} />
      </div>
    </div>
  );
}

type CreateDone = { mode: "new" | "existing"; email: string; password?: string; slug: string; waSent: boolean; waError: string | null };

function AdminCreateClient() {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [templates, setTemplates] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", userId: "", package: "PRO",
    brideShort: "", brideName: "", groomShort: "", groomName: "", templateId: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<CreateDone | null>(null);

  useEffect(() => {
    api.get("/templates").then((r) => { setTemplates(r.data); setForm((f) => ({ ...f, templateId: r.data[0]?.id ?? "" })); });
    api.get("/admin/users").then((r) => setUsers(r.data.filter((u: any) => u.role !== "ADMIN")));
  }, []);

  function set<K extends keyof typeof form>(k: K, v: string) { setForm((f) => ({ ...f, [k]: v })); }
  function genPassword() {
    const p = Math.random().toString(36).slice(2, 10) + Math.floor(Math.random() * 90 + 10);
    set("password", p);
  }
  function resetForm() {
    setForm({ name: "", email: "", password: "", phone: "", userId: "", package: "PRO", brideShort: "", brideName: "", groomShort: "", groomName: "", templateId: templates[0]?.id ?? "" });
  }

  const allowedTemplates = templates.filter((t) => form.package === "EKSKLUSIF" || t.priceIdr <= 100000);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const couple = {
        package: form.package,
        brideShort: form.brideShort, brideName: form.brideName,
        groomShort: form.groomShort, groomName: form.groomName,
        templateId: form.templateId || null,
      };
      if (mode === "new") {
        const r = await api.post("/admin/clients", { name: form.name, email: form.email, password: form.password, phone: form.phone, ...couple });
        setDone({ mode: "new", email: r.data.credentials.email, password: r.data.credentials.password, slug: r.data.wedding.slug, waSent: r.data.waSent, waError: r.data.waError ?? null });
      } else {
        const r = await api.post("/admin/weddings/assign", { userId: form.userId, ...couple });
        setDone({ mode: "existing", email: r.data.user.email, slug: r.data.wedding.slug, waSent: r.data.waSent, waError: r.data.waError ?? null });
      }
    } catch (e) { setErr(extractError(e)); }
    finally { setBusy(false); }
  }

  if (done) {
    return (
      <div className="max-w-xl">
        <div className="card-paper bracketed p-8">
          <span className="sec-num">UNDANGAN DIBUAT</span>
          <h2 className="font-serif text-3xl mt-2">{done.mode === "new" ? "Akun klien siap diserahkan" : "Undangan ditambahkan ke akun user"}</h2>
          <p className="text-sepia-soft mt-3 text-sm">
            {done.mode === "new"
              ? "Kredensial & info setup telah dikirim ke WhatsApp klien. Cadangan tersedia di bawah bila diperlukan."
              : "Info undangan telah dikirim ke WhatsApp user. User login dengan akun yang sudah ada untuk mengisinya."}
          </p>
          <div className={`mt-4 rounded-sm p-3 text-sm border ${done.waSent ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-900"}`}>
            {done.waSent
              ? "✓ Info terkirim ke WhatsApp."
              : `⚠ Belum terkirim via WhatsApp${done.waError ? ` (${done.waError})` : ""}.`}
          </div>
          <div className="mt-4 space-y-2 bg-cream-soft border border-line rounded-sm p-5 text-sm">
            <div className="flex justify-between gap-4"><span className="text-sepia-mute">Email</span><span className="font-mono">{done.email}</span></div>
            {done.password && <div className="flex justify-between gap-4"><span className="text-sepia-mute">Password</span><span className="font-mono">{done.password}</span></div>}
            <div className="flex justify-between gap-4"><span className="text-sepia-mute">Undangan</span><a className="font-mono text-gold-deep hover:underline" href={`/${done.slug}`} target="_blank" rel="noreferrer">/{done.slug}</a></div>
          </div>
          <div className="mt-6 flex gap-3">
            {done.password && (
              <button
                onClick={() => navigator.clipboard.writeText(`Email: ${done.email}\nPassword: ${done.password}\nUndangan: ${window.location.origin}/${done.slug}`)}
                className="btn btn-sm"
              >Salin Kredensial</button>
            )}
            <button onClick={() => { setDone(null); resetForm(); }} className="btn-ghost btn-sm">Buat Lagi</button>
          </div>
        </div>
      </div>
    );
  }

  const tab = (m: "new" | "existing", label: string) => (
    <button
      type="button"
      onClick={() => { setMode(m); setErr(null); }}
      className={`flex-1 text-sm py-2.5 rounded-full border transition ${mode === m ? "bg-sepia text-cream-soft border-sepia" : "border-line text-sepia-soft hover:border-sepia"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-2xl">
      <div className="card-paper bracketed p-8">
        <span className="sec-num">BUAT UNDANGAN UNTUK KLIEN</span>
        <h2 className="font-serif text-3xl md:text-4xl mt-2">Buat undangan klien</h2>
        <Divider width={200} className="mt-4" />

        <div className="mt-5 flex gap-2">
          {tab("new", "Buat akun baru")}
          {tab("existing", "User yang sudah ada")}
        </div>
        <p className="text-sepia-soft mt-3 text-sm">
          {mode === "new"
            ? "Buat akun klien (email & password) sekaligus undangannya. Kredensial dikirim via WhatsApp."
            : "Tambahkan undangan ke akun user yang sudah terdaftar. User login dengan akunnya sendiri."}
        </p>

        {err && <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{err}</div>}

        <form onSubmit={submit} className="mt-6 grid md:grid-cols-2 gap-4">
          {mode === "new" ? (
            <>
              <div className="md:col-span-2 text-[11px] uppercase tracking-[0.18em] text-gold-deep">Akun Klien</div>
              <FormRow label="Nama klien">
                <input required className="cms-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </FormRow>
              <FormRow label="No. WhatsApp (tujuan kredensial)">
                <input required className="cms-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="62…" />
              </FormRow>
              <FormRow label="Email login">
                <input required type="email" className="cms-input" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </FormRow>
              <FormRow label="Password">
                <div className="flex gap-2">
                  <input required className="cms-input" value={form.password} onChange={(e) => set("password", e.target.value)} />
                  <button type="button" onClick={genPassword} className="btn-ghost btn-sm whitespace-nowrap">Acak</button>
                </div>
              </FormRow>
            </>
          ) : (
            <>
              <div className="md:col-span-2 text-[11px] uppercase tracking-[0.18em] text-gold-deep">Pilih User</div>
              <FormRow label="User terdaftar" full>
                <select required className="cms-input" value={form.userId} onChange={(e) => set("userId", e.target.value)}>
                  <option value="">— Pilih user —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} · {u.email}{u.phone ? "" : " (tanpa WA)"}</option>
                  ))}
                </select>
              </FormRow>
            </>
          )}

          <div className="md:col-span-2 mt-2 text-[11px] uppercase tracking-[0.18em] text-gold-deep">Paket &amp; Undangan</div>
          <div className="md:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-sepia-mute mb-1.5">Paket dibeli</div>
            <div className="flex gap-2">
              {(["PRO", "EKSKLUSIF"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, package: p, templateId: (p === "EKSKLUSIF" || (templates.find((t) => t.id === f.templateId)?.priceIdr ?? 0) <= 100000) ? f.templateId : (templates.find((t) => t.priceIdr <= 100000)?.id ?? "") }))}
                  className={`flex-1 text-sm py-2.5 rounded-lg border transition ${form.package === p ? "bg-sepia text-cream-soft border-sepia" : "border-line text-sepia-soft hover:border-sepia"}`}
                >
                  {p === "PRO" ? "Pro" : "Eksklusif"}
                </button>
              ))}
            </div>
          </div>
          <FormRow label="Panggilan mempelai putri">
            <input required className="cms-input" value={form.brideShort} onChange={(e) => set("brideShort", e.target.value)} />
          </FormRow>
          <FormRow label="Nama lengkap mempelai putri">
            <input required className="cms-input" value={form.brideName} onChange={(e) => set("brideName", e.target.value)} />
          </FormRow>
          <FormRow label="Panggilan mempelai putra">
            <input required className="cms-input" value={form.groomShort} onChange={(e) => set("groomShort", e.target.value)} />
          </FormRow>
          <FormRow label="Nama lengkap mempelai putra">
            <input required className="cms-input" value={form.groomName} onChange={(e) => set("groomName", e.target.value)} />
          </FormRow>
          <FormRow label={`Template (${form.package === "EKSKLUSIF" ? "semua" : "Pro"})`} full>
            <select className="cms-input" value={form.templateId} onChange={(e) => set("templateId", e.target.value)}>
              {allowedTemplates.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.style}{t.priceIdr > 100000 ? " · Eksklusif" : ""}</option>)}
            </select>
          </FormRow>
          <div className="md:col-span-2">
            <button disabled={busy} className="btn">{busy ? "Membuat…" : mode === "new" ? "Buat Akun & Undangan" : "Assign Undangan ke User"}</button>
          </div>
        </form>
      </div>
      <style>{`.cms-input{width:100%;border:1px solid rgba(58,42,28,0.18);background:#FCF7EB;padding:11px 14px;border-radius:6px;font-size:14px;font-family:inherit}.cms-input:focus{outline:none;border-color:#A88339;background:#F4EAD5}`}</style>
    </div>
  );
}

function AdminUsers() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => { api.get("/admin/users").then((r) => setList(r.data)); }, []);
  return (
    <div className="bg-paper border border-line rounded-sm p-6">
      <h3 className="font-serif text-xl mb-4">Semua Pengguna ({list.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-sepia-mute">
            <tr className="border-b border-line"><th className="py-2">Nama</th><th>Email</th><th>Peran</th><th>Undangan</th><th>Bergabung</th></tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-b border-line/60">
                <td className="py-3 font-medium">{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`status-pill ${u.role === "ADMIN" ? "ragu" : "hadir"}`}>{u.role}</span></td>
                <td>{u._count?.weddings ?? 0}</td>
                <td className="text-xs text-sepia-mute">{new Date(u.createdAt).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function toDateInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10); // yyyy-mm-dd
}
function isLocked(w: any) {
  return w.activeUntil && Date.now() > new Date(w.activeUntil).getTime();
}

function AdminWeddings() {
  const [list, setList] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [win, setWin] = useState<{ from: string; until: string }>({ from: "", until: "" });

  async function load() { const r = await api.get("/admin/weddings"); setList(r.data); }
  useEffect(() => { load(); }, []);

  async function toggleStatus(w: any) {
    setBusy(w.id); setErr(null);
    try {
      await api.patch(`/admin/weddings/${w.id}/status`, { status: w.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" });
      await load();
    } catch (e) { setErr(extractError(e)); } finally { setBusy(null); }
  }
  async function remove(w: any) {
    if (!confirm(`Hapus undangan ${w.couple?.brideShort} & ${w.couple?.groomShort} (/${w.slug})? Tindakan ini permanen.`)) return;
    setBusy(w.id); setErr(null);
    try { await api.delete(`/admin/weddings/${w.id}`); await load(); }
    catch (e) { setErr(extractError(e)); } finally { setBusy(null); }
  }
  function openWindow(w: any) {
    setEditId(w.id);
    setWin({ from: toDateInput(w.activeFrom), until: toDateInput(w.activeUntil) });
  }
  async function saveWindow(w: any) {
    setBusy(w.id); setErr(null);
    try {
      await api.patch(`/admin/weddings/${w.id}/active-window`, {
        activeFrom: win.from ? new Date(`${win.from}T00:00:00`).toISOString() : null,
        activeUntil: win.until ? new Date(`${win.until}T23:59:59`).toISOString() : null,
      });
      setEditId(null);
      await load();
    } catch (e) { setErr(extractError(e)); } finally { setBusy(null); }
  }
  async function togglePackage(w: any) {
    const next = (w.package ?? "PRO") === "EKSKLUSIF" ? "PRO" : "EKSKLUSIF";
    setBusy(w.id); setErr(null);
    try { await api.patch(`/admin/weddings/${w.id}/package`, { package: next }); await load(); }
    catch (e) { setErr(extractError(e)); } finally { setBusy(null); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-serif text-xl">Semua Undangan ({list.length})</h3>
        <span className="text-xs text-sepia-mute">Masa aktif = batas user mengedit (undangan tetap tayang setelah lewat)</span>
      </div>
      {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{err}</div>}

      <div className="space-y-3">
        {list.map((w) => {
          const locked = isLocked(w);
          return (
            <div key={w.id} className="bg-paper border border-line rounded-sm p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-[170px]">
                  <div className="font-serif text-lg">{w.couple?.brideShort} &amp; {w.couple?.groomShort}</div>
                  <div className="text-xs text-sepia-mute font-mono">/{w.slug} · {w.owner?.email}</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className={`status-pill ${(w.package ?? "PRO") === "EKSKLUSIF" ? "ragu" : "hadir"}`}>{(w.package ?? "PRO") === "EKSKLUSIF" ? "Eksklusif" : "Pro"}</span>
                  <span className={`status-pill ${w.status === "PUBLISHED" ? "hadir" : "ragu"}`}>{w.status}</span>
                  {locked ? (
                    <span className="status-pill tidak">EDIT TERKUNCI</span>
                  ) : w.activeUntil ? (
                    <span className="text-sepia-mute">Edit s/d {new Date(w.activeUntil).toLocaleDateString("id-ID")}</span>
                  ) : (
                    <span className="text-sepia-mute">Tanpa batas</span>
                  )}
                  {w.customDomain && <span className="font-mono text-gold-deep">{w.customDomain}</span>}
                </div>
                <div className="text-xs font-mono text-sepia-mute ml-auto">{w._count?.guests}/{w._count?.rsvps}/{w._count?.wishes}</div>
                <div className="flex gap-2 flex-wrap">
                  <a href={`/${w.slug}`} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">Lihat</a>
                  <button disabled={busy === w.id} onClick={() => toggleStatus(w)} className="btn-ghost btn-sm">
                    {w.status === "PUBLISHED" ? "Tarik" : "Publish"}
                  </button>
                  <button onClick={() => (editId === w.id ? setEditId(null) : openWindow(w))} className="btn-ghost btn-sm">Masa Aktif</button>
                  <button disabled={busy === w.id} onClick={() => togglePackage(w)} className="btn-ghost btn-sm" title="Ubah paket Pro/Eksklusif">
                    → {(w.package ?? "PRO") === "EKSKLUSIF" ? "Pro" : "Eksklusif"}
                  </button>
                  <button disabled={busy === w.id} onClick={() => remove(w)} className="btn-ghost btn-sm text-maroon">Hapus</button>
                </div>
              </div>

              {editId === w.id && (
                <div className="mt-4 pt-4 border-t border-line flex flex-wrap items-end gap-4">
                  <label className="text-xs text-sepia-soft">
                    <div className="mb-1 uppercase tracking-[0.16em] text-sepia-mute">Aktif dari (opsional)</div>
                    <input type="date" value={win.from} onChange={(e) => setWin((p) => ({ ...p, from: e.target.value }))} className="border border-line bg-cream-soft px-3 py-2 rounded text-sm" />
                  </label>
                  <label className="text-xs text-sepia-soft">
                    <div className="mb-1 uppercase tracking-[0.16em] text-sepia-mute">Edit sampai (tenggat)</div>
                    <input type="date" value={win.until} onChange={(e) => setWin((p) => ({ ...p, until: e.target.value }))} className="border border-line bg-cream-soft px-3 py-2 rounded text-sm" />
                  </label>
                  <button disabled={busy === w.id} onClick={() => saveWindow(w)} className="btn btn-sm">{busy === w.id ? "…" : "Simpan"}</button>
                  <button onClick={() => setWin({ from: "", until: "" })} className="btn-ghost btn-sm">Kosongkan</button>
                  <span className="text-xs text-sepia-mute">Kosong = tanpa batas. Setelah tenggat, user tak bisa edit; undangan tetap tayang.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminDomains() {
  const [data, setData] = useState<{ cloudflareConfigured: boolean; cnameTarget: string; weddings: any[] } | null>(null);
  const [edit, setEdit] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const r = await api.get("/admin/domains");
    setData(r.data);
  }
  useEffect(() => { load(); }, []);

  const statusTone: Record<string, string> = {
    ACTIVE: "hadir", PENDING: "ragu", ERROR: "tidak", NONE: "",
  };

  async function save(id: string) {
    const domain = (edit[id] ?? "").trim().toLowerCase();
    if (!domain) return;
    setBusy(id); setErr(null);
    try {
      await api.put(`/admin/weddings/${id}/domain`, { customDomain: domain });
      setEdit((p) => { const n = { ...p }; delete n[id]; return n; });
      await load();
    } catch (e) { setErr(extractError(e)); }
    finally { setBusy(null); }
  }
  async function refresh(id: string) {
    setBusy(id); setErr(null);
    try { await api.post(`/admin/weddings/${id}/domain/refresh`); await load(); }
    catch (e) { setErr(extractError(e)); }
    finally { setBusy(null); }
  }
  async function remove(id: string) {
    if (!confirm("Hapus domain custom dari undangan ini?")) return;
    setBusy(id); setErr(null);
    try { await api.delete(`/admin/weddings/${id}/domain`); await load(); }
    catch (e) { setErr(extractError(e)); }
    finally { setBusy(null); }
  }

  if (!data) return <div className="text-sepia-soft">Memuat…</div>;

  const eksklusif = data.weddings.filter((w) => (w.template?.priceIdr ?? 0) > 100000 || w.customDomain);
  const others = data.weddings.filter((w) => !((w.template?.priceIdr ?? 0) > 100000 || w.customDomain));

  return (
    <div className="space-y-6">
      {/* Status Cloudflare */}
      <div className="rounded-sm bg-paper border border-line p-6 bracketed">
        <span className="sec-num">DOMAIN KUSTOM · PAKET EKSKLUSIF</span>
        <h2 className="font-serif text-2xl mt-2">Cloudflare for SaaS</h2>
        <div className="mt-3 flex items-center gap-3 flex-wrap text-sm">
          <span className={`status-pill ${data.cloudflareConfigured ? "hadir" : "ragu"}`}>
            {data.cloudflareConfigured ? "API Terhubung" : "Mode Manual"}
          </span>
          <span className="text-sepia-soft">
            {data.cloudflareConfigured
              ? "Custom hostname & sertifikat dibuat otomatis (proxied) saat domain diset."
              : "Set CF_API_TOKEN & CF_SAAS_ZONE_ID di server agar otomatis. Saat ini domain hanya disimpan."}
          </span>
        </div>
        <div className="mt-4 text-sm text-sepia-soft">
          Arahkan DNS domain <code className="font-mono text-xs">.my.id</code> (CNAME, proxied / orange-cloud) ke:
          <code className="ml-2 font-mono text-xs bg-cream-deep px-2 py-1 rounded">{data.cnameTarget}</code>
        </div>
      </div>

      {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{err}</div>}

      {/* Daftar Eksklusif */}
      <div className="bg-paper border border-line rounded-sm p-6">
        <h3 className="font-serif text-xl mb-4">Undangan Eksklusif ({eksklusif.length})</h3>
        {eksklusif.length === 0 && <div className="text-sm text-sepia-soft py-4">Belum ada undangan paket Eksklusif.</div>}
        <div className="space-y-3">
          {eksklusif.map((w) => (
            <div key={w.id} className="border border-line rounded-sm p-4 flex flex-wrap items-center gap-4">
              <div className="min-w-[180px]">
                <div className="font-serif text-lg">{w.couple?.brideShort} &amp; {w.couple?.groomShort}</div>
                <div className="text-xs text-sepia-mute font-mono">/{w.slug} · {w.owner?.email}</div>
              </div>

              <div className="flex-1 min-w-[240px]">
                {w.customDomain ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <a href={`https://${w.customDomain}`} target="_blank" rel="noreferrer" className="font-mono text-sm text-gold-deep hover:underline">{w.customDomain}</a>
                    <span className={`status-pill ${statusTone[w.domainStatus] ?? ""}`}>{w.domainStatus}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      value={edit[w.id] ?? ""}
                      onChange={(e) => setEdit((p) => ({ ...p, [w.id]: e.target.value }))}
                      placeholder="nama.my.id"
                      className="flex-1 border border-line bg-cream-soft px-3 py-2 rounded text-sm font-mono"
                    />
                    <button disabled={busy === w.id} onClick={() => save(w.id)} className="btn btn-sm">{busy === w.id ? "…" : "Set"}</button>
                  </div>
                )}
              </div>

              {w.customDomain && (
                <div className="flex gap-2">
                  <button disabled={busy === w.id} onClick={() => refresh(w.id)} className="btn-ghost btn-sm" title="Cek status terbaru">⟳ Cek</button>
                  <button disabled={busy === w.id} onClick={() => remove(w.id)} className="btn-ghost btn-sm">Hapus</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Non-eksklusif (referensi) */}
      {others.length > 0 && (
        <details className="bg-cream-soft border border-line rounded-sm p-5">
          <summary className="cursor-pointer font-serif text-lg">Undangan lain ({others.length}) — bukan Eksklusif</summary>
          <div className="mt-3 text-sm text-sepia-soft space-y-1">
            {others.map((w) => (
              <div key={w.id} className="flex items-center gap-3">
                <span className="font-serif">{w.couple?.brideShort} &amp; {w.couple?.groomShort}</span>
                <span className="text-xs font-mono text-sepia-mute">/{w.slug}</span>
                <span className="text-xs ml-auto">{w.template?.name ?? "—"}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function AdminTemplates() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => { api.get("/templates").then((r) => setList(r.data)); }, []);
  return (
    <div className="bg-paper border border-line rounded-sm p-6">
      <h3 className="font-serif text-xl mb-4">Pustaka Template ({list.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-sepia-mute">
            <tr className="border-b border-line"><th className="py-2">Nama</th><th>Slug</th><th>Kategori</th><th>Palette</th><th>Harga</th><th>Badge</th></tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className="border-b border-line/60">
                <td className="py-3 font-medium">{t.name}</td>
                <td className="text-xs font-mono">{t.slug}</td>
                <td className="text-xs">{t.category}</td>
                <td className="text-xs">{t.palette}</td>
                <td className="text-xs font-mono">Rp {(t.priceIdr / 1000).toFixed(0)}rb</td>
                <td>{t.badge && <span className="status-pill hadir">{t.badge}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminLogs() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => { api.get("/admin/logs").then((r) => setList(r.data)); }, []);
  return (
    <div className="bg-paper border border-line rounded-sm p-6">
      <h3 className="font-serif text-xl mb-4">Log Aktivitas</h3>
      <div className="divide-y divide-line">
        {list.length === 0 && <div className="py-8 text-center text-sepia-soft">Belum ada log.</div>}
        {list.map((l) => (
          <div key={l.id} className="py-3 flex items-center gap-4 text-sm">
            <span className="text-xs font-mono text-sepia-mute w-40">{new Date(l.createdAt).toLocaleString("id-ID")}</span>
            <span className="font-medium">{l.action}</span>
            <span className="text-xs text-sepia-mute">{l.actorEmail}</span>
            <span className="text-xs ml-auto">{l.target ?? ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminWhatsApp() {
  const [s, setS] = useState<{ status: string; qrDataUrl?: string; connectedNumber?: string; lastError?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await api.get("/admin/whatsapp/status");
    setS(r.data);
  }
  useEffect(() => { load(); const i = setInterval(load, 4000); return () => clearInterval(i); }, []);

  async function connect() {
    setBusy(true);
    try { await api.post("/admin/whatsapp/connect"); await load(); }
    finally { setBusy(false); }
  }
  async function disconnect() {
    if (!confirm("Putuskan koneksi bot WhatsApp weddQ?")) return;
    setBusy(true);
    try { await api.post("/admin/whatsapp/disconnect"); await load(); }
    finally { setBusy(false); }
  }

  if (!s) return <div className="text-sepia-soft">Memuat…</div>;

  const statusMap: Record<string, { label: string; tone: string; desc: string }> = {
    DISABLED: { label: "Dinonaktifkan", tone: "bg-cream-deep text-sepia-mute", desc: "Bot dimatikan via env WA_DISABLED=true." },
    DISCONNECTED: { label: "Belum terhubung", tone: "bg-cream-deep text-sepia-mute", desc: "Klik tombol Hubungkan untuk memulai. QR code akan muncul untuk Anda scan." },
    CONNECTING: { label: "Menghubungkan…", tone: "bg-amber-50 text-amber-700", desc: "Tunggu sebentar, sistem sedang menyambung ke WhatsApp." },
    AWAITING_QR: { label: "Menunggu QR Scan", tone: "bg-amber-50 text-amber-700", desc: "Buka WhatsApp di HP weddQ → Perangkat Tertaut → Tautkan Perangkat → scan QR di bawah." },
    CONNECTED: { label: "Terhubung", tone: "bg-emerald-50 text-emerald-700", desc: `Bot weddQ aktif${s.connectedNumber ? ` pada nomor ${s.connectedNumber}` : ""}.` },
    FAILED: { label: "Error", tone: "bg-red-50 text-red-700", desc: s.lastError ?? "Koneksi gagal." },
  };
  const info = statusMap[s.status] ?? statusMap.DISCONNECTED;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-paper border border-line rounded-sm p-7 bracketed">
        <span className="sec-num">BOT WHATSAPP WEDDQ</span>
        <h2 className="font-serif text-3xl mt-2">Status Koneksi</h2>
        <div className={`inline-block mt-4 px-3 py-1 text-xs uppercase tracking-wider rounded-full ${info.tone}`}>{info.label}</div>
        <p className="text-sepia-soft text-sm mt-3 max-w-xl">{info.desc}</p>

        <div className="mt-6 flex gap-3 flex-wrap">
          {(s.status === "DISCONNECTED" || s.status === "FAILED") && (
            <button disabled={busy} onClick={connect} className="btn">{busy ? "Menyambung…" : "Hubungkan Bot"}</button>
          )}
          {s.status === "CONNECTED" && (
            <button disabled={busy} onClick={disconnect} className="btn-ghost">{busy ? "Memutus…" : "Putuskan & Hapus Sesi"}</button>
          )}
        </div>
      </div>

      {s.qrDataUrl && s.status === "AWAITING_QR" && (
        <div className="bg-paper border border-line rounded-sm p-7 text-center bracketed">
          <h3 className="font-serif text-xl">Scan QR Code</h3>
          <p className="text-sm text-sepia-soft mt-2 mb-6">
            Di HP weddQ: WhatsApp → ⋮ → Perangkat Tertaut → Tautkan Perangkat
          </p>
          <img src={s.qrDataUrl} alt="QR Code" className="mx-auto" style={{ width: 280, height: 280 }} />
          <p className="text-[11px] text-sepia-mute mt-4">QR code di-refresh otomatis. Halaman ini akan berpindah ke status Terhubung setelah scan berhasil.</p>
        </div>
      )}

      <div className="bg-cream-soft border border-line rounded-sm p-6">
        <h3 className="font-serif text-lg">Catatan Penggunaan</h3>
        <ul className="text-sm text-sepia-soft mt-3 space-y-2 list-disc list-inside">
          <li>Gunakan nomor WhatsApp khusus untuk bot weddQ, jangan nomor pribadi.</li>
          <li>Sesi tersimpan di disk (<code className="font-mono text-xs">data/whatsapp-auth/</code>) sehingga restart server tidak butuh scan ulang.</li>
          <li>WhatsApp dapat memblokir nomor jika dianggap spam. Beri jeda antar pengiriman dan hindari mengirim ke nomor yang tidak menyimpan kontak weddQ.</li>
          <li>Bila bot tidak terhubung, pengguna tetap bisa pakai opsi "WA Saya" yang membuka WhatsApp pribadi pengguna lewat tautan wa.me.</li>
        </ul>
      </div>
    </div>
  );
}
