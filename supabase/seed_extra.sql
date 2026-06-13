-- Uplide Admin Panel — Additional seed data
-- Run AFTER 0001_initial_schema.sql, 0002_storage_setup.sql, and seed.sql.
-- This batch leaves image_url NULL so the new Storage upload UI can be exercised.

-- Sample products (no images — admin will upload via UI)
insert into public.products (name, description, category, price, stock, status, image_url)
values
  ('{"tr":"Ahşap Defter A5","en":"Wooden Notebook A5"}',
   '{"tr":"El yapımı kapak, 120 sayfa","en":"Handmade cover, 120 pages"}',
   'other', 169.50, 75, 'active', null),
  ('{"tr":"Kablosuz Kulaklık","en":"Wireless Headphones"}',
   '{"tr":"Aktif gürültü engelleme","en":"Active noise cancellation"}',
   'electronics', 3499.00, 18, 'active', null),
  ('{"tr":"Koşu Ayakkabısı","en":"Running Shoes"}',
   '{"tr":"Hafif, yastıklı taban","en":"Lightweight cushioned sole"}',
   'sports', 1899.00, 27, 'active', null),
  ('{"tr":"Termos Şişe 750ml","en":"Thermos Bottle 750ml"}',
   '{"tr":"24 saat sıcak/soğuk","en":"24h hot/cold"}',
   'home', 249.90, 142, 'active', null),
  ('{"tr":"Akıllı Saat","en":"Smart Watch"}',
   '{"tr":"GPS + kalp ritmi","en":"GPS + heart rate"}',
   'electronics', 4250.00, 12, 'active', null),
  ('{"tr":"Cam Çay Demliği","en":"Glass Tea Pot"}',
   '{"tr":"800ml, ısıya dayanıklı","en":"800ml, heat resistant"}',
   'home', 219.00, 48, 'active', null),
  ('{"tr":"Pamuklu T-Shirt","en":"Cotton T-Shirt"}',
   '{"tr":"%100 organik pamuk","en":"100% organic cotton"}',
   'fashion', 299.00, 96, 'active', null),
  ('{"tr":"Vegan Bitter Çikolata","en":"Vegan Dark Chocolate"}',
   '{"tr":"%80 kakao, 100g","en":"80% cocoa, 100g"}',
   'food', 64.50, 0, 'archived', null),
  ('{"tr":"Çatal Bıçak Seti 24''lü","en":"Cutlery Set 24pcs"}',
   '{"tr":"Paslanmaz çelik","en":"Stainless steel"}',
   'home', 1299.00, 6, 'draft', null),
  ('{"tr":"Bluetooth Hoparlör","en":"Bluetooth Speaker"}',
   '{"tr":"IPX7 su geçirmez","en":"IPX7 waterproof"}',
   'electronics', 899.00, 33, 'active', null);

-- Sample customers (realistic emails, not @example.com)
insert into public.customers (full_name, email, phone, city, status, total_orders)
values
  ('Pınar Yıldız', 'pinar.yildiz@gmail.com', '+90 532 411 8821', 'İstanbul', 'active', 17),
  ('Onur Kara', 'onur.kara91@outlook.com', '+90 535 762 1144', 'Ankara', 'active', 9),
  ('Selin Doğan', 'sdogan@yahoo.com', '+90 533 990 5566', 'İzmir', 'active', 4),
  ('Berk Tekin', 'berk.tekin@hotmail.com', '+90 530 223 8800', 'Bursa', 'inactive', 1),
  ('Ceren Aksoy', 'c.aksoy@gmail.com', '+90 537 110 4477', 'Antalya', 'active', 31),
  ('Hakan Polat', 'hakan@protonmail.com', '+90 538 668 2299', 'İstanbul', 'active', 6),
  ('Damla Erdem', 'damla.erdem@icloud.com', '+90 539 445 7711', 'Eskişehir', 'active', 0),
  ('Tolga Şimşek', 'tolga.simsek@gmail.com', '+90 531 887 3322', 'Konya', 'inactive', 3),
  ('Esra Korkmaz', 'esra.korkmaz@gmail.com', '+90 534 119 6655', 'Trabzon', 'active', 14),
  ('Mert Avcı', 'mert.avci@outlook.com', '+90 536 332 9988', 'Mersin', 'active', 11);
