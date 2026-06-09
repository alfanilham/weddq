import { useEffect, useState, MouseEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "@/store/auth";
import { smoothScrollToTop, smoothScrollToHash } from "@/lib/smoothScroll";

const links = [
  { to: "/", label: "Beranda" },
  { to: "/#about", label: "Tentang" },
  { to: "/templates", label: "Template" },
  { to: "/#pricing", label: "Paket" },
  { to: "/#testimoni", label: "Testimoni" },
];

export default function Nav() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Navbar transparan hanya saat di puncak; langsung solid begitu mulai di-scroll.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [loc.pathname]);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [loc.pathname, loc.hash]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  /** Smooth in-page scroll, or fall back to router navigation. */
  function handleLinkClick(e: MouseEvent<HTMLAnchorElement>, to: string) {
    // Home — scroll to top if already on landing
    if (to === "/") {
      if (loc.pathname === "/") {
        e.preventDefault();
        smoothScrollToTop();
        setOpen(false);
      }
      // else let Link navigate normally
      return;
    }
    // Hash link to landing section
    if (to.startsWith("/#")) {
      const hash = to.slice(1); // "#about"
      if (loc.pathname === "/") {
        // Already on landing — smooth scroll
        e.preventDefault();
        smoothScrollToHash(hash);
        history.replaceState(null, "", to);
        setOpen(false);
      }
      // else let Link navigate to /#hash, ScrollHashHandler will smooth-scroll on landing
    }
  }

  function isActive(to: string) {
    if (to.includes("#")) {
      const [path, hash] = to.split("#");
      return loc.pathname === (path || "/") && loc.hash === `#${hash}`;
    }
    if (to === "/") return loc.pathname === "/" && !loc.hash;
    return loc.pathname === to || loc.pathname.startsWith(`${to}/`);
  }

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
          scrolled || open
            ? "bg-brown/95 border-b border-white/10 backdrop-blur-md"
            : "bg-brown md:bg-transparent border-b border-transparent"
        }`}
      >
        <div className="container-narrow flex items-center justify-between py-4">
          <Link to="/" onClick={(e) => handleLinkClick(e, "/")} className="flex items-center" aria-label="weddQ Beranda">
            <Logo size={44} showWordmark={false} invert />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-9 text-sm font-medium">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={(e) => handleLinkClick(e, l.to)} className="text-cream-soft/75 transition hover:text-cream-soft">
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                {user.role === "ADMIN" && (
                  <NavLink to="/dashboard/admin" className="text-cream-soft/75 hover:text-cream-soft">Admin</NavLink>
                )}
                <NavLink to="/dashboard" className="text-cream-soft/75 hover:text-cream-soft">Dasbor</NavLink>
                <button onClick={() => { logout(); nav("/"); }} className="btn-gold btn-sm">
                  Keluar
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-gold btn-sm">Masuk</Link>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden flex flex-col items-center justify-center w-10 h-10 -mr-1 rounded hover:bg-white/10 transition"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span
              className="block w-5 h-px bg-cream-soft transition-all duration-300"
              style={open ? { transform: "translateY(3px) rotate(45deg)" } : { transform: "translateY(-3px)" }}
            />
            <span
              className="block w-5 h-px bg-cream-soft mt-[5px] transition-all duration-300"
              style={open ? { transform: "translateY(-3px) rotate(-45deg)" } : undefined}
            />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-30 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-sepia/40 backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: open ? 1 : 0 }}
          onClick={() => setOpen(false)}
        />
        {/* Drawer */}
        <aside
          className="absolute top-[73px] left-0 right-0 bg-cream-soft border-b border-line shadow-lg transition-transform duration-300 origin-top"
          style={{ transform: open ? "translateY(0)" : "translateY(-100%)" }}
        >
          <div className="px-6 py-7">
            <div className="flex flex-col gap-1">
              {links.map((l) => {
                const active = isActive(l.to);
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={(e) => handleLinkClick(e, l.to)}
                    className={`text-base font-medium py-3 px-3 rounded-lg transition ${active ? "bg-cream-deep text-sepia" : "text-sepia hover:bg-cream-deep"}`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 grid gap-2">
              {user ? (
                <>
                  {user.role === "ADMIN" && (
                    <Link to="/dashboard/admin" className="btn btn-ghost text-center">Panel Admin</Link>
                  )}
                  <Link to="/dashboard" className="btn btn-ghost text-center">Dasbor Saya</Link>
                  <button onClick={() => { logout(); nav("/"); setOpen(false); }} className="btn text-center">
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn text-center">Masuk</Link>
                  <Link to="/register" className="btn btn-ghost text-center">Daftar</Link>
                </>
              )}
            </div>

            <div className="mt-6 text-xs text-sepia-mute tracking-[0.18em] uppercase text-center">
              © {new Date().getFullYear()} weddQ Indonesia
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
