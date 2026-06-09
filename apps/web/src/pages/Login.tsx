import { FormEvent, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { useAuth } from "@/store/auth";
import { extractError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const u = await login(email, password);
      nav(u.role === "ADMIN" ? "/dashboard/admin" : from);
    } catch (e) {
      setErr(extractError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Masuk · weddQ"
      title={<><em>Selamat datang</em><br />kembali</>}
      subtitle="Lanjutkan menyusun undangan, periksa RSVP yang masuk, dan kelola ucapan tamu dari satu tempat."
      side={
        <>
          <p className="font-serif text-4xl leading-snug">
            “Undangan yang elegan adalah sambutan pertama untuk hari paling istimewa Anda.”
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            <div>
              <div className="font-serif text-3xl">4.2K+</div>
              <div className="text-xs uppercase tracking-[0.18em] opacity-60 mt-1">Pasangan aktif</div>
            </div>
            <div>
              <div className="font-serif text-3xl">120+</div>
              <div className="text-xs uppercase tracking-[0.18em] opacity-60 mt-1">Template pilihan</div>
            </div>
            <div>
              <div className="font-serif text-3xl">98%</div>
              <div className="text-xs uppercase tracking-[0.18em] opacity-60 mt-1">Open rate tamu</div>
            </div>
          </div>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="input"
          />
        </Field>
        <Field label="Kata sandi">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input"
          />
        </Field>

        {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">{err}</div>}

        <button type="submit" disabled={busy} className="btn w-full justify-center">
          {busy ? "Memproses…" : "Masuk"}
        </button>

        <p className="text-sm text-sepia-soft text-center">
          Belum punya akun?{" "}
          <Link to="/register" className="text-gold-deep underline underline-offset-4">
            Daftar
          </Link>
        </p>

        <p className="text-[11px] text-sepia-mute text-center mt-6">
          Demo: <span className="font-mono">arini@weddq.id</span> · <span className="font-mono">demo1234</span>
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
