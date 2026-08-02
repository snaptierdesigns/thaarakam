const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const url = 'https://kvgipdvlnpghxzsgxptz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z2lwZHZsbnBnaHh6c2d4cHR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTY3ODM1NywiZXhwIjoyMTAxMjU0MzU3fQ.EDTzTOtaYmg4jSGhnvVhQpAlmpSf25FaKHjtwh0-Fao';

const client = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function seed() {
  console.log('=== STARTING SUPABASE SEEDING ===');
  const backupData = JSON.parse(fs.readFileSync('backups/supabase_backup_2026-07-30T16-18-04-222Z.json', 'utf8'));

  // 1. Settings
  if (backupData.settings && backupData.settings.length > 0) {
    const { error } = await client.from('settings').upsert(backupData.settings);
    if (error) console.error('Error inserting settings:', error.message);
    else console.log('Successfully inserted settings!');
  }

  // 2. Products (Batching 50 rows per request)
  if (backupData.products && backupData.products.length > 0) {
    console.log(`Inserting ${backupData.products.length} products...`);
    const cleanProducts = backupData.products.map(p => ({
      ...p,
      stock_count: (p.stock_count !== null && p.stock_count !== undefined) ? p.stock_count : (p.availability === 'out_of_stock' ? 0 : 10)
    }));

    const chunkSize = 50;
    for (let i = 0; i < cleanProducts.length; i += chunkSize) {
      const chunk = cleanProducts.slice(i, i + chunkSize);
      const { error } = await client.from('products').upsert(chunk);
      if (error) {
        console.error(`Error inserting products batch ${i}:`, error.message);
      } else {
        console.log(`Inserted products ${i + 1} to ${Math.min(i + chunkSize, cleanProducts.length)}`);
      }
    }
  }

  // 3. Reviews
  if (backupData.reviews && backupData.reviews.length > 0) {
    const cleanReviews = backupData.reviews.map(r => ({
      ...r,
      author_name: r.reviewer_name || r.author_name || 'Anonymous'
    }));
    const { error } = await client.from('reviews').upsert(cleanReviews);
    if (error) console.error('Error inserting reviews:', error.message);
    else console.log('Successfully inserted reviews!');
  }

  console.log('=== SEEDING COMPLETE ===');
}

seed();
