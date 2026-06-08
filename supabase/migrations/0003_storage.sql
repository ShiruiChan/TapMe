-- ============================================================
-- TapMe v2 — Storage Buckets
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- владелец папки avatars/{user_id}/ может загружать/обновлять/удалять
create policy "avatar_upload_own" on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar_update_own" on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar_delete_own" on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- публичное чтение аватаров (bucket public=true достаточно, но явная политика — хорошая практика)
create policy "avatar_read_all" on storage.objects for select
  using (bucket_id = 'avatars');
