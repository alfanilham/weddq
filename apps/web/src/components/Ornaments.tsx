/* Reusable SVG ornaments, batik-inspired (geometric, abstract) */

type OrnProps = { size?: number; color?: string; className?: string };

export function Mark({ size = 34, color = "#A88339", className }: OrnProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" className={className}>
      <circle cx="17" cy="17" r="16" stroke={color} strokeWidth="0.8" />
      <rect x="17" y="3" width="8" height="8" transform="rotate(45 17 3)" stroke={color} strokeWidth="0.8" />
      <rect x="31" y="17" width="8" height="8" transform="rotate(45 31 17)" stroke={color} strokeWidth="0.8" />
      <rect x="17" y="31" width="8" height="8" transform="rotate(45 17 31)" stroke={color} strokeWidth="0.8" />
      <rect x="3" y="17" width="8" height="8" transform="rotate(45 3 17)" stroke={color} strokeWidth="0.8" />
      <circle cx="17" cy="17" r="2" fill={color} />
    </svg>
  );
}

export function Divider({ width = 360, color = "#A88339", className }: { width?: number; color?: string; className?: string }) {
  return (
    <svg width={width} height={40} viewBox={`0 0 ${width} 40`} fill="none" className={className}>
      <line x1="0" y1="20" x2={width / 2 - 28} y2="20" stroke={color} strokeOpacity="0.55" />
      <line x1={width / 2 + 28} y1="20" x2={width} y2="20" stroke={color} strokeOpacity="0.55" />
      <rect x={width / 2} y="8" width="16" height="16" transform={`rotate(45 ${width / 2} 8)`} stroke={color} />
      <circle cx={width / 2} cy="20" r="2" fill={color} />
      <circle cx={width / 2 - 18} cy="20" r="1.5" fill={color} />
      <circle cx={width / 2 + 18} cy="20" r="1.5" fill={color} />
    </svg>
  );
}

export function Inline({ color = "#A88339", className }: { color?: string; className?: string }) {
  return (
    <svg width="60" height="12" viewBox="0 0 60 12" fill="none" className={className}>
      <line x1="0" y1="6" x2="22" y2="6" stroke={color} strokeOpacity="0.6" />
      <rect x="30" y="2" width="8" height="8" transform="rotate(45 30 2)" stroke={color} />
      <line x1="38" y1="6" x2="60" y2="6" stroke={color} strokeOpacity="0.6" />
    </svg>
  );
}

export function Corner({ size = 120, color = "#A88339", className }: OrnProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <g stroke={color} strokeWidth="0.7" strokeOpacity="0.7" fill="none">
        {[20, 50, 80].map((y) => [20, 50, 80].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="14" />))}
      </g>
      <g fill={color} fillOpacity="0.5">
        {[20, 50, 80].map((y) => [20, 50, 80].map((x) => <circle key={`d-${x}-${y}`} cx={x} cy={y} r="1.5" />))}
      </g>
    </svg>
  );
}

export function BatikBg({ className = "", color = "#A88339", opacity = 0.18 }: { className?: string; color?: string; opacity?: number }) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
    <g fill='none' stroke='${color}' stroke-opacity='${opacity}' stroke-width='0.6'>
      <circle cx='16' cy='16' r='10'/>
      <circle cx='48' cy='48' r='10'/>
      <circle cx='48' cy='16' r='10'/>
      <circle cx='16' cy='48' r='10'/>
      <rect x='32' y='28' width='8' height='8' transform='rotate(45 32 28)'/>
      <rect x='0' y='28' width='8' height='8' transform='rotate(45 0 28)'/>
    </g>
    <g fill='${color}' fill-opacity='${opacity * 1.3}'>
      <circle cx='16' cy='16' r='1.2'/>
      <circle cx='48' cy='48' r='1.2'/>
      <circle cx='48' cy='16' r='1.2'/>
      <circle cx='16' cy='48' r='1.2'/>
      <circle cx='32' cy='32' r='1.2'/>
    </g>
  </svg>`;
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  return <div className={className} style={{ backgroundImage: url, pointerEvents: "none" }} />;
}

export function OrnamentRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 text-gold py-2 ${className}`}>
      <span className="h-px max-w-[200px] flex-1" style={{ background: "linear-gradient(90deg,transparent,#A88339 50%,transparent)" }} />
      <span className="w-2.5 h-2.5 border border-gold rotate-45" />
      <span className="w-1.5 h-1.5 bg-gold rotate-45" />
      <span className="w-2.5 h-2.5 border border-gold rotate-45" />
      <span className="h-px max-w-[200px] flex-1" style={{ background: "linear-gradient(90deg,transparent,#A88339 50%,transparent)" }} />
    </div>
  );
}
