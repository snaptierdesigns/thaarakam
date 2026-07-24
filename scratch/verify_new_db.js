const { createClient } = require('@supabase/supabase-js');

const URL = 'https://kwyrkezwhpgxstytxyaf.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eXJrZXp3aHBneHN0eXR4eWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NTU4MzcsImV4cCI6MjEwMDQzMTgzN30.r3Vpb0q3KQeAtYosPgE2WRIU0akpVAItPiJt5kKxq-0';

const supabase = createClient(URL, ANON_KEY);

async function verify() {
  console.log('=== VERIFYING NEW DATABASE CONTENT ===');

  const { data: products, count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Verification error:', error);
    return;
  }

  console.log(`Total Products in New DB: ${products.length} (Count: ${count})`);

  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();
  console.log('Store Settings in New DB:', settings);

  // Spot-check 3 random products
  console.log('\n--- Sample Product Spot Check ---');
  products.slice(0, 3).forEach((p, idx) => {
    console.log(`\nProduct #${idx + 1}:`);
    console.log(`- ID: ${p.id}`);
    console.log(`- Name: ${p.name}`);
    console.log(`- Price: ₹${p.price}`);
    console.log(`- Category: ${p.category}`);
    console.log(`- Images Count: ${p.images?.length || 0}`);
    console.log(`- Sample Image: ${p.images?.[0] || 'None'}`);
    console.log(`- Description Length: ${p.description?.length || 0} characters`);
    console.log(`- Stock Count: ${p.stock_count}`);
    console.log(`- Availability: ${p.availability}`);
  });
}

verify();
