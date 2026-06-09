import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";

const VISIBLE_MS = 500;

/* PageLoader — captures internal link clicks before React Router navigates,
   shows a fade-in overlay with the weddQ logo + spinning gold ring, then
   auto-hides after VISIBLE_MS. Single timer + single state, reset on every
   trigger so rapid clicks can never leave it stuck visible. */
export function PageLoader() {
  const [show, setShow] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    function clearHide() {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    function pulse() {
      clearHide();
      setShow(true);
      timerRef.current = window.setTimeout(() => {
        setShow(false);
        timerRef.current = null;
      }, VISIBLE_MS);
    }

    function isInternalLink(link: HTMLAnchorElement): boolean {
      const href = link.getAttribute("href");
      if (!href) return false;
      if (
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        href.startsWith("#")
      )
        return false;
      const tgt = link.target;
      if (tgt && tgt !== "_self") return false;
      if (link.hasAttribute("download")) return false;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return false;
        if (url.pathname === window.location.pathname) return false;
        return true;
      } catch {
        return false;
      }
    }

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement | null)?.closest(
        "a[href]"
      ) as HTMLAnchorElement | null;
      if (!link || !isInternalLink(link)) return;
      pulse();
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearHide();
    };
  }, []);

  return (
    <div
      aria-hidden={!show}
      role="status"
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        opacity: show ? 1 : 0,
        // Show instantly when triggered; only fade OUT smoothly. Fade-in would
        // let the new route paint underneath before the overlay is visible.
        transition: show ? "none" : "opacity 280ms ease-out",
        pointerEvents: show ? "auto" : "none",
        background: "rgba(250, 244, 230, 0.96)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className="relative" style={{ width: 128, height: 128 }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: "3px solid rgba(201, 169, 97, 0.18)" }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "3px solid transparent",
            borderTopColor: "#C9A961",
            borderRightColor: "#C9A961",
            animation: "weddq-pl-spin 1.05s linear infinite",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Logo size={40} />
        </div>
      </div>
      <span className="sr-only">Memuat halaman…</span>
      <style>{`@keyframes weddq-pl-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
