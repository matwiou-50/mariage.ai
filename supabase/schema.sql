-- Plateforme mariage : schéma Supabase (PostgreSQL)
-- À coller dans Supabase > SQL Editor > New query > Run.
-- Chaque table est rattachée à un mariage (wedding_id) : c'est ce qui sépare les couples.

create extension if not exists pgcrypto with schema extensions;

-- ---------- Tables ----------

create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]([a-z0-9-]{1,40}[a-z0-9])$'),
  couple_names text not null,                 -- ex. "Charlotte & Matthieu"
  wedding_date date,
  location text,
  welcome_text text,
  plan text not null default 'free' check (plan in ('free', 'custom', 'logistics')),
  theme jsonb not null default '{
    "colors": {"bg": "#FFFFFF", "text": "#222222", "accent": "#E9474D", "soft": "#F5B1D0"},
    "fonts": {"heading": "Playfair Display", "body": "Jost"},
    "hero_image": null
  }'::jsonb,
  sections jsonb not null default '{"program": true, "practical": true, "lodging": false, "rsvp": true}'::jsonb,
  access_code text,                            -- code optionnel pour protéger le site
  rsvp_deadline date,
  created_at timestamptz not null default now()
);

create table public.members (
  wedding_id uuid not null references public.weddings on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'editor')),
  primary key (wedding_id, user_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  name text not null,                          -- Cérémonie, Dîner, Brunch...
  starts_at timestamptz,
  place text,
  description text,
  position int not null default 0
);

create table public.households (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  name text not null,                          -- "Famille Martin"
  email text,
  code text not null unique default encode(extensions.gen_random_bytes(5), 'hex'),  -- code d'accès invité
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.lodgings (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  name text not null,                          -- Tipi 1, Chambre 3...
  capacity int not null default 2,
  price_per_person numeric(8,2) not null default 0
);

create table public.seating_tables (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  name text not null,
  capacity int not null default 8
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  household_id uuid references public.households on delete cascade,
  full_name text not null,
  attending boolean,                           -- null = pas encore répondu
  attending_brunch boolean,
  sleeps_on_site boolean,
  diet text,                                   -- végétarien, vegan...
  allergies text,                              -- donnée sensible : consentement requis
  lodging_id uuid references public.lodgings on delete set null,
  lodging_paid boolean not null default false,
  seating_table_id uuid references public.seating_tables on delete set null,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  label text not null,
  kind text not null default 'text' check (kind in ('text', 'yesno', 'choice')),
  choices text[],
  required boolean not null default false,
  position int not null default 0
);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests on delete cascade,
  question_id uuid not null references public.questions on delete cascade,
  value text,
  unique (guest_id, question_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  stripe_session_id text unique,
  plan text not null,
  amount_cents int not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index on public.guests (wedding_id);
create index on public.households (wedding_id);
create index on public.events (wedding_id);

-- ---------- Sécurité : règles par ligne (RLS) ----------

create or replace function public.is_member(w uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where wedding_id = w and user_id = auth.uid());
$$;

alter table public.weddings enable row level security;
alter table public.members enable row level security;
alter table public.events enable row level security;
alter table public.households enable row level security;
alter table public.lodgings enable row level security;
alter table public.seating_tables enable row level security;
alter table public.guests enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.payments enable row level security;

-- Les mariés voient et modifient uniquement leur mariage.
create policy weddings_member on public.weddings for all
  using (public.is_member(id)) with check (public.is_member(id));
create policy members_self on public.members for select using (user_id = auth.uid());

create policy events_member on public.events for all
  using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));
create policy households_member on public.households for all
  using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));
create policy lodgings_member on public.lodgings for all
  using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));
create policy seating_member on public.seating_tables for all
  using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));
create policy guests_member on public.guests for all
  using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));
create policy questions_member on public.questions for all
  using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));
create policy answers_member on public.answers for all
  using (exists (select 1 from public.guests g where g.id = guest_id and public.is_member(g.wedding_id)))
  with check (exists (select 1 from public.guests g where g.id = guest_id and public.is_member(g.wedding_id)));
create policy payments_member on public.payments for select using (public.is_member(wedding_id));

-- Droits d'accès explicites (certains projets Supabase n'exposent plus les nouvelles tables par défaut).
-- Les invités passent par le serveur (service_role) : le rôle anon n'a besoin d'aucune table.
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;

-- Un couple ne peut pas changer lui-même son offre (plan) : seul le webhook Stripe le fait.
revoke update on public.weddings from authenticated;
grant update (couple_names, wedding_date, location, welcome_text, theme, sections, access_code, rsvp_deadline)
  on public.weddings to authenticated;
-- Les paiements sont écrits uniquement par le webhook Stripe.
revoke insert, update, delete on public.payments from authenticated;

-- Les invités n'ont pas de compte : le site public lit et écrit via le serveur
-- de l'application avec la clé "service role" (jamais exposée au navigateur).

-- ---------- Création d'un mariage (le créateur devient propriétaire) ----------

create or replace function public.create_wedding(p_slug text, p_names text)
returns uuid language plpgsql security definer set search_path = public as $$
declare w uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into public.weddings (slug, couple_names) values (p_slug, p_names) returning id into w;
  insert into public.members (wedding_id, user_id, role) values (w, auth.uid(), 'owner');
  insert into public.questions (wedding_id, label, kind, position) values
    (w, 'Serez-vous présent(e) ?', 'yesno', 0),
    (w, 'Allergies ou régime alimentaire ?', 'text', 1),
    (w, 'Serez-vous présent(e) au brunch ?', 'yesno', 2),
    (w, 'Souhaitez-vous dormir sur place ?', 'yesno', 3);
  return w;
end $$;

revoke execute on function public.create_wedding(text, text) from public, anon;
grant execute on function public.create_wedding(text, text) to authenticated;

-- ---------- Suppression des données après le mariage (RGPD) ----------
-- Supprime les mariages dont la date est passée depuis plus de 6 mois.
-- À programmer avec l'extension pg_cron (Database > Extensions) :
--   select cron.schedule('purge-old-weddings', '0 3 * * *', 'select public.purge_old_weddings()');

create or replace function public.purge_old_weddings()
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  delete from public.weddings where wedding_date is not null and wedding_date < (current_date - interval '6 months');
  get diagnostics n = row_count;
  return n;
end $$;
revoke execute on function public.purge_old_weddings() from public, anon, authenticated;
