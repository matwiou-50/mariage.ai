import type { CSSProperties } from "react";

export type Theme = {
  colors: { bg: string; text: string; accent: string; soft: string };
  fonts: { heading: string; body: string };
  hero_image: string | null;
};

export const FONT_CHOICES = [
  "Playfair Display",
  "Cormorant Garamond",
  "Great Vibes",
  "DM Serif Display",
  "Lora",
  "Jost",
  "Montserrat",
  "Raleway",
  "Poppins",
];

export const DEFAULT_THEME: Theme = {
  colors: { bg: "#FFFFFF", text: "#222222", accent: "#E9474D", soft: "#F5B1D0" },
  fonts: { heading: "Playfair Display", body: "Jost" },
  hero_image: null,
};

const HEX = /^#[0-9a-fA-F]{6}$/;

// Nettoie le thème stocké : on n'affiche jamais une valeur inconnue dans le CSS.
export function safeTheme(raw: unknown): Theme {
  const t = (raw ?? {}) as Partial<Theme>;
  const pick = (v: unknown, d: string) => (typeof v === "string" && HEX.test(v) ? v : d);
  const font = (v: unknown, d: string) => (typeof v === "string" && FONT_CHOICES.includes(v) ? v : d);
  return {
    colors: {
      bg: pick(t.colors?.bg, DEFAULT_THEME.colors.bg),
      text: pick(t.colors?.text, DEFAULT_THEME.colors.text),
      accent: pick(t.colors?.accent, DEFAULT_THEME.colors.accent),
      soft: pick(t.colors?.soft, DEFAULT_THEME.colors.soft),
    },
    fonts: {
      heading: font(t.fonts?.heading, DEFAULT_THEME.fonts.heading),
      body: font(t.fonts?.body, DEFAULT_THEME.fonts.body),
    },
    hero_image: typeof t.hero_image === "string" && t.hero_image.startsWith("https://") ? t.hero_image : null,
  };
}

export function fontsUrl(t: Theme) {
  const families = Array.from(new Set([t.fonts.heading, t.fonts.body]))
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;600`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export function themeStyle(t: Theme): CSSProperties {
  return {
    "--bg": t.colors.bg,
    "--text": t.colors.text,
    "--accent": t.colors.accent,
    "--soft": t.colors.soft,
    "--font-heading": `'${t.fonts.heading}', serif`,
    "--font-body": `'${t.fonts.body}', sans-serif`,
  } as CSSProperties;
}
