const { createClient } = require('@supabase/supabase-js');

const URL = 'https://kwyrkezwhpgxstytxyaf.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eXJrZXp3aHBneHN0eXR4eWFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg1NTgzNywiZXhwIjoyMTAwNDMxODM3fQ.q2d0Ecxsihjm6xAzgOD_Weu7D77SXMk9hlgiR8Y0-gU';

const supabase = createClient(URL, SERVICE_KEY);

async function setupDatabase() {
  console.log('=== SETTING UP STAGING DATABASE COLUMNS AND TABLES ===');

  // Check if orders table exists by performing a simple select
  const { error: ordersErr } = await supabase.from('orders').select('id').limit(1);

  if (ordersErr) {
    console.log('Notice: Orders table query result:', ordersErr.message);
    console.log('\n--- SQL TO RUN IN SUPABASE SQL EDITOR ---');
    console.log(`
-- 1. Create orders table
create table if not exists public.orders (
    id uuid default gen_random_uuid() primary key,
    order_number text not null unique,
    customer_name text not null,
    customer_phone text not null,
    customer_email text,
    country text default 'India' not null,
    address text not null,
    city text not null,
    state text not null,
    pincode text not null,
    items jsonb not null,
    subtotal numeric not null,
    shipping_fee numeric not null,
    total_amount numeric not null,
    payment_status text default 'paid' not null check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
    razorpay_order_id text,
    razorpay_payment_id text,
    shipping_status text default 'processing' not null check (shipping_status in ('processing', 'shipped', 'delivered', 'cancelled')),
    tracking_number text,
    carrier_name text default 'India Post',
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS and public policies for orders
alter table public.orders enable row level security;
create policy "Allow public insert to orders" on public.orders for insert with check (true);
create policy "Allow public read access to orders" on public.orders for select using (true);
create policy "Allow service role full access to orders" on public.orders for all using (true);

-- 2. Add size customization columns to products
alter table public.products add column if not exists custom_sizes integer[] default '{}'::integer[];
alter table public.products add column if not exists sizes_out_of_stock integer[] default '{}'::integer[];
    `);
  } else {
    console.log('Orders table already exists and is accessible!');
  }

  // Check if products table has custom_sizes column
  const { data: sampleProduct } = await supabase.from('products').select('*').limit(1);
  if (sampleProduct && sampleProduct[0]) {
    console.log('Sample Product Columns:', Object.keys(sampleProduct[0]));
  }
}

setupDatabase();
