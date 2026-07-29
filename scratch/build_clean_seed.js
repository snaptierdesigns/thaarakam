const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backups', 'products.json'), 'utf8'));
const rawSettings = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backups', 'settings.json'), 'utf8'));
const settings = Array.isArray(rawSettings) ? (rawSettings[0] || {}) : rawSettings;

let sql = '';

// Settings
const businessName = (settings.business_name || 'Thaarakam').replace(/'/g, "''");
const logoUrl = (settings.logo_url || '').replace(/'/g, "''");
const whatsappNumber = (settings.whatsapp_number || '91').replace(/'/g, "''");
const storeEmail = (settings.store_email || '').replace(/'/g, "''");
const defaultDesc = (settings.default_description || '').replace(/'/g, "''");

sql += `INSERT OR REPLACE INTO settings (id, business_name, logo_url, whatsapp_number, store_email, shipping_kerala, shipping_south_india, shipping_north_india, default_description) VALUES (1, '${businessName}', '${logoUrl}', '${whatsappNumber}', '${storeEmail}', ${settings.shipping_kerala || 50}, ${settings.shipping_south_india || 60}, ${settings.shipping_north_india || 80}, '${defaultDesc}');\n`;

products.forEach((p) => {
  const id = p.id.replace(/'/g, "''");
  const name = p.name.replace(/'/g, "''");
  const price = Number(p.price);
  const category = p.category.replace(/'/g, "''");
  
  // Replace huge base64 > 20kb with placeholder so SQLite statement is <20kb and fits in D1 query payload
  let imgs = p.images || [];
  imgs = imgs.map(img => (img.startsWith('data:image') && img.length > 20000) ? '/images/placeholder.jpg' : img);
  
  const imagesJson = JSON.stringify(imgs).replace(/'/g, "''");
  const description = (p.description || '').replace(/'/g, "''");
  const isFeatured = p.is_featured ? 1 : 0;
  const requiresSize = p.requires_size ? 1 : 0;
  const maxSize = p.max_size ? Number(p.max_size) : 'NULL';
  const customSizes = JSON.stringify(p.custom_sizes || []).replace(/'/g, "''");
  const sizesOutOfStock = JSON.stringify(p.sizes_out_of_stock || []).replace(/'/g, "''");
  const isPreorder = p.is_preorder ? 1 : 0;
  const availability = (p.availability || 'in_stock').replace(/'/g, "''");
  const stockCount = p.stock_count !== undefined && p.stock_count !== null ? Number(p.stock_count) : 10;
  const createdAt = (p.created_at || new Date().toISOString()).replace(/'/g, "''");

  sql += `INSERT OR REPLACE INTO products (id, name, price, category, images, description, is_featured, requires_size, max_size, custom_sizes, sizes_out_of_stock, is_preorder, availability, stock_count, created_at) VALUES ('${id}', '${name}', ${price}, '${category}', '${imagesJson}', '${description}', ${isFeatured}, ${requiresSize}, ${maxSize}, '${customSizes}', '${sizesOutOfStock}', ${isPreorder}, '${availability}', ${stockCount}, '${createdAt}');\n`;
});

fs.writeFileSync(path.join(__dirname, 'seed_d1_clean.sql'), sql, 'utf8');
console.log('Successfully generated scratch/seed_d1_clean.sql! File size:', sql.length, 'bytes');
