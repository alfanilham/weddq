export type Palette = {
  bg: string;
  fg: string;
  accent: string;
  soft: string;
  card: string;
};

export const PALETTES: Record<string, Palette> = {
  cream:      { bg: "#F4EAD5", fg: "#3A2A1C", accent: "#A88339", soft: "#5C463A", card: "#FAF4E6" },
  paper:      { bg: "#FCF7EB", fg: "#3A2A1C", accent: "#A88339", soft: "#5C463A", card: "#F4EAD5" },
  maroon:     { bg: "#4A1D1D", fg: "#FAF4E6", accent: "#D9A39C", soft: "#E8DAB8", card: "#6B2C2C" },
  sepia:      { bg: "#2A1A0E", fg: "#FAF4E6", accent: "#C9A961", soft: "#E8DAB8", card: "#3A2A1C" },
  gold:       { bg: "#3A2A1C", fg: "#FAF4E6", accent: "#C9A961", soft: "#E8DAB8", card: "#5C463A" },
  navy:       { bg: "#16243A", fg: "#F5E8C7", accent: "#C9A961", soft: "#9DB2CC", card: "#243752" },
  emerald:    { bg: "#0F2E27", fg: "#F0E8D6", accent: "#D4B26B", soft: "#9DBFAF", card: "#1A4338" },
  sage:       { bg: "#D8DFCA", fg: "#2C3A2A", accent: "#7C6A4A", soft: "#5C6957", card: "#E6EBD8" },
  blush:      { bg: "#F4D9CC", fg: "#3D1F1A", accent: "#A86655", soft: "#8A5247", card: "#FBE7DC" },
  terracotta: { bg: "#E2BCA1", fg: "#341E12", accent: "#A04A24", soft: "#7A4A3A", card: "#EDD0B8" },
  dustyRose:  { bg: "#DABEBB", fg: "#3D2530", accent: "#8E5A66", soft: "#6B4853", card: "#E8CFCB" },
  plum:       { bg: "#241026", fg: "#F2E8D8", accent: "#D4A05E", soft: "#B89BBA", card: "#371A38" },
};

export function getPalette(key: string | null | undefined): Palette {
  if (key && PALETTES[key]) return PALETTES[key];
  return PALETTES.cream;
}

export function isDarkPalette(key: string | null | undefined): boolean {
  if (!key) return false;
  return ["maroon", "sepia", "gold", "navy", "emerald", "plum"].includes(key);
}
