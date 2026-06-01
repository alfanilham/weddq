import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { useAuth } from "@/store/auth";
import { extractError } from "@/lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await register(form);
      nav("/dashboard");
    } catch (e) {
      setErr(extractError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Daftar · weddQ"
      title={<><em>Mulai rangkai</em><br />kisah Anda</>}
      subtitle="Buat akun gratis dalam satu menit. Anda bisa langsung mencoba editor undangan tanpa kartu kredit."
      side={
        <>
          <p className="font-serif text-4xl leading-snug">
            “Hari baik dimulai dari undangan yang terasa hangat untuk siapa pun yang menerimanya.”
          </p>
          <ul className="mt-10 space-y-4 text-sm">
            {[
              "Editor visual: ubah konten tanpa coding",
              "Tautan unik untuk setiap tamu, pantau siapa yang telah membuka",
              "RSVP, buku tamu, dan amplop digital terintegrasi",
              "Domain weddq.id gratis seumur paket",
            ].map((f) => (
              <li key={f} className="flex gap-3 opacity-90">
                <span className="text-gold-soft">◆</span>
                {f}
              </li>
            ))}
          </ul>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Nama lengkap">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Arini Salsabila"
            className="input"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="nama@email.com"
            className="input"
          />
        </Field>
        <Field label="Nomor WhatsApp (opsional)">
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+62 812 ..."
            className="input"
          />
        </Field>
        <Field label="Kata sandi">
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Minimal 6 karakter"
            className="input"
          />
        </Field>

        {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">{err}</div>}

        <button type="submit" disabled={busy} className="btn w-full justify-center">
          {busy ? "Membuat akun…" : "Buat Akun Gratis"}
        </button>

        <p className="text-xs text-sepia-mute text-center">
          Dengan mendaftar, Anda menyetujui Ketentuan Layanan & Kebijakan Privasi weddQ.
        </p>

        <p className="text-sm text-sepia-soft text-center">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-gold-deep underline underline-offset-4">
            Masuk di sini
          </Link>
        </p>
      </form>

      <style>{`
        .input { width:100%; border:1px solid rgba(58,42,28,0.18); background:#FCF7EB; padding:14px 16px; border-radius:6px; font-size:15px; transition:border 150ms, background 150ms; }
        .input:focus { outline:none; border-color:#A88339; background:#F4EAD5; }
      `}</style>
    </AuthShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-[0.22em] text-sepia-mute mb-2">{label}</div>
      {children}
    </label>
  );
}
