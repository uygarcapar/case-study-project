-- Uplide Admin Panel — Product image storage setup
-- Run this after 0001_initial_schema.sql

-- 1. Create the public bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,                                                -- public read
  5242880,                                              -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. RLS policies on storage.objects

-- Public read
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select to public
  using (bucket_id = 'product-images');

-- Only full_access can upload
drop policy if exists "product_images_full_access_insert" on storage.objects;
create policy "product_images_full_access_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and public.current_user_role() = 'full_access'
  );

-- Only full_access can update (overwrite)
drop policy if exists "product_images_full_access_update" on storage.objects;
create policy "product_images_full_access_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'product-images'
    and public.current_user_role() = 'full_access'
  );

-- Only full_access can delete
drop policy if exists "product_images_full_access_delete" on storage.objects;
create policy "product_images_full_access_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'product-images'
    and public.current_user_role() = 'full_access'
  );
