import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

// Renvoie l'utilisateur connecté et son mariage (le premier), ou redirige vers la connexion.
export async function requireWedding() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return { supabase, user: data.user, wedding };
}
