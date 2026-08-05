-- THAARAKAM DATABASE MIGRATION SCRIPT
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/kvgipdvlnpghxzsgxptz/sql/new)

-- 1. CREATE ORDERS TABLE
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

-- 2. ENABLE ROW LEVEL SECURITY & POLICIES FOR ORDERS TABLE
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "All Access Orders" ON public.orders;
CREATE POLICY "All Access Orders" ON public.orders FOR ALL USING (true);

-- 3. ADD FLEXIBLE SIZES AND OUT-OF-STOCK SIZES COLUMNS TO PRODUCTS TABLE
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS available_sizes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS out_of_stock_sizes JSONB DEFAULT '[]'::jsonb;
