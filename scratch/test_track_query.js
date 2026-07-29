const ACCOUNT_ID = 'ef3d14dcb8c107be3672c91aa35a3a49';
const DATABASE_ID = '244387d1-3d22-40be-879b-93681f607432';
const API_TOKEN = 'cfoat_AkA21cE8O0Rs30-gRNdYZEpylFvMz-GXROICj66Z3ns.VL1dDHSezG099hu3c2hA5P8DFIdR-ufqyekyGvfsZlg';

async function testTrack() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
  
  // 1. Get all orders
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sql: 'SELECT id, order_number, customer_name, tracking_number FROM orders'
    })
  });
  
  const data = await res.json();
  console.log('Orders in D1:', JSON.stringify(data, null, 2));
}

testTrack();
