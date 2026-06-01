type Props = {
  /** height in px; width follows the natural aspect ratio (logo is landscape) */
  size?: number;
  className?: string;
  showWordmark?: boolean;
  invert?: boolean;
};

export function Logo({ size = 36, className = "", showWordmark = false, invert = false }: Props) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src="/logo.png"
        alt="weddQ"
        style={{
          height: size,
          width: "auto",
          maxWidth: "none",
          objectFit: "contain",
          filter: invert ? "brightness(0) invert(0.92) sepia(0.2) saturate(2) hue-rotate(330deg)" : undefined,
        }}
        draggable={false}
      />
      {showWordmark && <span className="font-serif text-[26px] tracking-wide leading-none">weddQ</span>}
    </span>
  );
}
