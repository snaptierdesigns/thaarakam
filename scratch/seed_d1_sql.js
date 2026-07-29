const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '..', 'backups', 'products.json');
const settingsPath = path.join(__dirname, '..', 'backups', 'settings.json');
const outputPath = path.join(__dirname, '..', 'scratch', 'seed_d1.sql');

if (!fs.existsSync(productsPath)) {
  console.error('Error: backups/products.json not found.');
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf8')) : [];
const settingsObj = Array.isArray(settings) ? settings[0] : settings;

let sql = `-- Cloudflare D1 Seed SQL for 206 Products and Store Settings\n\n`;

// 1. Insert Settings
if (settingsObj) {
  const businessName = (settingsObj.business_name || 'Thaarakam').replace(/'/g, "''");
  const logoUrl = (settingsObj.logo_url || '').replace(/'/g, "''");
  const whatsappNumber = (settingsObj.whatsapp_number || '91').replace(/'/g, "''");
  const storeEmail = (settingsObj.store_email || '').replace(/'/g, "''");
  const defaultDesc = (settingsObj.default_description || '').replace(/'/g, "''");

  sql += `INSERT OR REPLACE INTO settings (id, business_name, logo_url, whatsapp_number, store_email, shipping_kerala, shipping_south_india, shipping_north_india, default_description) VALUES (1, '${businessName}', '${logoUrl}', '${whatsappNumber}', '${storeEmail}', ${settingsObj.shipping_kerala || 50}, ${settingsObj.shipping_south_india || 60}, ${settingsObj.shipping_north_india || 80}, '${defaultDesc}');\n\n`;
}

// 2. Insert Products
products.forEach((p) => {
  const id = p.id.replace(/'/g, "''");
  const name = p.name.replace(/'/g, "''");
  const price = Number(p.price);
  const category = p.category.replace(/'/g, "''");
  const imagesJson = JSON.stringify(p.images || []).replace(/'/g, "''");
  const description = (p.description || '').replace(/'/g, "''");
  const isFeatured = p.is_featured ? 1 : 0;
  const requiresSize = p.requires_size ? 1 : 0;
  const maxSize = p.max_size ? Number(p.max_size) : 'NULL';
  const customSizes = JSON.stringify(p.custom_sizes || []).replace(/'/g, "''");
  const sizesOutOfStock = JSON.stringify(p.sizes_out_of_stock || []).replace(/'/g, "''");
  const isPreorder = p.is_preorder ? 1 : 0;
  const availability = (p.availability || 'in_stock').replace(/'/g, "''");
  const stockCount = p.stock_count !== null && p.stock_count !== undefined ? Number(p.stock_count) : 10;
  const createdAt = (p.created_at || new Date().toISOString()).replace(/'/g, "''");

  sql += `INSERT OR REPLACE INTO products (id, name, price, category, images, description, is_featured, requires_size, max_size, custom_sizes, sizes_out_of_stock, is_preorder, availability, stock_count, created_at) VALUES ('${id}', '${name}', ${price}, '${category}', '${imagesJson}', '${description}', ${isFeatured}, ${requiresSize}, ${maxSize}, '${customSizes}', '${sizesOutOfStock}', ${isPreorder}, '${availability}', ${stockCount}, '${createdAt}');\n`;
});

fs.writeFileSync(outputPath, sql);
console.log(`Successfully generated scratch/seed_d1.sql with 206 products and settings!`);
