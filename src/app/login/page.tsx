import { sendMagicLink } from "./actions";

export default async function Login({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return (
    <main className="wrap">
      <h1>Connexion</h1>
      {sent ? (
        <p className="ok">Un lien de connexion vient de vous être envoyé. Ouvrez votre e-mail.</p>
      ) : (
        <form action={sendMagicLink} className="card">
          <label htmlFor="email">Votre e-mail</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
          {error && <p className="error">Impossible d&apos;envoyer le lien. Vérifiez l&apos;adresse et réessayez.</p>}
          <p><button className="btn" type="submit">Recevoir mon lien</button></p>
          <p className="muted">Pas de mot de passe : vous recevez un lien par e-mail.</p>
        </form>
      )}
    </main>
  );
}
