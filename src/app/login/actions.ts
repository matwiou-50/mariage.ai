"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { appUrl, supabaseUrl } from "@/lib/config";

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email.includes("@")) redirect("/login?error=email");
  const url = supabaseUrl();
  if (!url.startsWith("https://") || url.includes("xxxx") || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("[login] .env.local incomplet : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY manquant (redémarrez npm run dev après l'avoir rempli).");
    redirect("/login?error=config");
  }
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${appUrl()}/auth/callback` },
  });
  if (error) {
    // Le détail n'est affiché que dans le terminal, jamais à l'invité.
    console.error("[login] Supabase a refusé l'envoi du lien :", error.status, error.code, error.message);
    redirect(`/login?error=${error.status === 429 ? "rate" : "send"}`);
  }
  redirect("/login?sent=1");
}
