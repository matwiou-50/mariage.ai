import { requireWedding } from "@/lib/wedding";
import { addEvent, deleteEvent } from "./actions";

export default async function Program() {
  const { supabase, wedding } = await requireWedding();
  if (!wedding) return <p>Créez d&apos;abord votre mariage.</p>;
  const { data: events } = await supabase.from("events").select("*").eq("wedding_id", wedding.id).order("position");

  return (
    <>
      <h1>Programme</h1>
      {(events ?? []).map((e) => (
        <div className="card" key={e.id}>
          <strong>{e.name}</strong>
          {e.starts_at && <span className="muted"> · {new Date(e.starts_at).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })}</span>}
          {e.place && <div>{e.place}</div>}
          {e.description && <p>{e.description}</p>}
          <form action={deleteEvent}>
            <input type="hidden" name="id" value={e.id} />
            <button className="btn secondary" type="submit">Supprimer</button>
          </form>
        </div>
      ))}
      <form action={addEvent} className="card">
        <h3>Ajouter un moment</h3>
        <label htmlFor="name">Nom</label>
        <input id="name" name="name" placeholder="Cérémonie, dîner, brunch..." required />
        <div className="row">
          <div><label htmlFor="starts_at">Date et heure</label><input id="starts_at" name="starts_at" type="datetime-local" /></div>
          <div><label htmlFor="place">Lieu</label><input id="place" name="place" /></div>
        </div>
        <label htmlFor="description">Détails</label>
        <textarea id="description" name="description" rows={3} />
        <p><button className="btn" type="submit">Ajouter</button></p>
      </form>
    </>
  );
}
