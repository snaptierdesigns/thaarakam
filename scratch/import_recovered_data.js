const fs = require('fs');
const path = require('path');
const { createClient } = require('c:/Users/nonam/OneDrive/Desktop/thaarakam/node_modules/@supabase/supabase-js');

// Paths to recovered JSON data
const productsPath = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\recovered_products.json';
const settingsPath = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\recovered_settings.json';

// Read .env.local keys from project root (we assume this is updated with the NEW database credentials)
const envPath = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\.env.local';

function getEnvVar(content, name) {
  const match = content.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
}

async function runImport() {
  console.log('=== Starting Database Restoration ===');

  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found. Please create it with your new database credentials.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const url = getEnvVar(envContent, 'NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = getEnvVar(envContent, 'SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  console.log(`Connecting to new database at: ${url}`);
  const supabase = createClient(url, serviceKey);

  // 1. Restore Store Settings
  if (fs.existsSync(settingsPath)) {
    console.log('\nRestoring Settings...');
    const rawSettings = fs.readFileSync(settingsPath, 'utf8');
    const settings = JSON.parse(rawSettings);

    const { data, error } = await supabase
      .from('settings')
      .upsert(settings)
      .select();

    if (error) {
      console.error('Failed to restore settings:', error.message);
    } else {
      console.log('Settings restored successfully!', data);
    }
  } else {
    console.log('\nNo recovered_settings.json found, skipping settings restore.');
  }

  // 2. Restore Products
  if (fs.existsSync(productsPath)) {
    console.log('\nRestoring Products...');
    const rawProducts = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(rawProducts);
    console.log(`Loaded ${products.length} products from backup.`);

    // Next.js cache sometimes stores properties we don't need, let's sanitize them to match schema
    const sanitizedProducts = products.map(p => {
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        images: Array.isArray(p.images) ? p.images : [],
        description: p.description || null,
        is_featured: p.is_featured === true || p.is_featured === 'true',
        requires_size: p.requires_size === true || p.requires_size === 'true',
        max_size: p.max_size ? parseInt(p.max_size) : null,
        is_preorder: p.is_preorder === true || p.is_preorder === 'true',
        availability: p.availability || 'in_stock',
        stock_count: p.stock_count !== undefined && p.stock_count !== null ? parseInt(p.stock_count) : 10,
        created_at: p.created_at || new Date().toISOString()
      };
    });

    // Insert individually to prevent large payloads from failing other products
    let successCount = 0;

    for (let i = 0; i < sanitizedProducts.length; i++) {
      const product = sanitizedProducts[i];
      const payloadSize = JSON.stringify(product).length;
      
      console.log(`Uploading product ${i + 1}/${sanitizedProducts.length}: "${product.name}" (${(payloadSize / 1024).toFixed(1)} KB)...`);

      const { error } = await supabase
        .from('products')
        .upsert(product);

      if (error) {
        console.error(`❌ Failed to upload product "${product.name}":`, error.message);
      } else {
        successCount++;
      }
    }

    console.log(`\nRestoration complete: ${successCount}/${sanitizedProducts.length} products restored successfully!`);
  } else {
    console.log('\nNo recovered_products.json found, skipping products restore.');
  }

  // 3. Restore Reviews
  const reviewsPath = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\recovered_reviews.json';
  if (fs.existsSync(reviewsPath)) {
    console.log('\nRestoring Reviews...');
    const rawReviews = fs.readFileSync(reviewsPath, 'utf8');
    const reviews = JSON.parse(rawReviews);
    console.log(`Loaded ${reviews.length} reviews from backup.`);

    const sanitizedReviews = reviews.map(r => {
      return {
        id: r.id,
        product_id: r.product_id,
        reviewer_name: r.reviewer_name,
        rating: parseInt(r.rating),
        comment: r.comment,
        created_at: r.created_at || new Date().toISOString()
      };
    });

    const BATCH_SIZE = 50;
    let successReviewsCount = 0;

    for (let i = 0; i < sanitizedReviews.length; i += BATCH_SIZE) {
      const batch = sanitizedReviews.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('reviews')
        .upsert(batch);

      if (error) {
        console.error(`Failed to upload reviews batch starting at index ${i}:`, error.message);
      } else {
        successReviewsCount += batch.length;
      }
    }

    console.log(`Reviews restoration complete: ${successReviewsCount}/${sanitizedReviews.length} reviews restored successfully!`);
  } else {
    console.log('\nNo recovered_reviews.json found, skipping reviews restore.');
  }
}

runImport();
