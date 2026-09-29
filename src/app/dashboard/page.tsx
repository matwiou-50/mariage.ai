import { requireWedding } from "@/lib/wedding";
import { siteUrl } from "@/lib/config";
import { createWedding, startCheckout } from "./actions";

const ERRORS: Record<string, string> = {
  names: "Indiquez vos prénoms.",
  slug: "Adresse invalide : 3 à 42 lettres, chiffres ou tirets.",
  taken: "Cette adresse est déjà prise, essayez-en une autre.",
  create: "La création a échoué, réessayez.",
};

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string; paid?: string }> }) {
  const { error, paid } = await searchParams;
  const { wedding, supabase } = await requireWedding();

  if (!wedding) {
    return (
      <>
        <h1>Créer votre mariage</h1>
        <form action={createWedding} className="card">
          <label htmlFor="names">Vos prénoms</label>
          <input id="names" name="names" placeholder="Charlotte & Matthieu" required />
          <label htmlFor="slug">Adresse du site</label>
          <input id="slug" name="slug" placeholder="charlotte-matthieu" />
          <p className="muted">Laissez vide pour la créer à partir de vos prénoms.</p>
          {error && <p className="error">{ERRORS[error] ?? "Erreur."}</p>}
          <p><button className="btn" type="submit">Créer</button></p>
        </form>
      </>
    );
  }

  const { data: guests } = await supabase.from("guests").select("attending, allergies").eq("wedding_id", wedding.id);
  const all = guests ?? [];
  const yes = all.filter((g) => g.attending === true).length;
  const no = all.filter((g) => g.attending === false).length;
  const pending = all.length - yes - no;
  const allergies = all.filter((g) => g.allergies).length;
  const url = siteUrl(wedding.slug);

  return (
    <>
      <h1>Tableau de bord</h1>
      {paid && <p className="ok">Merci ! Votre offre sera activée dans quelques instants.</p>}
      <div className="card">
        <strong>Votre site : </strong>
        <a href={url} target="_blank" rel="noreferrer">{url}</a>
        <p className="muted">Offre actuelle : {wedding.plan === "free" ? "Essentiel (gratuite)" : wedding.plan === "custom" ? "Sur mesure" : "Logistique"}</p>
      </div>
      <div className="row">
        <div className="card"><strong>{all.length}</strong><br />invités</div>
        <div className="card"><strong>{yes}</strong><br />présents</div>
        <div className="card"><strong>{no}</strong><br />absents</div>
        <div className="card"><strong>{pending}</strong><br />sans réponse</div>
        <div className="card"><strong>{allergies}</strong><br />allergies signalées</div>
      </div>
      {wedding.plan === "free" && (
        <div className="card">
          <h3>Passer à une offre payante</h3>
          <div className="row">
            <form action={startCheckout}>
              <input type="hidden" name="plan" value="custom" />
              <button className="btn" type="submit">Sur mesure — 149 €</button>
            </form>
            <form action={startCheckout}>
              <input type="hidden" name="plan" value="logistics" />
              <button className="btn" type="submit">Logistique — 249 €</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
