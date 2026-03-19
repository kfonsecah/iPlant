/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Brand ────────────────────────────────────────────────
        primary:           "#34D399",
        "primary-pressed": "#059669",
        secondary:         "#86EFAC",
        accent:            "#34D399",
        "accent-dim":      "#163330",
        // ── Dark-mode backgrounds ─────────────────────────────────
        background:        "#0D1117",
        surface:           "#161B22",
        "surface-elevated":"#1C2128",
        border:            "#21262D",
        // ── Text ─────────────────────────────────────────────────
        "text-primary":    "#E6EDF3",
        "text-secondary":  "#8B949E",
        "text-on-accent":  "#FFFFFF",
        // ── Tab bar ──────────────────────────────────────────────
        "tab-active":      "#34D399",
        "tab-inactive":    "#4B5563",
        // ── Feedback ─────────────────────────────────────────────
        error:             "#F87171",
        success:           "#34D399",
      },
      borderRadius: {
        pill: "20px",
        sm:   "12px",
        md:   "14px",
        lg:   "16px",
        xl:   "20px",
      },
    },
  },
  plugins: [],
};
