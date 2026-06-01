import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-sepia text-cream-soft mt-20">
      <div className="container-narrow grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-5 text-cream-soft">
            <Logo size={96} showWordmark={false} />
          </div>
          <p className="text-sm opacity-80 max-w-xs leading-relaxed">
            Undangan digital pernikahan yang elegan, modern, dan berakar pada tradisi Indonesia, dikelola melalui satu dasbor sederhana.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.22em] opacity-60">Platform</h4>
          <Link to="/templates" className="block py-1 text-sm opacity-80 hover:opacity-100">Pustaka Template</Link>
          <Link to="/register" className="block py-1 text-sm opacity-80 hover:opacity-100">Daftar Gratis</Link>
          <Link to="/login" className="block py-1 text-sm opacity-80 hover:opacity-100">Masuk</Link>
          <a href="/#pricing" className="block py-1 text-sm opacity-80 hover:opacity-100">Paket Harga</a>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.22em] opacity-60">Bantuan</h4>
          <a href="#" className="block py-1 text-sm opacity-80 hover:opacity-100">Panduan</a>
          <a href="#" className="block py-1 text-sm opacity-80 hover:opacity-100">Tanya Jawab</a>
          <a href="#" className="block py-1 text-sm opacity-80 hover:opacity-100">Hubungi Tim</a>
          <a href="#" className="block py-1 text-sm opacity-80 hover:opacity-100">Status Layanan</a>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.22em] opacity-60">Lainnya</h4>
          <a href="#" className="block py-1 text-sm opacity-80 hover:opacity-100">Ketentuan Layanan</a>
          <a href="#" className="block py-1 text-sm opacity-80 hover:opacity-100">Kebijakan Privasi</a>
          <a href="#" className="block py-1 text-sm opacity-80 hover:opacity-100">Press Kit</a>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs opacity-60 font-mono">
        © {new Date().getFullYear()} weddQ. All rights reserved.
      </div>
    </footer>
  );
}
