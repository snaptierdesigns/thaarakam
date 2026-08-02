-- THAARAKAM SUPABASE SCHEMA & RLS SETUP

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  availability TEXT NOT NULL DEFAULT 'in_stock',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_preorder BOOLEAN NOT NULL DEFAULT false,
  requires_size BOOLEAN NOT NULL DEFAULT false,
  max_size INTEGER,
  stock_count INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  business_name TEXT DEFAULT 'Thaarakam',
  logo_url TEXT,
  announcement_text TEXT,
  instagram_url TEXT,
  whatsapp_number TEXT,
  store_email TEXT,
  shipping_kerala NUMERIC,
  shipping_south_india NUMERIC,
  shipping_north_india NUMERIC,
  default_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. ROW LEVEL SECURITY & POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "All Access Products" ON public.products;
CREATE POLICY "All Access Products" ON public.products FOR ALL USING (true);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Settings" ON public.settings;
CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "All Access Settings" ON public.settings;
CREATE POLICY "All Access Settings" ON public.settings FOR ALL USING (true);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Reviews" ON public.reviews;
CREATE POLICY "Public Insert Reviews" ON public.reviews FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "All Access Reviews" ON public.reviews;
CREATE POLICY "All Access Reviews" ON public.reviews FOR ALL USING (true);
