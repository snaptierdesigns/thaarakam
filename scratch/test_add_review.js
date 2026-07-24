const { createClient } = require('@supabase/supabase-js');

const URL = 'https://kwyrkezwhpgxstytxyaf.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eXJrZXp3aHBneHN0eXR4eWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NTU4MzcsImV4cCI6MjEwMDQzMTgzN30.r3Vpb0q3KQeAtYosPgE2WRIU0akpVAItPiJt5kKxq-0';

const supabase = createClient(URL, ANON_KEY);

async function testReview() {
  console.log('Testing review insertion...');
  const { data, error } = await supabase
    .from('reviews')
    .insert([
      {
        reviewer_name: 'Test Customer',
        rating: 5,
        comment: 'Beautiful quality and fast shipping!',
        product_id: null,
      }
    ])
    .select();

  if (error) {
    console.error('Review insertion error:', error);
  } else {
    console.log('Review inserted successfully! Data:', data);
    
    // Clean up test review
    if (data && data[0]?.id) {
      await supabase.from('reviews').delete().eq('id', data[0].id);
      console.log('Cleaned up test review.');
    }
  }
}

testReview();
