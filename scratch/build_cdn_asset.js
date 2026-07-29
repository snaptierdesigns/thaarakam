const fs = require('fs');
const path = require('path');

const backupsPath = path.join(__dirname, '..', 'backups', 'products.json');
const targetDir = path.join(__dirname, '..', 'public', 'data');
const targetPath = path.join(targetDir, 'products.json');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

if (fs.existsSync(backupsPath)) {
  const products = JSON.parse(fs.readFileSync(backupsPath, 'utf8'));
  
  // Clean products for public CDN consumption
  const cleanProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    category: p.category,
    images: p.images || [],
    description: p.description || null,
    is_featured: Boolean(p.is_featured),
    requires_size: Boolean(p.requires_size),
    max_size: p.max_size ? Number(p.max_size) : null,
    is_preorder: Boolean(p.is_preorder),
    availability: p.availability || 'in_stock',
    stock_count: p.stock_count !== null && p.stock_count !== undefined ? Number(p.stock_count) : 10,
    created_at: p.created_at || new Date().toISOString()
  }));

  fs.writeFileSync(targetPath, JSON.stringify(cleanProducts, null, 2));
  console.log(`Successfully generated public/data/products.json with ${cleanProducts.length} products!`);
} else {
  console.error('Error: backups/products.json not found.');
}
