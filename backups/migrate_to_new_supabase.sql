-- 1:1 COMPLETE SUPABASE DATABASE MIGRATION SCRIPT
-- RUN THIS ENTIRE SCRIPT IN YOUR NEW SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/qkebwcsyvazjcbukyyvu/sql/new

-- 1. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id INT PRIMARY KEY DEFAULT 1,
  shipping_kerala NUMERIC DEFAULT 50,
  shipping_south_india NUMERIC DEFAULT 60,
  shipping_north_india NUMERIC DEFAULT 80,
  whatsapp_number TEXT DEFAULT '918921356009',
  logo_url TEXT,
  business_name TEXT DEFAULT 'Thaarakam',
  tagline TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  requires_size BOOLEAN DEFAULT false,
  max_size INT,
  available_sizes JSONB DEFAULT '[]'::jsonb,
  out_of_stock_sizes JSONB DEFAULT '[]'::jsonb,
  is_preorder BOOLEAN DEFAULT false,
  availability TEXT DEFAULT 'in_stock',
  stock_count INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_name TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  product_id UUID,
  image_url TEXT,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  pincode TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping_fee NUMERIC NOT NULL,
  grand_total NUMERIC NOT NULL,
  payment_id TEXT,
  razorpay_order_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'pending',
  consignment_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY & POLICIES ON ALL TABLES
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ & INSERT POLICIES
DROP POLICY IF EXISTS "Public Read Settings" ON public.settings;
CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "All Access Settings" ON public.settings;
CREATE POLICY "All Access Settings" ON public.settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "All Access Categories" ON public.categories;
CREATE POLICY "All Access Categories" ON public.categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "All Access Products" ON public.products;
CREATE POLICY "All Access Products" ON public.products FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Reviews" ON public.reviews;
CREATE POLICY "Public Insert Reviews" ON public.reviews FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "All Access Reviews" ON public.reviews;
CREATE POLICY "All Access Reviews" ON public.reviews FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "All Access Orders" ON public.orders;
CREATE POLICY "All Access Orders" ON public.orders FOR ALL USING (true);
