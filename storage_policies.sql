-- Storage Policies for 'product-images' bucket in Supabase

-- Enable RLS on storage.objects (if not already enabled)
alter table storage.objects enable row level security;

-- Clean up any existing policies for the 'product-images' bucket
drop policy if exists "Allow public read access to product-images" on storage.objects;
drop policy if exists "Allow public upload access to product-images" on storage.objects;
drop policy if exists "Allow public update access to product-images" on storage.objects;
drop policy if exists "Allow public delete access to product-images" on storage.objects;

-- 1. Select Policy: Allow public read access to any file inside 'product-images'
create policy "Allow public read access to product-images"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

-- 2. Insert Policy: Allow public upload access to 'product-images'
create policy "Allow public upload access to product-images"
  on storage.objects for insert
  with check ( bucket_id = 'product-images' );

-- 3. Update Policy: Allow public replace/update access to files in 'product-images'
create policy "Allow public update access to product-images"
  on storage.objects for update
  using ( bucket_id = 'product-images' );

-- 4. Delete Policy: Allow public delete access to files in 'product-images'
create policy "Allow public delete access to product-images"
  on storage.objects for delete
  using ( bucket_id = 'product-images' );
