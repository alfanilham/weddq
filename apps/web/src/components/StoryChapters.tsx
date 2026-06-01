import { useEffect, useRef, useState } from "react";

/* Shared multi-chapter story section.
   Desktop: alternating photo/text zigzag rows.
   Mobile: photo on top, text below, stacked.
   Parses `story` string for `## CHAPTER TITLE` markers; falls back to a
   single chapter when no markers are present. */

export type StoryTheme = {
  bg: string;
  fg: string;
  fgSoft: string;
  accent: string;        // small caps eyebrow & chapter title
  rule: string;          // divider color
  card?: string;         // photo frame border
  serifFontFamily?: string;
  scriptFontFamily?: string; // optional cursive for the title
  variant?: "light" | "dark";
};

export type StoryChapter = { title: string; body: string; photo?: string };

const DEFAULT_TITLES = ["PERTEMUAN", "MENJALIN HUBUNGAN", "LAMARAN", "PERNIKAHAN"];

/** Parse story string into chapters.
 * Format: `## TITLE\nbody\n## TITLE\nbody...`
 * Fallback: single chapter using "PERJALANAN KAMI" as title. */
export function parseStoryChapters(story: string | null | undefined, gallery: Array<{ url: string }> = []): StoryChapter[] {
  if (!story) return [];
  const raw = story.trim();
  if (raw.includes("## ")) {
    const parts = raw.split(/\n?##\s+/).map((s) => s.trim()).filter(Boolean);
    const chapters = parts.map((block, i) => {
      const [titleLine, ...rest] = block.split("\n");
      return {
        title: (titleLine || DEFAULT_TITLES[i] || `BAB ${i + 1}`).toUpperCase(),
        body: rest.join("\n").trim() || titleLine,
        photo: gallery[i]?.url,
      };
    });
    return chapters;
  }
  // Fallback: split into ~equal chunks if it's a long paragraph
  const sentences = raw.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length >= 4) {
    const chunkSize = Math.ceil(sentences.length / Math.min(DEFAULT_TITLES.length, 3));
    const chapters: StoryChapter[] = [];
    for (let i = 0; i < sentences.length; i += chunkSize) {
      chapters.push({
        title: DEFAULT_TITLES[chapters.length] ?? `BAB ${chapters.length + 1}`,
        body: sentences.slice(i, i + chunkSize).join(" "),
        photo: gallery[chapters.length]?.url,
      });
    }
    return chapters;
  }
  return [{ title: "PERJALANAN KAMI", body: raw, photo: gallery[0]?.url }];
}

/** Heart-pulse icon used as section divider */
function HeartPulse({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      <path
        d="M32 54s-22-12-22-28a12 12 0 0 1 22-7 12 12 0 0 1 22 7c0 16-22 28-22 28Z"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 32 H22 L26 26 L30 38 L34 30 L38 34 H48"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSeen(true)),
      { threshold: 0.15 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return { ref, seen };
}

/** Main exported section */
export function StoryChapters({
  chapters: explicitChapters,
  story,
  gallery,
  theme,
  eyebrow = "Cerita Kami",
  heading = "Perjalanan Kami",
  subtitle = "Sebuah perjalanan tak terlupakan yang mengubah arah hidup kami",
}: {
  chapters?: Array<{ title: string; body: string; photo?: string | null }>;
  story?: string | null | undefined;
  gallery?: Array<{ url: string }>;
  theme: StoryTheme;
  eyebrow?: string;
  heading?: string;
  subtitle?: string;
}) {
  const chapters: StoryChapter[] = explicitChapters && explicitChapters.length > 0
    ? explicitChapters.map((c, i) => ({
        title: c.title.toUpperCase(),
        body: c.body,
        photo: c.photo ?? gallery?.[i]?.url,
      }))
    : parseStoryChapters(story, gallery ?? []);
  if (chapters.length === 0) return null;

  const dark = theme.variant === "dark";
  const titleSerif = theme.serifFontFamily ?? "Quattrocento, Georgia, serif";
  const titleScript = theme.scriptFontFamily ?? "Quattrocento, Georgia, serif";

  return (
    <section className="relative py-24 px-6" style={{ background: theme.bg, color: theme.fg }}>
      <style>{`
        .sc-reveal { opacity: 0; transform: translateY(40px); transition: opacity .9s ease, transform .9s ease; }
        .sc-reveal.in { opacity: 1; transform: none; }
        .sc-photo { box-shadow: 0 24px 50px -22px ${dark ? "rgba(0,0,0,.7)" : "rgba(0,0,0,.25)"}; }
      `}</style>

      <Header eyebrow={eyebrow} heading={heading} subtitle={subtitle} theme={theme} titleSerif={titleSerif} titleScript={titleScript} />

      <div className="max-w-5xl mx-auto mt-16 space-y-20 md:space-y-28">
        {chapters.map((ch, i) => (
          <ChapterRow key={i} chapter={ch} index={i} theme={theme} titleSerif={titleSerif} />
        ))}
      </div>
    </section>
  );
}

function Header({
  eyebrow, heading, subtitle, theme, titleSerif, titleScript,
}: {
  eyebrow: string; heading: string; subtitle: string; theme: StoryTheme; titleSerif: string; titleScript: string;
}) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="text-[10px] tracking-[0.45em] uppercase" style={{ color: theme.accent, fontFamily: titleSerif }}>
        {eyebrow}
      </div>
      <h2
        className="mt-4 italic"
        style={{
          color: theme.fg,
          fontFamily: titleScript,
          fontSize: "clamp(40px, 8vw, 68px)",
          lineHeight: 1.05,
          fontWeight: 400,
        }}
      >
        {heading}
      </h2>
      <p className="mt-5 text-sm md:text-base leading-relaxed" style={{ color: theme.fgSoft }}>
        {subtitle}
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <span className="h-px w-12 md:w-16" style={{ background: theme.rule, opacity: 0.7 }} />
        <HeartPulse color={theme.accent} size={28} />
        <span className="h-px w-12 md:w-16" style={{ background: theme.rule, opacity: 0.7 }} />
      </div>
    </div>
  );
}

