import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "@/store/auth";

export function CmsShell({
  links,
  title,
  topbar,
  children,
}: {
  links: Array<{ to: string; label: string; icon?: string; group?: string; count?: number | string }>;
  title: string;
  topbar?: ReactNode;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const grouped = links.reduce<Record<string, typeof links>>((acc, l) => {
    const k = l.group ?? " ";
    (acc[k] ??= []).push(l);
    return acc;
  }, {});

  return (
    <div className="min-h-screen grid md:grid-cols-[260px_1fr] bg-cream doodle-tx">
      <aside className="bg-sepia text-cream-soft py-7 px-5 md:sticky md:top-0 md:h-screen flex flex-col">
        <Link to="/" aria-label="weddQ Beranda" className="shrink-0">
          <Logo size={42} />
        </Link>

        <div className="mt-8 space-y-7 flex-1 overflow-y-auto pr-1">
          {Object.entries(grouped).map(([k, items]) => (
            <div key={k}>
              {k.trim() && <div className="text-[10px] uppercase tracking-[0.22em] opacity-50 mb-2">{k}</div>}
              <div className="space-y-1">
                {items.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded px-3 py-2.5 text-sm transition ${
                        isActive ? "bg-cream-soft text-sepia" : "text-cream-soft/85 hover:bg-white/5"
                      }`
                    }
                  >
                    <span className="opacity-70 w-5 text-center">{l.icon ?? "◆"}</span>
                    <span className="flex-1">{l.label}</span>
                    {l.count !== undefined && (
                      <span className="text-[10px] opacity-60 font-mono">{l.count}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shrink-0 mt-6 pt-5 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-deep text-cream-soft font-serif flex items-center justify-center shrink-0">
            {user?.name?.[0] ?? "•"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{user?.name ?? ""}</div>
            <div className="text-[11px] opacity-60 truncate">{user?.email}</div>
          </div>
          <button
            onClick={() => { logout(); nav("/"); }}
            title="Keluar"
            className="text-cream-soft/60 hover:text-cream-soft flex items-center gap-1.5 text-xs"
          >
            <span className="hidden lg:inline">Keluar</span>
            <span aria-hidden>↗</span>
          </button>
        </div>
      </aside>

      <div className="min-h-screen flex flex-col">
        <header className="bg-cream-soft border-b border-line">
          <div className="px-6 md:px-10 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-sepia-mute">Dasbor /</div>
              <div className="font-serif text-xl">{title}</div>
            </div>
            <div className="flex items-center gap-3">{topbar}</div>
          </div>
        </header>
        <main className="p-6 md:p-10 flex-1">{children}</main>
      </div>
    </div>
  );
}
