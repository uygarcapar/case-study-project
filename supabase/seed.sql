-- Uplide Admin Panel — Seed Data
-- Users must be created via Supabase Auth dashboard first:
--   admin@uplide.test  (will be promoted to full_access)
--   reader@uplide.test (stays as reader)
-- After both users are created, run this script in the SQL editor.

-- Promote admin to full_access
update public.profiles
set role = 'full_access'
where email = 'admin@uplide.test';

-- Clear any previous seed (idempotent re-run)
truncate table public.products restart identity cascade;
truncate table public.customers restart identity cascade;

-- Sample products (50 rows). Photos use picsum.photos deterministic seeds — always render.
insert into public.products (name, description, category, price, stock, status, image_url)
values
  ('{"tr":"Kahve Çekirdeği 1kg","en":"Coffee Beans 1kg"}', '{"tr":"Orta kavurma Arabica","en":"Medium roast Arabica"}', 'food', 549.90, 120, 'active', 'https://picsum.photos/seed/uplide-1/600/600'),
  ('{"tr":"El Yapımı Seramik Kupa","en":"Handmade Ceramic Mug"}', '{"tr":"Mat siyah, 350ml","en":"Matte black, 350ml"}', 'home', 189.00, 64, 'active', 'https://picsum.photos/seed/uplide-2/600/600'),
  ('{"tr":"Kablosuz Mouse","en":"Wireless Mouse"}', '{"tr":"Bluetooth 5.2","en":"Bluetooth 5.2"}', 'electronics', 749.00, 35, 'active', 'https://picsum.photos/seed/uplide-3/600/600'),
  ('{"tr":"Spor Çantası","en":"Sports Bag"}', '{"tr":"40L kapasiteli","en":"40L capacity"}', 'sports', 459.50, 22, 'active', 'https://picsum.photos/seed/uplide-4/600/600'),
  ('{"tr":"Bambu Diş Fırçası","en":"Bamboo Toothbrush"}', '{"tr":"4''lü paket","en":"Pack of 4"}', 'home', 89.90, 250, 'active', 'https://picsum.photos/seed/uplide-5/600/600'),
  ('{"tr":"Mekanik Klavye","en":"Mechanical Keyboard"}', '{"tr":"75% layout","en":"75% layout"}', 'electronics', 2999.00, 8, 'active', 'https://picsum.photos/seed/uplide-6/600/600'),
  ('{"tr":"Yoga Matı","en":"Yoga Mat"}', '{"tr":"6mm, kaymaz","en":"6mm, non-slip"}', 'sports', 329.00, 4, 'active', 'https://picsum.photos/seed/uplide-7/600/600'),
  ('{"tr":"Organik Bal 500g","en":"Organic Honey 500g"}', '{"tr":"Kekik balı","en":"Thyme honey"}', 'food', 299.00, 0, 'archived', 'https://picsum.photos/seed/uplide-8/600/600'),
  ('{"tr":"USB-C Şarj Kablosu","en":"USB-C Cable"}', '{"tr":"1.5m, hızlı şarj","en":"1.5m, fast charging"}', 'electronics', 149.00, 180, 'active', 'https://picsum.photos/seed/uplide-9/600/600'),
  ('{"tr":"Çiçek Saksısı","en":"Flower Pot"}', '{"tr":"Terracotta 20cm","en":"Terracotta 20cm"}', 'home', 79.50, 90, 'draft', 'https://picsum.photos/seed/uplide-10/600/600'),
  ('{"tr":"Bluetooth Hoparlör","en":"Bluetooth Speaker"}', '{"tr":"IPX7 su geçirmez","en":"IPX7 waterproof"}', 'electronics', 1299.00, 18, 'active', 'https://picsum.photos/seed/uplide-11/600/600'),
  ('{"tr":"Yün Battaniye","en":"Wool Blanket"}', '{"tr":"150x200cm","en":"150x200cm"}', 'home', 899.00, 27, 'active', 'https://picsum.photos/seed/uplide-12/600/600'),
  ('{"tr":"Koşu Ayakkabısı","en":"Running Shoes"}', '{"tr":"Hafif, nefes alır","en":"Lightweight, breathable"}', 'sports', 1499.00, 12, 'active', 'https://picsum.photos/seed/uplide-13/600/600'),
  ('{"tr":"Zeytinyağı 1L","en":"Olive Oil 1L"}', '{"tr":"Soğuk sıkım, organik","en":"Cold-pressed, organic"}', 'food', 399.00, 75, 'active', 'https://picsum.photos/seed/uplide-14/600/600'),
  ('{"tr":"Akıllı Saat","en":"Smart Watch"}', '{"tr":"GPS + nabız","en":"GPS + heart rate"}', 'electronics', 4299.00, 6, 'active', 'https://picsum.photos/seed/uplide-15/600/600'),
  ('{"tr":"Pamuklu Havlu Seti","en":"Cotton Towel Set"}', '{"tr":"3''lü set","en":"Set of 3"}', 'home', 249.00, 140, 'active', 'https://picsum.photos/seed/uplide-16/600/600'),
  ('{"tr":"Mat Yoga Bloku","en":"Yoga Block"}', '{"tr":"EVA köpük","en":"EVA foam"}', 'sports', 119.00, 60, 'active', 'https://picsum.photos/seed/uplide-17/600/600'),
  ('{"tr":"Filtre Kahve Makinesi","en":"Drip Coffee Maker"}', '{"tr":"1.2L kapasite","en":"1.2L capacity"}', 'electronics', 1799.00, 14, 'active', 'https://picsum.photos/seed/uplide-18/600/600'),
  ('{"tr":"Çikolata Kaplı Fındık","en":"Chocolate Covered Hazelnut"}', '{"tr":"200g paket","en":"200g pack"}', 'food', 89.00, 200, 'active', 'https://picsum.photos/seed/uplide-19/600/600'),
  ('{"tr":"Deri Cüzdan","en":"Leather Wallet"}', '{"tr":"Hakiki deri","en":"Genuine leather"}', 'accessories', 649.00, 32, 'active', 'https://picsum.photos/seed/uplide-20/600/600'),
  ('{"tr":"Termos 500ml","en":"Thermos 500ml"}', '{"tr":"24 saat sıcak","en":"24h hot"}', 'home', 219.00, 48, 'active', 'https://picsum.photos/seed/uplide-21/600/600'),
  ('{"tr":"HDMI Kablo 2m","en":"HDMI Cable 2m"}', '{"tr":"4K destekli","en":"4K supported"}', 'electronics', 79.00, 320, 'active', 'https://picsum.photos/seed/uplide-22/600/600'),
  ('{"tr":"Dağ Bisikleti","en":"Mountain Bike"}', '{"tr":"21 vites","en":"21 speed"}', 'sports', 8499.00, 3, 'active', 'https://picsum.photos/seed/uplide-23/600/600'),
  ('{"tr":"Kuru Yemiş Karışımı","en":"Mixed Nuts"}', '{"tr":"500g","en":"500g"}', 'food', 229.00, 110, 'active', 'https://picsum.photos/seed/uplide-24/600/600'),
  ('{"tr":"Masaüstü Lamba","en":"Desk Lamp"}', '{"tr":"LED, kısılabilir","en":"LED, dimmable"}', 'home', 449.00, 25, 'active', 'https://picsum.photos/seed/uplide-25/600/600'),
  ('{"tr":"Tablet Kılıfı","en":"Tablet Case"}', '{"tr":"10.9 inç","en":"10.9 inch"}', 'accessories', 199.00, 87, 'active', 'https://picsum.photos/seed/uplide-26/600/600'),
  ('{"tr":"Kano Küreği","en":"Kayak Paddle"}', '{"tr":"Karbon fiber","en":"Carbon fiber"}', 'sports', 1899.00, 5, 'draft', 'https://picsum.photos/seed/uplide-27/600/600'),
  ('{"tr":"Beyaz Çay 100g","en":"White Tea 100g"}', '{"tr":"Çin menşeli","en":"Sourced from China"}', 'food', 459.00, 40, 'active', 'https://picsum.photos/seed/uplide-28/600/600'),
  ('{"tr":"Kablosuz Kulaklık","en":"Wireless Earbuds"}', '{"tr":"ANC, 30 saat","en":"ANC, 30h"}', 'electronics', 2199.00, 21, 'active', 'https://picsum.photos/seed/uplide-29/600/600'),
  ('{"tr":"Mum Seti","en":"Candle Set"}', '{"tr":"Lavanta kokulu","en":"Lavender scented"}', 'home', 159.00, 95, 'active', 'https://picsum.photos/seed/uplide-30/600/600'),
  ('{"tr":"Yürüyüş Sopası","en":"Trekking Pole"}', '{"tr":"Ayarlanabilir","en":"Adjustable"}', 'sports', 379.00, 16, 'active', 'https://picsum.photos/seed/uplide-31/600/600'),
  ('{"tr":"Kurutulmuş Meyve","en":"Dried Fruit Mix"}', '{"tr":"300g","en":"300g"}', 'food', 129.00, 180, 'active', 'https://picsum.photos/seed/uplide-32/600/600'),
  ('{"tr":"Powerbank 20000mAh","en":"Powerbank 20000mAh"}', '{"tr":"Hızlı şarj","en":"Fast charging"}', 'electronics', 549.00, 53, 'active', 'https://picsum.photos/seed/uplide-33/600/600'),
  ('{"tr":"Şemsiye","en":"Umbrella"}', '{"tr":"Otomatik açılır","en":"Auto open"}', 'accessories', 179.00, 70, 'active', 'https://picsum.photos/seed/uplide-34/600/600'),
  ('{"tr":"Yatak Çarşafı","en":"Bed Sheet"}', '{"tr":"%100 pamuk","en":"100% cotton"}', 'home', 359.00, 42, 'active', 'https://picsum.photos/seed/uplide-35/600/600'),
  ('{"tr":"Tenis Raketi","en":"Tennis Racket"}', '{"tr":"Profesyonel","en":"Professional"}', 'sports', 2299.00, 9, 'active', 'https://picsum.photos/seed/uplide-36/600/600'),
  ('{"tr":"Kakao Tozu 500g","en":"Cocoa Powder 500g"}', '{"tr":"Şekersiz","en":"Unsweetened"}', 'food', 179.00, 130, 'active', 'https://picsum.photos/seed/uplide-37/600/600'),
  ('{"tr":"Webcam 1080p","en":"Webcam 1080p"}', '{"tr":"Otomatik fokus","en":"Auto focus"}', 'electronics', 899.00, 19, 'active', 'https://picsum.photos/seed/uplide-38/600/600'),
  ('{"tr":"Güneş Gözlüğü","en":"Sunglasses"}', '{"tr":"UV400 koruma","en":"UV400 protection"}', 'accessories', 499.00, 38, 'active', 'https://picsum.photos/seed/uplide-39/600/600'),
  ('{"tr":"Mutfak Bıçak Seti","en":"Kitchen Knife Set"}', '{"tr":"5 parça","en":"5 piece"}', 'home', 999.00, 14, 'active', 'https://picsum.photos/seed/uplide-40/600/600'),
  ('{"tr":"Boks Eldiveni","en":"Boxing Gloves"}', '{"tr":"12oz","en":"12oz"}', 'sports', 649.00, 17, 'active', 'https://picsum.photos/seed/uplide-41/600/600'),
  ('{"tr":"Granola 750g","en":"Granola 750g"}', '{"tr":"Ballı, fındıklı","en":"Honey, nuts"}', 'food', 159.00, 88, 'active', 'https://picsum.photos/seed/uplide-42/600/600'),
  ('{"tr":"Monitor 27\"","en":"Monitor 27\""}', '{"tr":"4K, IPS","en":"4K, IPS"}', 'electronics', 7499.00, 7, 'active', 'https://picsum.photos/seed/uplide-43/600/600'),
  ('{"tr":"Şapka","en":"Hat"}', '{"tr":"Pamuklu","en":"Cotton"}', 'accessories', 149.00, 120, 'active', 'https://picsum.photos/seed/uplide-44/600/600'),
  ('{"tr":"Yastık","en":"Pillow"}', '{"tr":"Memory foam","en":"Memory foam"}', 'home', 329.00, 55, 'active', 'https://picsum.photos/seed/uplide-45/600/600'),
  ('{"tr":"Yüzme Gözlüğü","en":"Swim Goggles"}', '{"tr":"Buğu önleyici","en":"Anti-fog"}', 'sports', 219.00, 44, 'active', 'https://picsum.photos/seed/uplide-46/600/600'),
  ('{"tr":"Çiğ Badem 500g","en":"Raw Almonds 500g"}', '{"tr":"California","en":"California"}', 'food', 289.00, 100, 'active', 'https://picsum.photos/seed/uplide-47/600/600'),
  ('{"tr":"Mouse Pad XL","en":"Mouse Pad XL"}', '{"tr":"90x40cm","en":"90x40cm"}', 'electronics', 199.00, 230, 'active', 'https://picsum.photos/seed/uplide-48/600/600'),
  ('{"tr":"Kemer","en":"Belt"}', '{"tr":"Hakiki deri","en":"Genuine leather"}', 'accessories', 299.00, 65, 'active', 'https://picsum.photos/seed/uplide-49/600/600'),
  ('{"tr":"Halı 160x230","en":"Rug 160x230"}', '{"tr":"Geometrik desen","en":"Geometric pattern"}', 'home', 1899.00, 11, 'active', 'https://picsum.photos/seed/uplide-50/600/600');

