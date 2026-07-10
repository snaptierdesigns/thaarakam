const fs = require('fs');
const { createClient } = require('c:/Users/nonam/OneDrive/Desktop/thaarakam/node_modules/@supabase/supabase-js');

// Read current .env.local keys (which point to your old locked database)
const envPath = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\.env.local';

function getEnvVar(content, name) {
  const match = content.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
}

async function runBackup() {
  console.log('=== Fetching Complete Backup from Unlocked Database ===');

  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const url = getEnvVar(envContent, 'NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = getEnvVar(envContent, 'SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceKey) {
    console.error('Error: Missing credentials in .env.local');
    process.exit(1);
  }

  console.log(`Connecting to database at: ${url}`);
  const supabase = createClient(url, serviceKey);

  // 1. Backup Products
  console.log('\nFetching all products...');
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (pErr) {
    console.error('Error fetching products:', pErr.message);
  } else {
    console.log(`Successfully fetched ${products.length} products!`);
    const backupPath = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\recovered_products.json';
    fs.writeFileSync(backupPath, JSON.stringify(products, null, 2));
    console.log(`Backup saved to ${backupPath}`);
  }

  // 2. Backup Settings
  console.log('\nFetching store settings...');
  const { data: settings, error: sErr } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (sErr) {
    console.error('Error fetching settings:', sErr.message);
  } else {
    console.log(`Successfully fetched settings!`);
    const backupPath = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\recovered_settings.json';
    fs.writeFileSync(backupPath, JSON.stringify(settings, null, 2));
    console.log(`Backup saved to ${backupPath}`);
  }

  // 3. Backup Reviews
  console.log('\nFetching all reviews...');
  const { data: reviews, error: rErr } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (rErr) {
    console.error('Error fetching reviews:', rErr.message);
  } else {
    console.log(`Successfully fetched ${reviews.length} reviews!`);
    const backupPath = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\recovered_reviews.json';
    fs.writeFileSync(backupPath, JSON.stringify(reviews, null, 2));
    console.log(`Backup saved to ${backupPath}`);
  }

  console.log('\nBackup Process Complete!');
}

runBackup();
