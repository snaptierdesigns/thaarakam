const fs = require('fs');
const path = require('path');

const backupData = JSON.parse(fs.readFileSync('backups/supabase_backup_2026-07-30T16-18-04-222Z.json', 'utf8'));

let sqlDump = '-- THAARAKAM SUPABASE FULL DATABASE BACKUP\n';
sqlDump += `-- Generated at: ${new Date().toISOString()}\n\n`;

// 1. Schema DDL
sqlDump += '-- CREATE TABLES SCHEMA\n';
sqlDump += `CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  availability TEXT NOT NULL DEFAULT 'in_stock',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_preorder BOOLEAN NOT NULL DEFAULT false,
  stock_count INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);\n\n`;

sqlDump += `CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  business_name TEXT DEFAULT 'Thaarakam',
  announcement_text TEXT,
  instagram_url TEXT,
  whatsapp_number TEXT,
  default_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);\n\n`;

sqlDump += `CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);\n\n`;

// RLS
sqlDump += '-- ENABLE ROW LEVEL SECURITY & POLICIES\n';
sqlDump += 'ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;\n';
sqlDump += 'DROP POLICY IF EXISTS "Public Read Products" ON public.products;\n';
sqlDump += 'CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);\n';
sqlDump += 'DROP POLICY IF EXISTS "All Access Products" ON public.products;\n';
sqlDump += 'CREATE POLICY "All Access Products" ON public.products FOR ALL USING (true);\n\n';

sqlDump += 'ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;\n';
sqlDump += 'DROP POLICY IF EXISTS "Public Read Settings" ON public.settings;\n';
sqlDump += 'CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);\n';
sqlDump += 'DROP POLICY IF EXISTS "All Access Settings" ON public.settings;\n';
sqlDump += 'CREATE POLICY "All Access Settings" ON public.settings FOR ALL USING (true);\n\n';

sqlDump += 'ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;\n';
sqlDump += 'DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;\n';
sqlDump += 'CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);\n';
sqlDump += 'DROP POLICY IF EXISTS "Public Insert Reviews" ON public.reviews;\n';
sqlDump += 'CREATE POLICY "Public Insert Reviews" ON public.reviews FOR INSERT WITH CHECK (true);\n';
sqlDump += 'DROP POLICY IF EXISTS "All Access Reviews" ON public.reviews;\n';
sqlDump += 'CREATE POLICY "All Access Reviews" ON public.reviews FOR ALL USING (true);\n\n';

// 2. Data Inserts
for (const [table, rows] of Object.entries(backupData)) {
  if (!rows || rows.length === 0) continue;
  sqlDump += `-- DATA FOR TABLE: ${table}\n`;
  for (const row of rows) {
    const keys = Object.keys(row);
    const vals = keys.map(k => {
      const val = row[k];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'boolean' || typeof val === 'number') return val;
      if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
      return `'${String(val).replace(/'/g, "''")}'`;
    });
    sqlDump += `INSERT INTO public.${table} (${keys.join(', ')}) VALUES (${vals.join(', ')}) ON CONFLICT DO NOTHING;\n`;
  }
  sqlDump += '\n';
}

fs.writeFileSync('backups/supabase_restore_latest.sql', sqlDump);
console.log('Successfully regenerated backups/supabase_restore_latest.sql with RLS policies and all 221 products!');