-- Sample customers (40 rows)
insert into public.customers (full_name, email, phone, city, status, total_orders)
values
  ('Ayşe Yılmaz', 'ayse@example.com', '+90 532 123 4567', 'İstanbul', 'active', 12),
  ('Mehmet Demir', 'mehmet@example.com', '+90 535 987 6543', 'Ankara', 'active', 8),
  ('Zeynep Kaya', 'zeynep@example.com', '+90 533 222 4455', 'İzmir', 'active', 3),
  ('Can Aydın', 'can@example.com', '+90 530 111 2233', 'Bursa', 'inactive', 1),
  ('Elif Şahin', 'elif@example.com', '+90 537 555 6677', 'Antalya', 'active', 22),
  ('Burak Öztürk', 'burak@example.com', '+90 538 333 7788', 'İstanbul', 'active', 5),
  ('Selin Arslan', 'selin@example.com', '+90 539 444 9900', 'Eskişehir', 'active', 0),
  ('Emre Çetin', 'emre@example.com', '+90 531 666 1122', 'Konya', 'inactive', 2),
  ('Deniz Polat', 'deniz@example.com', '+90 532 200 3344', 'İstanbul', 'active', 17),
  ('Murat Kurt', 'murat@example.com', '+90 535 700 1188', 'Ankara', 'active', 9),
  ('Buse Eren', 'buse@example.com', '+90 533 800 2299', 'İzmir', 'active', 14),
  ('Onur Yıldız', 'onur@example.com', '+90 530 900 3377', 'Trabzon', 'active', 4),
  ('Ece Aksoy', 'ece@example.com', '+90 537 100 4455', 'Antalya', 'active', 11),
  ('Kerem Doğan', 'kerem@example.com', '+90 538 200 5566', 'Adana', 'inactive', 0),
  ('Merve Koç', 'merve@example.com', '+90 539 300 6677', 'İstanbul', 'active', 28),
  ('Tolga Şen', 'tolga@example.com', '+90 531 400 7788', 'Gaziantep', 'active', 6),
  ('Yağmur Acar', 'yagmur@example.com', '+90 532 500 8899', 'Bursa', 'active', 19),
  ('Ahmet Tan', 'ahmet@example.com', '+90 535 600 9911', 'Ankara', 'active', 7),
  ('Pınar Güneş', 'pinar@example.com', '+90 533 700 1022', 'Mersin', 'active', 13),
  ('Hakan Kara', 'hakan@example.com', '+90 530 800 2133', 'İstanbul', 'inactive', 1),
  ('Sude Yalçın', 'sude@example.com', '+90 537 900 3244', 'İzmir', 'active', 25),
  ('Berk Erdem', 'berk@example.com', '+90 538 110 4355', 'Konya', 'active', 5),
  ('Naz Çelik', 'naz@example.com', '+90 539 220 5466', 'Antalya', 'active', 16),
  ('Cem Bozkurt', 'cem@example.com', '+90 531 330 6577', 'İstanbul', 'active', 10),
  ('Damla Yurt', 'damla@example.com', '+90 532 440 7688', 'Kayseri', 'active', 8),
  ('Furkan Avcı', 'furkan@example.com', '+90 535 550 8799', 'Diyarbakır', 'active', 3),
  ('Gizem Köse', 'gizem@example.com', '+90 533 660 9810', 'İstanbul', 'active', 21),
  ('Mert Şimşek', 'mert@example.com', '+90 530 770 1922', 'Sakarya', 'inactive', 2),
  ('İrem Bulut', 'irem@example.com', '+90 537 880 3044', 'İzmir', 'active', 15),
  ('Serkan Kılıç', 'serkan@example.com', '+90 538 990 4155', 'Ankara', 'active', 6),
  ('Aslı Korkmaz', 'asli@example.com', '+90 539 100 5266', 'Bursa', 'active', 18),
  ('Barış Özkan', 'baris@example.com', '+90 531 210 6377', 'İstanbul', 'active', 9),
  ('Cansu Tekin', 'cansu@example.com', '+90 532 320 7488', 'Eskişehir', 'active', 23),
  ('Doruk Yılmaz', 'doruk@example.com', '+90 535 430 8599', 'Antalya', 'active', 4),
  ('Esra Aydın', 'esra@example.com', '+90 533 540 9600', 'İstanbul', 'inactive', 1),
  ('Gökhan Demir', 'gokhan@example.com', '+90 530 650 0711', 'Trabzon', 'active', 12),
  ('Hande Kara', 'hande@example.com', '+90 537 760 1822', 'Ankara', 'active', 30),
  ('Kaan Erkan', 'kaan@example.com', '+90 538 870 2933', 'İzmir', 'active', 7),
  ('Lale Çakır', 'lale@example.com', '+90 539 980 3144', 'İstanbul', 'active', 14),
  ('Yiğit Aslan', 'yigit@example.com', '+90 531 090 4255', 'Bursa', 'active', 5);
