-- Create products table
create table if not exists public.products (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    price numeric not null,
    category text not null,
    images text[] default '{}'::text[] not null,
    description text,
    is_featured boolean default false not null,
    requires_size boolean default false not null,
    max_size integer,
    is_preorder boolean default false not null,
    availability text default 'in_stock' not null check (availability in ('in_stock', 'out_of_stock')),
    stock_count integer default 10,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create settings table
create table if not exists public.settings (
    id integer primary key check (id = 1),
    business_name text not null default 'Thaarakam',
    logo_url text,
    whatsapp_number text not null default '910000000000',
    store_email text,
    shipping_kerala numeric not null default 50,
    shipping_south_india numeric not null default 60,
    shipping_north_india numeric not null default 80,
    default_description text not null default 'Details
• Material: 316L Stainless Steel
• Finish: Anti-tarnish, High Polish
• Lightweight & comfortable for all-day wear
• Hypoallergenic & skin-friendly

Care
Avoid harsh chemicals and perfumes.
Wipe gently after use and store in a dry place for extended shine.'
);

-- Insert default settings row if it doesn't exist
insert into public.settings (id, business_name, whatsapp_number)
values (1, 'Thaarakam', '910000000000')
on conflict (id) do nothing;

-- Enable Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.settings enable row level security;

-- Create policies for public read access
create policy "Allow public read access to products"
    on public.products for select
    using (true);

create policy "Allow public read access to settings"
    on public.settings for select
    using (true);

-- Create reviews table
create table if not exists public.reviews (
    id uuid default gen_random_uuid() primary key,
    product_id uuid references public.products(id) on delete cascade not null,
    reviewer_name text not null,
    rating integer not null check (rating >= 1 and rating <= 5),
    comment text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for reviews
alter table public.reviews enable row level security;

-- Create policies for reviews
create policy "Allow public read access to reviews"
    on public.reviews for select
    using (true);

create policy "Allow public insert to reviews"
    on public.reviews for insert
    with check (true);
