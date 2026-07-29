-- Cloudflare D1 Database Schema for Thaarakam Store

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    images TEXT NOT NULL, -- JSON array of image URLs
    description TEXT,
    is_featured INTEGER DEFAULT 0 NOT NULL,
    requires_size INTEGER DEFAULT 0 NOT NULL,
    max_size INTEGER,
    custom_sizes TEXT DEFAULT '[]', -- JSON array of available sizes e.g. [5, 8, 9]
    sizes_out_of_stock TEXT DEFAULT '[]', -- JSON array of sizes marked out of stock e.g. [8]
    is_preorder INTEGER DEFAULT 0 NOT NULL,
    availability TEXT DEFAULT 'in_stock' NOT NULL,
    stock_count INTEGER DEFAULT 10,
    created_at TEXT DEFAULT (datetime('now')) NOT NULL
);

-- 2. Store Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    business_name TEXT DEFAULT 'Thaarakam' NOT NULL,
    logo_url TEXT,
    whatsapp_number TEXT DEFAULT '91' NOT NULL,
    store_email TEXT,
    shipping_kerala REAL DEFAULT 50 NOT NULL,
    shipping_south_india REAL DEFAULT 60 NOT NULL,
    shipping_north_india REAL DEFAULT 80 NOT NULL,
    default_description TEXT NOT NULL
);

-- 3. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    reviewer_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    is_verified INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')) NOT NULL
);

-- 4. Paid Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    country TEXT DEFAULT 'India' NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    items TEXT NOT NULL, -- JSON array of purchased items
    subtotal REAL NOT NULL,
    shipping_fee REAL NOT NULL,
    total_amount REAL NOT NULL,
    payment_status TEXT DEFAULT 'paid' NOT NULL,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    shipping_status TEXT DEFAULT 'processing' NOT NULL,
    tracking_number TEXT,
    carrier_name TEXT DEFAULT 'India Post',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')) NOT NULL
);
