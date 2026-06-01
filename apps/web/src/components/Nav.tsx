import { Link, NavLink, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "@/store/auth";

const links = [
  { to: "/#about", label: "Tentang" },
  { to: "/templates", label: "Template" },
  { to: "/#pricing", label: "Paket" },
  { to: "/#testimoni", label: "Testimoni" },
];

export default function Nav() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <nav className="sticky top-0 z-40 border-b border-line backdrop-blur-md" style={{ background: "rgba(244,234,213,0.86)" }}>
      <div className="container-narrow flex items-center justify-between py-4">
        <Link to="/" className="flex items-center" aria-label="weddQ Beranda">
          <Logo size={44} showWordmark={false} />
        </Link>
        <div className="hidden md:flex items-center gap-9 text-sm font-medium">
          {links.map((l) => (
            <a key={l.to} href={l.to} className="text-sepia-soft transition hover:text-sepia">
              {l.label}
            </a>
          ))}
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <NavLink to="/admin" className="text-sepia-soft hover:text-sepia">Admin</NavLink>
              )}
              <NavLink to="/dashboard" className="text-sepia-soft hover:text-sepia">Dasbor</NavLink>
              <button onClick={() => { logout(); nav("/"); }} className="btn btn-sm">
                Keluar
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-sm">Masuk</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