function ChapterRow({
  chapter, index, theme, titleSerif,
}: {
  chapter: StoryChapter; index: number; theme: StoryTheme; titleSerif: string;
}) {
  const { ref, seen } = useReveal<HTMLDivElement>();
  const photoRight = index % 2 === 1;

  return (
    <article
      ref={ref}
      className={`sc-reveal ${seen ? "in" : ""} grid md:grid-cols-2 gap-8 md:gap-14 items-center`}
    >
      <div className={`flex justify-center ${photoRight ? "md:order-2" : "md:order-1"}`}>
        <Photo chapter={chapter} theme={theme} />
      </div>
      <div className={`${photoRight ? "md:order-1" : "md:order-2"}`}>
        <TextBlock chapter={chapter} index={index} theme={theme} titleSerif={titleSerif} />
      </div>
    </article>
  );
}

function Photo({ chapter, theme }: { chapter: StoryChapter; theme: StoryTheme }) {
  if (!chapter.photo) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          aspectRatio: "3 / 4",
          background: theme.card ?? theme.bg,
          borderRadius: 14,
          border: `1px dashed ${theme.rule}88`,
        }}
      />
    );
  }
  return (
    <div
      className="sc-photo relative overflow-hidden"
      style={{
        width: "100%",
        maxWidth: 380,
        aspectRatio: "3 / 4",
        background: theme.card ?? theme.bg,
        borderRadius: 14,
        border: `1px solid ${theme.rule}66`,
        padding: 8,
      }}
    >
      <div className="w-full h-full overflow-hidden" style={{ borderRadius: 8 }}>
        <img src={chapter.photo} alt={chapter.title} className="w-full h-full object-cover" loading="lazy" />
      </div>
    </div>
  );
}

function TextBlock({
  chapter, index, theme, titleSerif,
}: {
  chapter: StoryChapter; index: number; theme: StoryTheme; titleSerif: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-[10px] tracking-[0.3em]" style={{ color: theme.accent, fontFamily: titleSerif }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="h-px w-10" style={{ background: theme.rule, opacity: 0.5 }} />
        <h3
          className="font-bold tracking-[0.18em]"
          style={{
            color: theme.accent,
            fontFamily: titleSerif,
            fontSize: 22,
          }}
        >
          {chapter.title}
        </h3>
      </div>
      <p
        className="mt-5 text-[15px] md:text-base leading-[1.85]"
        style={{ color: theme.fgSoft, whiteSpace: "pre-wrap" }}
      >
        {chapter.body}
      </p>
    </div>
  );
}
