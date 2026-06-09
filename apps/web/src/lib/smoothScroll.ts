/* Custom smooth scroll with controlled duration and easing.
 * Browser's native `behavior: "smooth"` is too quick (~300-500ms) and not
 * configurable. This implementation uses requestAnimationFrame with an
 * ease-in-out curve and a longer default duration for a calmer feel. */

const DEFAULT_DURATION = 1100; // ms
const NAV_OFFSET = 80; // sticky navbar height, content lands below it

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function smoothScrollTo(targetY: number, duration = DEFAULT_DURATION) {
  // Respect reduced-motion preference
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, targetY);
    return;
  }

  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;

  const start = performance.now();

  function step(now: number) {
    const elapsed = now - start;
    const t = Math.min(1, elapsed / duration);
    window.scrollTo(0, startY + distance * easeInOutCubic(t));
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

export function smoothScrollToTop(duration?: number) {
  smoothScrollTo(0, duration);
}

export function smoothScrollToHash(hash: string, duration?: number) {
  if (!hash) return;
  const el = document.querySelector(hash);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const target = window.scrollY + rect.top - NAV_OFFSET;
  smoothScrollTo(target, duration);
}
