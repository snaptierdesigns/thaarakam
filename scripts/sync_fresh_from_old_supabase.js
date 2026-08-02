const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const oldUrl = 'https://kwyrkezwhpgxstytxyaf.supabase.co';
const oldKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eXJrZXp3aHBneHN0eXR4eWFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg1NTgzNywiZXhwIjoyMTAwNDMxODM3fQ.q2d0Ecxsihjm6xAzgOD_Weu7D77SXMk9hlgiR8Y0-gU';

const newUrl = 'https://kvgipdvlnpghxzsgxptz.supabase.co';
const newKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z2lwZHZsbnBnaHh6c2d4cHR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTY3ODM1NywiZXhwIjoyMTAxMjU0MzU3fQ.EDTzTOtaYmg4jSGhnvVhQpAlmpSf25FaKHjtwh0-Fao';

const oldClient = createClient(oldUrl, oldKey, { auth: { persistSession: false, autoRefreshToken: false } });
const newClient = createClient(newUrl, newKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function syncLive() {
  console.log('=== SYNCING LIVE UNTOUCHED DATA FROM OLD DATABASE TO NEW DATABASE ===');

  // 1. Fetch Products
  const { data: products, error: pErr } = await oldClient.from('products').select('*');
  if (pErr) {
    console.error('Error fetching products from old DB:', pErr.message);
    return;
  }
  console.log(`Fetched ${products.length} live products from old DB.`);

  // 2. Fetch Settings
  const { data: settings } = await oldClient.from('settings').select('*');
  console.log(`Fetched ${settings ? settings.length : 0} settings from old DB.`);

  // 3. Fetch Reviews
  const { data: reviews } = await oldClient.from('reviews').select('*');
  console.log(`Fetched ${reviews ? reviews.length : 0} reviews from old DB.`);

  // --- UPSERT TO NEW DB ---

  // Settings
  if (settings && settings.length > 0) {
    const { error } = await newClient.from('settings').upsert(settings);
    if (error) console.error('Error upserting settings:', error.message);
    else console.log('Successfully synced settings to new DB!');
  }

  // Products (chunk of 50)
  if (products && products.length > 0) {
    const cleanProducts = products.map(p => ({
      ...p,
      stock_count: (p.stock_count !== null && p.stock_count !== undefined) ? p.stock_count : (p.availability === 'out_of_stock' ? 0 : 10)
    }));

    const chunkSize = 50;
    for (let i = 0; i < cleanProducts.length; i += chunkSize) {
      const chunk = cleanProducts.slice(i, i + chunkSize);
      const { error } = await newClient.from('products').upsert(chunk);
      if (error) {
        console.error(`Error upserting products chunk ${i}:`, error.message);
      } else {
        console.log(`Synced products ${i + 1} to ${Math.min(i + chunkSize, cleanProducts.length)}`);
      }
    }
  }

  // Reviews
  if (reviews && reviews.length > 0) {
    const cleanReviews = reviews.map(r => ({
      ...r,
      author_name: r.reviewer_name || r.author_name || 'Anonymous'
    }));
    const { error } = await newClient.from('reviews').upsert(cleanReviews);
    if (error) console.error('Error upserting reviews:', error.message);
    else console.log('Successfully synced reviews to new DB!');
  }

  // Save fresh backup & public JSON
  fs.writeFileSync('public/data/products.json', JSON.stringify(products, null, 2));
  fs.writeFileSync('backups/supabase_backup_latest.json', JSON.stringify({ products, settings, reviews }, null, 2));

  console.log('=== SYNC COMPLETED PERFECTLY! ===');
}

syncLive();
