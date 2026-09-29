# Cahier des charges — Plateforme mariage

Nom de travail : **Nuptia** (à remplacer). Version 0.1, 29/09/2026.

## 1. Objectif

Permettre à n'importe quel couple de créer en quelques minutes :

1. un **site pour ses invités** (infos, programme, questionnaire de présence, allergies, brunch, nuit sur place) qui reprend l'identité de son faire-part ;
2. un **espace de gestion** pour suivre les réponses, les allergies, les logements, les paiements et le plan de table.

Un seul programme et une seule base servent tous les couples (architecture multi-couples).

## 2. Utilisateurs

| Rôle | Accès | Actions principales |
| --- | --- | --- |
| Marié(e) | Compte, connexion par lien magique | Configurer le site, gérer les invités, voir les réponses |
| Invité | Pas de compte, lien ou code par foyer | Lire les infos, répondre au questionnaire, modifier sa réponse |
| Administrateur (toi) | Accès complet | Aider les couples, adapter un thème à la main |

## 3. Fonctions

Priorité : **P1** = version 1 vendable, **P2** = version 2, **P3** = plus tard.

| # | Fonction | Priorité |
| --- | --- | --- |
| 1 | Création de compte par lien magique (e-mail) | P1 |
| 2 | Création d'un mariage avec adresse `prenoms.tondomaine.fr` | P1 |
| 3 | Site invités : accueil, programme, infos pratiques | P1 |
| 4 | Thème configurable : couleurs, 2 polices, image d'en-tête | P1 |
| 5 | Questionnaire par défaut (présence, allergies, brunch, nuit) et questions personnalisées | P1 |
| 6 | Foyers invités avec code d'accès unique, réponse pour tout le foyer | P1 |
| 7 | Import de la liste d'invités (CSV) | P1 |
| 8 | Tableau de bord : réponses, filtres par allergies et régimes, export CSV traiteur | P1 |
| 9 | Paiement Stripe des offres | P1 |
| 10 | Mentions légales, confidentialité, consentement allergies | P1 |
| 11 | Logements (tipis, chambres), affectation, suivi « payé » manuel | P2 |
| 12 | Plan de table (glisser-déposer) | P2 |
| 13 | Envoi d'invitations et relances par e-mail | P2 |
| 14 | Extraction automatique des couleurs et polices depuis le faire-part | P2 |
| 15 | Nom de domaine personnalisé | P3 |
| 16 | Paiement des invités pour les logements (Stripe) | P3 |
| 17 | Livre d'or audio (téléphone Raspberry Pi) : vente ou location | P3 |
| 18 | Offre partenaire pour les domaines de mariage | P3 |

## 4. Parcours principaux

**Couple.** Inscription → création du mariage (noms, adresse, date) → réglage du thème → infos du lieu et programme → import ou saisie des invités → partage des liens → suivi des réponses → export pour le traiteur.

**Invité.** Ouvre son lien → voit le site aux couleurs du couple → répond pour chaque personne de son foyer (présence, brunch, nuit, allergies) → peut modifier jusqu'à la date limite.

## 5. Règles de gestion

- Chaque donnée est rattachée à un mariage ; un couple ne voit jamais un autre mariage.
- Un foyer a un code unique de 10 caractères ; les essais de code sont limités.
- Les allergies sont une donnée sensible : case de consentement obligatoire avant de les saisir.
- Après la date limite de réponse, les invités ne peuvent plus modifier.
- Les données d'un mariage sont supprimées 6 mois après sa date.
- Offre gratuite : jusqu'à 50 invités et thème standard.

## 6. Offres (hypothèses à tester)

| Offre | Prix | Contenu |
| --- | --- | --- |
| Essentiel | 0 € | Site modèle, questionnaire, 50 invités |
| Sur mesure | 149 € | Thème du faire-part, invités illimités, export |
| Logistique | 249 € | Sur mesure + logements, paiements, plan de table |

## 7. Contraintes techniques

- Hébergement des données dans l'UE (Supabase, région Paris ou Francfort).
- Application web adaptée au téléphone en priorité (les invités répondent sur mobile).
- Temps de chargement du site invités inférieur à 2 secondes.
- Sauvegardes automatiques, suivi des erreurs (Sentry).
- Aucune clé secrète dans le code visible du navigateur.

## 8. Ce qui reste à décider (à compléter)

- [ ] Nom définitif et nom de domaine
- [ ] Prix définitifs après test sur 10 couples
- [ ] Textes des mentions légales et de la politique de confidentialité (à faire relire)
- [ ] Statut de l'entreprise et vérification du contrat chez THE AURA
- [ ] Langues : français seulement, ou aussi anglais
- [ ] Design de la page de vente
