const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function runBackup() {
  console.log('=== Running Automated Database Backup ===');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment.');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);
  const backupsDir = path.join(__dirname, '..', 'backups');

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir);
  }

  // 1. Backup Products
  console.log('Backing up products...');
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (pErr) {
    console.error('Failed to fetch products:', pErr.message);
  } else {
    fs.writeFileSync(
      path.join(backupsDir, 'products.json'),
      JSON.stringify(products || [], null, 2)
    );
    console.log(`Successfully backed up ${products.length} products!`);
  }

  // 2. Backup Settings
  console.log('Backing up settings...');
  const { data: settings, error: sErr } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (sErr) {
    console.error('Failed to fetch settings:', sErr.message);
  } else {
    fs.writeFileSync(
      path.join(backupsDir, 'settings.json'),
      JSON.stringify(settings || {}, null, 2)
    );
    console.log('Successfully backed up settings!');
  }

  // 3. Backup Reviews
  console.log('Backing up reviews...');
  const { data: reviews, error: rErr } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (rErr) {
    console.error('Failed to fetch reviews:', rErr.message);
  } else {
    fs.writeFileSync(
      path.join(backupsDir, 'reviews.json'),
      JSON.stringify(reviews || [], null, 2)
    );
    console.log(`Successfully backed up ${reviews.length} reviews!`);
  }

  console.log('Backup script completed.');
}

runBackup();
