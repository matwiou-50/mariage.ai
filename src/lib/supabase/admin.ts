import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/config";

// La clé publique (anon / sb_publishable_) ne passe pas les règles RLS : le site des invités
// semblerait vide (404). On refuse donc tout de suite une clé qui n'est pas la clé secrète.
function serviceKeyProblem(key: string) {
  if (key.startsWith("sb_publishable_")) return "c'est la clé publique (sb_publishable_…), pas la clé secrète (sb_secret_…)";
  if (key.startsWith("eyJ")) {
    try {
      const role = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role;
      if (role !== "service_role") return `c'est la clé « ${role} », pas la clé « service_role »`;
    } catch {
      return "la clé semble tronquée";
    }
  }
  return null;
}

// Client "service role" : contourne les règles RLS. Uniquement côté serveur,
// pour le site public des invités (qui n'ont pas de compte) et le webhook Stripe.
export function supabaseAdmin() {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local (redémarrez npm run dev après l'avoir rempli).");
  }
  const problem = serviceKeyProblem(key);
  if (problem) throw new Error(`SUPABASE_SERVICE_ROLE_KEY dans .env.local : ${problem}. Corrigez-la puis redémarrez npm run dev.`);
  return createClient(supabaseUrl(), key, {
    auth: { persistSession: false },
  });
}

// Mariage d'après son adresse (site des invités). Une erreur Supabase est affichée
// telle quelle au lieu d'une page 404 trompeuse.
export async function weddingBySlug(slug: string, columns = "*") {
  const { data, error } = await supabaseAdmin().from("weddings").select(columns).eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Lecture du mariage « ${slug} » impossible : ${error.message}`);
  if (!data) console.warn(`[site] Aucun mariage avec l'adresse « ${slug} ». Vérifiez l'adresse affichée sur l'accueil du tableau de bord.`);
  return data as unknown as Record<string, any> | null; // eslint-disable-line @typescript-eslint/no-explicit-any
}
