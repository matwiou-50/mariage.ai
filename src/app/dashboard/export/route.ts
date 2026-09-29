import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const esc = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const yn = (v: boolean | null) => (v === null ? "" : v ? "oui" : "non");

// Export pour le traiteur : un invité par ligne.
export async function GET() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new NextResponse("Non connecté", { status: 401 });

  const { data } = await supabase
    .from("guests")
    .select("full_name, attending, attending_brunch, sleeps_on_site, diet, allergies, households(name)")
    .order("full_name");
  const rows = (data ?? []) as unknown as {
    full_name: string; attending: boolean | null; attending_brunch: boolean | null;
    sleeps_on_site: boolean | null; diet: string | null; allergies: string | null;
    households: { name: string } | null;
  }[];

  const header = ["Nom", "Foyer", "Présent", "Brunch", "Nuit sur place", "Régime", "Allergies"];
  const lines = rows.map((g) =>
    [g.full_name, g.households?.name, yn(g.attending), yn(g.attending_brunch), yn(g.sleeps_on_site), g.diet, g.allergies]
      .map(esc)
      .join(";")
  );
  return new NextResponse("﻿" + [header.join(";"), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="invites.csv"',
    },
  });
}
