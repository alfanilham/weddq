/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: "#F4EAD5", deep: "#E8DAB8", soft: "#FAF4E6" },
        paper: "#FCF7EB",
        sepia: { DEFAULT: "#3A2A1C", soft: "#5C463A", mute: "#8B7560" },
        brown: { DEFAULT: "#3D2818", deep: "#2A1A0E", mid: "#5C3F2A" },
        gold: { DEFAULT: "#A88339", deep: "#846421", soft: "#C9A961" },
        maroon: { DEFAULT: "#6B2C2C", deep: "#4A1D1D" },
        rose: { DEFAULT: "#B8736D", deep: "#8E544E", soft: "#D9A39C" },
      },
      fontFamily: {
        serif: ['"Quattrocento"', "Georgia", "serif"],
        sans: ['"Quattrocento Sans"', '"Quattrocento"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(58,42,28,0.06), 0 8px 24px -8px rgba(58,42,28,0.18)",
      },
      borderColor: {
        line: "rgba(58,42,28,0.18)",
        lineStrong: "rgba(58,42,28,0.35)",
      },
    },
  },
  plugins: [],
};
