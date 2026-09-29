# Nuptia — plateforme mariage (squelette)

Un seul programme (Next.js) et une seule base (Supabase) servent tous les couples.
`charlotte-matthieu.tondomaine.fr` affiche le site des invités ; `app.tondomaine.fr` est l'espace des mariés.

Ce qui fonctionne déjà : connexion par lien magique, création d'un mariage, thème (couleurs, polices, image), programme,
import d'invités, foyers avec lien unique, questionnaire (présence, brunch, nuit, régime, allergies avec consentement),
tableau de bord avec filtres, export CSV pour le traiteur, paiement Stripe (Sur mesure, Logistique).

Ce qui reste à faire : voir la liste en bas.

## 1. Installer sur ton Mac

```bash
cd nuptia
npm install
cp .env.example .env.local
```

## 2. Créer la base (Supabase)

1. Crée un compte sur supabase.com, puis un projet (région **Paris** ou **Francfort**).
2. Ouvre **SQL Editor**, colle tout le contenu de `supabase/schema.sql`, clique **Run**.
3. **Project Settings > API** : copie l'URL, la clé `anon` et la clé `service_role` dans `.env.local`.
4. **Authentication > URL Configuration** : ajoute `http://localhost:3000/auth/callback` dans les adresses de redirection autorisées.

La clé `service_role` est secrète : jamais dans GitHub, jamais dans le navigateur.

## 3. Lancer en local

```bash
npm run dev
```

- `http://localhost:3000` : page de vente.
- `http://localhost:3000/login` : connexion, création du mariage, puis tableau de bord.
- Le site des invités s'ouvre sur `http://localhost:3000/site/<adresse>` (les sous-domaines ne marchent qu'en ligne).

## 4. Mettre en ligne (Netlify)

1. Mets le dossier sur GitHub (dépôt privé), puis **Add new site > Import from Git** sur Netlify.
2. Ajoute les variables de `.env.local` dans **Site configuration > Environment variables**, avec
   `NEXT_PUBLIC_ROOT_DOMAIN=tondomaine.fr`.
3. Chez ton registrar (OVH, Gandi), crée les enregistrements DNS vers Netlify pour `tondomaine.fr`, `app` et un **joker `*`**.
   Dans Netlify, **Domain management** : ajoute le domaine et le sous-domaine joker `*.tondomaine.fr`.
   Le joker demande en général le DNS de Netlify (plan Pro) : vérifie l'offre actuelle avant de choisir.
4. Supabase : ajoute `https://app.tondomaine.fr/auth/callback` aux adresses de redirection.

## 5. Paiement (Stripe)

1. Crée un compte Stripe, copie la clé secrète dans `STRIPE_SECRET_KEY`.
2. **Développeurs > Webhooks** : ajoute `https://app.tondomaine.fr/api/stripe/webhook`, événement
   `checkout.session.completed`, puis copie la clé de signature dans `STRIPE_WEBHOOK_SECRET`.
3. Teste d'abord en mode test avec la carte `4242 4242 4242 4242`.

## 6. Suppression des données (RGPD)

Dans Supabase : **Database > Extensions**, active `pg_cron`, puis exécute la ligne commentée à la fin de `schema.sql`.
Les mariages passés depuis plus de 6 mois sont alors supprimés chaque nuit.

## Structure du code

| Dossier ou fichier | Rôle |
| --- | --- |
| `src/middleware.ts` | Lit le sous-domaine et envoie vers le bon site |
| `src/app/site/[slug]/` | Site des invités et questionnaire |
| `src/app/dashboard/` | Espace des mariés : accueil, invités, thème, programme, export |
| `src/app/api/stripe/webhook/` | Active l'offre après paiement |
| `src/lib/theme.ts` | Couleurs et polices du thème, avec nettoyage des valeurs |
| `supabase/schema.sql` | Tables, règles de sécurité, suppression après mariage |

## À compléter

- [ ] Nom définitif (« Nuptia » est provisoire) et nom de domaine
- [ ] Mentions légales, politique de confidentialité et CGV (à faire relire)
- [ ] Code d'accès pour protéger un site (le champ `access_code` existe, la page ne le demande pas encore)
- [ ] Limitation des essais de code invité (à ajouter avant le lancement public)
- [ ] Limite de 50 invités pour l'offre gratuite
- [ ] Envoi d'e-mails d'invitation et de relance (Resend)
- [ ] Logements, paiements des invités et plan de table (tables déjà prévues dans la base)
- [ ] Éditeur de questions personnalisées (le questionnaire lit déjà les questions de la table `questions`)
- [ ] Envoi d'image pour l'en-tête (aujourd'hui : adresse https à coller)
- [ ] Extraction des couleurs depuis le faire-part
- [ ] Tests avec 5 à 10 couples, puis correction des retours
