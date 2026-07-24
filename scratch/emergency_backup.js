const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const URL = 'https://bzqbsdkbkfufuixndarb.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cWJzZGtia2Z1ZnVpeG5kYXJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzY4OTg1MCwiZXhwIjoyMDk5MjY1ODUwfQ.CvQO7u7KhVfYPaFWmB34PAaOJwovN_YsAiSKQY8m6b8';

const supabase = createClient(URL, SERVICE_KEY);

async function runEmergencyBackup() {
  console.log('=== EMERGENCY BACKUP STARTED ===');
  const backupsDir = path.join(__dirname, '..', 'backups');

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  // 1. Backup Products
  console.log('Fetching products...');
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (pErr) {
    console.error('Products fetch error:', pErr);
  } else {
    fs.writeFileSync(path.join(backupsDir, 'products.json'), JSON.stringify(products || [], null, 2));
    console.log(`Saved ${products?.length || 0} products to backups/products.json`);
  }

  // 2. Backup Settings
  console.log('Fetching settings...');
  const { data: settings, error: sErr } = await supabase
    .from('settings')
    .select('*');

  if (sErr) {
    console.error('Settings fetch error:', sErr);
  } else {
    fs.writeFileSync(path.join(backupsDir, 'settings.json'), JSON.stringify(settings || [], null, 2));
    console.log(`Saved ${settings?.length || 0} settings rows to backups/settings.json`);
  }

  // 3. Backup Reviews
  console.log('Fetching reviews...');
  const { data: reviews, error: rErr } = await supabase
    .from('reviews')
    .select('*');

  if (rErr) {
    console.error('Reviews fetch error:', rErr);
  } else {
    fs.writeFileSync(path.join(backupsDir, 'reviews.json'), JSON.stringify(reviews || [], null, 2));
    console.log(`Saved ${reviews?.length || 0} reviews to backups/reviews.json`);
  }

  // 4. Combined Backup File
  const fullBackup = {
    timestamp: new Date().toISOString(),
    products: products || [],
    settings: settings || [],
    reviews: reviews || []
  };

  fs.writeFileSync(path.join(backupsDir, `full_db_backup_${Date.now()}.json`), JSON.stringify(fullBackup, null, 2));
  console.log('=== EMERGENCY BACKUP COMPLETE ===');
}

runEmergencyBackup();
