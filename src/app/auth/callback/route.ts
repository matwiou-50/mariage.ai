import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Retour du lien magique : échange le code contre une session, puis ouvre le tableau de bord.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/dashboard`);
    console.error("[auth] Échec de l'ouverture de session :", error.status, error.code, error.message);
  } else {
    console.error("[auth] Retour du lien sans code :", searchParams.toString() || "(vide)");
  }
  return NextResponse.redirect(`${origin}/login?error=link`);
}
