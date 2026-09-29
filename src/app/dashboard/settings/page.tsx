import { requireWedding } from "@/lib/wedding";
import { FONT_CHOICES, safeTheme } from "@/lib/theme";
import { updateSettings } from "../actions";

export default async function Settings({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { wedding } = await requireWedding();
  if (!wedding) return <p>Créez d&apos;abord votre mariage.</p>;
  const t = safeTheme(wedding.theme);
  const s = (wedding.sections ?? {}) as Record<string, boolean>;

  return (
    <>
      <h1>Site et thème</h1>
      {saved && <p className="ok">Enregistré.</p>}
      {error && <p className="error">L&apos;enregistrement a échoué.</p>}
      <form action={updateSettings}>
        <div className="card">
          <h3>Informations</h3>
          <label htmlFor="couple_names">Vos prénoms</label>
          <input id="couple_names" name="couple_names" defaultValue={wedding.couple_names} />
          <div className="row">
            <div><label htmlFor="wedding_date">Date du mariage</label><input id="wedding_date" name="wedding_date" type="date" defaultValue={wedding.wedding_date ?? ""} /></div>
            <div><label htmlFor="rsvp_deadline">Réponses avant le</label><input id="rsvp_deadline" name="rsvp_deadline" type="date" defaultValue={wedding.rsvp_deadline ?? ""} /></div>
          </div>
          <label htmlFor="location">Lieu</label>
          <input id="location" name="location" defaultValue={wedding.location ?? ""} />
          <label htmlFor="welcome_text">Mot d&apos;accueil</label>
          <textarea id="welcome_text" name="welcome_text" rows={4} defaultValue={wedding.welcome_text ?? ""} />
        </div>

        <div className="card">
          <h3>Couleurs et polices</h3>
          <div className="row">
            <div><label htmlFor="bg">Fond</label><input id="bg" name="bg" type="color" defaultValue={t.colors.bg} /></div>
            <div><label htmlFor="text">Texte</label><input id="text" name="text" type="color" defaultValue={t.colors.text} /></div>
            <div><label htmlFor="accent">Accent</label><input id="accent" name="accent" type="color" defaultValue={t.colors.accent} /></div>
            <div><label htmlFor="soft">Doux</label><input id="soft" name="soft" type="color" defaultValue={t.colors.soft} /></div>
          </div>
          <div className="row">
            <div>
              <label htmlFor="font_heading">Police des titres</label>
              <select id="font_heading" name="font_heading" defaultValue={t.fonts.heading}>
                {FONT_CHOICES.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="font_body">Police du texte</label>
              <select id="font_body" name="font_body" defaultValue={t.fonts.body}>
                {FONT_CHOICES.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <label htmlFor="hero_image">Image d&apos;en-tête (adresse https)</label>
          <input id="hero_image" name="hero_image" defaultValue={t.hero_image ?? ""} placeholder="https://..." />
        </div>

        <div className="card">
          <h3>Sections du site</h3>
          <label><input type="checkbox" name="s_program" defaultChecked={s.program !== false} style={{ width: "auto" }} /> Programme</label>
          <label><input type="checkbox" name="s_practical" defaultChecked={s.practical !== false} style={{ width: "auto" }} /> Infos pratiques</label>
          <label><input type="checkbox" name="s_lodging" defaultChecked={s.lodging === true} style={{ width: "auto" }} /> Hébergement</label>
          <label><input type="checkbox" name="s_rsvp" defaultChecked={s.rsvp !== false} style={{ width: "auto" }} /> Questionnaire de réponse</label>
        </div>
        <button className="btn" type="submit">Enregistrer</button>
      </form>
    </>
  );
}
