import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { CmsShell } from "@/components/CmsShell";
import { api } from "@/lib/api";

const links = [
  { to: "/admin", label: "Ringkasan", icon: "◆", group: "Admin" },
  { to: "/admin/users", label: "Pengguna", icon: "☷", group: "Admin" },
  { to: "/admin/weddings", label: "Undangan", icon: "✦", group: "Admin" },
  { to: "/admin/templates", label: "Template", icon: "◇", group: "Admin" },
  { to: "/admin/whatsapp", label: "Bot WhatsApp", icon: "✆", group: "Admin" },
  { to: "/admin/logs", label: "Log Aktivitas", icon: "≡", group: "Admin" },
];

export default function AdminPage() {
  return (
    <CmsShell title="Panel Admin" links={links}>
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="weddings" element={<AdminWeddings />} />
        <Route path="templates" element={<AdminTemplates />} />
        <Route path="whatsapp" element={<AdminWhatsApp />} />
        <Route path="logs" element={<AdminLogs />} />
      </Routes>
    </CmsShell>
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

function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { api.get("/admin/stats").then((r) => setStats(r.data)); }, []);
  if (!stats) return <div className="text-sepia-soft">Memuat…</div>;
  const t = stats.totals;
  return (
    <div className="space-y-8">
      <div className="rounded-sm bg-paper border border-line p-7 bracketed">
        <span className="sec-num">RINGKASAN PLATFORM</span>
        <h2 className="font-serif text-3xl mt-2">Selamat siang, Admin.</h2>
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

function AdminWeddings() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => { api.get("/admin/weddings").then((r) => setList(r.data)); }, []);
  return (
    <div className="bg-paper border border-line rounded-sm p-6">
      <h3 className="font-serif text-xl mb-4">Semua Undangan ({list.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-sepia-mute">
            <tr className="border-b border-line"><th className="py-2">Pasangan</th><th>Slug</th><th>Pemilik</th><th>Template</th><th>Status</th><th>T/R/W</th></tr>
          </thead>
          <tbody>
            {list.map((w) => (
              <tr key={w.id} className="border-b border-line/60">
                <td className="py-3 font-serif">{w.couple?.brideShort} &amp; {w.couple?.groomShort}</td>
                <td className="text-xs font-mono">/{w.slug}</td>
                <td className="text-xs">{w.owner?.email}</td>
                <td className="text-xs">{w.template?.name ?? "Belum dipilih"}</td>
                <td><span className={`status-pill ${w.status === "PUBLISHED" ? "hadir" : "ragu"}`}>{w.status}</span></td>
                <td className="text-xs font-mono">{w._count?.guests}/{w._count?.rsvps}/{w._count?.wishes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
