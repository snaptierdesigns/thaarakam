const { createClient } = require('@supabase/supabase-js');

const url = 'https://kwyrkezwhpgxstytxyaf.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eXJrZXp3aHBneHN0eXR4eWFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg1NTgzNywiZXhwIjoyMTAwNDMxODM3fQ.q2d0Ecxsihjm6xAzgOD_Weu7D77SXMk9hlgiR8Y0-gU';

const supabase = createClient(url, serviceKey);

async function testSupabase() {
  console.log('Testing Supabase query...');
  const { data, error } = await supabase.from('products').select('id, name').limit(1);
  if (error) {
    console.error('Supabase fetch error:', error);
  } else {
    console.log('Supabase product query working! Sample:', data);
  }

  // Also check if orders table exists
  const { error: ordersErr } = await supabase.from('orders').select('id').limit(1);
  if (ordersErr) {
    console.log('Supabase orders table status:', ordersErr.message);
  } else {
    console.log('Supabase orders table exists and is accessible!');
  }
}

testSupabase();
