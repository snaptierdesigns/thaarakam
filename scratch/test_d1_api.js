const accountId = 'ef3d14dcb8c107be3672c91aa35a3a49';
const databaseId = '244387d1-3d22-40be-879b-93681f607432';
const token = 'cfoat_AkA21cE8O0Rs30-gRNdYZEpylFvMz-GXROICj66Z3ns.VL1dDHSezG099hu3c2hA5P8DFIdR-ufqyekyGvfsZlg';

async function testD1Api() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sql: 'SELECT id, name, price, category FROM products LIMIT 2;'
    })
  });
  const data = await res.json();
  console.log('D1 REST API Response success:', data.success);
  console.log('Sample rows:', data.result[0].results);
}

testD1Api();
