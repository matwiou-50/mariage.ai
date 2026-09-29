import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { fontsUrl, safeTheme, themeStyle } from "@/lib/theme";
import { saveRsvp } from "./actions";

const ERR: Record<string, string> = {
  code: "Ce code n'est pas reconnu.",
  closed: "Les réponses sont closes. Contactez directement les mariés.",
  consent: "Cochez la case de consentement pour indiquer une allergie.",
};

const YesNo = ({ name, value }: { name: string; value: boolean | null }) => (
  <select name={name} defaultValue={value === null ? "" : value ? "yes" : "no"}>
    <option value="">— choisir —</option>
    <option value="yes">Oui</option>
    <option value="no">Non</option>
  </select>
);

export default async function Rsvp({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string; done?: string; error?: string }>;
}) {
  const { slug } = await params;
  const { code, done, error } = await searchParams;
  const db = supabaseAdmin();
  const { data: w } = await db.from("weddings").select("*").eq("slug", slug).maybeSingle();
  if (!w) notFound();
  const base = (await headers()).get("x-site-base") ?? `/site/${slug}`;
  const theme = safeTheme(w.theme);

  const household = code
    ? (await db.from("households").select("id, name").eq("wedding_id", w.id).eq("code", code).maybeSingle()).data
    : null;
  const guests = household
    ? (await db.from("guests").select("*").eq("household_id", household.id).order("full_name")).data ?? []
    : [];
  // Les 4 premières questions sont des champs fixes ; les suivantes sont des questions du couple.
  const extras = household
    ? ((await db.from("questions").select("*").eq("wedding_id", w.id).order("position")).data ?? []).filter((q) => q.position >= 4)
    : [];

  return (
    <div style={themeStyle(theme)}>
      <link rel="stylesheet" href={fontsUrl(theme)} />
      <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
        <main className="wrap">
          <p><a href={base || "/"}>← {w.couple_names}</a></p>
          <h1>Répondre à l&apos;invitation</h1>
          {error && <p className="error">{ERR[error] ?? "Une erreur est survenue."}</p>}
          {done && <p className="ok">Merci, vos réponses sont enregistrées. Vous pouvez les modifier avec le même lien.</p>}

          {!household ? (
            <form method="get" className="card">
              <label htmlFor="code">Votre code d&apos;invitation</label>
              <input id="code" name="code" required autoComplete="off" />
              <p><button className="btn" type="submit">Continuer</button></p>
            </form>
          ) : (
            <form action={saveRsvp}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="code" value={code} />
              <input type="hidden" name="base" value={base} />
              <p>Bonjour {household.name}.</p>
              {guests.map((g) => (
                <div className="card" key={g.id}>
                  <h3>{g.full_name}</h3>
                  <label>Serez-vous présent(e) ?</label>
                  <YesNo name={`attending_${g.id}`} value={g.attending} />
                  <label>Serez-vous présent(e) au brunch ?</label>
                  <YesNo name={`brunch_${g.id}`} value={g.attending_brunch} />
                  <label>Souhaitez-vous dormir sur place ?</label>
                  <YesNo name={`sleep_${g.id}`} value={g.sleeps_on_site} />
                  <label>Régime alimentaire</label>
                  <input name={`diet_${g.id}`} defaultValue={g.diet ?? ""} placeholder="Végétarien, sans porc..." />
                  <label>Allergies</label>
                  <input name={`allergies_${g.id}`} defaultValue={g.allergies ?? ""} />
                  {extras.map((q) => (
                    <div key={q.id}>
                      <label>{q.label}</label>
                      <input name={`q_${g.id}_${q.id}`} />
                    </div>
                  ))}
                </div>
              ))}
              <label style={{ fontWeight: 400 }}>
                <input type="checkbox" name="consent" style={{ width: "auto" }} /> J&apos;accepte que mes allergies soient transmises aux mariés et à leur traiteur.
                Ces données sont supprimées après le mariage.
              </label>
              <p><button className="btn" type="submit">Enregistrer</button></p>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
