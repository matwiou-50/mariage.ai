"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { appUrl } from "@/lib/config";

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email.includes("@")) redirect("/login?error=email");
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${appUrl()}/auth/callback` },
  });
  if (error) redirect("/login?error=send");
  redirect("/login?sent=1");
}
