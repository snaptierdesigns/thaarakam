const { createClient } = require('@supabase/supabase-js');

const URL = 'https://kwyrkezwhpgstytxyaf.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eXJrZXp3aHBneHN0eXR4eWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NTU4MzcsImV4cCI6MjEwMDQzMTgzN30.r3Vpb0q3KQeAtYosPgE2WRIU0akpVAItPiJt5kKxq-0';

const supabase = createClient(URL, ANON_KEY);

async function testConn() {
  console.log('Testing connection to kwyrkezwhpgstytxyaf...');
  try {
    const res = await supabase.from('products').select('*').limit(1);
    console.log('Response:', res);
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testConn();
