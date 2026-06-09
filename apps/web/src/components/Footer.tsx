import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-sepia text-cream-soft">
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
          <h4 className="mb-4 font-serif text-xl text-cream-soft">Platform</h4>
          <Link to="/templates" className="block py-1 text-sm opacity-80 hover:opacity-100">Pustaka Template</Link>
          <Link to="/register" className="block py-1 text-sm opacity-80 hover:opacity-100">Daftar</Link>
          <Link to="/login" className="block py-1 text-sm opacity-80 hover:opacity-100">Masuk</Link>
          <a href="/#pricing" className="block py-1 text-sm opacity-80 hover:opacity-100">Paket Harga</a>
        </div>
        <div>
          <h4 className="mb-4 font-serif text-xl text-cream-soft">Bantuan</h4>
          <Link to="/panduan" className="block py-1 text-sm opacity-80 hover:opacity-100">Panduan</Link>
          <a href="/#testimoni" className="block py-1 text-sm opacity-80 hover:opacity-100">Testimoni</a>
          <a href="https://wa.me/6283197715855" target="_blank" rel="noopener noreferrer" className="block py-1 text-sm opacity-80 hover:opacity-100">Hubungi Tim</a>
        </div>
        <div>
          <h4 className="mb-4 font-serif text-xl text-cream-soft">Sosial</h4>
          <a href="https://instagram.com/weddq.id" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-1.5 text-sm opacity-80 hover:opacity-100 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span>Instagram</span>
          </a>
          <a href="https://wa.me/6283197715855" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-1.5 text-sm opacity-80 hover:opacity-100 transition">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
              <path d="M16 .395C7.215.395.13 7.482.13 16.27c0 2.99.811 5.79 2.234 8.196L0 32l7.74-2.273a15.722 15.722 0 0 0 8.26 2.343c8.789 0 15.875-7.087 15.875-15.875S24.79.395 16 .395zm0 28.838a13.155 13.155 0 0 1-6.998-1.987l-4.996 1.471 1.434-4.95a13.105 13.105 0 0 1-2.064-7.097c0-7.247 5.916-13.163 13.165-13.163 7.246 0 13.16 5.917 13.16 13.163 0 7.246-5.913 13.163-13.16 13.163zm7.385-9.877c-.405-.203-2.394-1.18-2.766-1.314-.37-.137-.642-.205-.913.205-.27.408-1.046 1.314-1.282 1.585-.237.272-.473.305-.879.103-.404-.205-1.71-.63-3.255-2.012-1.203-1.075-2.013-2.398-2.249-2.806-.236-.408-.025-.628.178-.832.184-.181.405-.474.608-.71.203-.236.27-.408.405-.679.135-.272.067-.51-.034-.713-.102-.203-.913-2.196-1.25-3.012-.331-.795-.666-.687-.914-.7-.236-.012-.507-.014-.778-.014a1.49 1.49 0 0 0-1.082.507c-.371.41-1.418 1.385-1.418 3.377 0 1.992 1.451 3.918 1.654 4.19.203.27 2.857 4.363 6.926 6.118.969.418 1.724.667 2.313.853.972.31 1.857.266 2.557.16.78-.116 2.394-.979 2.732-1.924.337-.945.337-1.754.236-1.924-.1-.171-.371-.273-.776-.476z"/>
            </svg>
            <span>WhatsApp</span>
          </a>
          <a href="mailto:halo@weddq.id" className="flex items-center gap-3 py-1.5 text-sm opacity-80 hover:opacity-100 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>halo@weddq.id</span>
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs opacity-60 font-serif">
        © {new Date().getFullYear()} weddQ. All rights reserved.
      </div>
    </footer>
  );
}
