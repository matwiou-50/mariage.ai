import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>Le site de votre mariage, à l&apos;image de votre faire-part</h1>
        <p>Vos invités répondent en ligne. Vous suivez les présences, les allergies, les logements et le plan de table au même endroit.</p>
        <p>
          <Link className="btn" href="/login">Créer mon site</Link>
        </p>
      </section>
      <div className="wrap">
        <h2>Ce que vous obtenez</h2>
        <div className="card"><strong>Un site sur mesure.</strong> Vos couleurs, vos polices, vos infos pratiques et votre programme.</div>
        <div className="card"><strong>Un questionnaire pour vos invités.</strong> Présence, allergies, brunch, nuit sur place, avec un lien par foyer.</div>
        <div className="card"><strong>Un tableau de bord.</strong> Réponses triées, export pour le traiteur, logements et paiements suivis.</div>
        <h2>Tarifs</h2>
        <table>
          <thead><tr><th>Offre</th><th>Prix</th><th>Contenu</th></tr></thead>
          <tbody>
            <tr><td>Essentiel</td><td>0 €</td><td>Site modèle, questionnaire, 50 invités</td></tr>
            <tr><td>Sur mesure</td><td>149 €</td><td>Votre thème, invités illimités, export</td></tr>
            <tr><td>Logistique</td><td>249 €</td><td>Sur mesure + logements, paiements, plan de table</td></tr>
          </tbody>
        </table>
        <p className="muted">Prix indicatifs à confirmer avant le lancement.</p>
      </div>
    </main>
  );
}
