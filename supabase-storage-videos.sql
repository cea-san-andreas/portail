-- Bucket public pour les vidéos uploadées (VideosTab)
-- A executer dans Supabase > SQL Editor > Run

insert into storage.buckets (id, name, public)
values ('videos-upload', 'videos-upload', true)
on conflict (id) do nothing;

drop policy if exists "videos-upload public read" on storage.objects;
drop policy if exists "videos-upload public insert" on storage.objects;
drop policy if exists "videos-upload public delete" on storage.objects;

create policy "videos-upload public read"
  on storage.objects for select
  using (bucket_id = 'videos-upload');

create policy "videos-upload public insert"
  on storage.objects for insert
  with check (bucket_id = 'videos-upload');

create policy "videos-upload public delete"
  on storage.objects for delete
  using (bucket_id = 'videos-upload');
