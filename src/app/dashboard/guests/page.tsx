import { requireWedding } from "@/lib/wedding";
import { siteUrl } from "@/lib/config";
import { importGuests } from "../actions";

type Guest = {
  id: string;
  full_name: string;
  attending: boolean | null;
  attending_brunch: boolean | null;
  sleeps_on_site: boolean | null;
  diet: string | null;
  allergies: string | null;
  households: { name: string; code: string } | null;
};

const yesNo = (v: boolean | null) => (v === null ? "—" : v ? "Oui" : "Non");

export default async function Guests({ searchParams }: { searchParams: Promise<{ filter?: string; added?: string }> }) {
  const { filter, added } = await searchParams;
  const { supabase, wedding } = await requireWedding();
  if (!wedding) return <p>Créez d&apos;abord votre mariage.</p>;

  const { data } = await supabase
    .from("guests")
    .select("id, full_name, attending, attending_brunch, sleeps_on_site, diet, allergies, households(name, code)")
    .eq("wedding_id", wedding.id)
    .order("full_name");
  const all = (data ?? []) as unknown as Guest[];
  const guests = all.filter((g) => {
    if (filter === "yes") return g.attending === true;
    if (filter === "no") return g.attending === false;
    if (filter === "pending") return g.attending === null;
    if (filter === "allergies") return Boolean(g.allergies || g.diet);
    return true;
  });
  const base = siteUrl(wedding.slug);
  const link = (code: string) => `${base}/rsvp?code=${code}`;

  return (
    <>
      <h1>Invités</h1>
      {added && <p className="ok">{added} ligne(s) importée(s).</p>}
      <p>
        Filtrer :{" "}
        <a href="?">tous</a> · <a href="?filter=yes">présents</a> · <a href="?filter=no">absents</a> ·{" "}
        <a href="?filter=pending">sans réponse</a> · <a href="?filter=allergies">allergies et régimes</a>
        {" · "}
        <a href="/dashboard/export">exporter en CSV</a>
      </p>
      <table>
        <thead>
          <tr><th>Nom</th><th>Foyer</th><th>Présent</th><th>Brunch</th><th>Nuit</th><th>Régime</th><th>Allergies</th><th>Lien du foyer</th></tr>
        </thead>
        <tbody>
          {guests.map((g) => (
            <tr key={g.id}>
              <td>{g.full_name}</td>
              <td>{g.households?.name}</td>
              <td>{yesNo(g.attending)}</td>
              <td>{yesNo(g.attending_brunch)}</td>
              <td>{yesNo(g.sleeps_on_site)}</td>
              <td>{g.diet}</td>
              <td>{g.allergies}</td>
              <td>{g.households && <a href={link(g.households.code)}>lien</a>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {guests.length === 0 && <p className="muted">Aucun invité pour ce filtre.</p>}

      <h2>Ajouter des invités</h2>
      <form action={importGuests} className="card">
        <label htmlFor="lines">Une ligne par invité</label>
        <textarea id="lines" name="lines" rows={8} placeholder={"Famille Martin;Paul Martin\nFamille Martin;Julie Martin\nSophie Durand"} />
        <p className="muted">Format : « Foyer;Nom complet », ou seulement le nom. Les personnes d&apos;un même foyer répondent ensemble avec le même lien.</p>
        <p><button className="btn" type="submit">Ajouter</button></p>
      </form>
    </>
  );
}
