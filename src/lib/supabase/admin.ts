import { createClient } from "@supabase/supabase-js";

// Client "service role" : contourne les règles RLS. Uniquement côté serveur,
// pour le site public des invités (qui n'ont pas de compte) et le webhook Stripe.
export function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
