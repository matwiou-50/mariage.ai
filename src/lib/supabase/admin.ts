import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/config";

// Client "service role" : contourne les règles RLS. Uniquement côté serveur,
// pour le site public des invités (qui n'ont pas de compte) et le webhook Stripe.
export function supabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local (redémarrez npm run dev après l'avoir rempli).");
  }
  return createClient(supabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}
