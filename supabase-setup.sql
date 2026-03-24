-- ====================================
-- CEA Portal — Tables Supabase
-- Copie-colle ce SQL dans Supabase > SQL Editor > New Query > Run
-- ====================================

-- 1. Documents
create table public.documents (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  category text,
  type text,
  status text default 'Actif',
  tags text[] default '{}',
  link text,
  description text,
  contact text,
  important boolean default false,
  updated_at timestamptz default now()
);

-- 2. Associations
create table public.associations (
  id text primary key default gen_random_uuid()::text,
  nom text not null,
  date_creation text,
  president text,
  vice_president text,
  tresorier text,
  telephone text,
  siege text,
  contrat text,
  lien_contrat text,
  statut text default 'Actif',
  notes text
);

-- 3. Vidéos
create table public.videos (
  id text primary key default gen_random_uuid()::text,
  titre text not null,
  url text not null,
  description text,
  categorie text default 'Général',
  date_ajout text
);

-- 4. Comptabilité (semaine courante)
create table public.comptabilite (
  id text primary key default gen_random_uuid()::text,
  libelle text not null,
  montant numeric default 0,
  type text default 'Dépense',
  categorie text default 'Général',
  date text,
  notes text,
  date_ajout text,
  week_start text
);

-- 5. Comptabilité archives
create table public.comptabilite_archives (
  id text primary key default gen_random_uuid()::text,
  week_start text not null,
  week_label text,
  items jsonb default '[]',
  total_depenses numeric default 0,
  total_recettes numeric default 0
);

-- 6. Événements
create table public.evenements (
  id text primary key default gen_random_uuid()::text,
  titre text not null,
  date text,
  heure text,
  lieu text,
  description text,
  organisateur text,
  statut text default 'À venir',
  budget text,
  participants text
);

-- 7. Idées
create table public.idees (
  id text primary key default gen_random_uuid()::text,
  titre text not null,
  contenu text,
  categorie text default 'Général',
  priorite text default 'Normale',
  date_ajout text
);

-- 8. Affiches
create table public.affiches (
  id text primary key default gen_random_uuid()::text,
  titre text not null,
  image_url text not null,
  description text,
  evenement text,
  auteur text,
  date_ajout text
);

-- 9. Stockage (listes)
create table public.stockage_listes (
  id text primary key default gen_random_uuid()::text,
  titre text not null,
  description text,
  couleur text default 'blue',
  items jsonb default '[]',
  created_at timestamptz default now()
);

-- 10. Location matériels
create table public.location_materiels (
  id text primary key default gen_random_uuid()::text,
  nom text not null,
  categorie text default ‘Mobilier’,
  quantite integer default 1,
  etat text default ‘Bon état’,
  description text,
  prix_unitaire numeric default 0
);

-- 11. Location réservations
create table public.location_reservations (
  id text primary key default gen_random_uuid()::text,
  materiel_id text,
  materiel_nom text,
  emprunteur text not null,
  evenement text,
  date_debut text,
  date_fin text,
  quantite integer default 1,
  prix_total numeric default 0,
  statut text default ‘En attente’,
  notes text
);

-- Activer RLS mais autoriser tout (accès public pour l'instant)
alter table public.documents enable row level security;
alter table public.associations enable row level security;
alter table public.videos enable row level security;
alter table public.comptabilite enable row level security;
alter table public.comptabilite_archives enable row level security;
alter table public.evenements enable row level security;
alter table public.idees enable row level security;
alter table public.affiches enable row level security;
alter table public.stockage_listes enable row level security;
alter table public.location_materiels enable row level security;
alter table public.location_reservations enable row level security;

-- Policies : accès complet pour tous (anon)
create policy "allow all" on public.documents for all using (true) with check (true);
create policy "allow all" on public.associations for all using (true) with check (true);
create policy "allow all" on public.videos for all using (true) with check (true);
create policy "allow all" on public.comptabilite for all using (true) with check (true);
create policy "allow all" on public.comptabilite_archives for all using (true) with check (true);
create policy "allow all" on public.evenements for all using (true) with check (true);
create policy "allow all" on public.idees for all using (true) with check (true);
create policy "allow all" on public.affiches for all using (true) with check (true);
create policy "allow all" on public.stockage_listes for all using (true) with check (true);
create policy "allow all" on public.location_materiels for all using (true) with check (true);
create policy "allow all" on public.location_reservations for all using (true) with check (true);
