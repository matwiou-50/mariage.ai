"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin, weddingBySlug } from "@/lib/supabase/admin";
import { safePath } from "@/lib/config";

const tri = (v: FormDataEntryValue | null) => (v === "yes" ? true : v === "no" ? false : null);

// Enregistre les réponses d'un foyer. Les invités n'ont pas de compte : le code du foyer sert de clé.
export async function saveRsvp(formData: FormData) {
  const slug = String(formData.get("slug"));
  const code = String(formData.get("code"));
  const base = safePath(String(formData.get("base")), `/site/${slug}`);
  const back = (q: string) => redirect(`${base}/rsvp?code=${encodeURIComponent(code)}&${q}`);

  const db = supabaseAdmin();
  const w = await weddingBySlug(slug, "id, rsvp_deadline");
  if (!w) redirect(base || "/");
  const { data: h } = await db.from("households").select("id").eq("wedding_id", w.id).eq("code", code).maybeSingle();
  if (!h) back("error=code");
  if (w.rsvp_deadline && new Date(w.rsvp_deadline) < new Date(new Date().toDateString())) back("error=closed");

  const { data: guests } = await db.from("guests").select("id").eq("household_id", h!.id);
  const consent = formData.get("consent") === "on";
  const allergiesOf = (id: string) => String(formData.get(`allergies_${id}`) ?? "").trim().slice(0, 500);
  // Vérifié avant toute écriture, pour ne pas enregistrer le foyer à moitié.
  if (!consent && (guests ?? []).some((g) => allergiesOf(g.id))) back("error=consent");

  for (const g of guests ?? []) {
    const allergies = allergiesOf(g.id);
    await db
      .from("guests")
      .update({
        attending: tri(formData.get(`attending_${g.id}`)),
        attending_brunch: tri(formData.get(`brunch_${g.id}`)),
        sleeps_on_site: tri(formData.get(`sleep_${g.id}`)),
        diet: String(formData.get(`diet_${g.id}`) ?? "").trim().slice(0, 200) || null,
        allergies: allergies || null,
      })
      .eq("id", g.id)
      .eq("household_id", h!.id);

    // Questions personnalisées
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith(`q_${g.id}_`)) continue;
      const questionId = key.slice(`q_${g.id}_`.length);
      await db
        .from("answers")
        .upsert({ guest_id: g.id, question_id: questionId, value: String(value).slice(0, 500) }, { onConflict: "guest_id,question_id" });
    }
  }
  await db.from("households").update({ responded_at: new Date().toISOString() }).eq("id", h!.id);
  back("done=1");
}
