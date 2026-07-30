const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const url = 'https://kwyrkezwhpgxstytxyaf.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eXJrZXp3aHBneHN0eXR4eWFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg1NTgzNywiZXhwIjoyMTAwNDMxODM3fQ.q2d0Ecxsihjm6xAzgOD_Weu7D77SXMk9hlgiR8Y0-gU';

const adminClient = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function backupAll() {
  console.log('=== STARTING FULL SUPABASE BACKUP ===');

  const tables = ['products', 'settings', 'reviews', 'orders'];
  const fullData = {};

  for (const table of tables) {
    try {
      const { data, error } = await adminClient.from(table).select('*');
      if (error) {
        console.warn(`Warning fetching table ${table}:`, error.message);
        fullData[table] = [];
      } else {
        fullData[table] = data || [];
        console.log(`Successfully backed up table "${table}": ${fullData[table].length} records.`);
      }
    } catch (err) {
      console.error(`Error on table ${table}:`, err);
      fullData[table] = [];
    }
  }

  // Ensure backups folder exists
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(backupDir, `supabase_backup_${timestamp}.json`);
  const latestJsonPath = path.join(backupDir, 'supabase_backup_latest.json');

  fs.writeFileSync(jsonPath, JSON.stringify(fullData, null, 2));
  fs.writeFileSync(latestJsonPath, JSON.stringify(fullData, null, 2));

  // Generate runnable SQL dump
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

  // 2. Data Inserts
  for (const [table, rows] of Object.entries(fullData)) {
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

  const sqlPath = path.join(backupDir, `supabase_restore_${timestamp}.sql`);
  const latestSqlPath = path.join(backupDir, 'supabase_restore_latest.sql');

  fs.writeFileSync(sqlPath, sqlDump);
  fs.writeFileSync(latestSqlPath, sqlDump);

  console.log('Saved JSON Backup:', jsonPath);
  console.log('Saved SQL Restore Dump:', sqlPath);
  console.log('=== FULL SUPABASE BACKUP COMPLETED SUCCESSFULLY ===');
}

backupAll();
