const ACCOUNT_ID = 'ef3d14dcb8c107be3672c91aa35a3a49';
const DATABASE_ID = '244387d1-3d22-40be-879b-93681f607432';
const API_TOKEN = 'cfoat_AkA21cE8O0Rs30-gRNdYZEpylFvMz-GXROICj66Z3ns.VL1dDHSezG099hu3c2hA5P8DFIdR-ufqyekyGvfsZlg';

async function testInsertOrder() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

  const newId = 'test-' + Date.now();
  const orderNumber = `THK-${Date.now().toString().slice(-6)}-123`;
  const createdAt = new Date().toISOString();
  const itemsStr = JSON.stringify([{ id: '5785cf79-5a71-414c-9cf9-1cedd801aa52', name: 'Astra', price: 499, quantity: 1 }]);

  const sql = `INSERT INTO orders (id, order_number, customer_name, customer_phone, customer_email, country, address, city, state, pincode, items, subtotal, shipping_fee, total_amount, payment_status, razorpay_order_id, razorpay_payment_id, shipping_status, tracking_number, carrier_name, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing', NULL, 'India Post', ?, ?)`;
  const params = [
    newId,
    orderNumber,
    'Test Customer',
    '9876543210',
    'test@example.com',
    'India',
    '123 Test St',
    'Kochi',
    'Kerala',
    '682001',
    itemsStr,
    499,
    50,
    549,
    'paid',
    'rzp_test_123',
    'pay_test_456',
    'Test Order Note',
    createdAt
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sql,
      params
    })
  });

  const data = await res.json();
  console.log('Insert Result:', JSON.stringify(data, null, 2));
}

testInsertOrder();
