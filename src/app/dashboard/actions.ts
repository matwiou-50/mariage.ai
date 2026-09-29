"use server";

import { redirect } from "next/navigation";
import Stripe from "stripe";
import { supabaseServer } from "@/lib/supabase/server";
import { requireWedding } from "@/lib/wedding";
import { appUrl, cleanSlug, isValidSlug } from "@/lib/config";
import { FONT_CHOICES, safeTheme } from "@/lib/theme";

export async function createWedding(formData: FormData) {
  const names = String(formData.get("names") ?? "").trim();
  const slug = cleanSlug(String(formData.get("slug") || names));
  if (!names) redirect("/dashboard?error=names");
  if (!isValidSlug(slug)) redirect("/dashboard?error=slug");
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("create_wedding", { p_slug: slug, p_names: names });
  if (error) redirect(`/dashboard?error=${error.code === "23505" ? "taken" : "create"}`);
  redirect("/dashboard/settings");
}

export async function updateSettings(formData: FormData) {
  const { supabase, wedding } = await requireWedding();
  if (!wedding) redirect("/dashboard");
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const theme = safeTheme({
    colors: { bg: get("bg"), text: get("text"), accent: get("accent"), soft: get("soft") },
    fonts: {
      heading: FONT_CHOICES.includes(get("font_heading")) ? get("font_heading") : undefined,
      body: FONT_CHOICES.includes(get("font_body")) ? get("font_body") : undefined,
    },
    hero_image: get("hero_image") || null,
  });
  const { error } = await supabase
    .from("weddings")
    .update({
      couple_names: get("couple_names") || wedding.couple_names,
      wedding_date: get("wedding_date") || null,
      rsvp_deadline: get("rsvp_deadline") || null,
      location: get("location") || null,
      welcome_text: get("welcome_text") || null,
      theme,
      sections: {
        program: formData.get("s_program") === "on",
        practical: formData.get("s_practical") === "on",
        lodging: formData.get("s_lodging") === "on",
        rsvp: formData.get("s_rsvp") === "on",
      },
    })
    .eq("id", wedding.id);
  redirect(`/dashboard/settings?${error ? "error=1" : "saved=1"}`);
}

// Import : une ligne par invité, "Foyer;Nom complet" ou juste "Nom complet".
export async function importGuests(formData: FormData) {
  const { supabase, wedding } = await requireWedding();
  if (!wedding) redirect("/dashboard");
  const lines = String(formData.get("lines") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const groups = new Map<string, string[]>();
  for (const line of lines) {
    const parts = line.split(/[;\t]/).map((p) => p.trim());
    const [household, guest] = parts.length > 1 ? [parts[0], parts.slice(1).join(" ")] : [parts[0], parts[0]];
    if (!guest) continue;
    groups.set(household, [...(groups.get(household) ?? []), guest]);
  }
  for (const [name, guests] of groups) {
    const { data: h } = await supabase
      .from("households")
      .insert({ wedding_id: wedding.id, name })
      .select("id")
      .single();
    if (!h) continue;
    await supabase
      .from("guests")
      .insert(guests.map((full_name) => ({ wedding_id: wedding.id, household_id: h.id, full_name })));
  }
  redirect("/dashboard/guests?added=" + lines.length);
}

const PLANS = {
  custom: { name: "Nuptia — Sur mesure", cents: 14900 },
  logistics: { name: "Nuptia — Logistique", cents: 24900 },
} as const;

export async function startCheckout(formData: FormData) {
  const { wedding, user } = await requireWedding();
  if (!wedding) redirect("/dashboard");
  const plan = String(formData.get("plan")) as keyof typeof PLANS;
  if (!(plan in PLANS)) redirect("/dashboard");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: { currency: "eur", unit_amount: PLANS[plan].cents, product_data: { name: PLANS[plan].name } },
      },
    ],
    metadata: { wedding_id: wedding.id, plan },
    success_url: `${appUrl()}/dashboard?paid=1`,
    cancel_url: `${appUrl()}/dashboard`,
  });
  redirect(session.url!);
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}
