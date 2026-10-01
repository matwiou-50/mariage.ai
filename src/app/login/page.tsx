import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { sendMagicLink } from "./actions";

const ERRORS: Record<string, string> = {
  email: "Cette adresse e-mail n'est pas valide.",
  send: "Impossible d'envoyer le lien. Vérifiez l'adresse et réessayez.",
  rate: "Trop de liens envoyés récemment. Patientez quelques minutes avant de réessayer.",
  config: "Le site n'est pas encore relié à Supabase (fichier .env.local).",
  link: "Ce lien de connexion n'est plus valide. Demandez-en un nouveau, et ouvrez-le dans le même navigateur.",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  // Déjà connecté (ex. bouton « Créer mon site » de l'accueil) : pas besoin de redemander l'e-mail.
  const { data } = await (await supabaseServer()).auth.getUser();
  if (data.user) redirect("/dashboard");
  return (
    <main className="wrap">
      <h1>Connexion</h1>
      {sent ? (
        <p className="ok">Un lien de connexion vient de vous être envoyé. Ouvrez votre e-mail.</p>
      ) : (
        <form action={sendMagicLink} className="card">
          <label htmlFor="email">Votre e-mail</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
          {error && <p className="error">{ERRORS[error] ?? ERRORS.send}</p>}
          <p><button className="btn" type="submit">Recevoir mon lien</button></p>
          <p className="muted">Pas de mot de passe : vous recevez un lien par e-mail.</p>
        </form>
      )}
    </main>
  );
}
