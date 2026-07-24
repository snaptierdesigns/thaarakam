const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const NEW_URL = 'https://kwyrkezwhpgxstytxyaf.supabase.co';
const NEW_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eXJrZXp3aHBneHN0eXR4eWFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg1NTgzNywiZXhwIjoyMTAwNDMxODM3fQ.q2d0Ecxsihjm6xAzgOD_Weu7D77SXMk9hlgiR8Y0-gU';

const supabase = createClient(NEW_URL, NEW_SERVICE_KEY);

async function migrateData() {
  console.log('=== RESTORING TO NEW SUPABASE PROJECT (kwyrkezwhpgxstytxyaf) ===');

  const productsPath = path.join(__dirname, '..', 'backups', 'products.json');
  const settingsPath = path.join(__dirname, '..', 'backups', 'settings.json');

  if (!fs.existsSync(productsPath) || !fs.existsSync(settingsPath)) {
    console.error('Error: Backup files not found in backups/ directory.');
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

  console.log(`Loaded ${products.length} products and settings from local backups.`);

  // Batch insert products into new DB (50 at a time)
  console.log('Inserting products in batches of 50...');
  const batchSize = 50;
  let successCount = 0;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      images: p.images,
      description: p.description,
      is_featured: p.is_featured,
      requires_size: p.requires_size,
      max_size: p.max_size,
      is_preorder: p.is_preorder,
      availability: p.availability,
      stock_count: p.stock_count,
      created_at: p.created_at || new Date().toISOString()
    }));

    const { data, error } = await supabase.from('products').upsert(batch);
    if (error) {
      console.error(`Batch ${i / batchSize + 1} insert error:`, error.message);
    } else {
      successCount += batch.length;
      console.log(`Batch ${i / batchSize + 1} (${batch.length} products) inserted successfully!`);
    }
  }

  console.log(`Total products restored: ${successCount} / ${products.length}`);

  // Insert Settings
  console.log('Restoring store settings...');
  const settingsObj = Array.isArray(settings) ? settings[0] : settings;
  if (settingsObj) {
    const settingsPayload = {
      id: 1,
      business_name: settingsObj.business_name || 'Thaarakam',
      logo_url: settingsObj.logo_url || '',
      whatsapp_number: settingsObj.whatsapp_number || '91',
      store_email: settingsObj.store_email || '',
      shipping_kerala: settingsObj.shipping_kerala || 50,
      shipping_south_india: settingsObj.shipping_south_india || 60,
      shipping_north_india: settingsObj.shipping_north_india || 80,
      default_description: settingsObj.default_description || ''
    };

    const { error: setErr } = await supabase.from('settings').upsert([settingsPayload]);
    if (setErr) {
      console.error('Settings insert error:', setErr.message);
    } else {
      console.log('Store settings restored successfully!');
    }
  }

  console.log('=== RESTORATION COMPLETE ===');
}

migrateData();
