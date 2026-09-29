"use server";

import { redirect } from "next/navigation";
import { requireWedding } from "@/lib/wedding";

export async function addEvent(formData: FormData) {
  const { supabase, wedding } = await requireWedding();
  if (!wedding) redirect("/dashboard");
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  if (!get("name")) redirect("/dashboard/program");
  const { count } = await supabase.from("events").select("id", { count: "exact", head: true }).eq("wedding_id", wedding.id);
  await supabase.from("events").insert({
    wedding_id: wedding.id,
    name: get("name"),
    starts_at: get("starts_at") ? new Date(get("starts_at")).toISOString() : null,
    place: get("place") || null,
    description: get("description") || null,
    position: count ?? 0,
  });
  redirect("/dashboard/program");
}

export async function deleteEvent(formData: FormData) {
  const { supabase, wedding } = await requireWedding();
  if (!wedding) redirect("/dashboard");
  await supabase.from("events").delete().eq("id", String(formData.get("id"))).eq("wedding_id", wedding.id);
  redirect("/dashboard/program");
}
