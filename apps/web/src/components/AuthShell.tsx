import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { BatikBg, Divider } from "@/components/Ornaments";
import { Logo } from "@/components/Logo";

export function AuthShell({
  title,
  eyebrow,
  subtitle,
  side,
  children,
}: {
  title: ReactNode;
  eyebrow: string;
  subtitle: ReactNode;
  side: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-full grid md:grid-cols-[1fr_1.1fr]">
      {/* Aside */}
      <aside className="relative hidden md:flex flex-col justify-between bg-sepia text-cream-soft p-14 overflow-hidden">
        <BatikBg className="absolute inset-0 opacity-25" color="#D9A39C" opacity={0.4} />
        <div className="relative">
          <Link to="/" aria-label="weddQ Beranda" className="inline-block">
            <Logo size={180} showWordmark={false} />
          </Link>
        </div>

        <div className="relative max-w-md">{side}</div>

        <div className="relative text-xs uppercase tracking-[0.22em] opacity-50">
          © {new Date().getFullYear()} weddQ Indonesia
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-col justify-center px-6 py-12 md:px-16 md:py-20 bg-paper">
        <div className="w-full max-w-md mx-auto text-left">
          <Link to="/" className="md:hidden mb-6 block w-fit" aria-label="weddQ Beranda">
            <Logo size={130} showWordmark={false} />
          </Link>
          <span className="eyebrow left">{eyebrow}</span>
          <h1 className="mt-5 font-serif text-4xl md:text-5xl">{title}</h1>
          <Divider width={200} className="mt-5" />
          <p className="mt-5 text-sepia-soft">{subtitle}</p>
          <div className="mt-10">{children}</div>
        </div>
      </main>
    </div>
  );
}
