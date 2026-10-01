const RESERVED = ["www", "app", "api", "admin", "site", "dashboard", "login"];

export const rootDomain = () => process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

// Adresse publique du site d'un couple.
export function siteUrl(slug: string) {
  const root = rootDomain();
  if (root.startsWith("localhost")) return `http://${root}/site/${slug}`;
  return `https://${slug}.${root}`;
}

export function appUrl() {
  const root = rootDomain();
  return root.startsWith("localhost") ? `http://${root}` : `https://app.${root}`;
}

export function cleanSlug(input: string) {
  const s = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
  return s;
}

export const isValidSlug = (s: string) => /^[a-z0-9][a-z0-9-]{1,40}[a-z0-9]$/.test(s) && !RESERVED.includes(s);

// Un chemin de redirection ne doit jamais sortir du site.
export const safePath = (p: string, fallback: string) => (p.startsWith("/") && !p.startsWith("//") ? p : fallback);

// Adresse Supabase réduite à "https://xxxx.supabase.co" : un chemin copié en trop
// (ex. ".../rest/v1/") provoque sinon l'erreur 404 "Invalid path specified in request URL".
export function supabaseUrl() {
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  try {
    return new URL(raw).origin;
  } catch {
    return raw;
  }
}
