-- Bucket public pour les images d'affiches (upload depuis le portail)
-- À exécuter dans Supabase > SQL Editor > Run

insert into storage.buckets (id, name, public)
values ('affiches', 'affiches', true)
on conflict (id) do nothing;

drop policy if exists "affiches public read" on storage.objects;
drop policy if exists "affiches public insert" on storage.objects;
drop policy if exists "affiches public delete" on storage.objects;

create policy "affiches public read"
  on storage.objects for select
  using (bucket_id = 'affiches');

create policy "affiches public insert"
  on storage.objects for insert
  with check (bucket_id = 'affiches');

create policy "affiches public delete"
  on storage.objects for delete
  using (bucket_id = 'affiches');
